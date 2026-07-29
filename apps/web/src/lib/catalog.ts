import { getArticArtwork, getArticCollection } from "@/src/lib/artic";
import type { CatalogSource } from "@/src/lib/catalog-source";
import { getEuropeanaArtwork, getEuropeanaCollection } from "@/src/lib/europeana";
import type { CollectionQuery } from "@/src/schemas/routes";

export function getCatalogCollection(
  source: CatalogSource,
  query: CollectionQuery,
  cursor?: string,
) {
  return source === "artic" ? getArticCollection(query) : getEuropeanaCollection(query, cursor);
}

export function getCatalogArtwork(source: CatalogSource, sourceId: string) {
  return source === "artic" ? getArticArtwork(sourceId) : getEuropeanaArtwork(sourceId);
}
