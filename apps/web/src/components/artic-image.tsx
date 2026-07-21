"use client";

import { useState } from "react";

import { iiifImageUrl } from "@/src/lib/iiif";
import type { ImageAsset } from "@/src/schemas/catalog";

export function ArticImage({
  asset,
  alt,
  priority = false,
  failureLabel = "High-resolution image temporarily unavailable",
}: {
  asset: ImageAsset;
  alt: string;
  priority?: boolean;
  failureLabel?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (failed) {
    return (
      <span
        className={asset.lqip ? "image-fallback has-preview" : "image-fallback"}
        style={asset.lqip ? { backgroundImage: `url(${asset.lqip})` } : undefined}
      >
        <span>{failureLabel}</span>
      </span>
    );
  }

  const srcSet = asset.directUrl
    ? asset.directUrl2x
      ? `${asset.directUrl} ${asset.width ?? 843}w, ${asset.directUrl2x} ${(asset.width ?? 843) * 2}w`
      : undefined
    : `${iiifImageUrl(asset, 200)} 200w, ${iiifImageUrl(asset, 400)} 400w, ${iiifImageUrl(asset, 600)} 600w, ${iiifImageUrl(asset, 843)} 843w, ${iiifImageUrl(asset, 1686)} 1686w`;

  return (
    // ARTIC explicitly supports IIIF hotlinking. A native responsive image lets the
    // browser choose a size without routing museum images through our deployment.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={asset.altText ?? alt}
      className={loaded ? "artic-image is-loaded" : "artic-image"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      onLoad={() => setLoaded(true)}
      sizes="(max-width: 720px) 92vw, (max-width: 1100px) 45vw, 30vw"
      src={iiifImageUrl(asset, 843)}
      srcSet={srcSet}
      style={asset.lqip ? { backgroundImage: `url(${asset.lqip})` } : undefined}
    />
  );
}
