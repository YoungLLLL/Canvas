import { z } from "zod";

import {
  artworkSchema,
  catalogPageSchema,
  type Artwork,
  type CatalogPage,
} from "@/src/schemas/catalog";
import type { CollectionQuery } from "@/src/schemas/routes";
import { attachWikidataTitles } from "@/src/lib/wikidata-artwork-titles";

const API_BASE = "https://collectionapi.metmuseum.org/public/collection/v1";
const PAGE_SIZE = 12;
const RULE_VERSION = "met-paintings-v1-2026-07-30";

const searchResponseSchema = z
  .object({
    total: z.number().int().nonnegative().default(0),
    objectIDs: z.array(z.number().int().positive()).nullable().default([]),
  })
  .loose();

const rawArtworkSchema = z
  .object({
    objectID: z.number().int().positive(),
    isPublicDomain: z.boolean().optional().default(false),
    primaryImage: z.string().optional().default(""),
    primaryImageSmall: z.string().optional().default(""),
    additionalImages: z.array(z.string()).optional().default([]),
    objectName: z.string().optional().default(""),
    title: z.string().optional().default("Untitled"),
    artistDisplayName: z.string().optional().default(""),
    artistDisplayBio: z.string().optional().default(""),
    objectDate: z.string().optional().default(""),
    objectBeginDate: z.number().int().optional().default(0),
    objectEndDate: z.number().int().optional().default(0),
    medium: z.string().optional().default(""),
    dimensions: z.string().optional().default(""),
    classification: z.string().optional().default(""),
    department: z.string().optional().default(""),
    accessionNumber: z.string().optional().default(""),
    creditLine: z.string().optional().default(""),
    objectURL: z.string().optional().default(""),
    objectWikidata_URL: z.string().optional().default(""),
  })
  .loose();

type RawMetArtwork = z.infer<typeof rawArtworkSchema>;

export function metArtworkWikidataId(input: unknown) {
  const parsed = rawArtworkSchema.safeParse(input);
  return parsed.success ? parsed.data.objectWikidata_URL.match(/Q\d+$/)?.[0] : undefined;
}

function secureUrl(value: string) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value.replace(/^http:\/\//, "https://"));
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function isMetPainting(record: Pick<RawMetArtwork, "objectName" | "classification">) {
  return (
    record.classification.trim().toLowerCase() === "paintings" ||
    /^painting(?:\b|,)/i.test(record.objectName.trim())
  );
}

export function normalizeMetArtwork(
  input: unknown,
  accessedAt = new Date().toISOString(),
): Artwork | null {
  const parsed = rawArtworkSchema.safeParse(input);
  if (!parsed.success || !isMetPainting(parsed.data)) return null;
  const raw = parsed.data;
  const recordUrl =
    secureUrl(raw.objectURL) ?? `https://www.metmuseum.org/art/collection/search/${raw.objectID}`;
  const originalImage = secureUrl(raw.primaryImage);
  const displayImage = secureUrl(raw.primaryImageSmall) ?? originalImage;
  const image =
    raw.isPublicDomain && displayImage
      ? {
          id: `met-image:${raw.objectID}`,
          directUrl: displayImage,
          ...(originalImage && originalImage !== displayImage
            ? { directUrl2x: originalImage }
            : {}),
          sourceUrl: recordUrl,
          altText: `${raw.artistDisplayName || "Unknown artist"}, ${raw.title}`,
          zoomable: Boolean(originalImage),
          maxZoomWindowSize: null,
          health: "ok" as const,
        }
      : null;
  const status = image
    ? "image_displayable"
    : raw.isPublicDomain
      ? "metadata_only_no_image"
      : "metadata_only_rights";

  return artworkSchema.parse({
    id: `met:${raw.objectID}`,
    sourceId: String(raw.objectID),
    museumId: "met",
    source: {
      id: "met",
      label: "The Metropolitan Museum of Art",
      recordUrl,
      apiUrl: `${API_BASE}/objects/${raw.objectID}`,
      termsUrl: "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
      accessedAt,
    },
    display: {
      title: raw.title.trim() || "Untitled",
      localizedTitles: { en: raw.title.trim() || "Untitled" },
      localizedTitleMetadata: { en: { source: "museum", status: "verified" } },
      altTitles: [],
      artistDisplay: raw.artistDisplayName.trim() || "Unknown artist",
      dateDisplay: raw.objectDate.trim() || undefined,
      mediumDisplay: raw.medium.trim() || undefined,
      dimensionsDisplay: raw.dimensions.trim() || undefined,
    },
    artist: null,
    date: {
      start: raw.objectBeginDate || null,
      end: raw.objectEndDate || null,
    },
    classification: {
      artworkTypeId: 1,
      artworkTypeTitle: "Painting",
      departmentTitle: raw.department.trim() || undefined,
      classificationTitles: [raw.classification, raw.objectName]
        .map((value) => value.trim())
        .filter(Boolean),
    },
    images: { preferred: image, alternates: [] },
    rights: {
      work: {
        status: raw.isPublicDomain ? "public_domain" : "copyrighted",
        notice: raw.isPublicDomain ? "Public Domain" : "Copyright restrictions may apply",
      },
      image: {
        licenseCode: raw.isPublicDomain ? "CC0-1.0" : "restricted",
        licenseUrl: raw.isPublicDomain
          ? "https://creativecommons.org/publicdomain/zero/1.0/"
          : recordUrl,
        usage: raw.isPublicDomain
          ? {
              commercialUseAllowed: true,
              adaptationsAllowed: true,
              attributionRequired: false,
              shareAlike: false,
            }
          : null,
      },
      metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
      termsUrl: "https://www.metmuseum.org/about-the-met/policies-and-documents/open-access",
      attribution: raw.creditLine.trim() || "The Metropolitan Museum of Art",
    },
    eligibility: {
      status,
      ruleVersion: RULE_VERSION,
      checkedAt: accessedAt,
      reasons:
        status === "metadata_only_rights"
          ? ["image_rights_not_open"]
          : status === "metadata_only_no_image"
            ? ["image_unavailable"]
            : [],
    },
    creditLine: raw.creditLine.trim() || undefined,
    mainReferenceNumber: raw.accessionNumber.trim() || undefined,
    revision: `met-${raw.objectID}`,
  });
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300, tags: ["met-paintings"] },
  });
  if (!response.ok) {
    const error = new Error(`The Met API request failed with ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return { payload: await response.json(), fetchedAt: new Date().toISOString() };
}

async function fetchMetArtwork(sourceId: string) {
  const response = await fetchJson(`${API_BASE}/objects/${encodeURIComponent(sourceId)}`);
  const artwork = normalizeMetArtwork(response.payload, response.fetchedAt);
  return artwork
    ? {
        artwork,
        wikidataId: metArtworkWikidataId(response.payload),
      }
    : null;
}

export async function getMetCollection(query: CollectionQuery, cursor = "0"): Promise<CatalogPage> {
  const offset = /^\d+$/.test(cursor) ? Number(cursor) : 0;
  const params = new URLSearchParams({
    q: query.q || "*",
    medium: "Paintings",
    hasImages: "true",
    isPublicDomain: "true",
  });
  if (query.from !== undefined || query.to !== undefined) {
    params.set("dateBegin", String(query.from ?? -5000));
    params.set("dateEnd", String(query.to ?? new Date().getFullYear()));
  }
  const search = await fetchJson(`${API_BASE}/search?${params}`);
  const payload = searchResponseSchema.parse(search.payload);
  const ids = (payload.objectIDs ?? []).slice(offset, offset + PAGE_SIZE);
  const records = await Promise.all(
    ids.map(async (id) => {
      try {
        return await fetchMetArtwork(String(id));
      } catch {
        return null;
      }
    }),
  );
  const eligibleRecords = records.filter(
    (
      record,
    ): record is {
      artwork: Artwork;
      wikidataId: string | undefined;
    } => record?.artwork.eligibility.status === "image_displayable",
  );
  const items = await attachWikidataTitles(eligibleRecords);
  const nextOffset = offset + ids.length;

  return catalogPageSchema.parse({
    items,
    pageInfo: {
      totalEligible: payload.total,
      hasNextPage: nextOffset < (payload.objectIDs?.length ?? 0),
      nextCursor: nextOffset < (payload.objectIDs?.length ?? 0) ? String(nextOffset) : null,
    },
    query: { q: query.q, filters: { availability: "image", type: "Painting" }, sort: query.sort },
    snapshotVersion: `met-live-${search.fetchedAt}`,
    dataStatus: { state: "fresh", fetchedAt: search.fetchedAt },
  });
}

export async function getMetArtwork(sourceId: string): Promise<Artwork | null> {
  if (!/^\d+$/.test(sourceId)) return null;
  try {
    const record = await fetchMetArtwork(sourceId);
    return record ? ((await attachWikidataTitles([record]))[0] ?? null) : null;
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404)
      return null;
    throw error;
  }
}
