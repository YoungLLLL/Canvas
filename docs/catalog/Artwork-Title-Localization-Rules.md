# Artwork title localization rules

Every museum added to the formal catalog must use the shared catalog entry points in
`apps/web/src/lib/catalog.ts`. Those entry points apply Chinese title localization to both
collection pages and individual artwork records.

## Resolution order

1. Curated Chinese title tied to the exact full artwork ID.
2. Chinese title supplied by the museum, Wikidata, or another verified source.
3. Chinese original-language title supplied as an alternate title.
4. Curated title matched against the exact English title.
5. Cached machine translation, visibly marked as provisional.
6. English title with the UI state “暂无可靠中文译名”.

## Identity and cache requirements

- Translation identity is the full artwork ID, such as `artic:28560`, `met:436535`, or
  `cleveland:94979`.
- Numeric source IDs must never be treated as globally unique.
- Cache files live under `.cache/translations/zh-Hans/<source>/<encoded-source-id>.json`.
- A cached translation is valid only while both the full artwork ID and source title match.
- Existing Art Institute version-1 cache entries may be read for migration, but new writes use
  the source-scoped version-2 format.

## Provider checklist

When adding a museum:

- Populate `Artwork.id`, `sourceId`, `source.id`, the English title, localized titles, alternate
  titles, and localized-title metadata accurately.
- Preserve an original-language Chinese title in `altTitles` or `localizedTitles`.
- Register collection and detail retrieval through `getCatalogCollection` and
  `getCatalogArtwork`; do not bypass these entry points in formal pages or APIs.
- Add a collision test proving that the same numeric source ID in two museums cannot share a
  cached or seeded translation.
- Keep generated translations marked `machine` and `provisional`; never present them as official
  museum metadata.

## Verified Wikidata matching

Wikidata labels may be marked verified only when the artwork entity is resolved through an exact
institution identifier:

- The Met: use the official API's `objectWikidata_URL`.
- Cleveland Museum of Art: match the official `accession_number` against Wikidata property
  `P11110` (Cleveland Museum of Art ID).
- Art Institute of Chicago: match the museum artwork ID against Wikidata property `P4610`.

Title/artist fuzzy search must not produce a verified title. If an exact item has no Chinese label,
the catalog continues to the project-curated or provisional machine-translation stages.
