"use client";

import { useRef, useState } from "react";

import { ArticImage } from "@/src/components/artic-image";
import type { ImageAsset } from "@/src/schemas/catalog";

export function ArtworkViewer({
  asset,
  alt,
  locale,
}: {
  asset: ImageAsset;
  alt: string;
  locale: "en" | "zh";
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const text =
    locale === "zh"
      ? { zoomIn: "放大", zoomOut: "缩小", reset: "复位", fullscreen: "全屏" }
      : { zoomIn: "Zoom in", zoomOut: "Zoom out", reset: "Reset", fullscreen: "Fullscreen" };

  const updateScale = (next: number) => {
    const clamped = Math.min(4, Math.max(1, next));
    setScale(clamped);
    if (clamped === 1) setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className={scale > 1 ? "artwork-viewer is-zoomed" : "artwork-viewer"}
      onKeyDown={(event) => {
        if (event.key === "+" || event.key === "=") updateScale(scale + 0.5);
        if (event.key === "-") updateScale(scale - 0.5);
        if (event.key === "0" || event.key === "Escape") updateScale(1);
      }}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest(".viewer-controls")) return;
        if (scale === 1) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = { x: event.clientX, y: event.clientY, left: position.x, top: position.y };
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current;
        if (!drag) return;
        setPosition({
          x: drag.left + event.clientX - drag.x,
          y: drag.top + event.clientY - drag.y,
        });
      }}
      onPointerUp={() => (dragRef.current = null)}
      onWheel={(event) => {
        event.preventDefault();
        updateScale(scale + (event.deltaY < 0 ? 0.25 : -0.25));
      }}
      ref={rootRef}
      role="region"
      tabIndex={0}
    >
      <div
        className="viewer-transform"
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})` }}
      >
        <ArticImage
          asset={asset}
          alt={alt}
          failureLabel={
            locale === "zh" ? "高清图片暂时不可用" : "High-resolution image temporarily unavailable"
          }
          priority
        />
      </div>
      <div className="viewer-controls">
        <button
          aria-label={text.zoomOut}
          disabled={scale === 1}
          onClick={() => updateScale(scale - 0.5)}
          type="button"
        >
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          aria-label={text.zoomIn}
          disabled={scale === 4}
          onClick={() => updateScale(scale + 0.5)}
          type="button"
        >
          ＋
        </button>
        <button onClick={() => updateScale(1)} type="button">
          {text.reset}
        </button>
        <button onClick={() => rootRef.current?.requestFullscreen()} type="button">
          {text.fullscreen}
        </button>
      </div>
    </div>
  );
}
