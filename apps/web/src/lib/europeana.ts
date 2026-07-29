import { z } from "zod";

import {
  artworkSchema,
  catalogPageSchema,
  type Artwork,
  type CatalogPage,
} from "@/src/schemas/catalog";
import type { CollectionQuery } from "@/src/schemas/routes";
import { artworkKey } from "@/src/lib/catalog-source";
import { museumById } from "@/src/lib/museum-directory";

const API_BASE = "https://api.europeana.eu/record/v2";
const ITEM_BASE = "https://www.europeana.eu/item";
const PAGE_SIZE = 12;
const RULE_VERSION = "europeana-availability-v1-2026-07-29";

const searchResponseSchema = z
  .object({
    items: z.array(z.unknown()).default([]),
    totalResults: z.number().int().nonnegative().default(0),
    nextCursor: z.string().optional(),
  })
  .loose();

export class EuropeanaConfigurationError extends Error {}

function values(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(values);
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  for (const key of ["def", "zh", "en", "@id", "id", "about", "value"]) {
    const preferred = values(record[key]);
    if (preferred.length) return preferred;
  }
  return Object.values(record).flatMap(values);
}

function first(...candidates: unknown[]) {
  return candidates
    .flatMap(values)
    .map((value) => value.trim())
    .find(Boolean);
}

function unique(...candidates: unknown[]) {
  return [
    ...new Set(
      candidates
        .flatMap(values)
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function url(value: unknown) {
  const candidate = first(value);
  if (!candidate) return undefined;
  try {
    const parsed = new URL(candidate);
    return ["http:", "https:"].includes(parsed.protocol)
      ? candidate.replace(/^http:\/\//, "https://")
      : undefined;
  } catch {
    return undefined;
  }
}

function directImageUrl(value: unknown) {
  const candidate = url(value);
  if (!candidate) return undefined;
  try {
    const parsed = new URL(candidate);
    return /\.(?:avif|gif|jpe?g|png|tiff?|webp)$/i.test(parsed.pathname) ||
      /\/iiif(?:\/|$)/i.test(parsed.pathname)
      ? candidate
      : undefined;
  } catch {
    return undefined;
  }
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

function mergeRecordPayload(payload: unknown): Record<string, unknown> {
  const root =
    payload && typeof payload === "object" && "object" in payload
      ? ((payload as { object: unknown }).object as Record<string, unknown>)
      : (payload as Record<string, unknown>);
  if (!root || typeof root !== "object") return {};
  const proxies = Array.isArray(root.proxies) ? root.proxies : [];
  const aggregations = Array.isArray(root.aggregations) ? root.aggregations : [];
  if (!proxies.length && !aggregations.length) return root;
  const merged: Record<string, unknown> = { id: root.about || root.id };
  for (const section of [...proxies, ...aggregations, root.europeanaAggregation]) {
    if (!section || typeof section !== "object") continue;
    for (const [key, value] of Object.entries(section as Record<string, unknown>)) {
      merged[key] = merged[key] === undefined ? value : [...values(merged[key]), ...values(value)];
    }
  }
  return merged;
}

function license(rightsUrl?: string) {
  const normalized = rightsUrl?.toLowerCase() ?? "";
  if (normalized.includes("publicdomain/zero") || normalized.includes("/cc0/")) {
    return {
      code: "CC0-1.0" as const,
      open: true,
      usage: {
        commercialUseAllowed: true,
        adaptationsAllowed: true,
        attributionRequired: false,
        shareAlike: false,
      },
    };
  }
  if (normalized.includes("publicdomain/mark") || normalized.includes("/pdm/")) {
    return {
      code: "PDM-1.0" as const,
      open: true,
      usage: {
        commercialUseAllowed: true,
        adaptationsAllowed: true,
        attributionRequired: false,
        shareAlike: false,
      },
    };
  }
  const match = normalized.match(/creativecommons\.org\/licenses\/(by(?:-[a-z]+)*)\/(\d\.\d)/);
  if (match) {
    const code = `CC-${match[1].toUpperCase()}-${match[2]}`;
    return {
      code,
      open: true,
      usage: {
        commercialUseAllowed: !code.includes("-NC-"),
        adaptationsAllowed: !code.includes("-ND-"),
        attributionRequired: true,
        shareAlike: code.includes("-SA-"),
      },
    };
  }
  return { code: "restricted" as const, open: false, usage: null };
}

function sourceIdFrom(record: Record<string, unknown>) {
  return (first(record.id, record.about) ?? "").replace(/^\/+/, "").replace(/\.json$/i, "");
}

export function normalizeEuropeanaArtwork(
  rawInput: unknown,
  accessedAt = new Date().toISOString(),
): Artwork {
  const raw = mergeRecordPayload(rawInput);
  const sourceId = sourceIdFrom(raw);
  if (!sourceId) throw new Error("Europeana record has no identifier");
  const title = first(raw.title, raw.dcTitle) ?? "Untitled";
  const creators = unique(raw.dcCreator, raw.creator);
  const dates = unique(raw.year, raw.dcDate, raw.dctermsCreated);
  const types = unique(raw.dcType, raw.type);
  const dataProviders = unique(raw.dataProvider, raw.edmDataProvider);
  const museumName =
    first(raw.edmCurrentLocationLabel, raw["edm:currentLocationLabel"]) ??
    dataProviders[0] ??
    "Europeana contributing institution";
  const providerUrl = url(raw.edmIsShownAt);
  const recordUrl = providerUrl ?? `${ITEM_BASE}/${sourceId}`;
  // edm:isShownBy may point to a video player, a 3D viewer, or another
  // non-image resource. edm:preview is the thumbnail Europeana generated for
  // display, so prefer it and only fall back to an obvious direct image URL.
  const directUrl = url(raw.edmPreview) ?? directImageUrl(raw.edmIsShownBy);
  const rightsUrl = url(raw.rights) ?? url(raw.edmRights);
  const imageLicense = license(rightsUrl);
  const descriptionHtml = first(raw.dcDescription, raw.description);
  const year = Number(dates.join(" ").match(/\b(1\d{3}|20\d{2})\b/)?.[1]);
  const image = directUrl
    ? {
        id: artworkKey("europeana", sourceId),
        directUrl,
        sourceUrl: providerUrl ?? `${ITEM_BASE}/${sourceId}`,
        altText: `${creators[0] ?? "Unknown artist"}, ${title}`,
        zoomable: false,
        maxZoomWindowSize: null,
        health: "unknown" as const,
      }
    : null;
  const status = !image
    ? "metadata_only_no_image"
    : imageLicense.open
      ? "image_displayable"
      : "metadata_only_rights";

  return artworkSchema.parse({
    id: `europeana:${artworkKey("europeana", sourceId).slice("europeana-".length)}`,
    sourceId,
    museumId: `europeana:${museumName.slice(0, 120)}`,
    source: {
      id: "europeana",
      label: museumName,
      recordUrl,
      apiUrl: `${API_BASE}/${sourceId}.json`,
      termsUrl: "https://www.europeana.eu/en/rights/terms-of-use",
      accessedAt,
    },
    display: {
      title,
      localizedTitles: { en: title },
      localizedTitleMetadata: { en: { source: "museum", status: "verified" } },
      altTitles: unique(raw.dctermsAlternative),
      artistDisplay: creators.join("; ") || "Unknown artist",
      dateDisplay: dates.join("; ") || undefined,
      mediumDisplay: first(raw.dctermsMedium, raw.dcFormat),
    },
    artist: null,
    date: { start: Number.isFinite(year) ? year : null, end: Number.isFinite(year) ? year : null },
    classification: {
      artworkTypeId: 1,
      artworkTypeTitle: types[0] ?? "Artwork",
      departmentTitle: museumName,
      classificationTitles: types,
    },
    images: { preferred: image, alternates: [] },
    rights: {
      work: { status: imageLicense.open ? "public_domain" : "unknown", notice: rightsUrl ?? null },
      image: {
        licenseCode: imageLicense.code,
        licenseUrl: rightsUrl ?? null,
        usage: imageLicense.usage,
      },
      metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
      termsUrl: "https://www.europeana.eu/en/rights/terms-of-use",
      attribution: `${creators[0] ?? "Unknown artist"}. ${title}. ${museumName}.`,
    },
    eligibility: {
      status,
      ruleVersion: RULE_VERSION,
      checkedAt: accessedAt,
      reasons: status === "metadata_only_rights" ? ["image_rights_not_open"] : [],
    },
    description: descriptionHtml
      ? { html: descriptionHtml, text: stripHtml(descriptionHtml), sourceField: "description" }
      : undefined,
    revision: first(raw.timestamp_update, raw.timestampUpdated) ?? `europeana-${sourceId}`,
  });
}

function apiKey() {
  const key = process.env.EUROPEANA_API_KEY?.trim();
  if (key) return key;
  throw new EuropeanaConfigurationError("EUROPEANA_API_KEY is not configured");
}

async function fetchEuropeana(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "X-Api-Key": apiKey() },
    next: { revalidate: 300, tags: ["europeana-catalog"] },
  });
  if (!response.ok) {
    const error = new Error(`Europeana request failed with ${response.status}`);
    Object.assign(error, { status: response.status });
    throw error;
  }
  return { payload: await response.json(), fetchedAt: new Date().toISOString() };
}

export async function getEuropeanaCollection(
  query: CollectionQuery,
  cursor = "*",
): Promise<CatalogPage> {
  const selectedMuseum = museumById(query.museum);
  const dataProvider =
    selectedMuseum?.collection.source === "europeana"
      ? selectedMuseum.collection.dataProvider
      : undefined;
  const params = new URLSearchParams({
    query: dataProvider
      ? `DATA_PROVIDER:"${dataProvider.replaceAll('"', '\\"')}"`
      : query.q || "painting",
    theme: "art",
    media: "true",
    thumbnail: "true",
    landingpage: "true",
    profile: "rich",
    rows: String(PAGE_SIZE),
    cursor: cursor || "*",
  });
  params.append("qf", "TYPE:IMAGE");
  const response = await fetchEuropeana(`${API_BASE}/search.json?${params}`);
  const payload = searchResponseSchema.parse(response.payload);
  const items = payload.items.map((item) => normalizeEuropeanaArtwork(item, response.fetchedAt));
  return catalogPageSchema.parse({
    items,
    pageInfo: {
      totalEligible: payload.totalResults,
      hasNextPage: Boolean(payload.nextCursor),
      nextCursor: payload.nextCursor ?? null,
    },
    query: { q: query.q, filters: { availability: "all" }, sort: query.sort },
    snapshotVersion: `europeana-live-${response.fetchedAt}`,
    dataStatus: { state: "fresh", fetchedAt: response.fetchedAt },
  });
}

export async function getEuropeanaArtwork(sourceId: string): Promise<Artwork | null> {
  const recordPath = sourceId.split("/").map(encodeURIComponent).join("/");
  try {
    const response = await fetchEuropeana(`${API_BASE}/${recordPath}.json`);
    return normalizeEuropeanaArtwork(response.payload, response.fetchedAt);
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && error.status === 404)
      return null;
    throw error;
  }
}
