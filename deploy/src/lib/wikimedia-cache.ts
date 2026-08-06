import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ArticCommonsImage } from "@/src/lib/wikimedia";

type CacheEntry =
  | {
      version: 1;
      checkedAt: string;
      status: "mapped";
      image: ArticCommonsImage;
    }
  | {
      version: 1;
      checkedAt: string;
      status: "no_usable_mapping";
    };

const POSITIVE_TTL_MS = 30 * 24 * 60 * 60 * 1_000;
const NEGATIVE_TTL_MS = 24 * 60 * 60 * 1_000;

function cacheRoot() {
  return path.resolve(process.cwd(), process.env.WIKIMEDIA_CACHE_DIR || ".cache/wikimedia/artic");
}

function cachePath(articId: string) {
  return path.join(cacheRoot(), `${articId}.json`);
}

function isFresh(entry: CacheEntry) {
  const checkedAt = Date.parse(entry.checkedAt);
  if (!Number.isFinite(checkedAt)) return false;
  const ttl = entry.status === "mapped" ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
  return Date.now() - checkedAt < ttl;
}

function isCacheEntry(value: unknown): value is CacheEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<CacheEntry>;
  if (entry.version !== 1 || typeof entry.checkedAt !== "string") return false;
  if (entry.status === "no_usable_mapping") return true;
  return entry.status === "mapped" && Boolean(entry.image);
}

export async function readArticCommonsCache(articIds: string[]) {
  const entries = new Map<string, CacheEntry>();
  await Promise.all(
    articIds.map(async (articId) => {
      try {
        const value: unknown = JSON.parse(await readFile(cachePath(articId), "utf8"));
        if (isCacheEntry(value) && isFresh(value)) entries.set(articId, value);
      } catch {
        // A missing, stale, or malformed cache entry is an ordinary cache miss.
      }
    }),
  );
  return entries;
}

export async function writeArticCommonsCache(entries: Map<string, ArticCommonsImage | null>) {
  try {
    await mkdir(cacheRoot(), { recursive: true });
    const checkedAt = new Date().toISOString();
    await Promise.all(
      Array.from(entries, ([articId, image]) => {
        const entry: CacheEntry = image
          ? { version: 1, checkedAt, status: "mapped", image }
          : { version: 1, checkedAt, status: "no_usable_mapping" };
        return writeFile(cachePath(articId), `${JSON.stringify(entry)}\n`, "utf8");
      }),
    );
  } catch (error) {
    console.warn("Wikimedia metadata cache is not writable; continuing without persistence", error);
  }
}
