import { getArticArtwork } from "@/src/lib/artic";

export async function GET(_request: Request, context: RouteContext<"/api/artworks/[sourceId]">) {
  const { sourceId } = await context.params;
  if (!/^\d+$/.test(sourceId))
    return Response.json({ error: "invalid_artwork_id" }, { status: 400 });

  try {
    const artwork = await getArticArtwork(sourceId);
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
