import { z } from "zod";

import {
  artworkSchema,
  catalogPageSchema,
  type Artwork,
  type CatalogPage,
} from "@/src/schemas/catalog";
import type { CollectionQuery } from "@/src/schemas/routes";
import { getClevelandWikidataIds } from "@/src/lib/wikimedia";
import { attachWikidataTitles } from "@/src/lib/wikidata-artwork-titles";

const API_BASE = "https://openaccess-api.clevelandart.org/api";
const PAGE_SIZE = 12;
const RULE_VERSION = "cleveland-paintings-v1-2026-07-30";

const imageVariantSchema = z
  .object({
    url: z.string().optional(),
    width: z.coerce.number().int().positive().optional(),
    height: z.coerce.number().int().positive().optional(),
  })
  .loose()
  .optional()
  .nullable();

const imageSchema = z
  .object({
    web: imageVariantSchema,
    print: imageVariantSchema,
    full: imageVariantSchema,
  })
  .loose()
  .optional()
  .nullable();

const rawArtworkSchema = z
  .object({
    id: z.number().int().positive(),
    accession_number: z.string().optional().default(""),
    share_license_status: z.string().optional().default(""),
    title: z.string().optional().default("Untitled"),
    title_in_original_language: z.string().nullable().optional(),
    creation_date: z.string().optional().default(""),
    creation_date_earliest: z.number().int().nullable().optional(),
    creation_date_latest: z.number().int().nullable().optional(),
    creators: z
      .array(
        z
          .object({
            description: z.string().optional(),
            name: z.string().optional(),
          })
          .loose(),
      )
      .optional()
      .default([]),
    culture: z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(),
    technique: z.string().optional().default(""),
    measurements: z.string().optional().default(""),
    wall_description: z.string().nullable().optional(),
    didactic_description: z.string().nullable().optional(),
    type: z.string().optional().default(""),
    department: z.string().optional().default(""),
    current_location: z.string().nullable().optional(),
    creditline: z.string().optional().default(""),
    copyright: z.string().nullable().optional(),
    url: z.string().optional().default(""),
    images: imageSchema,
  })
  .loose();

const searchResponseSchema = z
  .object({
    info: z
      .object({ total: z.number().int().nonnegative().default(0) })
      .loose()
      .default({ total: 0 }),
    data: z.array(z.unknown()).default([]),
  })
  .loose();

type RawClevelandArtwork = z.infer<typeof rawArtworkSchema>;

function normalizedClevelandRecord(input: unknown, accessedAt: string) {
  const parsed = rawArtworkSchema.safeParse(input);
  if (!parsed.success) return null;
  const artwork = normalizeClevelandArtwork(parsed.data, accessedAt);
  return artwork
    ? {
        artwork,
        accessionNumber: parsed.data.accession_number.trim(),
      }
    : null;
}

async function attachClevelandWikidataTitles(
  records: Array<{ artwork: Artwork; accessionNumber: string }>,
) {
  try {
    const ids = await getClevelandWikidataIds(
      records.flatMap(({ accessionNumber }) => (accessionNumber ? [accessionNumber] : [])),
    );
    return attachWikidataTitles(
      records.map(({ artwork, accessionNumber }) => ({
        artwork,
        wikidataId: ids.get(accessionNumber),
      })),
    );
  } catch (error) {
    console.warn(
      "Cleveland Wikidata mapping failed; continuing without verified Chinese titles",
      error instanceof Error ? error.message : error,
    );
    return records.map(({ artwork }) => artwork);
  }
}

function secureUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value.replace(/^http:\/\//, "https://"));
    return parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cleanHtml(value?: string | null) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function isClevelandPainting(record: Pick<RawClevelandArtwork, "type">) {
  return record.type.trim().toLowerCase() === "painting";
}

export function normalizeClevelandArtwork(
  input: unknown,
  accessedAt = new Date().toISOString(),
): Artwork | null {
  const parsed = rawArtworkSchema.safeParse(input);
  if (!parsed.success || !isClevelandPainting(parsed.data)) return null;
  const raw = parsed.data;
  const isCc0 = raw.share_license_status.trim().toUpperCase() === "CC0";
  const recordUrl =
    secureUrl(raw.url) ??
    `https://www.clevelandart.org/art/${encodeURIComponent(raw.accession_number || String(raw.id))}`;
  const webImage = secureUrl(raw.images?.web?.url);
  const printImage = secureUrl(raw.images?.print?.url);
  const fullImage = secureUrl(raw.images?.full?.url);
  const displayImage = webImage ?? printImage ?? fullImage;
  const largeImage = printImage ?? fullImage;
  const dimensionsFrom = raw.images?.print ?? raw.images?.full ?? raw.images?.web;
  const image =
    isCc0 && displayImage
      ? {
          id: `cleveland-image:${raw.id}`,
          directUrl: displayImage,
          ...(largeImage && largeImage !== displayImage ? { directUrl2x: largeImage } : {}),
          sourceUrl: recordUrl,
          width: dimensionsFrom?.width,
          height: dimensionsFrom?.height,
          altText: `${raw.creators[0]?.description || raw.creators[0]?.name || "Unknown artist"}, ${raw.title}`,
          zoomable: Boolean(largeImage),
          maxZoomWindowSize: null,
          health: "ok" as const,
        }
      : null;
  const creators = raw.creators
    .map((creator) => creator.description || creator.name)
    .filter((value): value is string => Boolean(value?.trim()));
  const description = cleanHtml(raw.wall_description || raw.didactic_description);
  const status = image
    ? "image_displayable"
    : isCc0
      ? "metadata_only_no_image"
      : "metadata_only_rights";

  return artworkSchema.parse({
    id: `cleveland:${raw.id}`,
    sourceId: String(raw.id),
    museumId: "cleveland",
    source: {
      id: "cleveland",
      label: "The Cleveland Museum of Art",
      recordUrl,
      apiUrl: `${API_BASE}/artworks/${raw.id}`,
      termsUrl: "https://www.clevelandart.org/open-access",
      accessedAt,
    },
    display: {
      title: raw.title.trim() || "Untitled",
      localizedTitles: { en: raw.title.trim() || "Untitled" },
      localizedTitleMetadata: { en: { source: "museum", status: "verified" } },
      altTitles: raw.title_in_original_language?.trim()
        ? [raw.title_in_original_language.trim()]
        : [],
      artistDisplay: creators.join("; ") || "Unknown artist",
      dateDisplay: raw.creation_date.trim() || undefined,
      mediumDisplay: raw.technique.trim() || undefined,
      dimensionsDisplay: raw.measurements.trim() || undefined,
    },
    artist: null,
    date: {
      start: raw.creation_date_earliest ?? null,
      end: raw.creation_date_latest ?? null,
    },
    classification: {
      artworkTypeId: 1,
      artworkTypeTitle: "Painting",
      departmentTitle: raw.department.trim() || undefined,
      classificationTitles: [raw.type],
    },
    images: { preferred: image, alternates: [] },
    rights: {
      work: {
        status: isCc0 ? "public_domain" : "unknown",
        notice: raw.copyright?.trim() || (isCc0 ? "CC0" : null),
      },
      image: {
        licenseCode: isCc0 ? "CC0-1.0" : "restricted",
        licenseUrl: isCc0 ? "https://creativecommons.org/publicdomain/zero/1.0/" : recordUrl,
        usage: isCc0
          ? {
              commercialUseAllowed: true,
              adaptationsAllowed: true,
              attributionRequired: false,
              shareAlike: false,
            }
          : null,
      },
      metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
      termsUrl: "https://www.clevelandart.org/open-access",
      attribution: raw.creditline.trim() || "The Cleveland Museum of Art",
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
    creditLine: raw.creditline.trim() || undefined,
    mainReferenceNumber: raw.accession_number.trim() || undefined,
    description: description
      ? { html: description, text: description, sourceField: "description" }
      : undefined,
    revision: `cleveland-${raw.id}`,
  });
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 300, tags: ["cleveland-paintings"] },
  });
  if (!response.ok) {
    const error = new Error(`Cleveland API request failed with ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return { payload: await response.json(), fetchedAt: new Date().toISOString() };
}

export async function getClevelandCollection(
  query: CollectionQuery,
  cursor = "0",
): Promise<CatalogPage> {
  const skip = /^\d+$/.test(cursor) ? Number(cursor) : 0;
  const params = new URLSearchParams({
    type: "Painting",
    has_image: "1",
    limit: String(PAGE_SIZE),
    skip: String(skip),
  });
  params.append("cc0", "");
  if (query.q) params.set("q", query.q);
  if (query.from !== undefined) params.set("created_after", String(query.from));
  if (query.to !== undefined) params.set("created_before", String(query.to));
  if (query.sort === "title-asc") params.set("orderby", "title ASC");
  if (query.sort === "date-asc") params.set("orderby", "creation_date_earliest ASC");
  if (query.sort === "date-desc") params.set("orderby", "creation_date_latest DESC");

  const response = await fetchJson(`${API_BASE}/artworks/?${params}`);
  const payload = searchResponseSchema.parse(response.payload);
  const records = payload.data
    .map((item) => normalizedClevelandRecord(item, response.fetchedAt))
    .filter(
      (
        record,
      ): record is {
        artwork: Artwork;
        accessionNumber: string;
      } => record?.artwork.eligibility.status === "image_displayable",
    );
  const items = await attachClevelandWikidataTitles(records);
  const nextSkip = skip + payload.data.length;

  return catalogPageSchema.parse({
    items,
    pageInfo: {
      totalEligible: payload.info.total,
      hasNextPage: nextSkip < payload.info.total,
      nextCursor: nextSkip < payload.info.total ? String(nextSkip) : null,
    },
    query: { q: query.q, filters: { availability: "image", type: "Painting" }, sort: query.sort },
    snapshotVersion: `cleveland-live-${response.fetchedAt}`,
    dataStatus: { state: "fresh", fetchedAt: response.fetchedAt },
  });
}

export async function getClevelandArtwork(sourceId: string): Promise<Artwork | null> {
  if (!/^\d+$/.test(sourceId)) return null;
  try {
    const response = await fetchJson(`${API_BASE}/artworks/${encodeURIComponent(sourceId)}`);
    const payload = z.object({ data: z.unknown() }).loose().parse(response.payload);
    const record = normalizedClevelandRecord(payload.data, response.fetchedAt);
    return record ? ((await attachClevelandWikidataTitles([record]))[0] ?? null) : null;
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404)
      return null;
    throw error;
  }
}
