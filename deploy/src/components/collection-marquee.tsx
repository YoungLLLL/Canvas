"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";

import { ArtworkCardLink } from "@/src/components/collection-state";
import { artworkKey, type CatalogSource } from "@/src/lib/catalog-source";

export type MarqueeArtwork = {
  source?: CatalogSource;
  sourceId: string;
  title: string;
  secondaryTitle?: string;
  artist: string;
  date: string;
  medium: string;
  origin: string;
  imageUrl: string | null;
  ratio: number;
};

function ratioClass(ratio: number) {
  return ratio < 0.9 ? "portrait" : ratio > 1.5 ? "wide" : "landscape";
}

const FLOATING_LAYOUT = [
  { x: 50, y: 47, scale: 1.24, rotate: -1.2 },
  { x: 23, y: 35, scale: 0.72, rotate: -4.5 },
  { x: 77, y: 33, scale: 0.76, rotate: 3.6 },
  { x: 13, y: 73, scale: 0.6, rotate: 4.8 },
  { x: 88, y: 72, scale: 0.66, rotate: -3.8 },
  { x: 36, y: 78, scale: 0.5, rotate: -1.4 },
  { x: 65, y: 14, scale: 0.56, rotate: 1.8 },
  { x: 94, y: 16, scale: 0.46, rotate: 4.2 },
] as const;

export function CollectionMarquee({
  artworks,
  locale,
}: {
  artworks: MarqueeArtwork[];
  locale: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [selected, setSelected] = useState<MarqueeArtwork | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      moved: false,
    };
    setSelected(null);
    setIsDragging(true);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 6) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    setOffset({ x: drag.originX + deltaX, y: drag.originY + deltaY });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <>
      <div
        aria-label={
          locale === "zh" ? "可拖动的漂浮馆藏作品" : "Draggable floating collection artworks"
        }
        className={`collection-marquee collection-floating-stage${isDragging ? " is-dragging" : ""}`}
        onPointerCancel={endDrag}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerLeave={() => {
          setSelected(null);
        }}
      >
        <div
          className="collection-marquee-track"
          ref={trackRef}
          style={
            {
              transform: `translate3d(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px), 0)`,
            } as React.CSSProperties
          }
        >
          {[0, 1].map((copy) => (
            <div
              className={`collection-marquee-set${copy ? " is-floating-clone" : ""}`}
              aria-hidden={copy ? "true" : undefined}
              key={copy}
            >
              {artworks.map((artwork, index) =>
                (() => {
                  const layout = FLOATING_LAYOUT[index % FLOATING_LAYOUT.length];
                  return (
                    <ArtworkCardLink
                      aria-label={`${artwork.artist}, ${artwork.title}, ${artwork.date}`}
                      className={`artwork-marquee-item ${ratioClass(artwork.ratio)}${index === 0 ? " is-featured" : ""}`}
                      artworkKey={artworkKey(artwork.source ?? "artic", artwork.sourceId)}
                      idSuffix={copy ? "-clone" : ""}
                      key={`${copy}-${artwork.sourceId}`}
                      onBlur={() => {
                        setSelected(null);
                      }}
                      onFocus={() => {
                        setSelected(artwork);
                      }}
                      onPointerEnter={() => {
                        setSelected(artwork);
                      }}
                      onPointerLeave={() => {
                        setSelected(null);
                      }}
                      onPointerMove={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        event.currentTarget.style.setProperty(
                          "--cursor-x",
                          `${event.clientX - rect.left}px`,
                        );
                        event.currentTarget.style.setProperty(
                          "--cursor-y",
                          `${event.clientY - rect.top}px`,
                        );
                      }}
                      onClick={(event) => {
                        if (!suppressClickRef.current) return;
                        event.preventDefault();
                        event.stopPropagation();
                        suppressClickRef.current = false;
                      }}
                      style={
                        {
                          "--item-ratio": artwork.ratio,
                          "--pos-x": `${layout.x}%`,
                          "--pos-y": `${layout.y}%`,
                          "--item-scale": layout.scale,
                          "--item-rotate": `${layout.rotate}deg`,
                          viewTransitionName: copy ? "none" : `artwork-${artwork.sourceId}`,
                        } as React.CSSProperties
                      }
                      tabIndex={copy ? -1 : 0}
                    >
                      <span
                        className={`artwork-marquee-card${artwork.imageUrl ? "" : " metadata-artwork-card"}`}
                      >
                        <figure>
                          {artwork.imageUrl ? (
                            <img
                              alt={`${artwork.artist}, ${artwork.title}`}
                              decoding="async"
                              draggable={false}
                              fetchPriority={!copy && index < 2 ? "high" : "auto"}
                              loading={!copy && index < 2 ? "eager" : "lazy"}
                              src={artwork.imageUrl}
                            />
                          ) : (
                            <span className="metadata-artwork-content">
                              <small>
                                {locale === "zh" ? "仅资料记录" : "Metadata-only record"}
                              </small>
                              <strong>{artwork.title}</strong>
                              <span>{artwork.artist}</span>
                            </span>
                          )}
                          <span className="artwork-open-pill">
                            {locale === "zh" ? "进入作品" : "Open artwork"} <i>↗</i>
                          </span>
                        </figure>
                      </span>
                    </ArtworkCardLink>
                  );
                })(),
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="collection-floating-cue" aria-hidden="true">
        <span>{locale === "zh" ? "拖动探索作品" : "DRAG TO EXPLORE"}</span>
        <small>{locale === "zh" ? "四向自由移动" : "MOVE IN ANY DIRECTION"}</small>
      </p>
      <aside
        className={`artwork-hover-detail${selected ? " visible" : ""}`}
        aria-hidden={!selected}
      >
        <p>
          {[selected?.medium || "COLLECTION", selected?.origin]
            .filter(Boolean)
            .join(" / ")
            .toUpperCase()}
        </p>
        <h2>{selected?.title}</h2>
        {selected?.secondaryTitle ? <h3>{selected.secondaryTitle}</h3> : null}
        <span>{[selected?.artist, selected?.date].filter(Boolean).join(" · ")}</span>
      </aside>
    </>
  );
}
