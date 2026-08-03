import { describe, expect, it, vi } from "vitest";

vi.mock("@/src/lib/qwen", () => ({
  QwenRequestError: class QwenRequestError extends Error {
    retryable = false;
  },
  createQwenJsonResponse: vi.fn(async (messages, parse) => ({
    data: parse({
      answer:
        "1906年，我画下了《Water Lilies》。那一刻我想留住的不是一个固定轮廓，而是颜色正在发生的变化。",
      englishAnswer:
        "In 1906, I painted Water Lilies. At that moment I wanted to hold not a fixed outline, but a change taking place among colors.",
      englishSegments: [
        "In 1906, I painted Water Lilies.",
        " At that moment I wanted to hold not a fixed outline, but a change taking place among colors.",
      ],
      responseType: "imagined_response",
      segments: [
        {
          text: "1906年，我画下了《Water Lilies》。",
          layer: "fact",
          claimIds: ["claim:artic:16568:identity"],
        },
        {
          text: "那一刻我想留住的不是一个固定轮廓，而是颜色正在发生的变化。",
          layer: "persona_reconstruction",
          claimIds: [],
        },
      ],
      evidenceRefIds: [],
    }),
    model: "qwen-plus",
    requestId: "opening-request-1",
    usage: { inputTokens: 300, outputTokens: 80, totalTokens: 380 },
  })),
}));

import { normalizeArticArtwork } from "@/src/lib/artic";
import { generateReviewedPersonaOpeningForCatalogArtwork } from "@/src/lib/generated-persona-opening";
import { createQwenJsonResponse } from "@/src/lib/qwen";

describe("generated persona opening", () => {
  it("asks AI to write an artwork-specific Monet opening and preserves evidence", async () => {
    const artwork = normalizeArticArtwork(
      {
        id: 16568,
        title: "Water Lilies",
        date_display: "1906",
        date_start: 1906,
        date_end: 1906,
        artist_id: 35809,
        artist_title: "Claude Monet",
        artist_display: "Claude Monet (French, 1840–1926)",
        medium_display: "Oil on canvas",
        dimensions: "89.9 × 94.1 cm",
        image_id: "test-image",
        is_public_domain: true,
        copyright_notice: null,
        is_zoomable: true,
        artwork_type_id: 1,
        artwork_type_title: "Painting",
      },
      {
        iiif_url: "https://www.artic.edu/iiif/2",
        website_url: "https://www.artic.edu",
      },
      "2026-07-29T00:00:00.000Z",
    );

    const opening = await generateReviewedPersonaOpeningForCatalogArtwork(artwork);

    expect(opening).toMatchObject({
      chinese: expect.stringContaining("1906年，我画下了《Water Lilies》"),
      responseType: "imagined_response",
      citations: [
        expect.objectContaining({
          publisher: "The Art Institute of Chicago",
          url: "https://www.artic.edu/artworks/16568",
        }),
      ],
    });
    expect(createQwenJsonResponse).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          role: "system",
          content: expect.stringContaining("克劳德·莫奈数字化身"),
        }),
        expect.objectContaining({
          role: "user",
          content: expect.stringMatching(/Water Lilies[\s\S]*什么时候画了这幅画[\s\S]*创作处境/),
        }),
      ],
      expect.any(Function),
    );
  });
});
