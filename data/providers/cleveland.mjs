import { cleanText, compactObject, fetchJson } from "./shared.mjs";

const apiBase = "https://openaccess-api.clevelandart.org/api";

function normalizeImage(image, kind = "primary") {
  if (!image) return null;
  const preferredUrl = image.print?.url || image.full?.url || image.web?.url;
  if (!preferredUrl) return null;
  return compactObject({
    kind,
    url: preferredUrl,
    thumbnailUrl: image.web?.url || preferredUrl,
    originalUrl: image.full?.url,
    width: image.print?.width || image.full?.width || image.web?.width,
    height: image.print?.height || image.full?.height || image.web?.height,
  });
}

export function normalizeClevelandArtwork(record) {
  const publicDomain = record.share_license_status === "CC0";
  const creators = (record.creators || []).map((creator) => creator.description || creator.name).filter(Boolean);
  const preferred = normalizeImage(record.images);
  const alternates = (record.alternate_images || []).map((image) => normalizeImage(image, "alternate")).filter(Boolean);
  return compactObject({
    id: `cleveland:${record.id}`,
    source: "cleveland",
    sourceId: String(record.id),
    sourceUrl: record.url,
    apiUrl: `${apiBase}/artworks/${record.id}`,
    title: record.title,
    alternateTitles: [record.title_in_original_language].filter(Boolean),
    artist: compactObject({ name: creators[0], display: creators.join("; ") }),
    date: compactObject({ display: record.creation_date, start: record.creation_date_earliest, end: record.creation_date_latest }),
    origin: record.culture?.join?.(", ") || record.culture,
    medium: record.technique,
    dimensions: record.measurements,
    description: cleanText(record.wall_description || record.didactic_description),
    classification: record.type,
    department: record.department,
    gallery: record.current_location,
    accessionNumber: record.accession_number,
    creditLine: record.creditline,
    images: preferred ? { preferred, alternates } : { alternates },
    rights: {
      publicDomain,
      code: record.share_license_status || "UNKNOWN",
      notice: record.copyright,
      licenseUrl: publicDomain ? "https://creativecommons.org/publicdomain/zero/1.0/" : record.url,
      attribution: record.creditline || "The Cleveland Museum of Art",
    },
  });
}

export const clevelandProvider = {
  id: "cleveland",
  label: "The Cleveland Museum of Art",
  capabilities: ["search", "by-id", "full-resolution", "public-domain-filter"],
  async getArtworks({ ids = [], query, limit = 20, publicDomainOnly = false }, context = {}) {
    if (ids.length) {
      const payloads = await Promise.all(ids.slice(0, 20).map((id) => fetchJson(`${apiBase}/artworks/${encodeURIComponent(id)}`, context)));
      const items = payloads.map((payload) => normalizeClevelandArtwork(payload.data)).filter((item) => !publicDomainOnly || item.rights.publicDomain);
      return { source: this.id, total: items.length, items };
    }
    const params = new URLSearchParams({ limit: String(Math.min(Math.max(limit, 1), 100)) });
    if (query) params.set("q", query);
    if (publicDomainOnly) params.append("cc0", "");
    const payload = await fetchJson(`${apiBase}/artworks/?${params}`, context);
    return {
      source: this.id,
      total: payload.info?.total ?? payload.data?.length ?? 0,
      items: (payload.data || []).map(normalizeClevelandArtwork),
    };
  },
};
