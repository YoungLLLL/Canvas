import { collectionQuerySchema } from "@/src/schemas/routes";
import { getCatalogCollection } from "@/src/lib/catalog";
import { isCatalogSource } from "@/src/lib/catalog-source";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input: Record<string, string | string[]> = Object.fromEntries(url.searchParams);
  const sourceInput = url.searchParams.get("source") || "artic";
  if (!isCatalogSource(sourceInput)) {
    return Response.json({ error: "invalid_source" }, { status: 400 });
  }
  const cursor = url.searchParams.get("cursor") || undefined;
  const enrichArticImages = url.searchParams.get("fast") !== "1";
  if (sourceInput === "artic" && cursor && /^\d+$/.test(cursor)) input.page = cursor;
  const artists = url.searchParams.getAll("artist");
  if (artists.length > 1) input.artist = artists;
  const query = collectionQuerySchema.safeParse(input);
  if (!query.success) return Response.json({ error: "invalid_query" }, { status: 400 });

  try {
    return Response.json(
      await getCatalogCollection(sourceInput, query.data, cursor, { enrichArticImages }),
      {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
      },
    );
  } catch (error) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("Catalog request failed", details);
    return Response.json({ error: "catalog_unavailable" }, { status: 502 });
  }
}
