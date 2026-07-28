import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/qwen", () => ({
  QwenRequestError: class QwenRequestError extends Error {},
  createQwenJsonResponse: vi.fn().mockResolvedValue({
    data: {
      answer: "机器可以制造图像，但不能替人决定什么值得凝视。",
      englishAnswer:
        "Machines can make images, but they cannot decide what is worth contemplating.",
      englishSegments: [
        "Machines can make images, but they cannot decide what is worth contemplating.",
      ],
      responseType: "imagined_response",
      segments: [
        {
          text: "机器可以制造图像，但不能替人决定什么值得凝视。",
          layer: "persona_reconstruction",
          claimIds: [],
        },
      ],
      evidenceRefIds: [],
    },
    model: "qwen-plus",
    requestId: "request-1",
    usage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 },
  }),
}));

import { POST } from "@/app/api/ai/chat/route";

afterEach(() => {
  vi.clearAllMocks();
});

describe("artist chat API", () => {
  it("returns a labeled imagined response for a reviewed artwork", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          artworkId: "artic:28560",
          message: "你怎么看生成式 AI？",
          history: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      answer: "机器可以制造图像，但不能替人决定什么值得凝视。",
      englishAnswer:
        "Machines can make images, but they cannot decide what is worth contemplating.",
      responseType: "imagined_response",
      requestId: "request-1",
    });
  });

  it("does not open chat for an artwork without reviewed persona context", async () => {
    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          artworkId: "artic:999999",
          message: "你好",
        }),
      }),
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      code: "persona_context_unavailable",
    });
  });
});
