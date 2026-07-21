import type { ImageAsset } from "@/src/schemas/catalog";

export function iiifImageUrl(asset: ImageAsset, width: 200 | 400 | 600 | 843 | 1686) {
  if (asset.directUrl) {
    return width > 843 && asset.directUrl2x ? asset.directUrl2x : asset.directUrl;
  }
  return `${asset.iiifBaseUrl}/full/${width},/0/default.jpg`;
}
