import { describe, expect, it } from "vitest";

import { assemblePersonaDialogue } from "../../../ai/stage7/dialogue-assembler.mjs";
import { normalizeArticArtwork } from "@/src/lib/artic";
import {
  getReviewedPersonaForCatalogArtwork,
  getReviewedPersonaOpeningForCatalogArtwork,
} from "@/src/lib/persona-openings";
import { artistPersonaPackageSchema } from "@/src/schemas/ai-content";

function monetWaterLilies() {
  return normalizeArticArtwork(
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
}

describe("reviewed artist routing", () => {
  it("extends Monet's persona to an artwork without a hand-authored context", () => {
    const artwork = monetWaterLilies();
    const resolution = getReviewedPersonaForCatalogArtwork(artwork);

    expect(resolution).toMatchObject({
      tier: "artist",
      persona: {
        artistId: "artic-artist:35809",
        identity: { displayName: "克劳德·莫奈" },
      },
    });
    expect(() => artistPersonaPackageSchema.parse(resolution!.persona)).not.toThrow();

    const assembly = assemblePersonaDialogue({
      persona: resolution!.persona,
      artworkId: artwork.id,
    });
    expect(assembly.artworkContext.claimIds).toContain("claim:artic:16568:identity");
    expect(assembly.claims.map((claim: { claimId: string }) => claim.claimId)).not.toContain(
      "claim:monet:water-lily-artwork",
    );
    expect(assembly.instructions).toContain("克劳德·莫奈数字化身");
    expect(assembly.instructions).toContain("把其他作品的专属史料");
  });

  it("uses a reviewed-persona opening instead of the generic imagined-voice template", () => {
    const opening = getReviewedPersonaOpeningForCatalogArtwork(monetWaterLilies());

    expect(opening?.chinese).toContain("我从来不喜欢理论抢在眼睛前面");
    expect(opening?.chinese).toContain("光线一变，颜色之间的关系也会跟着改变");
    expect(opening?.chinese).not.toContain("我是Claude Monet的想象性声音");
    expect(opening?.citations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          publisher: "The Art Institute of Chicago",
          url: "https://www.artic.edu/artworks/16568",
        }),
        expect.objectContaining({
          title: expect.stringContaining("translated letters, part 2"),
        }),
      ]),
    );
  });
});
