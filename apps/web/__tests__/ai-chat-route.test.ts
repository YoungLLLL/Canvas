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

vi.mock("@/src/lib/artic", () => ({
  getArticArtwork: vi.fn(async (sourceId: string) =>
    sourceId === "999998"
      ? {
          id: "artic:999998",
          sourceId,
          museumId: "artic",
          source: {
            id: "artic",
            label: "The Art Institute of Chicago",
            recordUrl: "https://www.artic.edu/artworks/999998",
            accessedAt: "2026-07-29T00:00:00.000Z",
          },
          display: {
            title: "A Test Landscape",
            localizedTitles: {},
            altTitles: [],
            artistDisplay: "Ada Painter (French, 1880–1940)",
            dateDisplay: "1910",
            mediumDisplay: "Oil on canvas",
          },
          artist: {
            id: "artic-artist:42",
            sourceId: "42",
            name: "Ada Painter",
            display: "Ada Painter (French, 1880–1940)",
            personaStatus: "unavailable",
          },
          date: { start: 1910, end: 1910 },
          classification: {
            artworkTypeId: 1,
            artworkTypeTitle: "Painting",
            classificationTitles: [],
          },
          images: { preferred: null, alternates: [] },
          rights: {},
          eligibility: {
            status: "metadata_only_no_image",
            ruleVersion: "test",
            checkedAt: "2026-07-29T00:00:00.000Z",
            reasons: [],
          },
          description: {
            html: "A landscape with a river.",
            text: "A landscape with a river.",
            sourceField: "description",
          },
          revision: "test",
        }
      : null,
  ),
}));

vi.mock("@/src/lib/wikipedia-artist-profile", () => ({
  getWikipediaArtistProfile: vi.fn(async () => ({
    name: "Ada Painter",
    localizedName: "艾达·佩因特",
    life: "1880–1940",
    country: "France",
    localizedCountry: "法国",
    style: [{ english: "Modernism", chinese: "现代主义" }],
    subjects: [{ english: "Landscapes", chinese: "风景" }],
    legacy: {
      english: "Recognized for landscapes.",
      chinese: "以风景画闻名。",
    },
    sources: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Ada_Painter" }],
  })),
}));

import { POST } from "@/app/api/ai/chat/route";
import { createQwenJsonResponse } from "@/src/lib/qwen";

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
      attempts: 1,
    });
  });

  it("automatically completes evidence for claims used by the model", async () => {
    vi.mocked(createQwenJsonResponse).mockResolvedValueOnce({
      data: {
        answer: "我生于1853年。",
        englishAnswer: "I was born in 1853.",
        englishSegments: ["I was born in 1853."],
        responseType: "evidence_based",
        segments: [
          {
            text: "我生于1853年。",
            layer: "fact",
            claimIds: ["claim:van-gogh:identity"],
          },
        ],
        evidenceRefIds: [],
      },
      model: "qwen-plus",
      requestId: "request-evidence",
      usage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 },
    });

    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          artworkId: "artic:28560",
          message: "你出生于哪一年？",
          history: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      evidence: [{ sourceRefId: "ref:van-gogh:identity" }],
      attempts: 1,
      citations: [{ number: 1 }],
    });
    expect(createQwenJsonResponse).toHaveBeenCalledTimes(1);
  });

  it("retries generation once when persona validation rejects the first response", async () => {
    vi.mocked(createQwenJsonResponse).mockResolvedValueOnce({
      data: {
        answer: "第一次回答。",
        englishAnswer: "First answer.",
        englishSegments: ["First answer."],
        responseType: "unsupported_response_type",
        segments: [],
        evidenceRefIds: [],
      },
      model: "qwen-plus",
      requestId: "request-invalid",
      usage: { inputTokens: 100, outputTokens: 20, totalTokens: 120 },
    });

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
      attempts: 2,
    });
    expect(createQwenJsonResponse).toHaveBeenCalledTimes(2);
  });

  it("uses a grounded dynamic persona for another named artist", async () => {
    vi.mocked(createQwenJsonResponse).mockImplementationOnce(async (messages, parse) => ({
      data: parse({
        answer: "ignored in favor of aligned segments",
        englishAnswer: "ignored in favor of aligned segments",
        responseType: "imagined_response",
        segments: [
          {
            chinese: "馆藏把这件风景画记录为1910年的作品。",
            english: "The museum records this landscape as a work from 1910.",
            citationNumbers: [1],
          },
          {
            chinese: "至于河流带来的感受，我更愿意把它留给你的观看。",
            english: "As for the feeling of the river, I would leave that to your looking.",
            citationNumbers: [],
          },
        ],
      }),
      model: "qwen-plus",
      requestId: "request-dynamic",
      usage: { inputTokens: 120, outputTokens: 30, totalTokens: 150 },
    }));

    const response = await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          artworkId: "artic:999998",
          message: "这件作品画于什么时候？",
          history: [],
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      answer: "馆藏把这件风景画记录为1910年的作品。至于河流带来的感受，我更愿意把它留给你的观看。",
      responseType: "imagined_response",
      personaMode: "dynamic",
      citations: [{ number: 1, publisher: "The Art Institute of Chicago" }],
      displaySegments: [{ citationNumbers: [1] }, { citationNumbers: [] }],
    });
    expect(createQwenJsonResponse).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("Ada Painter"),
        }),
      ]),
      expect.any(Function),
    );
  });

  it("does not open chat without a server-side artwork record", async () => {
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
      code: "artwork_context_unavailable",
    });
  });
});
