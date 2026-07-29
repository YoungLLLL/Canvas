import { describe, expect, it } from "vitest";

import { normalizeArtistIdentity } from "@/src/lib/artist-identity";
import { resolveChineseArtworkTitle } from "@/src/lib/localized-artwork-title";
import { selectChineseEntityLabel } from "@/src/lib/wikimedia";

describe("artist identity normalization", () => {
  it("separates attribution wording from the canonical artist name", () => {
    expect(
      normalizeArtistIdentity("Attributed to Nicolaes Maes (Dutch, 1634–1693)", "Nicolaes Maes"),
    ).toMatchObject({
      canonicalName: "Nicolaes Maes",
      attributionType: "attributed_to",
      details: "Dutch, 1634–1693",
    });
  });

  it("supports common museum attribution qualifiers without a preferred name", () => {
    expect(normalizeArtistIdentity("Workshop of Rembrandt (Dutch, 1606–1669)")).toMatchObject({
      canonicalName: "Rembrandt",
      attributionType: "workshop_of",
    });
  });
});

describe("Chinese artwork title resolution", () => {
  const artwork = {
    sourceId: "example",
    display: {
      title: "Example",
      localizedTitles: { en: "Example" },
      altTitles: [] as string[],
    },
  };

  it("prefers Simplified Chinese locale variants and rejects English language fallbacks", () => {
    expect(
      resolveChineseArtworkTitle({
        ...artwork,
        display: {
          ...artwork.display,
          localizedTitles: {
            en: "Example",
            zh: "English fallback incorrectly stored under zh",
            "zh-Hans": "示例作品",
          },
        },
      }),
    ).toMatchObject({
      text: "示例作品",
      source: "wikidata",
      status: "verified",
    });
  });

  it("keeps the English title visible when no Chinese source exists", () => {
    expect(resolveChineseArtworkTitle(artwork)).toEqual({
      text: "Example",
      source: "english",
      status: "unavailable",
      hasChinese: false,
    });
  });

  it("marks local title candidates as provisional instead of verified museum data", () => {
    expect(
      resolveChineseArtworkTitle({
        ...artwork,
        sourceId: "86782",
        display: {
          ...artwork.display,
          title: "Portrait of a Woman",
          localizedTitles: { en: "Portrait of a Woman" },
        },
      }),
    ).toMatchObject({
      text: "女子肖像",
      source: "provisional",
      status: "provisional",
    });
  });
});

describe("Wikidata Chinese label selection", () => {
  it("uses a real Chinese label instead of languagefallback English text", () => {
    expect(
      selectChineseEntityLabel({
        zh: { value: "Portrait of a Woman" },
        "zh-hans": { value: "女子肖像" },
        en: { value: "Portrait of a Woman" },
      }),
    ).toEqual({ value: "女子肖像", locale: "zh-hans" });
    expect(selectChineseEntityLabel({ zh: { value: "Portrait of a Woman" } })).toBeNull();
  });
});
