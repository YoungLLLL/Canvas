const ARTIC_IIIF_BASE_URL = "https://www.artic.edu/iiif/2/";
const ALLOWED_WIDTHS = new Set([200, 400, 600, 843, 1686]);
const IMAGE_ID_PATTERN = /^[A-Za-z0-9._~-]+$/;

export const runtime = "nodejs";

function invalidRequest() {
  return Response.json({ error: "invalid_image_request" }, { status: 400 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const imageId = url.searchParams.get("image");
  const width = Number(url.searchParams.get("width") || "843");

  if (!imageId || !IMAGE_ID_PATTERN.test(imageId) || !ALLOWED_WIDTHS.has(width)) {
    return invalidRequest();
  }

  const upstream = await fetch(
    `${ARTIC_IIIF_BASE_URL}${encodeURIComponent(imageId)}/full/${width},/0/default.jpg`,
    {
      headers: {
        "AIC-User-Agent": process.env.ARTIC_USER_AGENT ?? "Canvium Gallery (local showcase)",
      },
      cache: "no-store",
    },
  );

  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "image_unavailable" }, { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000",
      "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
    },
  });
}
