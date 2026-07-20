import { getCatalogArtworks, getCatalogMuseums } from "../data/catalog-service.mjs";

const checks = [
  { name: "Art Institute of Chicago", options: { source: "artic", ids: ["28560", "80607", "14586"], publicDomainOnly: true } },
  { name: "The Met", options: { source: "met", ids: ["436535"], publicDomainOnly: true } },
  { name: "Cleveland Museum of Art", options: { source: "cleveland", query: "van gogh", limit: 1, publicDomainOnly: true } },
];

let failed = false;
for (const check of checks) {
  try {
    const result = await getCatalogArtworks(check.options);
    const withImages = result.items.filter((item) => item.images?.preferred?.url).length;
    if (!result.items.length || !withImages) throw new Error("没有返回带图片的作品");
    console.log(`✓ ${check.name}: ${result.items.length} records, ${withImages} images`);
  } catch (error) {
    failed = true;
    console.error(`✗ ${check.name}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;

try {
  const museums = await getCatalogMuseums({ source: "wikidata", ids: ["Q239303"] });
  const museum = museums.items[0];
  if (!museum?.coordinates || !museum?.officialUrl) throw new Error("缺少坐标或官网");
  console.log(`✓ Wikidata: ${museum.names.display}, ${museum.coordinates.latitude}, ${museum.coordinates.longitude}`);
} catch (error) {
  failed = true;
  process.exitCode = 1;
  console.error(`✗ Wikidata: ${error.message}`);
}
