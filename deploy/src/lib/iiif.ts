import type { ImageAsset } from "@/src/schemas/catalog";

const ARTIC_IIIF_BASE_URL = "https://www.artic.edu/iiif/2/";

export function iiifImageUrl(asset: ImageAsset, width: 200 | 400 | 600 | 843 | 1686) {
  if (asset.directUrl) {
    return width > 843 && asset.directUrl2x ? asset.directUrl2x : asset.directUrl;
  }

  const iiifBaseUrl = asset.iiifBaseUrl?.replace(/\/$/, "");
  if (iiifBaseUrl?.startsWith(ARTIC_IIIF_BASE_URL.slice(0, -1))) {
    const imageId = iiifBaseUrl.slice(ARTIC_IIIF_BASE_URL.length);
    return `/api/artic-image?image=${encodeURIComponent(imageId)}&width=${width}`;
  }

  return `${asset.iiifBaseUrl}/full/${width},/0/default.jpg`;
}
