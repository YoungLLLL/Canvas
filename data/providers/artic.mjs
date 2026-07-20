import { cleanText, compactObject, fetchJson, uniqueStrings } from "./shared.mjs";

const apiBase = "https://api.artic.edu/api/v1";
const fields = [
  "id", "title", "alt_titles", "date_display", "date_start", "date_end", "artist_title", "artist_display",
  "place_of_origin", "description", "short_description", "dimensions", "medium_display", "credit_line",
  "main_reference_number", "image_id", "alt_image_ids", "is_public_domain", "copyright_notice",
  "classification_title", "department_title", "gallery_title", "artwork_type_title", "style_title", "api_link",
].join(",");

function imageRecord(imageId, iiifBase, publicDomain, kind = "primary") {
  if (!imageId) return null;
  const width = publicDomain ? 1686 : 843;
  return compactObject({
    id: imageId,
    kind,
    iiifBaseUrl: `${iiifBase}/${imageId}`,
    url: `${iiifBase}/${imageId}/full/${width},/0/default.jpg`,
    thumbnailUrl: `${iiifBase}/${imageId}/full/400,/0/default.jpg`,
    width,
  });
}

export function normalizeArticArtwork(record, config = {}) {
  const publicDomain = record.is_public_domain === true;
  const iiifBase = config.iiif_url || "https://www.artic.edu/iiif/2";
  const primary = imageRecord(record.image_id, iiifBase, publicDomain);
  const alternates = (record.alt_image_ids || []).map((id) => imageRecord(id, iiifBase, publicDomain, "alternate"));
  return compactObject({
    id: `artic:${record.id}`,
    source: "artic",
    sourceId: String(record.id),
    sourceUrl: `https://www.artic.edu/artworks/${record.id}`,
    apiUrl: record.api_link || `${apiBase}/artworks/${record.id}`,
    iiifManifestUrl: `${apiBase}/artworks/${record.id}/manifest.json`,
    title: record.title,
    alternateTitles: uniqueStrings(record.alt_titles),
    artist: compactObject({ name: record.artist_title, display: record.artist_display }),
    date: compactObject({ display: record.date_display, start: record.date_start, end: record.date_end }),
    origin: record.place_of_origin,
    medium: record.medium_display,
    dimensions: record.dimensions,
    description: cleanText(record.short_description || record.description),
    classification: record.classification_title || record.artwork_type_title,
    style: record.style_title,
    department: record.department_title,
    gallery: record.gallery_title,
    accessionNumber: record.main_reference_number,
    creditLine: record.credit_line,
    images: primary ? { preferred: primary, alternates } : { alternates },
    rights: {
      publicDomain,
      code: publicDomain ? "CC0" : "RESTRICTED",
      notice: record.copyright_notice || null,
      licenseUrl: publicDomain ? "https://creativecommons.org/publicdomain/zero/1.0/" : "https://www.artic.edu/terms",
      attribution: record.credit_line || "The Art Institute of Chicago",
    },
  });
}

export const articProvider = {
  id: "artic",
  label: "Art Institute of Chicago",
  capabilities: ["search", "batch-by-id", "iiif", "public-domain-filter"],
  async getArtworks({ ids = [], query, limit = 20, publicDomainOnly = false }, context = {}) {
    const params = new URLSearchParams({ limit: String(Math.min(Math.max(limit, 1), 100)), fields });
    let endpoint = `${apiBase}/artworks`;
    if (ids.length) params.set("ids", ids.join(","));
    else if (query || publicDomainOnly) {
      endpoint += "/search";
      if (query) params.set("q", query);
    }
    if (publicDomainOnly) params.set("query[term][is_public_domain]", "true");
    const payload = await fetchJson(`${endpoint}?${params}`, context);
    return {
      source: this.id,
      total: payload.pagination?.total ?? payload.data?.length ?? 0,
      items: (payload.data || [])
        .map((item) => normalizeArticArtwork(item, payload.config))
        .filter((item) => !publicDomainOnly || item.rights.publicDomain),
    };
  },
};
