import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

const cacheRoot = path.resolve(process.cwd(), ".cache/translations/zh-Hans");
const outputPath = path.resolve(
  process.cwd(),
  "src/data/artwork-title-translations.catalog.zh-Hans.ts",
);

const entrySchema = z.object({
  version: z.literal(2),
  artworkId: z.string().regex(/^[a-z][a-z0-9-]*:/),
  sourceId: z.string().min(1),
  sourceTitle: z.string().min(1),
  zhHans: z.string().regex(/[\u3400-\u9fff]/u),
  model: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
});

const entries: Record<
  string,
  { sourceTitle: string; zhHans: string; model: string; generatedAt: string }
> = {};

for (const source of await readdir(cacheRoot, { withFileTypes: true })) {
  if (!source.isDirectory()) continue;
  const sourceRoot = path.join(cacheRoot, source.name);
  for (const file of await readdir(sourceRoot, { withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith(".json")) continue;
    const parsed = entrySchema.safeParse(
      JSON.parse(await readFile(path.join(sourceRoot, file.name), "utf8")),
    );
    if (!parsed.success) continue;
    const { artworkId, sourceTitle, zhHans, model, generatedAt } = parsed.data;
    entries[artworkId] = { sourceTitle, zhHans, model, generatedAt };
  }
}

const sorted = Object.fromEntries(
  Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)),
);
await writeFile(
  outputPath,
  `export const CATALOG_ARTWORK_TITLE_TRANSLATIONS = ${JSON.stringify(sorted, null, 2)} as const;\n`,
  "utf8",
);
process.stdout.write(`Promoted ${Object.keys(sorted).length} catalog title translations\n`);
