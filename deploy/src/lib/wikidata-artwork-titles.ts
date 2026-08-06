import { artworkSchema, type Artwork } from "@/src/schemas/catalog";
import { getWikidataChineseLabels } from "@/src/lib/wikimedia";

export type WikidataArtworkTitle = {
  value: string;
  locale: string;
};

export function attachVerifiedWikidataTitle(
  artwork: Artwork,
  title: WikidataArtworkTitle | undefined,
) {
  if (!title || !/[\u3400-\u9fff]/u.test(title.value)) return artwork;
  return artworkSchema.parse({
    ...artwork,
    display: {
      ...artwork.display,
      localizedTitles: {
        ...artwork.display.localizedTitles,
        zh: title.value,
        [title.locale]: title.value,
      },
      localizedTitleMetadata: {
        ...artwork.display.localizedTitleMetadata,
        zh: { source: "wikidata", status: "verified" },
        [title.locale]: { source: "wikidata", status: "verified" },
      },
    },
  });
}

export async function attachWikidataTitles(
  records: Array<{ artwork: Artwork; wikidataId?: string }>,
) {
  const ids = records.flatMap(({ wikidataId }) => (wikidataId ? [wikidataId] : []));
  if (!ids.length) return records.map(({ artwork }) => artwork);
  try {
    const labels = await getWikidataChineseLabels(ids);
    return records.map(({ artwork, wikidataId }) =>
      attachVerifiedWikidataTitle(artwork, wikidataId ? labels.get(wikidataId) : undefined),
    );
  } catch (error) {
    console.warn(
      "Wikidata artwork-title lookup failed; continuing without verified Chinese titles",
      error instanceof Error ? error.message : error,
    );
    return records.map(({ artwork }) => artwork);
  }
}
