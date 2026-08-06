import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { SEEDED_ARTWORK_TITLE_TRANSLATIONS } from "../data/artwork-title-translations.zh-Hans.ts";
import { CATALOG_ARTWORK_TITLE_TRANSLATIONS } from "../data/artwork-title-translations.catalog.zh-Hans.ts";
import { containsChinese, resolveChineseArtworkTitle } from "./localized-artwork-title.ts";
import { createQwenJsonResponse, getQwenStatus } from "./qwen.ts";
import { artworkSchema, type Artwork } from "../schemas/catalog.ts";

const CACHE_VERSION = 2;
const BATCH_LIMIT = 20;

const translationItemSchema = z
  .object({
    artworkId: z.string().regex(/^[a-z][a-z0-9-]*:[A-Za-z0-9._~/-]+$/),
    zhHans: z.string().trim().min(1).max(160).optional(),
    title: z.string().trim().min(1).max(160).optional(),
    chineseTitle: z.string().trim().min(1).max(160).optional(),
  })
  .transform((value, context) => {
    const zhHans = value.zhHans || value.chineseTitle || value.title;
    if (!zhHans) {
      context.addIssue({
        code: "custom",
        message: "A translated title is required",
      });
      return z.NEVER;
    }
    return { artworkId: value.artworkId, zhHans };
  });

const translationListSchema = z.array(translationItemSchema).max(BATCH_LIMIT);

const translationResponseSchema = z
  .union([
    z
      .object({
        translations: translationListSchema,
      })
      .strict(),
    translationListSchema,
  ])
  .transform((value) => (Array.isArray(value) ? { translations: value } : value));

type TranslationCacheEntry = {
  version: 2;
  artworkId: string;
  sourceId: string;
  sourceTitle: string;
  zhHans: string;
  model: string;
  generatedAt: string;
};

function cacheRoot() {
  return path.resolve(
    process.cwd(),
    process.env.ARTWORK_TITLE_TRANSLATION_CACHE_DIR || ".cache/translations/zh-Hans",
  );
}

function artworkIdentity(artwork: Artwork) {
  const separator = artwork.id.indexOf(":");
  const source = separator > 0 ? artwork.id.slice(0, separator) : artwork.source.id;
  return {
    artworkId: artwork.id,
    source,
    encodedSourceId: encodeURIComponent(artwork.sourceId),
  };
}

function cachePathForIdentity(artworkId: string, sourceId: string) {
  const separator = artworkId.indexOf(":");
  const source = separator > 0 ? artworkId.slice(0, separator) : "unknown";
  return path.join(cacheRoot(), source, `${encodeURIComponent(sourceId)}.json`);
}

export function artworkTranslationCachePath(artwork: Artwork) {
  const identity = artworkIdentity(artwork);
  return path.join(cacheRoot(), identity.source, `${identity.encodedSourceId}.json`);
}

function legacyArticCachePath(artwork: Artwork) {
  return artwork.source.id === "artic"
    ? path.resolve(process.cwd(), ".cache/translations/artic-zh-Hans", `${artwork.sourceId}.json`)
    : null;
}

function isCacheEntry(value: unknown): value is TranslationCacheEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<TranslationCacheEntry>;
  return (
    entry.version === CACHE_VERSION &&
    typeof entry.artworkId === "string" &&
    typeof entry.sourceId === "string" &&
    typeof entry.sourceTitle === "string" &&
    typeof entry.zhHans === "string" &&
    containsChinese(entry.zhHans) &&
    typeof entry.model === "string" &&
    typeof entry.generatedAt === "string"
  );
}

async function readCachedTranslation(artwork: Artwork) {
  const sourceTitle = artwork.display.localizedTitles.en || artwork.display.title;
  const seededTranslations = {
    ...SEEDED_ARTWORK_TITLE_TRANSLATIONS,
    ...CATALOG_ARTWORK_TITLE_TRANSLATIONS,
  } as Record<string, Omit<TranslationCacheEntry, "version" | "artworkId" | "sourceId">>;
  const seeded =
    seededTranslations[artwork.id] ??
    (artwork.source.id === "artic" ? seededTranslations[artwork.sourceId] : undefined);
  if (seeded?.sourceTitle === sourceTitle && containsChinese(seeded.zhHans)) {
    return {
      version: CACHE_VERSION,
      artworkId: artwork.id,
      sourceId: artwork.sourceId,
      ...seeded,
    } satisfies TranslationCacheEntry;
  }
  const candidates = [artworkTranslationCachePath(artwork), legacyArticCachePath(artwork)].filter(
    (value): value is string => Boolean(value),
  );
  for (const candidate of candidates) {
    try {
      const value: unknown = JSON.parse(await readFile(candidate, "utf8"));
      if (
        isCacheEntry(value) &&
        value.artworkId === artwork.id &&
        value.sourceId === artwork.sourceId &&
        value.sourceTitle === sourceTitle
      ) {
        return value;
      }
      if (
        candidate === legacyArticCachePath(artwork) &&
        value &&
        typeof value === "object" &&
        (value as { version?: number }).version === 1 &&
        (value as { sourceId?: string }).sourceId === artwork.sourceId &&
        (value as { sourceTitle?: string }).sourceTitle === sourceTitle &&
        containsChinese((value as { zhHans?: string }).zhHans)
      ) {
        const legacy = value as {
          sourceId: string;
          sourceTitle: string;
          zhHans: string;
          model?: string;
          generatedAt?: string;
        };
        return {
          version: CACHE_VERSION,
          artworkId: artwork.id,
          sourceId: artwork.sourceId,
          sourceTitle,
          zhHans: legacy.zhHans,
          model: legacy.model || "legacy-cache",
          generatedAt: legacy.generatedAt || new Date(0).toISOString(),
        };
      }
    } catch {
      // Try the next compatible cache location.
    }
  }
  return null;
}

async function writeCachedTranslations(entries: TranslationCacheEntry[]) {
  if (!entries.length) return;
  await mkdir(cacheRoot(), { recursive: true });
  await Promise.all(
    entries.map((entry) => {
      const target = cachePathForIdentity(entry.artworkId, entry.sourceId);
      return mkdir(path.dirname(target), { recursive: true }).then(() =>
        writeFile(target, `${JSON.stringify(entry)}\n`, "utf8"),
      );
    }),
  );
}

function translationPrompt(artworks: Artwork[]) {
  const records = artworks.map((artwork) => ({
    artworkId: artwork.id,
    title: artwork.display.localizedTitles.en || artwork.display.title,
    artist: artwork.artist?.name || artwork.display.artistDisplay,
    date: artwork.display.dateDisplay || null,
  }));
  return [
    "Translate every artwork title below into concise Simplified Chinese for a museum collection interface.",
    "These are provisional display translations, not claims about official Chinese titles.",
    "Preserve distinctions such as study, sketch, portrait, place names, seasons, and parenthetical subtitles.",
    "Use established Chinese artist/place transliterations when confident. Do not add explanations, quotation marks, IDs, or uncertainty labels to zhHans.",
    "Return exactly one item for every artworkId and no extra items.",
    JSON.stringify(records),
  ].join("\n");
}

async function generateTranslations(artworks: Artwork[]) {
  if (!artworks.length || !getQwenStatus().configured) return [];
  const expected = new Map(
    artworks.map((artwork) => [
      artwork.id,
      {
        sourceId: artwork.sourceId,
        sourceTitle: artwork.display.localizedTitles.en || artwork.display.title,
      },
    ]),
  );
  const generated = await createQwenJsonResponse(
    [
      {
        role: "system",
        content:
          "You are a bilingual museum catalog editor. Produce faithful, compact artwork-title translations.",
      },
      { role: "user", content: translationPrompt(artworks) },
    ],
    (value) => translationResponseSchema.parse(value),
  );
  const seen = new Set<string>();
  const generatedAt = new Date().toISOString();
  return generated.data.translations.flatMap((translation) => {
    const expectedArtwork = expected.get(translation.artworkId);
    if (
      !expectedArtwork ||
      seen.has(translation.artworkId) ||
      !containsChinese(translation.zhHans)
    ) {
      return [];
    }
    seen.add(translation.artworkId);
    return [
      {
        version: CACHE_VERSION,
        artworkId: translation.artworkId,
        sourceId: expectedArtwork.sourceId,
        sourceTitle: expectedArtwork.sourceTitle,
        zhHans: translation.zhHans,
        model: generated.model,
        generatedAt,
      } satisfies TranslationCacheEntry,
    ];
  });
}

function attachTranslation(artwork: Artwork, entry: TranslationCacheEntry | null) {
  if (!entry) return artwork;
  return artworkSchema.parse({
    ...artwork,
    display: {
      ...artwork.display,
      localizedTitles: {
        ...artwork.display.localizedTitles,
        "zh-Hans": entry.zhHans,
      },
      localizedTitleMetadata: {
        ...artwork.display.localizedTitleMetadata,
        "zh-Hans": { source: "machine", status: "provisional" },
      },
    },
  });
}

export async function attachProvisionalChineseTitles(items: Artwork[]) {
  const unresolved = items
    .filter((artwork) => !resolveChineseArtworkTitle(artwork).hasChinese)
    .slice(0, BATCH_LIMIT);
  if (!unresolved.length) return items;

  const cachedEntries = await Promise.all(unresolved.map(readCachedTranslation));
  const cachedById = new Map(
    cachedEntries
      .filter((entry): entry is TranslationCacheEntry => entry !== null)
      .map((entry) => [entry.sourceId, entry]),
  );
  const pending = unresolved.filter((artwork) => !cachedById.has(artwork.sourceId));

  if (pending.length && getQwenStatus().configured) {
    try {
      const generated = await generateTranslations(pending);
      await writeCachedTranslations(generated);
      for (const entry of generated) cachedById.set(entry.sourceId, entry);
    } catch (error) {
      console.warn(
        "Artwork title translation failed; continuing with sourced titles",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return items.map((artwork) =>
    attachTranslation(artwork, cachedById.get(artwork.sourceId) ?? null),
  );
}
