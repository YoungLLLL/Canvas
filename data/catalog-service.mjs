import { articProvider } from "./providers/artic.mjs";
import { clevelandProvider } from "./providers/cleveland.mjs";
import { europeanaProvider } from "./providers/europeana.mjs";
import { metProvider } from "./providers/met.mjs";
import { wikidataMuseumProvider } from "./providers/wikidata.mjs";

const providers = new Map(
  [articProvider, metProvider, clevelandProvider, europeanaProvider]
    .map((provider) => [provider.id, provider]),
);
const cache = new Map();
const cacheTtlMs = 15 * 60 * 1000;

export function listCatalogSources() {
  return [
    ...[...providers.values()].map(({ id, label, capabilities }) => ({ id, label, resourceTypes: ["artwork"], capabilities })),
    { id: wikidataMuseumProvider.id, label: wikidataMuseumProvider.label, resourceTypes: ["museum"], capabilities: wikidataMuseumProvider.capabilities },
  ];
}

export async function getCatalogArtworks(options, context = {}) {
  const provider = providers.get(options.source);
  if (!provider) {
    const error = new Error("不支持的数据源");
    error.status = 400;
    throw error;
  }
  const normalized = {
    ids: (options.ids || []).map(String).filter(Boolean).slice(0, 20),
    query: String(options.query || "").trim().slice(0, 200),
    limit: Math.min(Math.max(Number(options.limit) || 20, 1), 100),
    cursor: String(options.cursor || "").trim().slice(0, 4000),
    publicDomainOnly: options.publicDomainOnly === true,
  };
  if (
    !normalized.ids.length &&
    !normalized.query &&
    !provider.capabilities.includes("browse")
  ) {
    const error = new Error("请提供作品 ID 或搜索词");
    error.status = 400;
    throw error;
  }
  const key = JSON.stringify([options.source, normalized]);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < cacheTtlMs) return { ...cached.value, cached: true };
  const value = await provider.getArtworks(normalized, context);
  cache.set(key, { createdAt: Date.now(), value });
  return { ...value, cached: false };
}

export async function getCatalogMuseums(options, context = {}) {
  if (options.source !== "wikidata") {
    const error = new Error("不支持的博物馆数据源");
    error.status = 400;
    throw error;
  }
  const ids = (options.ids || []).map(String).filter(Boolean).slice(0, 50);
  const key = JSON.stringify(["museums", options.source, ids]);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < cacheTtlMs) return { ...cached.value, cached: true };
  const value = await wikidataMuseumProvider.getMuseums({ ids }, context);
  cache.set(key, { createdAt: Date.now(), value });
  return { ...value, cached: false };
}
