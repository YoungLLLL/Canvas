import { compactObject, fetchJson } from "./shared.mjs";

const apiBase = "https://www.wikidata.org/w/api.php";

function firstClaim(entity, property) {
  return entity.claims?.[property]?.[0]?.mainsnak?.datavalue?.value ?? null;
}

function localized(entity, property) {
  return entity[property]?.zh?.value || entity[property]?.en?.value || Object.values(entity[property] || {})[0]?.value || null;
}

function entityId(value) {
  return value?.id || (value?.["numeric-id"] ? `Q${value["numeric-id"]}` : null);
}

function linkedEntity(value, labels) {
  const id = entityId(value);
  return id ? compactObject({ id, name: labels.get(id) }) : null;
}

function wikipediaUrl(entity) {
  const zh = entity.sitelinks?.zhwiki?.title;
  const en = entity.sitelinks?.enwiki?.title;
  if (zh) return `https://zh.wikipedia.org/wiki/${encodeURIComponent(zh.replaceAll(" ", "_"))}`;
  if (en) return `https://en.wikipedia.org/wiki/${encodeURIComponent(en.replaceAll(" ", "_"))}`;
  return null;
}

export function normalizeWikidataMuseum(entity, labels = new Map()) {
  const coordinate = firstClaim(entity, "P625");
  const image = firstClaim(entity, "P18");
  const inception = firstClaim(entity, "P571")?.time?.match(/[+-](\d{4})/)?.[1];
  const addressValue = firstClaim(entity, "P6375");
  return compactObject({
    id: `wikidata:${entity.id}`,
    source: "wikidata",
    sourceId: entity.id,
    sourceUrl: `https://www.wikidata.org/wiki/${entity.id}`,
    names: compactObject({ zh: entity.labels?.zh?.value, en: entity.labels?.en?.value, display: localized(entity, "labels") }),
    descriptions: compactObject({ zh: entity.descriptions?.zh?.value, en: entity.descriptions?.en?.value }),
    coordinates: coordinate ? { latitude: coordinate.latitude, longitude: coordinate.longitude } : null,
    address: addressValue && typeof addressValue === "object" ? addressValue.text : addressValue,
    inceptionYear: inception ? Number(inception) : null,
    officialUrl: firstClaim(entity, "P856"),
    imageUrl: image ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(image)}` : null,
    location: linkedEntity(firstClaim(entity, "P131"), labels),
    country: linkedEntity(firstClaim(entity, "P17"), labels),
    wikipediaUrl: wikipediaUrl(entity),
    externalIds: compactObject({ geonames: firstClaim(entity, "P1566"), viaf: firstClaim(entity, "P214") }),
    rights: {
      code: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      attribution: "Wikidata contributors",
    },
  });
}

async function fetchEntities(ids, context) {
  const params = new URLSearchParams({
    action: "wbgetentities",
    ids: ids.join("|"),
    props: "labels|descriptions|claims|sitelinks",
    languages: "zh|en",
    languagefallback: "1",
    format: "json",
    formatversion: "2",
    origin: "*",
  });
  return fetchJson(`${apiBase}?${params}`, context);
}

export const wikidataMuseumProvider = {
  id: "wikidata",
  label: "Wikidata",
  capabilities: ["museum-by-id", "coordinates", "multilingual", "linked-data"],
  async getMuseums({ ids = [] }, context = {}) {
    const qids = ids.map((id) => String(id).toUpperCase()).filter((id) => /^Q\d+$/.test(id)).slice(0, 50);
    if (!qids.length) {
      const error = new Error("请提供有效的 Wikidata QID");
      error.status = 400;
      throw error;
    }
    const payload = await fetchEntities(qids, context);
    const entities = Object.values(payload.entities || {}).filter((entity) => !entity.missing);
    const linkedIds = [...new Set(entities.flatMap((entity) => [entityId(firstClaim(entity, "P131")), entityId(firstClaim(entity, "P17"))]).filter(Boolean))];
    const labels = new Map();
    if (linkedIds.length) {
      const linked = await fetchEntities(linkedIds, context);
      for (const entity of Object.values(linked.entities || {})) labels.set(entity.id, localized(entity, "labels"));
    }
    return { source: this.id, total: entities.length, items: entities.map((entity) => normalizeWikidataMuseum(entity, labels)) };
  },
};
