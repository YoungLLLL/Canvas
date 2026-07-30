import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { attachProvisionalChineseTitles } from "../src/lib/artwork-title-translations.ts";
import { artworkSchema, type Artwork } from "../src/schemas/catalog.ts";

const commonsCacheRoot = path.resolve(process.cwd(), ".cache/wikimedia/artic");
const translationCacheRoot = path.resolve(process.cwd(), ".cache/translations/zh-Hans/artic");
const seedOutputPath = path.resolve(
  process.cwd(),
  "src/data/artwork-title-translations.zh-Hans.ts",
);
const cacheFileSchema = z.object({
  status: z.literal("mapped"),
  image: z.object({
    titleEn: z.string().min(1),
    titleZh: z.string().optional(),
  }),
});

const filenames = (await readdir(commonsCacheRoot))
  .filter((filename) => /^\d+\.json$/.test(filename))
  .sort((left, right) => Number.parseInt(left) - Number.parseInt(right));

const artworks: Artwork[] = [];
for (const filename of filenames) {
  const parsed = cacheFileSchema.safeParse(
    JSON.parse(await readFile(path.join(commonsCacheRoot, filename), "utf8")),
  );
  if (!parsed.success || /[\u3400-\u9fff]/u.test(parsed.data.image.titleZh || "")) continue;
  const sourceId = filename.replace(/\.json$/, "");
  const title = parsed.data.image.titleEn;
  artworks.push(
    artworkSchema.parse({
      id: `artic:${sourceId}`,
      sourceId,
      museumId: "artic",
      source: {
        id: "artic",
        label: "The Art Institute of Chicago",
        recordUrl: `https://www.artic.edu/artworks/${sourceId}`,
        termsUrl: "https://www.artic.edu/terms",
        accessedAt: new Date().toISOString(),
      },
      display: {
        title,
        localizedTitles: { en: title },
        localizedTitleMetadata: {
          en: { source: "wikidata", status: "verified" },
        },
        altTitles: [],
        artistDisplay: "Unknown artist",
      },
      artist: null,
      date: { start: null, end: null },
      classification: {
        artworkTypeId: 1,
        artworkTypeTitle: "Painting",
        classificationTitles: [],
      },
      images: { preferred: null, alternates: [] },
      rights: {
        work: { status: "public_domain", notice: null },
        image: { licenseCode: "unknown", licenseUrl: null, usage: null },
        metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
        termsUrl: "https://www.artic.edu/terms",
        attribution: `${title}. The Art Institute of Chicago.`,
      },
      eligibility: {
        status: "metadata_only_no_image",
        ruleVersion: "translation-backfill",
        checkedAt: new Date().toISOString(),
        reasons: ["translation_backfill_record"],
      },
      revision: `translation-backfill-${sourceId}`,
    }),
  );
}

let completed = 0;
for (let index = 0; index < artworks.length; index += 20) {
  const batch = artworks.slice(index, index + 20);
  await attachProvisionalChineseTitles(batch);
  completed += batch.length;
  process.stdout.write(`Translated or checked ${completed}/${artworks.length}\n`);
}

const seedEntries: Record<
  string,
  { sourceTitle: string; zhHans: string; model: string; generatedAt: string }
> = {};
for (const filename of (await readdir(translationCacheRoot)).filter((name) =>
  /^\d+\.json$/.test(name),
)) {
  const value = JSON.parse(await readFile(path.join(translationCacheRoot, filename), "utf8")) as {
    artworkId?: string;
    sourceId?: string;
    sourceTitle?: string;
    zhHans?: string;
    model?: string;
    generatedAt?: string;
  };
  if (
    value.artworkId &&
    value.sourceId &&
    value.sourceTitle &&
    value.zhHans &&
    value.model &&
    value.generatedAt
  ) {
    seedEntries[value.artworkId] = {
      sourceTitle: value.sourceTitle,
      zhHans: value.zhHans,
      model: value.model,
      generatedAt: value.generatedAt,
    };
  }
}
const sortedSeedEntries = Object.fromEntries(
  Object.entries(seedEntries).sort(([left], [right]) => left.localeCompare(right)),
);
await mkdir(path.dirname(seedOutputPath), { recursive: true });
await writeFile(
  seedOutputPath,
  `export const SEEDED_ARTWORK_TITLE_TRANSLATIONS = ${JSON.stringify(
    sortedSeedEntries,
    null,
    2,
  )} as const;\n`,
  "utf8",
);
process.stdout.write(`Wrote ${Object.keys(sortedSeedEntries).length} seeded translations\n`);
