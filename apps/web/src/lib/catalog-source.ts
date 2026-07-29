export const catalogSources = ["artic", "europeana"] as const;
export type CatalogSource = (typeof catalogSources)[number];

export function isCatalogSource(value: string): value is CatalogSource {
  return catalogSources.includes(value as CatalogSource);
}

export function sourceForMuseumSlug(slug: string): CatalogSource | null {
  if (slug === "art-institute-of-chicago") return "artic";
  if (slug === "europeana") return "europeana";
  return null;
}

export function museumSlugForSource(source: CatalogSource) {
  return source === "artic" ? "art-institute-of-chicago" : "europeana";
}

function encodeSourceId(sourceId: string) {
  return encodeURIComponent(sourceId).replaceAll("~", "%7E").replaceAll("%", "~");
}

function decodeSourceId(value: string) {
  return decodeURIComponent(value.replaceAll("~", "%"));
}

export function artworkKey(source: CatalogSource, sourceId: string) {
  return `${source}-${source === "artic" ? sourceId : encodeSourceId(sourceId)}`;
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
      sourceId: source === "artic" ? encodedId : decodeSourceId(encodedId),
    };
  } catch {
    return null;
  }
}
