import test from "node:test";
import assert from "node:assert/strict";
import { articProvider, normalizeArticArtwork } from "../data/providers/artic.mjs";
import { normalizeClevelandArtwork } from "../data/providers/cleveland.mjs";
import { normalizeMetArtwork } from "../data/providers/met.mjs";
import { normalizeWikidataMuseum } from "../data/providers/wikidata.mjs";

test("Art Institute records expose IIIF derivatives and explicit image rights", () => {
  const item = normalizeArticArtwork({
    id: 28560,
    title: "The Bedroom",
    alt_titles: null,
    artist_title: "Vincent van Gogh",
    date_display: "1889",
    image_id: "image-uuid",
    is_public_domain: true,
    credit_line: "Helen Birch Bartlett Memorial Collection",
  }, { iiif_url: "https://images.example/iiif/2" });

  assert.equal(item.id, "artic:28560");
  assert.equal(item.rights.code, "CC0");
  assert.equal(item.images.preferred.url, "https://images.example/iiif/2/image-uuid/full/1686,/0/default.jpg");
  assert.equal(item.iiifManifestUrl, "https://api.artic.edu/api/v1/artworks/28560/manifest.json");
});

test("Art Institute provider batches curated IDs", async () => {
  let requestedUrl;
  const fetchImpl = async (url) => {
    requestedUrl = String(url);
    return {
      ok: true,
      async json() {
        return {
          data: [{ id: 28560, title: "The Bedroom", image_id: "image-uuid", is_public_domain: true }],
          config: { iiif_url: "https://images.example/iiif/2" },
        };
      },
    };
  };
  const result = await articProvider.getArtworks({ ids: [28560], limit: 20, publicDomainOnly: true }, { fetchImpl });
  assert.match(requestedUrl, /artworks\?/);
  assert.match(requestedUrl, /ids=28560/);
  assert.equal(result.items.length, 1);
});

test("Met records retain the museum source and public-domain image", () => {
  const item = normalizeMetArtwork({
    objectID: 436535,
    title: "Wheat Field with Cypresses",
    artistDisplayName: "Vincent van Gogh",
    isPublicDomain: true,
    primaryImage: "https://images.metmuseum.org/original.jpg",
    primaryImageSmall: "https://images.metmuseum.org/small.jpg",
    objectURL: "https://www.metmuseum.org/art/collection/search/436535",
  });
  assert.equal(item.source, "met");
  assert.equal(item.rights.code, "CC0");
  assert.equal(item.images.preferred.url, "https://images.metmuseum.org/original.jpg");
});

test("Cleveland records prefer print images and preserve the original", () => {
  const item = normalizeClevelandArtwork({
    id: 123,
    title: "Example",
    share_license_status: "CC0",
    images: {
      web: { url: "https://openaccess-cdn.example/web.jpg", width: 900 },
      print: { url: "https://openaccess-cdn.example/print.jpg", width: 3400 },
      full: { url: "https://openaccess-cdn.example/original.tif", width: 6000 },
    },
  });
  assert.equal(item.images.preferred.url, "https://openaccess-cdn.example/print.jpg");
  assert.equal(item.images.preferred.originalUrl, "https://openaccess-cdn.example/original.tif");
  assert.equal(item.rights.publicDomain, true);
});

test("Wikidata museum records expose multilingual identity and coordinates", () => {
  const item = normalizeWikidataMuseum({
    id: "Q239303",
    labels: { zh: { value: "芝加哥艺术博物馆" }, en: { value: "Art Institute of Chicago" } },
    descriptions: { en: { value: "art museum in Chicago" } },
    claims: {
      P625: [{ mainsnak: { datavalue: { value: { latitude: 41.8796, longitude: -87.6237 } } } }],
      P856: [{ mainsnak: { datavalue: { value: "https://www.artic.edu/" } } }],
      P17: [{ mainsnak: { datavalue: { value: { id: "Q30" } } } }],
    },
    sitelinks: { enwiki: { title: "Art Institute of Chicago" } },
  }, new Map([["Q30", "United States of America"]]));
  assert.equal(item.names.zh, "芝加哥艺术博物馆");
  assert.equal(item.coordinates.latitude, 41.8796);
  assert.equal(item.country.name, "United States of America");
  assert.equal(item.rights.code, "CC0");
});
