import { compactObject, fetchJson, uniqueStrings } from "./shared.mjs";

const apiBase = "https://collectionapi.metmuseum.org/public/collection/v1";

export function normalizeMetArtwork(record) {
  const publicDomain = record.isPublicDomain === true;
  const preferred = record.primaryImage ? {
    kind: "primary",
    url: record.primaryImage,
    thumbnailUrl: record.primaryImageSmall || record.primaryImage,
  } : null;
  return compactObject({
    id: `met:${record.objectID}`,
    source: "met",
    sourceId: String(record.objectID),
    sourceUrl: record.objectURL,
    apiUrl: `${apiBase}/objects/${record.objectID}`,
    title: record.title,
    alternateTitles: [],
    artist: compactObject({
      name: record.artistDisplayName,
      display: [record.artistDisplayName, record.artistNationality, record.artistDisplayBio].filter(Boolean).join("; "),
      role: record.artistRole,
    }),
    date: compactObject({ display: record.objectDate, start: record.objectBeginDate, end: record.objectEndDate }),
    origin: record.country || record.culture,
    medium: record.medium,
    dimensions: record.dimensions,
    classification: record.classification,
    department: record.department,
    accessionNumber: record.accessionNumber,
    creditLine: record.creditLine,
    images: preferred ? {
      preferred,
      alternates: uniqueStrings(record.additionalImages).map((url) => ({ kind: "alternate", url })),
    } : { alternates: [] },
    rights: {
      publicDomain,
      code: publicDomain ? "CC0" : "RESTRICTED",
      notice: record.rightsAndReproduction || null,
      licenseUrl: publicDomain ? "https://creativecommons.org/publicdomain/zero/1.0/" : record.objectURL,
      attribution: record.creditLine || "The Metropolitan Museum of Art",
    },
  });
}

export const metProvider = {
  id: "met",
  label: "The Metropolitan Museum of Art",
  capabilities: ["search", "by-id", "public-domain-filter"],
  async getArtworks({ ids = [], query, limit = 20, publicDomainOnly = false }, context = {}) {
    let objectIds = ids;
    let total = ids.length;
    if (!objectIds.length) {
      const params = new URLSearchParams({ q: query || "art", hasImages: "true" });
      if (publicDomainOnly) params.set("isPublicDomain", "true");
      const search = await fetchJson(`${apiBase}/search?${params}`, context);
      total = search.total || 0;
      objectIds = (search.objectIDs || []).slice(0, Math.min(Math.max(limit, 1), 20));
    }
    const records = await Promise.all(objectIds.slice(0, 20).map((id) => fetchJson(`${apiBase}/objects/${id}`, context)));
    const items = records.map(normalizeMetArtwork).filter((item) => !publicDomainOnly || item.rights.publicDomain);
    return { source: this.id, total, items };
  },
};
