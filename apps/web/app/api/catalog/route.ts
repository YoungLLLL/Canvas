import { collectionQuerySchema } from "@/src/schemas/routes";
import { getArticCollection } from "@/src/lib/artic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const input: Record<string, string | string[]> = Object.fromEntries(url.searchParams);
  const artists = url.searchParams.getAll("artist");
  if (artists.length > 1) input.artist = artists;
  const query = collectionQuerySchema.safeParse(input);
  if (!query.success) return Response.json({ error: "invalid_query" }, { status: 400 });

  try {
    return Response.json(await getArticCollection(query.data), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "catalog_unavailable" }, { status: 502 });
  }
}
