import type { ArtworkKnowledgePackage } from "../../../apps/web/src/schemas/ai-content.ts";
import type { Stage6GenerationContext, Stage6Provider } from "../pipeline.ts";
import { stage6FixtureProvider } from "./fixture.ts";

const apiKey = process.env.DASHSCOPE_API_KEY?.trim();
const baseUrl = (
  process.env.QWEN_BASE_URL?.trim() ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1"
).replace(/\/+$/, "");
const model = process.env.QWEN_VL_MODEL?.trim() || "qwen3-vl-plus";
const textModel = process.env.QWEN_MODEL?.trim() || "qwen-plus";

const usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 };
const unsupportedChronology =
  /(?:\b(?:1[0-9]|20)\d{2}\b|\b\d{1,2}(?:st|nd|rd|th)[ -]?century\b|\d{1,2}世纪)/iu;

type VisualAnalysis = {
  introduction: string;
  observations: Array<{
    text: string;
    layer: "fact" | "interpretation";
    confidence: "high" | "medium";
  }>;
  tags: string[];
  accessibility: { short: string; long: string };
  dialogueCues: Array<{
    topic:
      | "composition"
      | "color"
      | "light"
      | "space"
      | "subject"
      | "technique"
      | "material";
    triggerIntents: string[];
    transitionHint: string;
  }>;
};

function truncate(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function parseVisualAnalysis(input: unknown): VisualAnalysis {
  if (!input || typeof input !== "object")
    throw new Error("Qwen VL returned a non-object analysis");
  const value = input as Partial<VisualAnalysis>;
  const allowedTopics = new Set([
    "composition",
    "color",
    "light",
    "space",
    "subject",
    "technique",
    "material",
  ]);
  if (
    typeof value.introduction !== "string" ||
    !Array.isArray(value.observations) ||
    value.observations.length < 2 ||
    !Array.isArray(value.tags) ||
    !value.accessibility ||
    typeof value.accessibility.short !== "string" ||
    typeof value.accessibility.long !== "string" ||
    !Array.isArray(value.dialogueCues)
  )
    throw new Error("Qwen VL analysis is missing required fields");
  const observations = value.observations.slice(0, 5).map((item) => {
    if (
      !item ||
      typeof item.text !== "string" ||
      !["fact", "interpretation"].includes(item.layer) ||
      !["high", "medium"].includes(item.confidence)
    )
      throw new Error("Qwen VL returned an invalid observation");
    return {
      text: truncate(item.text, 600),
      layer: item.layer,
      confidence: item.confidence,
    };
  });
  const tags = value.tags
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 8)
    .map((item) => truncate(item, 80));
  const dialogueCues = value.dialogueCues.slice(0, 4).map((item) => {
    if (
      !item ||
      !allowedTopics.has(item.topic) ||
      !Array.isArray(item.triggerIntents) ||
      typeof item.transitionHint !== "string"
    )
      throw new Error("Qwen VL returned an invalid dialogue cue");
    const triggerIntents = item.triggerIntents
      .filter(
        (intent): intent is string =>
          typeof intent === "string" && intent.trim().length > 0,
      )
      .slice(0, 12)
      .map((intent) => truncate(intent, 120));
    if (triggerIntents.length === 0)
      throw new Error("Qwen VL dialogue cue requires trigger intents");
    return {
      topic: item.topic,
      triggerIntents,
      transitionHint: truncate(item.transitionHint, 320),
    };
  });
  return {
    introduction: truncate(value.introduction, 1_600),
    observations,
    tags,
    accessibility: {
      short: truncate(value.accessibility.short, 500),
      long: truncate(value.accessibility.long, 2_000),
    },
    dialogueCues,
  };
}

async function requestVisualAnalysis(context: Stage6GenerationContext) {
  if (!apiKey) throw new Error("DASHSCOPE_API_KEY is not configured");
  const imageUrl =
    context.artwork.images.preferred?.directUrl ??
    context.artwork.images.preferred?.directUrl2x;
  if (!imageUrl) throw new Error("Qwen VL generation requires a preferred image");
  const imageResponse = await fetch(imageUrl, {
    headers: {
      "User-Agent": "CanviumGallery/0.1 (multimodal evaluation)",
      Accept: "image/*",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (!imageResponse.ok)
    throw new Error(`Artwork image returned HTTP ${imageResponse.status}`);
  const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
  if (imageBytes.byteLength > 10 * 1024 * 1024)
    throw new Error("Artwork image exceeds the 10 MB evaluation limit");
  const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
  const imageDataUrl = `data:${contentType};base64,${Buffer.from(imageBytes).toString("base64")}`;
  const useChinese = context.locale.startsWith("zh");
  const systemPrompt = useChinese
    ? [
        "分析所提供的绘画，所有输出文字必须使用简体中文，不得使用英文句子。",
        "只能使用画面中直接可见的证据。不得从图像推断人物身份、生平、创作意图、情绪、疾病、象征意义或历史背景。",
        "不得给服饰、人物、风格或场景添加年代、世纪或时期标签，即使馆方元数据提供了年代。",
        "返回有效 JSON，且只能包含这些字段：",
        '{"introduction":"简短观看导言","observations":[{"text":"可见观察","layer":"fact|interpretation","confidence":"high|medium"}],"tags":["可见标签"],"accessibility":{"short":"简短替代文本","long":"详细视觉描述"},"dialogueCues":[{"topic":"composition|color|light|space|subject|technique|material","triggerIntents":["自然的用户表达"],"transitionHint":"如何自然衔接可见证据，不使用模板化提问"}]}',
        "提供 2–5 条观察、3–8 个标签和 1–4 条对话线索。超出字面描述的综合判断必须标为 interpretation。JSON 字段名和枚举值保留英文，所有面向用户的文字使用简体中文。",
      ].join("\n")
    : [
        "Analyze the supplied painting and write all user-facing text in English.",
        "Use only directly visible evidence. Do not infer identity, biography, intent, emotion, diagnosis, symbolism, or historical context from the image.",
        "Do not assign an era, century, or period label to clothing, people, style, or setting, even when museum metadata includes a date.",
        "Return valid JSON with exactly these fields:",
        '{"introduction":"concise viewing introduction","observations":[{"text":"visible observation","layer":"fact|interpretation","confidence":"high|medium"}],"tags":["visible tag"],"accessibility":{"short":"short alt text","long":"detailed visual description"},"dialogueCues":[{"topic":"composition|color|light|space|subject|technique|material","triggerIntents":["natural user phrase"],"transitionHint":"how to connect the visible evidence without asking a canned question"}]}',
        "Provide 2-5 observations, 3-8 tags, and 1-4 dialogue cues. Label any synthesis beyond literal description as interpretation.",
      ].join("\n");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: useChinese
                ? "只分析所附图像。馆方标题、作者和年代将在独立的确定性步骤中添加，本次不要识别或猜测这些信息。"
                : "Analyze only the attached image. Museum title, artist, and date are added in a separate deterministic step; do not identify or guess them here.",
            },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      enable_thinking: false,
      temperature: 0.1,
      max_tokens: 1800,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      `Qwen VL ${response.status}: ${body.error?.code || "unknown"} ${body.error?.message || ""}`.trim(),
    );
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Qwen VL returned an empty response");
  usage.calls += 1;
  usage.inputTokens += body.usage?.prompt_tokens || 0;
  usage.outputTokens += body.usage?.completion_tokens || 0;
  usage.totalTokens += body.usage?.total_tokens || 0;
  console.log(
    `QWEN_VL artwork=${context.artwork.id} locale=${context.locale} inputTokens=${body.usage?.prompt_tokens || 0} outputTokens=${body.usage?.completion_tokens || 0}`,
  );
  let analysis = parseVisualAnalysis(JSON.parse(content));
  let userFacingText = visualAnalysisText(analysis);
  if (unsupportedChronology.test(userFacingText)) {
    analysis = await repairVisualAnalysis(analysis, useChinese);
    analysis = sanitizeChronology(analysis, useChinese);
    userFacingText = visualAnalysisText(analysis);
  }
  if (
    useChinese &&
    (analysis.introduction.match(/\p{Script=Han}/gu)?.length ?? 0) < 8
  )
    throw new Error("Qwen VL did not return Simplified Chinese user-facing text");
  const chronologyMatch = userFacingText.match(unsupportedChronology);
  if (chronologyMatch)
    throw new Error(
      `Qwen VL inferred unsupported chronology from the image after repair: ${chronologyMatch[0]}`,
    );
  return analysis;
}

function cleanUnsupportedSentences(value: string): string {
  return (
    value
      .match(/[^。.!?！？]+[。.!?！？]?/gu)
      ?.filter((sentence) => !unsupportedChronology.test(sentence))
      .join("")
      .trim() ?? ""
  );
}

function sanitizeChronology(
  analysis: VisualAnalysis,
  useChinese: boolean,
): VisualAnalysis {
  const observations = analysis.observations
    .map((item) => ({
      ...item,
      text: cleanUnsupportedSentences(item.text),
    }))
    .filter((item) => item.text.length > 0);
  if (observations.length < 2)
    throw new Error(
      "Visual analysis has fewer than two safe observations after chronology removal",
    );
  const fallbackShort = truncate(observations[0].text, 500);
  const fallbackLong = truncate(
    observations.map((item) => item.text).join(useChinese ? "；" : " "),
    2_000,
  );
  const dialogueCues = analysis.dialogueCues.map((cue) => {
    const triggerIntents = cue.triggerIntents.filter(
      (intent) => !unsupportedChronology.test(intent),
    );
    return {
      ...cue,
      triggerIntents:
        triggerIntents.length > 0
          ? triggerIntents
          : [useChinese ? "画面细节" : "visual details"],
      transitionHint:
        cleanUnsupportedSentences(cue.transitionHint) ||
        (useChinese
          ? "仅衔接画面中可直接观察的细节。"
          : "Connect only to details directly visible in the image."),
    };
  });
  return {
    ...analysis,
    introduction:
      cleanUnsupportedSentences(analysis.introduction) || fallbackShort,
    observations,
    tags: analysis.tags.filter((tag) => !unsupportedChronology.test(tag)),
    accessibility: {
      short:
        cleanUnsupportedSentences(analysis.accessibility.short) ||
        fallbackShort,
      long:
        cleanUnsupportedSentences(analysis.accessibility.long) || fallbackLong,
    },
    dialogueCues,
  };
}

function visualAnalysisText(analysis: VisualAnalysis): string {
  return [
    analysis.introduction,
    ...analysis.observations.map((item) => item.text),
    ...analysis.tags,
    analysis.accessibility.short,
    analysis.accessibility.long,
    ...analysis.dialogueCues.flatMap((item) => [
      ...item.triggerIntents,
      item.transitionHint,
    ]),
  ].join("\n");
}

async function repairVisualAnalysis(
  analysis: VisualAnalysis,
  useChinese: boolean,
): Promise<VisualAnalysis> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: textModel,
      messages: [
        {
          role: "system",
          content: useChinese
            ? "你是视觉证据净化器。保持输入 JSON 的字段结构和枚举值，删除或改写所有艺术家、作品名、年份、世纪、时期、流派史、创作意图和其他无法仅凭画面确认的信息。保留颜色、形状、构图、人物动作、物体和可见笔触。所有面向用户的文字必须使用简体中文。只返回有效 JSON。"
            : "You are a visual-evidence sanitizer. Preserve the input JSON fields and enum values, while removing or rewriting every artist, artwork title, year, century, period, movement history, intent, or other claim that cannot be confirmed from pixels alone. Preserve colors, shapes, composition, actions, objects, and visible marks. Keep all user-facing text in English. Return valid JSON only.",
        },
        { role: "user", content: JSON.stringify(analysis) },
      ],
      response_format: { type: "json_object" },
      enable_thinking: false,
      temperature: 0,
      max_tokens: 1800,
    }),
    signal: AbortSignal.timeout(45_000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      `Qwen visual repair ${response.status}: ${body.error?.code || "unknown"} ${body.error?.message || ""}`.trim(),
    );
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("Qwen visual repair returned an empty response");
  usage.calls += 1;
  usage.inputTokens += body.usage?.prompt_tokens || 0;
  usage.outputTokens += body.usage?.completion_tokens || 0;
  usage.totalTokens += body.usage?.total_tokens || 0;
  console.log(
    `QWEN_VISUAL_REPAIR model=${body.model || textModel} inputTokens=${body.usage?.prompt_tokens || 0} outputTokens=${body.usage?.completion_tokens || 0}`,
  );
  return parseVisualAnalysis(JSON.parse(content));
}

function museumSource(context: Stage6GenerationContext) {
  const { artwork, generatedAt, sourceSnapshots } = context;
  return {
    sourceId: `source:${artwork.id}:museum`,
    kind: "museum_record" as const,
    title: artwork.display.title,
    publisher: artwork.source.label,
    url: artwork.source.recordUrl,
    language: "en",
    accessedAt: generatedAt,
    contentHash: sourceSnapshots.museumRecord.contentHash,
    reliability: "institutional" as const,
    snapshotRef: sourceSnapshots.museumRecord.snapshotRef,
  };
}

async function metadataOnlyPackage(
  context: Stage6GenerationContext,
): Promise<ArtworkKnowledgePackage> {
  const fixture = await stage6FixtureProvider.generate(context);
  const knowledge = fixture as ArtworkKnowledgePackage;
  const useChinese = context.locale.startsWith("zh");
  if (useChinese) {
    const title = context.artwork.display.localizedTitles[context.locale] ??
      context.artwork.display.title;
    knowledge.claims[0].text = `馆方将本作记录为《${title}》。`;
    knowledge.claims[1].text =
      `馆方将本作归于${context.artwork.display.artistDisplay}。`;
    if (knowledge.content.introduction)
      knowledge.content.introduction.text =
        `《${title}》由馆方归于${context.artwork.display.artistDisplay}；当前仅提供经核验的馆方资料，不生成画面描述。`;
    if (knowledge.dialogueCues[0])
      knowledge.dialogueCues[0].transitionHint =
        "仅在回应用户当前话题时使用经核验的馆方标题或作者归属，不补写画面内容。";
  }
  for (const cue of knowledge.dialogueCues)
    cue.triggerIntents = cue.triggerIntents.map((intent) =>
      truncate(intent, 120),
    );
  knowledge.generation = {
    provider: "deterministic-metadata",
    model: "none",
    promptVersion: "stage6-metadata-fallback-v1",
    generatedAt: context.generatedAt,
    inputHash: context.inputHash,
  };
  return knowledge;
}

export const stage6QwenVlProvider: Stage6Provider = {
  id: "qwen-vl",
  model,
  promptVersion: "stage6-qwen-vl-v6",
  getUsage: () => ({ ...usage }),
  async generate(context): Promise<ArtworkKnowledgePackage> {
    const { artwork, locale, inputHash, generatedAt } = context;
    if (!artwork.images.preferred) return metadataOnlyPackage(context);
    const analysis = await requestVisualAnalysis(context);
    const source = museumSource(context);
    const sourceRef = {
      sourceRefId: `source-ref:${artwork.id}:museum`,
      sourceId: source.sourceId,
      locator: { section: "object record" },
      support: "direct" as const,
    };
    const titleClaimId = `claim:${artwork.id}:${locale}:title`;
    const artistClaimId = `claim:${artwork.id}:${locale}:artist`;
    const imageId = artwork.images.preferred!.id;
    const visualClaims = analysis.observations.map((observation, index) => {
      const visualEvidenceId = `visual:${artwork.id}:${locale}:${index + 1}`;
      return {
        claimId: `claim:${artwork.id}:${locale}:visual-${index + 1}`,
        subjectId: artwork.id,
        layer: observation.layer,
        text: observation.text,
        sourceRefs: [],
        visualEvidence: [
          {
            visualEvidenceId,
            imageId,
            basis: "visible" as const,
            observation: observation.text,
            imageRevision: imageId,
          },
        ],
        confidence: observation.confidence,
        status: "generated" as const,
      };
    });
    const visualClaimIds = visualClaims.map((claim) => claim.claimId);
    const visualEvidenceIds = visualClaims.flatMap((claim) =>
      claim.visualEvidence.map((evidence) => evidence.visualEvidenceId),
    );
    const allClaimIds = [titleClaimId, artistClaimId, ...visualClaimIds];
    const sectionRun = {
      status: "succeeded" as const,
      attempt: 1,
      inputHash,
      outputHash: inputHash,
      updatedAt: generatedAt,
    };
    return {
      schemaVersion: "artwork-knowledge/2.0.0",
      packageId: `knowledge:${artwork.id}:${locale}:${inputHash.slice(0, 12)}`,
      artworkId: artwork.id,
      artworkRevision: artwork.revision,
      imageRevision: imageId,
      locale,
      sources: [source],
      claims: [
        {
          claimId: titleClaimId,
          subjectId: artwork.id,
          layer: "fact",
          text:
            locale.startsWith("zh")
              ? `馆方将本作记录为《${artwork.display.title}》。`
              : `The museum records this work as “${artwork.display.title}”.`,
          predicate: "title",
          value: artwork.display.title,
          sourceRefs: [sourceRef],
          visualEvidence: [],
          confidence: "high",
          status: "verified",
        },
        {
          claimId: artistClaimId,
          subjectId: artwork.id,
          layer: "fact",
          text:
            locale.startsWith("zh")
              ? `馆方将本作归于${artwork.display.artistDisplay}。`
              : `The museum attributes this work to ${artwork.display.artistDisplay}.`,
          predicate: "artist",
          value: artwork.display.artistDisplay,
          sourceRefs: [sourceRef],
          visualEvidence: [],
          confidence: "high",
          status: "verified",
        },
        ...visualClaims,
      ],
      content: {
        introduction: {
          text: analysis.introduction,
          claimIds: allClaimIds,
        },
        tags: analysis.tags.map((label, index) => ({
          tagId: `tag:${artwork.id}:${locale}:${index + 1}`,
          label,
          vocabulary: "qwen-vl-visible",
          confidence: "medium" as const,
          claimIds: visualClaimIds,
          visualEvidenceIds,
        })),
        relations: [],
        palette: [],
        accessibility: {
          short: analysis.accessibility.short,
          long: analysis.accessibility.long,
          claimIds: visualClaimIds,
          visualEvidenceIds,
        },
      },
      dialogueCues: analysis.dialogueCues.map((cue, index) => ({
        cueId: `cue:${artwork.id}:${locale}:visual-${index + 1}`,
        artworkId: artwork.id,
        locale,
        topic: cue.topic,
        triggerIntents: cue.triggerIntents,
        claimIds: visualClaimIds,
        visualEvidenceIds,
        compatiblePersonaIds: [],
        move: "mention",
        transitionHint: cue.transitionHint,
        delivery: {
          minimumTurn: 1,
          cooldownTurns: 3,
          maxUsesPerConversation: 1,
          requiresUserInitiation: true,
        },
        confidence: "medium",
        status: "generated",
      })),
      sectionRuns: {
        facts: sectionRun,
        introduction: sectionRun,
        dialogueCues: sectionRun,
        tags: sectionRun,
        accessibility: sectionRun,
      },
      generation: {
        provider: "dashscope",
        model,
        promptVersion: "stage6-qwen-vl-v6",
        generatedAt,
        inputHash,
      },
      review: {
        status: "pending",
        evaluationVersion: "stage6-eval-v1",
        issues: [],
      },
      publication: {
        status: "needs_review",
        version: `candidate-${inputHash.slice(0, 12)}`,
      },
    };
  },
};
