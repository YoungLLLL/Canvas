import { describe, expect, it } from "vitest";

import { buildArticCollectionUrl, normalizeArticArtwork } from "@/src/lib/artic";
import { collectionQuerySchema } from "@/src/schemas/routes";

const rawArtwork = {
  id: 28560,
  api_link: "https://api.artic.edu/api/v1/artworks/28560",
  title: "The Bedroom",
  date_display: "1889",
  date_start: 1889,
  date_end: 1889,
  artist_id: 40610,
  artist_title: "Vincent van Gogh",
  artist_display: "Vincent van Gogh\nDutch, 1853–1890",
  image_id: "5e965ba0-2f13-13be-35b6-8c7162b4d191",
  thumbnail: {
    lqip: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
    width: 3000,
    height: 2377,
    alt_text: "A bedroom with blue walls.",
  },
  is_public_domain: true,
  copyright_notice: null,
  is_zoomable: true,
  max_zoom_window_size: -1,
  artwork_type_id: 1,
  artwork_type_title: "Painting",
  updated_at: "2026-07-20T08:00:00-05:00",
};

const config = {
  iiif_url: "https://www.artic.edu/iiif/2",
  website_url: "http://www.artic.edu",
};

describe("ARTIC stage 5 adapter", () => {
  it("normalizes an eligible painting into the runtime domain schema", () => {
    const artwork = normalizeArticArtwork(rawArtwork, config, "2026-07-21T08:00:00Z");
    expect(artwork.id).toBe("artic:28560");
    expect(artwork.eligibility.status).toBe("image_displayable");
    expect(artwork.source.recordUrl).toBe("https://www.artic.edu/artworks/28560");
    expect(artwork.images.preferred?.width).toBe(3000);
    expect(artwork.images.preferred?.maxZoomWindowSize).toBeNull();
  });

  it("quarantines a public-domain record with a conflicting copyright notice", () => {
    const artwork = normalizeArticArtwork(
      { ...rawArtwork, copyright_notice: "Rights may apply" },
      config,
      "2026-07-21T08:00:00Z",
    );
    expect(artwork.eligibility.status).toBe("quarantined_rights_conflict");
    expect(artwork.eligibility.reasons).toContain("rights_field_conflict");
  });

  it("keeps a rights-safe painting without an image as a metadata-only record", () => {
    const artwork = normalizeArticArtwork(
      { ...rawArtwork, image_id: null, thumbnail: null },
      config,
      "2026-07-21T08:00:00Z",
    );
    expect(artwork.eligibility.status).toBe("metadata_only_no_image");
    expect(artwork.images.preferred).toBeNull();
  });

  it("builds a constrained server-side search instead of forwarding raw query syntax", () => {
    const url = new URL(
      buildArticCollectionUrl(collectionQuerySchema.parse({ q: "monet", from: "1870" })),
    );
    const remoteParams = JSON.parse(url.searchParams.get("params") ?? "{}");
    const remoteQuery = remoteParams.query;
    expect(url.pathname).toBe("/api/v1/artworks/search");
    expect(remoteQuery.bool.must).toContainEqual({
      multi_match: {
        query: "monet",
        fields: ["title^3", "artist_title^2", "artist_display", "description", "short_description"],
      },
    });
    expect(remoteQuery.bool.must).toContainEqual({ term: { artwork_type_id: 1 } });
    expect(remoteQuery.bool.must).toContainEqual({ term: { is_public_domain: true } });
    expect(remoteParams).toMatchObject({ from: 0, size: 12 });
    expect(remoteQuery.bool.must_not).toContainEqual({
      exists: { field: "copyright_notice" },
    });
  });

  it("uses Elasticsearch from/size offsets for deterministic deep pagination", () => {
    const url = new URL(buildArticCollectionUrl(collectionQuerySchema.parse({ page: "100" })));
    const remoteParams = JSON.parse(url.searchParams.get("params") ?? "{}");
    expect(remoteParams).toMatchObject({ from: 1188, size: 12 });
    expect(remoteParams.page).toBeUndefined();
  });

  it("does not request beyond the 10,000-result search window on the last page", () => {
    const url = new URL(buildArticCollectionUrl(collectionQuerySchema.parse({ page: "834" })));
    const remoteParams = JSON.parse(url.searchParams.get("params") ?? "{}");
    expect(remoteParams).toMatchObject({ from: 9996, size: 4 });
  });

  it("combines repeated artists with OR and supports metadata-only searches", () => {
    const url = new URL(
      buildArticCollectionUrl(
        collectionQuerySchema.parse({ artist: ["40610", "35809"], availability: "metadata" }),
      ),
    );
    const remoteQuery = JSON.parse(url.searchParams.get("params") ?? "{}").query;
    expect(remoteQuery.bool.must).toContainEqual({ terms: { artist_ids: ["40610", "35809"] } });
    expect(remoteQuery.bool.must_not).toContainEqual({ exists: { field: "image_id" } });
  });
});
