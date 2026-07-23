import { z } from "zod";

import type { Locale } from "@/src/i18n/locales";

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";
const WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php";
const COMMONS_API_URL = "https://commons.wikimedia.org/w/api.php";
const PAGE_SIZE = 12;
const CANDIDATE_SIZE = 30;
const USER_AGENT = "CanviumGallery/0.1 (Wikimedia Commons evaluation)";

const sparqlSchema = z.object({
  results: z.object({
    bindings: z.array(z.record(z.string(), z.object({ value: z.string() }).loose())),
  }),
});

const searchSchema = z.object({
  search: z.array(z.object({ id: z.string().regex(/^Q\d+$/) }).loose()).default([]),
});

const labelsSchema = z.object({
  entities: z.record(
    z.string(),
    z
      .object({
        labels: z.record(z.string(), z.object({ value: z.string() }).loose()).optional(),
        descriptions: z.record(z.string(), z.object({ value: z.string() }).loose()).optional(),
      })
      .loose(),
  ),
});

const metadataValueSchema = z.object({ value: z.string() }).loose();
const imageInfoSchema = z
  .object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    thumburl: z.string().url(),
    thumbwidth: z.number().int().positive(),
    thumbheight: z.number().int().positive(),
    responsiveUrls: z.record(z.string(), z.string().url()).optional(),
    url: z.string().url(),
    descriptionurl: z.string().url(),
    mime: z.string(),
    extmetadata: z.record(z.string(), metadataValueSchema).optional(),
  })
  .loose();
const commonsSchema = z.object({
  query: z
    .object({
      pages: z.array(
        z
          .object({
            title: z.string(),
            imageinfo: z.array(imageInfoSchema).optional(),
          })
          .loose(),
      ),
    })
    .optional(),
});

type Binding = z.infer<typeof sparqlSchema>["results"]["bindings"][number];
type ImageInfo = z.infer<typeof imageInfoSchema>;

export type ArticCommonsImage = {
  titleEn?: string;
  titleZh?: string;
  src: string;
  src2x?: string;
  originalUrl: string;
  sourceUrl: string;
  width: number;
  height: number;
  licenseCode: "CC0-1.0" | "PDM-1.0";
  licenseUrl: string;
  attribution: string;
};

export type WikimediaArtwork = {
  id: string;
  title: string;
  description?: string;
  artist: string;
  date?: string;
  collection?: string;
  sourceUrl: string;
  image: {
    src: string;
    src2x?: string;
    originalUrl: string;
    width: number;
    height: number;
    license: string;
    licenseUrl?: string;
    attribution: string;
  };
};

export type WikimediaCollection = {
  items: WikimediaArtwork[];
  page: number;
  hasNextPage: boolean;
  fetchedAt: string;
};

function entityId(value: string | undefined) {
  return value?.match(/Q\d+$/)?.[0];
}

export function commonsFileTitle(specialFilePath: string) {
  const pathname = new URL(specialFilePath).pathname;
  const filename = decodeURIComponent(pathname.slice(pathname.lastIndexOf("/") + 1)).replaceAll(
    "_",
    " ",
  );
  return `File:${filename}`;
}

function plainText(value: string | undefined) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function isPublicDomainImage(info: ImageInfo) {
  const metadata = info.extmetadata ?? {};
  return (
    metadata.Copyrighted?.value === "False" ||
    /public domain|cc0/i.test(metadata.LicenseShortName?.value ?? "")
  );
}

async function fetchJson(url: string, init?: RequestInit, attempts = 2): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          "Api-User-Agent": USER_AGENT,
          "User-Agent": USER_AGENT,
          ...init?.headers,
        },
        next: { revalidate: 300 },
      });
      if (!response.ok) {
        throw new Error(
          `Wikimedia request to ${new URL(url).hostname} failed with ${response.status}`,
        );
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

async function searchEntityIds(query: string, locale: Locale) {
  const languages = locale === "zh" ? ["zh", "en"] : ["en"];
  const results = await Promise.all(
    languages.map(async (language) => {
      const params = new URLSearchParams({
        action: "wbsearchentities",
        format: "json",
        language,
        limit: "20",
        search: query,
        type: "item",
        origin: "*",
      });
      return searchSchema
        .parse(await fetchJson(`${WIKIDATA_API_URL}?${params}`))
        .search.map((item) => item.id);
    }),
  );
  return Array.from(new Set(results.flat())).slice(0, 30);
}

function candidateQuery(page: number, searchIds: string[]) {
  const offset = (page - 1) * CANDIDATE_SIZE;
  if (searchIds.length) {
    const values = searchIds.map((id) => `wd:${id}`).join(" ");
    return `
      SELECT DISTINCT ?artwork ?image WHERE {
        {
          VALUES ?artwork { ${values} }
          ?artwork wdt:P31 wd:Q3305213; wdt:P18 ?image.
        }
        UNION
        {
          VALUES ?creator { ${values} }
          ?artwork wdt:P31 wd:Q3305213; wdt:P170 ?creator; wdt:P18 ?image.
        }
      }
      LIMIT ${CANDIDATE_SIZE + 1} OFFSET ${offset}
    `;
  }
  return `
    SELECT DISTINCT ?artwork ?image WHERE {
      ?artwork wdt:P31 wd:Q3305213; wdt:P18 ?image.
    }
    LIMIT ${CANDIDATE_SIZE + 1} OFFSET ${offset}
  `;
}

async function runSparql(query: string) {
  const params = new URLSearchParams({ query, format: "json" });
  return sparqlSchema.parse(
    await fetchJson(`${WIKIDATA_SPARQL_URL}?${params}`, {
      headers: { Accept: "application/sparql-results+json" },
    }),
  ).results.bindings;
}

async function getDetails(ids: string[]) {
  if (!ids.length) return [];
  const values = ids.map((id) => `wd:${id}`).join(" ");
  return runSparql(`
    SELECT ?artwork ?image ?creator ?date ?collection WHERE {
      VALUES ?artwork { ${values} }
      ?artwork wdt:P18 ?image.
      OPTIONAL { ?artwork wdt:P170 ?creator. }
      OPTIONAL { ?artwork wdt:P571 ?date. }
      OPTIONAL { ?artwork wdt:P195 ?collection. }
    }
  `);
}

async function getLabels(ids: string[], locale: Locale) {
  if (!ids.length) return {};
  const languages = locale === "zh" ? "zh|en" : "en";
  const chunks = Array.from({ length: Math.ceil(ids.length / 50) }, (_, index) =>
    ids.slice(index * 50, (index + 1) * 50),
  );
  const responses = await Promise.all(
    chunks.map(async (chunk) => {
      const params = new URLSearchParams({
        action: "wbgetentities",
        format: "json",
        formatversion: "2",
        ids: chunk.join("|"),
        props: "labels|descriptions",
        languages,
        languagefallback: "1",
        origin: "*",
      });
      return labelsSchema.parse(await fetchJson(`${WIKIDATA_API_URL}?${params}`)).entities;
    }),
  );
  return Object.assign({}, ...responses);
}

async function getCommonsImages(fileTitles: string[]) {
  if (!fileTitles.length) return new Map<string, ImageInfo>();
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    titles: fileTitles.join("|"),
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "843",
    iiextmetadatafilter:
      "Artist|Credit|ImageDescription|ObjectName|DateTimeOriginal|LicenseShortName|LicenseUrl|UsageTerms|Copyrighted",
    iiextmetadatalanguage: "en",
    origin: "*",
  });
  const response = commonsSchema.parse(await fetchJson(`${COMMONS_API_URL}?${params}`));
  const images = new Map<string, ImageInfo>();
  for (const page of response.query?.pages ?? []) {
    const info = page.imageinfo?.[0];
    if (info) images.set(page.title.replaceAll("_", " "), info);
  }
  return images;
}

export async function getCommonsImagesForArticIds(articIds: string[]) {
  const safeIds = Array.from(new Set(articIds.filter((id) => /^\d+$/.test(id))));
  if (!safeIds.length) return new Map<string, ArticCommonsImage>();
  const values = safeIds.map((id) => `"${id}"`).join(" ");
  const bindings = await runSparql(`
    SELECT DISTINCT ?artwork ?articId ?image WHERE {
      VALUES ?articId { ${values} }
      ?artwork wdt:P4610 ?articId; wdt:P18 ?image.
    }
  `);
  const candidates = bindings
    .map((binding) => {
      const articId = binding.articId?.value;
      const imageUrl = binding.image?.value;
      const artworkId = entityId(binding.artwork?.value);
      return articId && artworkId && imageUrl
        ? { articId, artworkId, fileTitle: commonsFileTitle(imageUrl) }
        : undefined;
    })
    .filter((candidate) => candidate !== undefined);
  const [images, labels] = await Promise.all([
    getCommonsImages(Array.from(new Set(candidates.map((candidate) => candidate.fileTitle)))),
    getLabels(Array.from(new Set(candidates.map((candidate) => candidate.artworkId))), "zh"),
  ]);
  const result = new Map<string, ArticCommonsImage>();
  for (const candidate of candidates) {
    if (result.has(candidate.articId)) continue;
    const info = images.get(candidate.fileTitle.replaceAll("_", " "));
    if (!info || !isPublicDomainImage(info) || !info.mime.startsWith("image/")) continue;
    const metadata = info.extmetadata ?? {};
    const cc0 = /cc0/i.test(metadata.LicenseShortName?.value ?? "");
    const entityLabels = labels[candidate.artworkId]?.labels;
    result.set(candidate.articId, {
      titleEn: entityLabels?.en?.value,
      titleZh: entityLabels?.zh?.value,
      src: info.thumburl,
      src2x: info.responsiveUrls?.["2"],
      originalUrl: info.url,
      sourceUrl: info.descriptionurl,
      width: info.thumbwidth,
      height: info.thumbheight,
      licenseCode: cc0 ? "CC0-1.0" : "PDM-1.0",
      licenseUrl:
        metadata.LicenseUrl?.value ??
        (cc0
          ? "https://creativecommons.org/publicdomain/zero/1.0/"
          : "https://creativecommons.org/publicdomain/mark/1.0/"),
      attribution:
        plainText(metadata.Credit?.value) ??
        plainText(metadata.Artist?.value) ??
        "Wikimedia Commons",
    });
  }
  return result;
}

function firstValue(bindings: Binding[], key: string) {
  return bindings.find((binding) => binding[key]?.value)?.[key]?.value;
}

function yearFromWikidata(value: string | undefined) {
  const match = value?.match(/^([+-]?\d{1,6})-/);
  if (!match) return undefined;
  const year = Number(match[1]);
  return year < 0 ? `${Math.abs(year)} BCE` : String(year);
}

export async function getWikimediaCollection({
  q = "",
  page = 1,
  locale,
}: {
  q?: string;
  page?: number;
  locale: Locale;
}): Promise<WikimediaCollection> {
  const searchIds = q ? await searchEntityIds(q, locale) : [];
  if (q && !searchIds.length) {
    return { items: [], page, hasNextPage: false, fetchedAt: new Date().toISOString() };
  }

  const candidates = await runSparql(candidateQuery(page, searchIds));
  const artworkIds = Array.from(
    new Set(candidates.map((binding) => entityId(binding.artwork?.value)).filter(Boolean)),
  ) as string[];
  const details = await getDetails(artworkIds);
  const relatedIds = Array.from(
    new Set(
      details
        .flatMap((binding) => [
          entityId(binding.artwork?.value),
          entityId(binding.creator?.value),
          entityId(binding.collection?.value),
        ])
        .filter(Boolean),
    ),
  ) as string[];
  const [labels, commonsImages] = await Promise.all([
    getLabels(relatedIds, locale),
    getCommonsImages(
      Array.from(
        new Set(
          details
            .map((binding) => binding.image?.value)
            .filter(Boolean)
            .map(commonsFileTitle),
        ),
      ),
    ),
  ]);

  const grouped = new Map<string, Binding[]>();
  for (const binding of details) {
    const id = entityId(binding.artwork?.value);
    if (id) grouped.set(id, [...(grouped.get(id) ?? []), binding]);
  }

  const items: WikimediaArtwork[] = [];
  for (const id of artworkIds) {
    const bindings = grouped.get(id) ?? [];
    const imageValue = firstValue(bindings, "image");
    if (!imageValue) continue;
    const fileTitle = commonsFileTitle(imageValue);
    const image = commonsImages.get(fileTitle.replaceAll("_", " "));
    if (!image || !isPublicDomainImage(image) || !image.mime.startsWith("image/")) continue;

    const creatorId = entityId(firstValue(bindings, "creator"));
    const collectionId = entityId(firstValue(bindings, "collection"));
    const metadata = image.extmetadata ?? {};
    const title =
      labels[id]?.labels?.[locale]?.value ??
      labels[id]?.labels?.en?.value ??
      plainText(metadata.ObjectName?.value) ??
      fileTitle.replace(/^File:/, "").replace(/\.[^.]+$/, "");
    const artist =
      (creatorId &&
        (labels[creatorId]?.labels?.[locale]?.value ?? labels[creatorId]?.labels?.en?.value)) ||
      plainText(metadata.Artist?.value) ||
      (locale === "zh" ? "佚名" : "Unknown artist");
    const license =
      metadata.LicenseShortName?.value ?? metadata.UsageTerms?.value ?? "Public domain";

    items.push({
      id,
      title,
      description: labels[id]?.descriptions?.[locale]?.value ?? labels[id]?.descriptions?.en?.value,
      artist,
      date: yearFromWikidata(firstValue(bindings, "date")),
      collection:
        collectionId === undefined
          ? undefined
          : (labels[collectionId]?.labels?.[locale]?.value ??
            labels[collectionId]?.labels?.en?.value),
      sourceUrl: image.descriptionurl,
      image: {
        src: image.thumburl,
        src2x: image.responsiveUrls?.["2"],
        originalUrl: image.url,
        width: image.thumbwidth,
        height: image.thumbheight,
        license,
        licenseUrl: metadata.LicenseUrl?.value,
        attribution: plainText(metadata.Credit?.value) ?? artist,
      },
    });
    if (items.length === PAGE_SIZE) break;
  }

  return {
    items,
    page,
    hasNextPage: candidates.length > CANDIDATE_SIZE || items.length === PAGE_SIZE,
    fetchedAt: new Date().toISOString(),
  };
}
