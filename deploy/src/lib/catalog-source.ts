export const catalogSources = ["artic", "met", "cleveland", "europeana"] as const;
export type CatalogSource = (typeof catalogSources)[number];

export function isCatalogSource(value: string): value is CatalogSource {
  return catalogSources.includes(value as CatalogSource);
}

export function sourceForMuseumSlug(slug: string): CatalogSource | null {
  if (slug === "art-institute-of-chicago") return "artic";
  if (slug === "metropolitan-museum-of-art") return "met";
  if (slug === "cleveland-museum-of-art") return "cleveland";
  if (slug === "europeana") return "europeana";
  return null;
}

export function museumSlugForSource(source: CatalogSource) {
  if (source === "artic") return "art-institute-of-chicago";
  if (source === "met") return "metropolitan-museum-of-art";
  if (source === "cleveland") return "cleveland-museum-of-art";
  return "europeana";
}

function encodeSourceId(sourceId: string) {
  return encodeURIComponent(sourceId).replaceAll("~", "%7E").replaceAll("%", "~");
}

function decodeSourceId(value: string) {
  return decodeURIComponent(value.replaceAll("~", "%"));
}

export function artworkKey(source: CatalogSource, sourceId: string) {
  return `${source}-${source === "europeana" ? encodeSourceId(sourceId) : sourceId}`;
}

export function parseArtworkKey(value: string): { source: CatalogSource; sourceId: string } | null {
  const separator = value.indexOf("-");
  if (separator < 1) return null;
  const source = value.slice(0, separator);
  const encodedId = value.slice(separator + 1);
  if (!isCatalogSource(source) || !encodedId) return null;
  try {
    return {
      source,
      sourceId: source === "europeana" ? decodeSourceId(encodedId) : encodedId,
    };
  } catch {
    return null;
  }
}
