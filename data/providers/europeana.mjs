import { cleanText, compactObject, fetchJson, uniqueStrings } from "./shared.mjs";

const apiBase = "https://api.europeana.eu/record/v2";
const europeanaItemBase = "https://www.europeana.eu/item";

function scalarValues(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(scalarValues);
  if (typeof value === "string" || typeof value === "number") return [String(value)];
  if (typeof value !== "object") return [];

  const preferredKeys = ["def", "zh", "en", "@id", "id", "about", "value"];
  const preferred = preferredKeys.flatMap((key) => scalarValues(value[key]));
  if (preferred.length) return preferred;
  return Object.values(value).flatMap(scalarValues);
}

function firstValue(...values) {
  return values.flatMap(scalarValues).map(cleanText).find(Boolean) || null;
}

function allValues(...values) {
  return uniqueStrings(values.flatMap(scalarValues).map(cleanText).filter(Boolean));
}

function secureUrl(value) {
  const candidate = firstValue(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) ? candidate : null;
  } catch {
    return null;
  }
}

function extractWikidataId(value) {
  for (const candidate of scalarValues(value)) {
    const match = candidate.match(/(?:wikidata\.org\/(?:wiki\/)?|^)(Q\d+)(?:$|[/?#])/i);
    if (match) return match[1].toUpperCase();
  }
  return null;
}

function rightsCode(rightsUrl) {
  if (!rightsUrl) return "UNKNOWN";
  const normalized = rightsUrl.toLowerCase();
  if (normalized.includes("publicdomain/zero") || normalized.includes("/cc0/")) return "CC0";
  if (normalized.includes("publicdomain/mark") || normalized.includes("/pdm/")) return "PDM";
  const creativeCommons = normalized.match(/creativecommons\.org\/licenses\/([^/]+)\/([\d.]+)/);
  if (creativeCommons) return `${creativeCommons[1].toUpperCase()}-${creativeCommons[2]}`;
  if (normalized.includes("rightsstatements.org")) {
    const statement = rightsUrl.match(/rightsstatements\.org\/(?:vocab\/)?([^/]+)/i)?.[1];
    if (statement) return statement.toUpperCase();
  }
  return "RESTRICTED";
}

function isPublicDomainCode(code) {
  return code === "CC0" || code === "PDM" || code === "NOC";
}

function normalizeEuropeanaId(value) {
  return String(value || "").replace(/^\/+/, "").replace(/\.json$/i, "");
}

function mergeRecordPayload(payload) {
  const object = payload?.object || payload || {};
  if (!Array.isArray(object.proxies) && !Array.isArray(object.aggregations)) return object;

  const merged = { id: object.about || object.id };
  for (const section of [
    ...(object.proxies || []),
    ...(object.aggregations || []),
    object.europeanaAggregation || {},
  ]) {
    if (!section || typeof section !== "object") continue;
    for (const [key, value] of Object.entries(section)) {
      if (merged[key] === undefined) merged[key] = value;
      else merged[key] = [...scalarValues(merged[key]), ...scalarValues(value)];
    }
  }
  merged._places = object.places || object.edmPlaces || [];
  return merged;
}

function placeCandidates(record) {
  const currentLocationValues = scalarValues(
    record.edmCurrentLocation,
    record["edm:currentLocation"],
  );
  const places = Array.isArray(record._places)
    ? record._places
    : Object.values(record._places || {});

  return places.filter((place) => {
    const identity = scalarValues(place.about || place["@id"] || place.id);
    return identity.some((candidate) => currentLocationValues.includes(candidate));
  });
}

function numberValue(value) {
  const parsed = Number(firstValue(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMuseum(record) {
  const currentLocation = firstValue(
    record.edmCurrentLocationLabel,
    record["edm:currentLocationLabel"],
    record.edmCurrentLocation,
    record["edm:currentLocation"],
  );
  const matchingPlace = placeCandidates(record)[0];
  const placeName = matchingPlace
    ? firstValue(matchingPlace.prefLabel, matchingPlace.skosPrefLabel, matchingPlace.note)
    : null;
  const currentLocationRaw = [
    record.edmCurrentLocation,
    record["edm:currentLocation"],
    matchingPlace,
  ];

  if (currentLocation || placeName) {
    return compactObject({
      name: placeName || currentLocation,
      relation: "current_location",
      confidence: "verified",
      wikidataId: extractWikidataId(currentLocationRaw),
      sourceUrl: secureUrl(record.edmCurrentLocation) || secureUrl(matchingPlace?.about),
      coordinates: matchingPlace
        ? compactObject({
            latitude: numberValue(matchingPlace.lat || matchingPlace.latitude || matchingPlace.wgs84_pos_lat),
            longitude: numberValue(matchingPlace.long || matchingPlace.longitude || matchingPlace.wgs84_pos_long),
          })
        : null,
    });
  }

  const dataProvider = firstValue(record.dataProvider, record.edmDataProvider);
  if (!dataProvider) return null;
  return {
    name: dataProvider,
    relation: "data_provider",
    confidence: "candidate",
    wikidataId: extractWikidataId(record.dataProvider),
  };
}

export function normalizeEuropeanaArtwork(input) {
  const record = mergeRecordPayload(input);
  const sourceId = normalizeEuropeanaId(record.id || record.about);
  const rightsUrl = secureUrl(record.rights, record.edmRights);
  const code = rightsCode(rightsUrl);
  const directImage = secureUrl(record.edmIsShownBy);
  const previewImage = secureUrl(record.edmPreview);
  const imageUrl = directImage || previewImage;
  const providerRecordUrl = secureUrl(record.edmIsShownAt);
  const europeanaUrl = sourceId ? `${europeanaItemBase}/${sourceId}` : null;
  const creators = allValues(record.dcCreator, record.creator);
  const dates = allValues(record.year, record.dcDate, record.dctermsCreated);
  const types = allValues(record.dcType, record.type);
  const dataProviders = allValues(record.dataProvider, record.edmDataProvider);
  const aggregators = allValues(record.provider, record.edmProvider);
  const museum = normalizeMuseum(record);
  const manifestUrl = allValues(record.dctermsIsReferencedBy, record.edmHasView)
    .find((value) => /(?:iiif|manifest)/i.test(value)) || null;

  return compactObject({
    id: `europeana:${sourceId}`,
    source: "europeana",
    sourceId,
    sourceUrl: providerRecordUrl || europeanaUrl,
    europeanaUrl,
    apiUrl: sourceId ? `${apiBase}/${sourceId}.json` : null,
    iiifManifestUrl: manifestUrl,
    title: firstValue(record.title, record.dcTitle) || "Untitled",
    alternateTitles: allValues(record.dctermsAlternative),
    artist: compactObject({
      name: creators[0],
      display: creators.join("; "),
    }),
    date: compactObject({ display: dates.join("; ") }),
    origin: firstValue(record.country, record.edmCountry, record.dctermsSpatial),
    medium: firstValue(record.dctermsMedium, record.dcFormat),
    description: cleanText(firstValue(record.dcDescription, record.description)),
    classification: types.join("; ") || null,
    museum,
    sourceInstitution: compactObject({
      dataProviders,
      aggregators,
    }),
    images: imageUrl
      ? {
          preferred: compactObject({
            kind: "primary",
            url: imageUrl,
            thumbnailUrl: previewImage || imageUrl,
          }),
          alternates: [],
        }
      : { alternates: [] },
    rights: {
      publicDomain: isPublicDomainCode(code),
      code,
      notice: rightsUrl || null,
      licenseUrl: rightsUrl || providerRecordUrl || europeanaUrl,
      attribution: dataProviders[0] || aggregators[0] || "Europeana",
    },
  });
}

function requireApiKey(context) {
  const apiKey = context.apiKey || process.env.EUROPEANA_API_KEY;
  if (apiKey) return apiKey;
  const error = new Error("未配置 EUROPEANA_API_KEY");
  error.status = 503;
  throw error;
}

async function getRecordsById(ids, context, apiKey) {
  const records = await Promise.all(
    ids.slice(0, 20).map((id) => {
      const sourceId = normalizeEuropeanaId(id);
      const params = new URLSearchParams({ wskey: apiKey });
      return fetchJson(`${apiBase}/${sourceId}.json?${params}`, context);
    }),
  );
  return records.map(normalizeEuropeanaArtwork);
}

export const europeanaProvider = {
  id: "europeana",
  label: "Europeana",
  capabilities: ["browse", "search", "by-id", "multi-institution", "iiif", "rights-filter"],
  async getArtworks(
    { ids = [], query, limit = 20, cursor = "*", publicDomainOnly = false },
    context = {},
  ) {
    const apiKey = requireApiKey(context);
    if (ids.length) {
      const items = await getRecordsById(ids, context, apiKey);
      return {
        source: this.id,
        total: items.length,
        items: items.filter((item) => !publicDomainOnly || item.rights.publicDomain),
      };
    }

    const params = new URLSearchParams({
      wskey: apiKey,
      query: query || "*",
      theme: "art",
      media: "true",
      thumbnail: "true",
      landingpage: "true",
      profile: "rich",
      rows: String(Math.min(Math.max(limit, 1), 100)),
      cursor: cursor || "*",
    });
    if (publicDomainOnly) params.set("reusability", "open");

    const payload = await fetchJson(`${apiBase}/search.json?${params}`, context);
    const items = (payload.items || [])
      .map(normalizeEuropeanaArtwork)
      .filter((item) => !publicDomainOnly || item.rights.publicDomain);
    return {
      source: this.id,
      total: payload.totalResults ?? items.length,
      nextCursor: payload.nextCursor,
      items,
    };
  },
};
