import { z } from "zod";

import {
  artworkSchema,
  catalogPageSchema,
  type Artwork,
  type CatalogPage,
} from "@/src/schemas/catalog";
import { maxAccessibleSearchPage, type CollectionQuery } from "@/src/schemas/routes";
import {
  getCommonsImagesForArticIds,
  type ArticCommonsImage,
  wikimediaFailureReason,
} from "@/src/lib/wikimedia";
import { attachProvisionalChineseTitles } from "@/src/lib/artwork-title-translations";

const API_BASE = "https://api.artic.edu/api/v1";
const PAGE_SIZE = 12;
const RULE_VERSION = "artic-showcase-v1-2026-07-20";
const LIST_FIELDS = [
  "id",
  "api_link",
  "title",
  "alt_titles",
  "date_display",
  "date_start",
  "date_end",
  "artist_id",
  "artist_title",
  "artist_display",
  "medium_display",
  "dimensions",
  "main_reference_number",
  "credit_line",
  "image_id",
  "alt_image_ids",
  "thumbnail",
  "is_public_domain",
  "copyright_notice",
  "is_zoomable",
  "max_zoom_window_size",
  "artwork_type_id",
  "artwork_type_title",
  "department_title",
  "classification_title",
  "classification_titles",
  "short_description",
  "description",
  "updated_at",
].join(",");

const thumbnailSchema = z
  .object({
    lqip: z.string().optional().nullable(),
    width: z.number().optional().nullable(),
    height: z.number().optional().nullable(),
    alt_text: z.string().optional().nullable(),
  })
  .loose()
  .optional()
  .nullable();

const rawArtworkSchema = z
  .object({
    id: z.number().int().positive(),
    api_link: z.string().url().optional().nullable(),
    title: z.string().optional().nullable(),
    alt_titles: z.array(z.string()).optional().nullable(),
    date_display: z.string().optional().nullable(),
    date_start: z.number().int().optional().nullable(),
    date_end: z.number().int().optional().nullable(),
    artist_id: z.number().int().positive().optional().nullable(),
    artist_title: z.string().optional().nullable(),
    artist_display: z.string().optional().nullable(),
    medium_display: z.string().optional().nullable(),
    dimensions: z.string().optional().nullable(),
    main_reference_number: z.string().optional().nullable(),
    credit_line: z.string().optional().nullable(),
    image_id: z.string().optional().nullable(),
    alt_image_ids: z.array(z.string()).optional().nullable(),
    thumbnail: thumbnailSchema,
    is_public_domain: z.boolean().optional().nullable(),
    copyright_notice: z.string().optional().nullable(),
    is_zoomable: z.boolean().optional().nullable(),
    max_zoom_window_size: z.number().int().optional().nullable(),
    artwork_type_id: z.number().int().positive(),
    artwork_type_title: z.string().min(1),
    department_title: z.string().optional().nullable(),
    classification_title: z.string().optional().nullable(),
    classification_titles: z.array(z.string()).optional().nullable(),
    short_description: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    updated_at: z.string().optional().nullable(),
  })
  .loose();

const responseSchema = z.object({
  data: z.union([z.array(rawArtworkSchema), rawArtworkSchema]),
  pagination: z
    .object({
      total: z.number().int().nonnegative(),
      current_page: z.number().int().positive(),
      total_pages: z.number().int().nonnegative(),
    })
    .loose()
    .optional(),
  config: z
    .object({ iiif_url: z.string().url(), website_url: z.string().url().optional() })
    .loose(),
});

type ArticPayload = z.infer<typeof responseSchema>;
type CacheEntry = {
  payload: ArticPayload;
  fetchedAt: string;
  freshUntil: number;
  staleUntil: number;
};
type CollectionPageCacheEntry = {
  promise: Promise<CatalogPage>;
  freshUntil: number;
};

export type ArticCollectionOptions = {
  enrichCommons?: boolean;
};

const responseCache = new Map<string, CacheEntry>();
const collectionPageCache = new Map<string, CollectionPageCacheEntry>();

class ArticRequestError extends Error {
  constructor(public status: number) {
    super(`ARTIC request failed with ${status}`);
  }
}

function clean(value: string | null | undefined) {
  const result = value?.trim();
  return result || undefined;
}

function secureUrl(value: string) {
  return value.replace(/^http:\/\//, "https://").replace(/\/$/, "");
}

function positiveInteger(value: number | null | undefined) {
  return value && value > 0 ? value : undefined;
}

function safeLqip(value: string | null | undefined) {
  return value &&
    value.length <= 20_000 &&
    /^data:image\/(?:gif|jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)
    ? value
    : undefined;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeArticArtwork(
  rawInput: unknown,
  configInput: { iiif_url: string; website_url?: string },
  accessedAt = new Date().toISOString(),
): Artwork {
  const raw = rawArtworkSchema.parse(rawInput);
  const iiifUrl = secureUrl(configInput.iiif_url);
  const websiteUrl = secureUrl(configInput.website_url ?? "https://www.artic.edu");
  const imageId = clean(raw.image_id);
  const publicDomain = raw.is_public_domain === true;
  const rightsConflict = publicDomain && Boolean(clean(raw.copyright_notice));
  const painting = raw.artwork_type_id === 1 && raw.artwork_type_title === "Painting";
  const title = clean(raw.title) ?? "Untitled";
  const artistName = clean(raw.artist_title);
  const dateDisplay = clean(raw.date_display);
  const attribution = `${artistName ?? "Unknown artist"}. ${title}${dateDisplay ? `, ${dateDisplay}` : ""}. The Art Institute of Chicago.`;
  const descriptionHtml = clean(raw.short_description) ?? clean(raw.description);
  const descriptionSource = clean(raw.short_description) ? "short_description" : "description";
  const preferred = imageId
    ? {
        id: imageId,
        width: positiveInteger(raw.thumbnail?.width),
        height: positiveInteger(raw.thumbnail?.height),
        altText: clean(raw.thumbnail?.alt_text),
        lqip: safeLqip(raw.thumbnail?.lqip),
        iiifBaseUrl: `${iiifUrl}/${imageId}`,
        zoomable: raw.is_zoomable === true,
        maxZoomWindowSize: positiveInteger(raw.max_zoom_window_size) ?? null,
        health: "unknown" as const,
      }
    : null;

  const reasons = [
    ...(!painting ? ["unsupported_type"] : []),
    ...(!publicDomain ? ["image_rights_not_open"] : []),
    ...(!imageId ? ["missing_primary_image"] : []),
    ...(rightsConflict ? ["rights_field_conflict"] : []),
  ];
  const status = !painting
    ? "quarantined_type"
    : rightsConflict
      ? "quarantined_rights_conflict"
      : !publicDomain
        ? "metadata_only_rights"
        : !imageId
          ? "metadata_only_no_image"
          : "image_displayable";

  return artworkSchema.parse({
    id: `artic:${raw.id}`,
    sourceId: String(raw.id),
    museumId: "artic",
    source: {
      id: "artic",
      label: "The Art Institute of Chicago",
      recordUrl: `${websiteUrl}/artworks/${raw.id}`,
      apiUrl: raw.api_link ?? `${API_BASE}/artworks/${raw.id}`,
      termsUrl: `${websiteUrl}/terms`,
      updatedAt: raw.updated_at ?? undefined,
      accessedAt,
    },
    display: {
      title,
      localizedTitles: { en: title },
      localizedTitleMetadata: {
        en: { source: "museum", status: "verified" },
      },
      altTitles: (raw.alt_titles ?? []).map((item) => item.trim()).filter(Boolean),
      artistDisplay: clean(raw.artist_display) ?? artistName ?? "Unknown artist",
      dateDisplay,
      mediumDisplay: clean(raw.medium_display),
      dimensionsDisplay: clean(raw.dimensions),
    },
    artist:
      raw.artist_id && artistName
        ? {
            id: `artic-artist:${raw.artist_id}`,
            sourceId: String(raw.artist_id),
            name: artistName,
            display: clean(raw.artist_display) ?? artistName,
            personaStatus: "unavailable",
          }
        : null,
    date: { start: raw.date_start ?? null, end: raw.date_end ?? null },
    classification: {
      artworkTypeId: raw.artwork_type_id,
      artworkTypeTitle: raw.artwork_type_title,
      departmentTitle: clean(raw.department_title),
      classificationTitles: (raw.classification_titles ?? [raw.classification_title ?? ""])
        .map((item) => item.trim())
        .filter(Boolean),
    },
    images: { preferred, alternates: [] },
    rights: {
      work: {
        status: publicDomain ? "public_domain" : "copyrighted",
        notice: clean(raw.copyright_notice) ?? null,
      },
      image: {
        licenseCode: publicDomain ? "CC0-1.0" : "restricted",
        licenseUrl: publicDomain ? "https://creativecommons.org/publicdomain/zero/1.0/" : null,
        usage: publicDomain
          ? {
              commercialUseAllowed: true,
              adaptationsAllowed: true,
              attributionRequired: false,
              shareAlike: false,
            }
          : null,
      },
      metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
      termsUrl: `${websiteUrl}/terms`,
      attribution,
    },
    eligibility: { status, ruleVersion: RULE_VERSION, checkedAt: accessedAt, reasons },
    creditLine: clean(raw.credit_line),
    mainReferenceNumber: clean(raw.main_reference_number),
    description: descriptionHtml
      ? { html: descriptionHtml, text: stripHtml(descriptionHtml), sourceField: descriptionSource }
      : undefined,
    revision: clean(raw.updated_at) ?? `artic-${raw.id}`,
  });
}

function createSearchQuery(query: CollectionQuery) {
  const must: object[] = [{ term: { is_public_domain: true } }, { term: { artwork_type_id: 1 } }];
  const mustNot: object[] = [{ exists: { field: "copyright_notice" } }];
  if (query.availability === "image") must.push({ exists: { field: "image_id" } });
  if (query.availability === "metadata") mustNot.push({ exists: { field: "image_id" } });
  if (query.q) {
    must.push({
      multi_match: {
        query: query.q,
        fields: ["title^3", "artist_title^2", "artist_display", "description", "short_description"],
      },
    });
  }
  if (query.from !== undefined) must.push({ range: { date_end: { gte: query.from } } });
  if (query.to !== undefined) must.push({ range: { date_start: { lte: query.to } } });
  if (query.artist.length) must.push({ terms: { artist_ids: query.artist } });
  return { bool: { must, must_not: mustNot } };
}

export function buildArticCollectionUrl(query: CollectionQuery) {
  const requestParams: Record<string, unknown> = {
    fields: LIST_FIELDS,
    from: (query.page - 1) * PAGE_SIZE,
    size: query.page === maxAccessibleSearchPage ? 4 : PAGE_SIZE,
    query: createSearchQuery(query),
  };
  const sortMap: Partial<Record<CollectionQuery["sort"], string>> = {
    recent: "updated_at",
    "title-asc": "title.keyword",
    "date-asc": "date_start",
    "date-desc": "date_start",
  };
  const sort = sortMap[query.sort];
  if (sort) {
    requestParams.sort = [
      { [sort]: { order: query.sort === "date-desc" || query.sort === "recent" ? "desc" : "asc" } },
      { id: { order: "asc" } },
    ];
  }
  return `${API_BASE}/artworks/search?${new URLSearchParams({ params: JSON.stringify(requestParams) })}`;
}

async function fetchArtic(url: string, tag = "artic-catalog") {
  const now = Date.now();
  const cached = responseCache.get(url);
  if (cached && now < cached.freshUntil) {
    return { payload: cached.payload, state: "fresh" as const, fetchedAt: cached.fetchedAt };
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          "AIC-User-Agent": process.env.ARTIC_USER_AGENT ?? "Canvium Gallery (local showcase)",
        },
      });
      if (!response.ok) throw new ArticRequestError(response.status);
      const payload = responseSchema.parse(await response.json());
      const fetchedAt = new Date().toISOString();
      responseCache.set(url, {
        payload,
        fetchedAt,
        freshUntil: now + 300_000,
        staleUntil: now + 3_600_000,
      });
      if (responseCache.size > 128) responseCache.delete(responseCache.keys().next().value!);
      return { payload, state: "fresh" as const, fetchedAt };
    } catch (error) {
      lastError = error;
      if (error instanceof ArticRequestError && ![429, 500, 502, 503, 504].includes(error.status)) {
        break;
      }
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  if (cached && now < cached.staleUntil) {
    return { payload: cached.payload, state: "stale" as const, fetchedAt: cached.fetchedAt };
  }
  throw lastError;
}

async function attachCommonsImages(items: Artwork[]) {
  let commonsImages = new Map<string, ArticCommonsImage>();
  let lookupFailure: string | null = null;
  try {
    commonsImages = await getCommonsImagesForArticIds(
      items
        .filter((item) => item.eligibility.status === "image_displayable")
        .map((item) => item.sourceId),
    );
  } catch (error) {
    lookupFailure = wikimediaFailureReason(error);
    console.error("Wikimedia Commons image mapping failed", error);
  }

  return items.map((item) => {
    const current = item.images.preferred;
    if (!current) return item;
    const commons = commonsImages.get(item.sourceId);
    if (!commons) {
      return artworkSchema.parse({
        ...item,
        images: { preferred: null, alternates: [] },
        rights: {
          ...item.rights,
          image: { licenseCode: "unknown", licenseUrl: null, usage: null },
        },
        eligibility: {
          ...item.eligibility,
          status: "metadata_only_no_image",
          reasons: Array.from(
            new Set([...item.eligibility.reasons, lookupFailure ?? "commons_image_unavailable"]),
          ),
        },
      });
    }
    return artworkSchema.parse({
      ...item,
      display: {
        ...item.display,
        localizedTitles: {
          ...item.display.localizedTitles,
          ...(commons.titleEn ? { en: commons.titleEn } : {}),
          ...(commons.titleZh && /[\u3400-\u9fff]/u.test(commons.titleZh)
            ? {
                zh: commons.titleZh,
                ...(commons.titleZhLocale ? { [commons.titleZhLocale]: commons.titleZh } : {}),
              }
            : {}),
        },
        localizedTitleMetadata: {
          ...item.display.localizedTitleMetadata,
          ...(commons.titleEn
            ? { en: { source: "wikidata" as const, status: "verified" as const } }
            : {}),
          ...(commons.titleZh && /[\u3400-\u9fff]/u.test(commons.titleZh)
            ? {
                zh: { source: "wikidata" as const, status: "verified" as const },
                ...(commons.titleZhLocale
                  ? {
                      [commons.titleZhLocale]: {
                        source: "wikidata" as const,
                        status: "verified" as const,
                      },
                    }
                  : {}),
              }
            : {}),
        },
      },
      images: {
        preferred: {
          id: `commons:${item.sourceId}`,
          width: commons.width,
          height: commons.height,
          altText: current.altText,
          lqip: current.lqip,
          directUrl: commons.src,
          directUrl2x: commons.src2x,
          sourceUrl: commons.sourceUrl,
          zoomable: true,
          maxZoomWindowSize: null,
          health: "ok",
        },
        alternates: [],
      },
      rights: {
        ...item.rights,
        image: {
          licenseCode: commons.licenseCode,
          licenseUrl: commons.licenseUrl,
          usage: commons.usage,
        },
        attribution: `${item.rights.attribution} Image source: ${commons.attribution}`,
      },
    });
  });
}

async function loadArticCollection(
  query: CollectionQuery,
  { enrichCommons = true }: ArticCollectionOptions = {},
): Promise<CatalogPage> {
  const response = await fetchArtic(buildArticCollectionUrl(query));
  const { payload } = response;
  const data = Array.isArray(payload.data) ? payload.data : [payload.data];
  const normalized = data.map((item) =>
    normalizeArticArtwork(item, payload.config, response.fetchedAt),
  );
  const imageEnriched = enrichCommons ? await attachCommonsImages(normalized) : normalized;
  const items = (await attachProvisionalChineseTitles(imageEnriched)).filter((item) => {
    if (query.availability === "image") return item.eligibility.status === "image_displayable";
    if (query.availability === "metadata") {
      return item.eligibility.status === "metadata_only_no_image";
    }
    return ["image_displayable", "metadata_only_no_image"].includes(item.eligibility.status);
  });
  const pagination = payload.pagination;
  const accessibleTotal = Math.min(pagination?.total ?? items.length, 10_000);
  const accessiblePages = Math.ceil(accessibleTotal / PAGE_SIZE);
  return catalogPageSchema.parse({
    items,
    pageInfo: {
      totalEligible: accessibleTotal,
      hasNextPage: pagination ? pagination.current_page < accessiblePages : false,
      nextCursor:
        pagination && pagination.current_page < accessiblePages
          ? String(pagination.current_page + 1)
          : null,
    },
    query: {
      q: query.q,
      filters: {
        artist: query.artist,
        from: query.from,
        to: query.to,
        availability: query.availability,
      },
      sort: query.sort,
    },
    snapshotVersion: `artic-live-page-${query.page}`,
    dataStatus: { state: response.state, fetchedAt: response.fetchedAt },
  });
}

export function getArticCollection(
  query: CollectionQuery,
  options: ArticCollectionOptions = {},
): Promise<CatalogPage> {
  const key = `${options.enrichCommons === false ? "direct" : "enriched"}:${buildArticCollectionUrl(query)}`;
  const cached = collectionPageCache.get(key);
  if (cached && Date.now() < cached.freshUntil) return cached.promise;

  const promise = loadArticCollection(query, options).catch((error) => {
    if (collectionPageCache.get(key)?.promise === promise) {
      collectionPageCache.delete(key);
    }
    throw error;
  });
  collectionPageCache.set(key, { promise, freshUntil: Date.now() + 300_000 });
  if (collectionPageCache.size > 128) {
    collectionPageCache.delete(collectionPageCache.keys().next().value!);
  }
  return promise;
}

export async function getArticArtwork(sourceId: string): Promise<Artwork | null> {
  const url = `${API_BASE}/artworks/${encodeURIComponent(sourceId)}?fields=${encodeURIComponent(LIST_FIELDS)}`;
  try {
    const response = await fetchArtic(url, `artic-artwork-${sourceId}`);
    const raw = Array.isArray(response.payload.data)
      ? response.payload.data[0]
      : response.payload.data;
    const artwork = normalizeArticArtwork(raw, response.payload.config, response.fetchedAt);
    return (await attachProvisionalChineseTitles(await attachCommonsImages([artwork])))[0];
  } catch (error) {
    if (error instanceof ArticRequestError && error.status === 404) return null;
    throw error;
  }
}
