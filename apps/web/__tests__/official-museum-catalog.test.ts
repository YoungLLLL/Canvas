import { describe, expect, it } from "vitest";

import { isClevelandPainting, normalizeClevelandArtwork } from "@/src/lib/cleveland";
import { artworkTranslationCachePath } from "@/src/lib/artwork-title-translations";
import { artworkKey, parseArtworkKey, sourceForMuseumSlug } from "@/src/lib/catalog-source";
import { isMetPainting, metArtworkWikidataId, normalizeMetArtwork } from "@/src/lib/met";
import { attachVerifiedWikidataTitle } from "@/src/lib/wikidata-artwork-titles";

describe("official museum painting catalogs", () => {
  it("accepts only The Met records explicitly classified as paintings", () => {
    expect(isMetPainting({ objectName: "Painting", classification: "Paintings" })).toBe(true);
    expect(isMetPainting({ objectName: "Painting, triptych", classification: "Paintings" })).toBe(
      true,
    );
    expect(isMetPainting({ objectName: "Hanging scrolls", classification: "Paintings" })).toBe(
      true,
    );
    expect(isMetPainting({ objectName: "Drawing", classification: "Drawings" })).toBe(false);
    expect(
      normalizeMetArtwork({
        objectID: 436535,
        objectName: "Painting",
        classification: "Paintings",
        title: "Wheat Field with Cypresses",
        artistDisplayName: "Vincent van Gogh",
        objectDate: "1889",
        isPublicDomain: true,
        primaryImage: "https://images.metmuseum.org/original.jpg",
        primaryImageSmall: "https://images.metmuseum.org/small.jpg",
        objectURL: "https://www.metmuseum.org/art/collection/search/436535",
      }),
    ).toMatchObject({
      id: "met:436535",
      sourceId: "436535",
      museumId: "met",
      classification: { artworkTypeTitle: "Painting" },
      images: {
        preferred: {
          directUrl: "https://images.metmuseum.org/small.jpg",
          directUrl2x: "https://images.metmuseum.org/original.jpg",
        },
      },
      eligibility: { status: "image_displayable" },
    });
    expect(
      normalizeMetArtwork({
        objectID: 1,
        objectName: "Sculpture",
        classification: "Sculpture",
        title: "Not a painting",
      }),
    ).toBeNull();
  });

  it("accepts only Cleveland CC0 painting images", () => {
    expect(isClevelandPainting({ type: "Painting" })).toBe(true);
    expect(isClevelandPainting({ type: "Drawing" })).toBe(false);
    expect(
      normalizeClevelandArtwork({
        id: 123,
        accession_number: "1953.424",
        type: "Painting",
        title: "Example painting",
        share_license_status: "CC0",
        creators: [{ description: "Example Artist" }],
        images: {
          web: { url: "https://openaccess-cdn.example/web.jpg", width: 900, height: 700 },
          print: {
            url: "https://openaccess-cdn.example/print.jpg",
            width: 3400,
            height: 2600,
          },
        },
      }),
    ).toMatchObject({
      id: "cleveland:123",
      museumId: "cleveland",
      classification: { artworkTypeTitle: "Painting" },
      images: {
        preferred: {
          directUrl: "https://openaccess-cdn.example/web.jpg",
          directUrl2x: "https://openaccess-cdn.example/print.jpg",
        },
      },
      eligibility: { status: "image_displayable" },
    });
    expect(
      normalizeClevelandArtwork({
        id: 124,
        type: "Drawing",
        title: "Not a painting",
      }),
    ).toBeNull();
  });

  it("round-trips official museum routes", () => {
    expect(sourceForMuseumSlug("metropolitan-museum-of-art")).toBe("met");
    expect(sourceForMuseumSlug("cleveland-museum-of-art")).toBe("cleveland");
    expect(parseArtworkKey(artworkKey("met", "436535"))).toEqual({
      source: "met",
      sourceId: "436535",
    });
    expect(parseArtworkKey(artworkKey("cleveland", "123"))).toEqual({
      source: "cleveland",
      sourceId: "123",
    });
  });

  it("uses source-scoped translation cache paths", () => {
    const met = normalizeMetArtwork({
      objectID: 123,
      objectName: "Painting",
      classification: "Paintings",
      title: "Met title",
      isPublicDomain: true,
      primaryImage: "https://images.metmuseum.org/met.jpg",
    });
    const cleveland = normalizeClevelandArtwork({
      id: 123,
      type: "Painting",
      title: "Cleveland title",
      share_license_status: "CC0",
      images: { web: { url: "https://openaccess-cdn.clevelandart.org/cleveland.jpg" } },
    });
    expect(met).not.toBeNull();
    expect(cleveland).not.toBeNull();
    expect(artworkTranslationCachePath(met!)).toMatch(/[\\/]met[\\/]123\.json$/);
    expect(artworkTranslationCachePath(cleveland!)).toMatch(/[\\/]cleveland[\\/]123\.json$/);
    expect(artworkTranslationCachePath(met!)).not.toBe(artworkTranslationCachePath(cleveland!));
  });

  it("extracts The Met's exact object Wikidata ID", () => {
    expect(
      metArtworkWikidataId({
        objectID: 437261,
        objectName: "Painting",
        classification: "Paintings",
        objectWikidata_URL: "https://www.wikidata.org/wiki/Q19883233",
      }),
    ).toBe("Q19883233");
    expect(
      metArtworkWikidataId({
        objectID: 437261,
        objectName: "Painting",
        classification: "Paintings",
      }),
    ).toBeUndefined();
  });

  it("marks an exact Wikidata Chinese label as verified", () => {
    const artwork = normalizeMetArtwork({
      objectID: 437261,
      objectName: "Painting",
      classification: "Paintings",
      title: "The Penitence of Saint Jerome",
      isPublicDomain: true,
      primaryImage: "https://images.metmuseum.org/met.jpg",
    });
    expect(artwork).not.toBeNull();
    expect(
      attachVerifiedWikidataTitle(artwork!, {
        value: "圣哲罗姆的忏悔",
        locale: "zh-hans",
      }),
    ).toMatchObject({
      display: {
        localizedTitles: { zh: "圣哲罗姆的忏悔", "zh-hans": "圣哲罗姆的忏悔" },
        localizedTitleMetadata: {
          zh: { source: "wikidata", status: "verified" },
          "zh-hans": { source: "wikidata", status: "verified" },
        },
      },
    });
  });
});
