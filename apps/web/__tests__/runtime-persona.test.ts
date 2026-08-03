import { describe, expect, it } from "vitest";

import {
  assemblePersonaDialogue,
  finalizePersonaDialogue,
} from "../../../ai/stage7/dialogue-assembler.mjs";
import { normalizeArticArtwork } from "@/src/lib/artic";
import { buildCatalogPersona } from "@/src/lib/runtime-persona";

describe("catalog persona fallback", () => {
  it("builds a source-bounded persona that passes dialogue validation", () => {
    const artwork = normalizeArticArtwork(
      {
        id: 16487,
        title: "The Basket of Apples",
        date_display: "c. 1893",
        date_start: 1893,
        date_end: 1893,
        artist_id: 36399,
        artist_title: "Paul Cézanne",
        artist_display: "Paul Cézanne\nFrench, 1839–1906",
        medium_display: "Oil on canvas",
        dimensions: "65.1 × 80.6 cm",
        image_id: "test-image",
        is_public_domain: true,
        copyright_notice: null,
        is_zoomable: true,
        artwork_type_id: 1,
        artwork_type_title: "Painting",
        short_description:
          "A still life in which a tilted table and bottle create an intentionally unstable arrangement.",
      },
      {
        iiif_url: "https://www.artic.edu/iiif/2",
        website_url: "https://www.artic.edu",
      },
      "2026-07-28T12:00:00Z",
    );
    const persona = buildCatalogPersona(artwork);
    const assembly = assemblePersonaDialogue({
      persona,
      artworkId: "artic:16487",
    });
    const dialogue = finalizePersonaDialogue({
      assembly,
      modelOutput: {
        answer: "我会先请你观察桌面的倾斜，以及它怎样让这组静物显得不安定。",
        englishAnswer:
          "I would first ask you to notice the tilted tabletop and how it makes the still life feel unstable.",
        englishSegments: [
          "I would first ask you to notice the tilted tabletop and how it makes the still life feel unstable.",
        ],
        responseType: "imagined_response",
        segments: [
          {
            text: "我会先请你观察桌面的倾斜，以及它怎样让这组静物显得不安定。",
            layer: "persona_reconstruction",
            claimIds: [],
          },
        ],
        evidenceRefIds: [],
      },
      modelRevision: "test-model",
    });

    expect(persona.disclosure.short).toContain("不代表艺术家原话");
    expect(persona.artworkContexts["artic:16487"].openingTemplates[0]).toMatchObject({
      text: expect.stringContaining("你的目光最先停在哪一处细节、光线或颜色上"),
      englishText: expect.stringContaining("where does your eye settle first"),
    });
    expect(assembly.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claimId: "claim:artic:16487:attribution",
          sourceRefs: [
            expect.objectContaining({
              sourceId: "source:artic:16487",
              support: "direct",
            }),
          ],
        }),
      ]),
    );
    expect(dialogue).toMatchObject({
      responseType: "imagined_response",
      personaVersion: "catalog-persona/1.0.0",
      promptVersion: "catalog-persona/1.0.0",
    });
  });
});
