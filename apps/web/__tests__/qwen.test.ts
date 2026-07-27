import { beforeEach, describe, expect, it, vi } from "vitest";

import { createQwenJsonResponse, getQwenStatus, QwenRequestError } from "@/src/lib/qwen";

describe("Qwen server client", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.stubEnv("DASHSCOPE_API_KEY", "test-key");
    vi.stubEnv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1");
    vi.stubEnv("QWEN_MODEL", "qwen-plus");
  });

  it("keeps configuration server-side and reports only safe status fields", () => {
    expect(getQwenStatus()).toEqual({
      configured: true,
      provider: "qwen",
      model: "qwen-plus",
    });
    expect(JSON.stringify(getQwenStatus())).not.toContain("test-key");
  });

  it("requests non-thinking JSON output and returns token usage", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: "request-1",
        model: "qwen-plus",
        choices: [{ message: { content: '{"answer":"你好"}' } }],
        usage: { prompt_tokens: 120, completion_tokens: 20, total_tokens: 140 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createQwenJsonResponse(
      [{ role: "user", content: "请用 JSON 回答" }],
      (value) => value as { answer: string },
    );

    expect(result).toEqual({
      data: { answer: "你好" },
      model: "qwen-plus",
      requestId: "request-1",
      usage: { inputTokens: 120, outputTokens: 20, totalTokens: 140 },
    });
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(request.headers).toEqual({
      Authorization: "Bearer test-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: "qwen-plus",
      response_format: { type: "json_object" },
      enable_thinking: false,
    });
  });

  it("does not expose provider errors as successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: { code: "InvalidApiKey", message: "Invalid API key" } },
            { status: 401 },
          ),
        ),
    );

    try {
      await createQwenJsonResponse([{ role: "user", content: "hello" }], (value) => value);
      throw new Error("expected Qwen request to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(QwenRequestError);
      expect(error).toMatchObject({
        code: "InvalidApiKey",
        retryable: false,
        status: 401,
      });
    }
  });
});
