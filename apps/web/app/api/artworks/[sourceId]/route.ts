import { getCatalogArtwork } from "@/src/lib/catalog";
import { isCatalogSource } from "@/src/lib/catalog-source";

export async function GET(request: Request, context: RouteContext<"/api/artworks/[sourceId]">) {
  const { sourceId } = await context.params;
  const source = new URL(request.url).searchParams.get("source") || "artic";
  if (!isCatalogSource(source) || (source !== "europeana" && !/^\d+$/.test(sourceId)))
    return Response.json({ error: "invalid_artwork_id" }, { status: 400 });

  try {
    const artwork = await getCatalogArtwork(source, sourceId);
    return artwork
      ? Response.json(artwork, {
          headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
        })
      : Response.json({ error: "artwork_not_found" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "artwork_unavailable" }, { status: 502 });
  }
}
