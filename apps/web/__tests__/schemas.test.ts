import { describe, expect, it } from "vitest";

import { claimSchema } from "@/src/schemas/ai-content";
import { artworkSchema } from "@/src/schemas/catalog";

const baseArtwork = {
  id: "artic:28560",
  sourceId: "28560",
  museumId: "artic",
  source: {
    id: "artic",
    label: "The Art Institute of Chicago",
    recordUrl: "https://www.artic.edu/artworks/28560",
    apiUrl: "https://api.artic.edu/api/v1/artworks/28560",
    accessedAt: "2026-07-20T08:00:00Z",
  },
  display: { title: "The Bedroom", artistDisplay: "Vincent van Gogh" },
  artist: null,
  date: { start: 1889, end: 1889 },
  classification: { artworkTypeId: 1, artworkTypeTitle: "Painting" },
  images: {
    preferred: {
      id: "image-1",
      iiifBaseUrl: "https://www.artic.edu/iiif/2/image-1",
      zoomable: true,
      maxZoomWindowSize: null,
      health: "ok",
    },
    alternates: [],
  },
  rights: {
    work: { status: "public_domain", notice: null },
    image: {
      licenseCode: "CC0-1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    },
    metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
    termsUrl: "https://www.artic.edu/terms",
    attribution: "Vincent van Gogh. The Bedroom, 1889. The Art Institute of Chicago.",
  },
  eligibility: {
    status: "image_displayable",
    ruleVersion: "artic-showcase-v1-2026-07-20",
    checkedAt: "2026-07-20T08:00:00Z",
    reasons: [],
  },
  revision: "fixture-v1",
};

describe("runtime domain schemas", () => {
  it("accepts an eligible painting with a licensed preferred image", () => {
    expect(artworkSchema.parse(baseArtwork).id).toBe("artic:28560");
  });

  it("rejects displayable artwork without a preferred image", () => {
    const result = artworkSchema.safeParse({
      ...baseArtwork,
      images: { preferred: null, alternates: [] },
    });
    expect(result.success).toBe(false);
  });

  it("requires speculation to state its qualification", () => {
    const result = claimSchema.safeParse({
      claimId: "claim:1",
      subjectId: "artic:28560",
      layer: "speculation",
      text: "The room may suggest solitude.",
      sourceRefs: [],
      visualEvidence: [],
      confidence: "low",
      status: "generated",
    });
    expect(result.success).toBe(false);
  });
});
