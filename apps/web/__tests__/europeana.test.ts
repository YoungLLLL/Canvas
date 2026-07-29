import { describe, expect, it } from "vitest";

import { artworkKey, parseArtworkKey } from "@/src/lib/catalog-source";
import { normalizeEuropeanaArtwork } from "@/src/lib/europeana";

describe("Europeana catalog adapter", () => {
  it("normalizes a multi-institution record without hiding a restricted image", () => {
    const artwork = normalizeEuropeanaArtwork(
      {
        id: "/90402/RP_P_1984_87",
        title: ["River Landscape"],
        dcCreator: ["Example Artist"],
        year: ["1889"],
        dcType: ["painting"],
        dataProvider: ["Rijksmuseum"],
        edmIsShownAt: ["https://museum.example/object"],
        edmPreview: ["https://images.example/preview.jpg"],
        rights: ["https://rightsstatements.org/vocab/InC/1.0/"],
      },
      "2026-07-29T00:00:00Z",
    );

    expect(artwork.source.label).toBe("Rijksmuseum");
    expect(artwork.images.preferred?.directUrl).toBe("https://images.example/preview.jpg");
    expect(artwork.eligibility.status).toBe("metadata_only_rights");
  });

  it("prefers Europeana's generated preview over a non-image media viewer", () => {
    const artwork = normalizeEuropeanaArtwork({
      id: "/123/example",
      title: ["Example"],
      dataProvider: ["Example museum"],
      edmIsShownBy: ["https://vimeo.com/524909325"],
      edmPreview: ["https://api.europeana.eu/thumbnail/v3/400/example.jpg"],
    });

    expect(artwork.images.preferred?.directUrl).toBe(
      "https://api.europeana.eu/thumbnail/v3/400/example.jpg",
    );
  });

  it("does not treat a video or 3D viewer as a directly displayable image", () => {
    const video = normalizeEuropeanaArtwork({
      id: "/123/video",
      title: ["Video"],
      edmIsShownBy: ["https://vimeo.com/524909325"],
    });
    const image = normalizeEuropeanaArtwork({
      id: "/123/image",
      title: ["Image"],
      edmIsShownBy: ["https://images.example/artwork.webp?size=large"],
    });

    expect(video.images.preferred).toBeNull();
    expect(video.eligibility.status).toBe("metadata_only_no_image");
    expect(image.images.preferred?.directUrl).toBe(
      "https://images.example/artwork.webp?size=large",
    );
  });

  it("round-trips Europeana identifiers through a route-safe artwork key", () => {
    const key = artworkKey("europeana", "90402/RP_P_1984_87");
    expect(parseArtworkKey(key)).toEqual({
      source: "europeana",
      sourceId: "90402/RP_P_1984_87",
    });
  });
});
