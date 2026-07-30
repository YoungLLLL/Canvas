import { getArticArtwork, getArticCollection } from "@/src/lib/artic";
import { getClevelandArtwork, getClevelandCollection } from "@/src/lib/cleveland";
import type { CatalogSource } from "@/src/lib/catalog-source";
import { getEuropeanaArtwork, getEuropeanaCollection } from "@/src/lib/europeana";
import { getMetArtwork, getMetCollection } from "@/src/lib/met";
import { attachProvisionalChineseTitles } from "@/src/lib/artwork-title-translations";
import type { CollectionQuery } from "@/src/schemas/routes";

export async function getCatalogCollection(
  source: CatalogSource,
  query: CollectionQuery,
  cursor?: string,
) {
  const page =
    source === "artic"
      ? await getArticCollection(query)
      : source === "met"
        ? await getMetCollection(query, cursor)
        : source === "cleveland"
          ? await getClevelandCollection(query, cursor)
          : await getEuropeanaCollection(query, cursor);
  return {
    ...page,
    items: await attachProvisionalChineseTitles(page.items),
  };
}

export async function getCatalogArtwork(source: CatalogSource, sourceId: string) {
  const artwork =
    source === "artic"
      ? await getArticArtwork(sourceId)
      : source === "met"
        ? await getMetArtwork(sourceId)
        : source === "cleveland"
          ? await getClevelandArtwork(sourceId)
          : await getEuropeanaArtwork(sourceId);
  if (!artwork) return null;
  return (await attachProvisionalChineseTitles([artwork]))[0] ?? null;
}
