import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { buildArtistPrompt, digitalPersonaDisclosure } from "./ai/prompt-framework.mjs";
import { vanGogh } from "./ai/artist-profiles/van-gogh.mjs";
import { getCatalogArtworks, getCatalogMuseums, listCatalogSources } from "./data/catalog-service.mjs";

const root = fileURLToPath(new URL("./experiments/canvas-demo/", import.meta.url));
const port = Number(process.env.PORT || 4173);
const profiles = new Map([[vanGogh.id, vanGogh]]);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

async function loadLocalEnv() {
  try {
    const text = await readFile(new URL("./.env", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
    }
  } catch {}
}

await loadLocalEnv();

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 64_000) throw new Error("请求内容过长");
  }
  return JSON.parse(body || "{}");
}

function extractOutputText(result) {
  if (result.output_text) return result.output_text.trim();
  return (result.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("")
    .trim();
}

function extractGeminiText(result) {
  return (result.steps || [])
    .filter((step) => step.type === "model_output")
    .flatMap((step) => step.content || [])
    .filter((content) => content.type === "text")
    .map((content) => content.text || "")
    .join("")
    .trim();
}

function formatDialogueInput({ mode, message, history }) {
  if (mode === "introduction") return "作品刚刚被打开。请按照开场规则说第一句话。";
  const transcript = history
    .map((item) => `${item.role === "assistant" ? "艺术家" : "用户"}：${item.content}`)
    .join("\n");
  return `${transcript ? `此前对话：\n${transcript}\n\n` : ""}用户最新消息：${String(message || "").trim().slice(0, 1000)}`;
}

function formatEvidenceInstructions(sources) {
  const catalog = sources.map((source) => `- ${source.id}｜${source.type}｜${source.title}：${source.description}`).join("\n");
  return `
可用依据目录：
${catalog}

依据选择规则：
- 只选择直接支持本次回答的依据，通常 1～2 项；不要每次返回全部来源。
- evidence 中的 source_id 必须来自上述目录。
- relevance 用一句简短中文说明该来源具体支持了本次回答中的什么信息，不要复制固定介绍。
- 如果本次回答只是情感回应且没有可核实事实，evidence 可以为空数组。
`.trim();
}

function resolveEvidence(selections, sources) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const seen = new Set();
  return (Array.isArray(selections) ? selections : []).flatMap((selection) => {
    const source = sourceMap.get(selection?.source_id);
    if (!source || seen.has(source.id)) return [];
    seen.add(source.id);
    return [{ ...source, summary: String(selection.relevance || source.description).slice(0, 240) }];
  });
}

async function createGeminiResponse({ instructions, input, sources }) {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const sourceIds = sources.map((source) => source.id);
  const apiResponse = await fetch("https://generativelanguage.googleapis.com/v1/interactions", {
    method: "POST",
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      system_instruction: `${instructions}\n\n${formatEvidenceInstructions(sources)}`,
      input,
      store: false,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: {
          type: "object",
          properties: {
            answer: { type: "string", description: "艺术家对用户说的话" },
            evidence: {
              type: "array",
              description: "仅包含直接支持本次回答的依据",
              items: {
                type: "object",
                properties: {
                  source_id: { type: "string", enum: sourceIds },
                  relevance: { type: "string", description: "该来源如何支持本次回答" },
                },
                required: ["source_id", "relevance"],
              },
            },
          },
          required: ["answer", "evidence"],
        },
      },
    }),
  });
  const result = await apiResponse.json();
  if (!apiResponse.ok) {
    const error = new Error(result?.error?.message || "Gemini 服务暂时不可用");
    error.status = apiResponse.status;
    throw error;
  }
  const raw = extractGeminiText(result);
  let structured;
  try {
    structured = JSON.parse(raw);
  } catch {
    throw new Error("Gemini 返回的依据结构无法解析");
  }
  return {
    answer: String(structured.answer || "").trim(),
    evidenceSelections: structured.evidence,
    model,
    provider: "gemini",
  };
}

async function createOpenAIResponse({ instructions, input, history }) {
  const model = process.env.OPENAI_MODEL || "gpt-5.6";
  const messages = history.map((item) => ({ role: item.role, content: item.content.slice(0, 1200) }));
  messages.push({ role: "user", content: input });
  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ model, instructions, input: messages, max_output_tokens: 500 }),
  });
  const result = await apiResponse.json();
  if (!apiResponse.ok) {
    const error = new Error(result?.error?.message || "OpenAI 服务暂时不可用");
    error.status = apiResponse.status;
    throw error;
  }
  return { answer: extractOutputText(result), evidenceSelections: [], model, provider: "openai" };
}

async function createDialogue({ artistId = "van-gogh", artworkId, mode, message, history = [] }) {
  const artist = profiles.get(artistId);
  const artwork = artist?.artworks?.[artworkId];
  if (!artist || !artwork) throw new Error("找不到对应的艺术家或作品");
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    const error = new Error("服务端尚未配置 GEMINI_API_KEY 或 OPENAI_API_KEY");
    error.status = 503;
    throw error;
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-8).filter((item) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
    : [];
  const instructions = buildArtistPrompt({ artist, artwork, mode });
  const input = formatDialogueInput({ mode, message, history: safeHistory });
  const sources = [...(artist.sources || []), artwork.source].filter(Boolean);
  const result = process.env.GEMINI_API_KEY
    ? await createGeminiResponse({ instructions, input, sources })
    : await createOpenAIResponse({ instructions, input, history: safeHistory });
  const answer = result.answer;
  if (!answer) throw new Error("AI 没有返回可显示的内容");
  const evidence = result.provider === "gemini"
    ? resolveEvidence(result.evidenceSelections, sources)
    : sources.slice(-1).map((source) => ({ ...source, summary: source.description }));
  return { answer, evidence, disclosure: digitalPersonaDisclosure, model: result.model, provider: result.provider };
}

async function serveStatic(request, response) {
  const requestPath = new URL(request.url, "http://localhost").pathname;
  const relative = requestPath === "/" ? "index.html" : decodeURIComponent(requestPath.slice(1));
  const resolved = normalize(join(root, relative));
  if (!resolved.startsWith(root)) return sendJson(response, 403, { error: "禁止访问" });
  try {
    const file = await readFile(resolved);
    response.writeHead(200, { "content-type": mime[extname(resolved)] || "application/octet-stream" });
    response.end(file);
  } catch {
    sendJson(response, 404, { error: "页面不存在" });
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://localhost");
  if (request.method === "GET" && requestUrl.pathname === "/api/catalog/sources") {
    sendJson(response, 200, { items: listCatalogSources() });
    return;
  }
  if (request.method === "GET" && requestUrl.pathname === "/api/catalog/artworks") {
    try {
      const result = await getCatalogArtworks({
        source: requestUrl.searchParams.get("source") || "artic",
        ids: (requestUrl.searchParams.get("ids") || "").split(",").filter(Boolean),
        query: requestUrl.searchParams.get("q") || "",
        limit: requestUrl.searchParams.get("limit"),
        publicDomainOnly: requestUrl.searchParams.get("publicDomainOnly") === "true",
      });
      sendJson(response, 200, result);
    } catch (error) {
      const status = error.status && error.status < 500 ? error.status : 502;
      sendJson(response, status, { error: error.message || "馆藏数据暂时不可用" });
    }
    return;
  }
  if (request.method === "GET" && requestUrl.pathname === "/api/catalog/museums") {
    try {
      const result = await getCatalogMuseums({
        source: requestUrl.searchParams.get("source") || "wikidata",
        ids: (requestUrl.searchParams.get("ids") || "").split(",").filter(Boolean),
      });
      sendJson(response, 200, result);
    } catch (error) {
      const status = error.status && error.status < 500 ? error.status : 502;
      sendJson(response, status, { error: error.message || "博物馆数据暂时不可用" });
    }
    return;
  }
  if (request.method === "POST" && request.url === "/api/dialogue") {
    try {
      const body = await readJson(request);
      if (!["introduction", "dialogue"].includes(body.mode)) throw new Error("无效的对话阶段");
      if (body.mode === "dialogue" && !String(body.message || "").trim()) throw new Error("请输入问题");
      sendJson(response, 200, await createDialogue(body));
    } catch (error) {
      sendJson(response, error.status || 400, { error: error.message || "请求失败" });
    }
    return;
  }
  if (request.method === "GET") return serveStatic(request, response);
  sendJson(response, 405, { error: "不支持的请求方式" });
}).listen(port, () => {
  console.log(`Canvium Gallery is running at http://localhost:${port}`);
  if (process.env.GEMINI_API_KEY) console.log(`AI provider: Gemini (${process.env.GEMINI_MODEL || "gemini-3.5-flash"})`);
  else if (process.env.OPENAI_API_KEY) console.log(`AI provider: OpenAI (${process.env.OPENAI_MODEL || "gpt-5.6"})`);
  else console.warn("No AI API key is configured; dialogue will use the local fallback opening.");
});
