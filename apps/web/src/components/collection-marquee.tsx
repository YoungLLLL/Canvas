"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";

import { ArtworkCardLink } from "@/src/components/collection-state";

type MarqueeArtwork = {
  sourceId: string;
  title: string;
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

export function CollectionMarquee({
  artworks,
  locale,
}: {
  artworks: MarqueeArtwork[];
  locale: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstSetRef = useRef<HTMLDivElement>(null);
  const interactionPaused = useRef(false);
  const manualPaused = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selected, setSelected] = useState<MarqueeArtwork | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let frame = 0;
    // Start with the first focusable artwork fully visible. This keeps keyboard and
    // touch targets reachable before the continuous loop begins.
    let offset = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const width = firstSet.getBoundingClientRect().width;
      const elapsed = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!interactionPaused.current && !manualPaused.current && width) {
        offset -= 40 * elapsed;
        if (offset <= -width) offset += width;
        track.style.transform = `translate3d(${offset}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    const updateVisibility = () => {
      cancelAnimationFrame(frame);
      previous = performance.now();
      if (document.visibilityState === "visible") frame = requestAnimationFrame(tick);
    };
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  return (
    <>
      <div
        className="collection-marquee"
        aria-label={locale === "zh" ? "自动滚动的馆藏艺术品" : "Automatically scrolling collection"}
        onPointerEnter={() => {
          interactionPaused.current = true;
        }}
        onPointerLeave={() => {
          interactionPaused.current = false;
          setSelected(null);
        }}
      >
        <div className="collection-marquee-track" ref={trackRef}>
          {[0, 1].map((copy) => (
            <div
              className="collection-marquee-set"
              aria-hidden={copy ? "true" : undefined}
              key={copy}
              ref={copy === 0 ? firstSetRef : undefined}
            >
              {artworks.map((artwork, index) => (
                <ArtworkCardLink
                  aria-label={`${artwork.artist}, ${artwork.title}, ${artwork.date}`}
                  className={`artwork-marquee-item ${ratioClass(artwork.ratio)}`}
                  artworkKey={`artic-${artwork.sourceId}`}
                  idSuffix={copy ? "-clone" : ""}
                  key={`${copy}-${artwork.sourceId}`}
                  onBlur={() => {
                    interactionPaused.current = false;
                    setSelected(null);
                  }}
                  onFocus={() => {
                    interactionPaused.current = true;
                    setSelected(artwork);
                  }}
                  onPointerEnter={() => {
                    interactionPaused.current = true;
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
                  style={
                    {
                      "--item-ratio": artwork.ratio,
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
                          <small>{locale === "zh" ? "仅资料记录" : "Metadata-only record"}</small>
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
              ))}
            </div>
          ))}
        </div>
      </div>
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
        <span>{[selected?.artist, selected?.date].filter(Boolean).join(" · ")}</span>
      </aside>
      <p className={`gallery-instruction${selected ? " quiet" : ""}`}>
        {locale === "zh" ? "悬停查看作品信息 · 点击进入作品" : "HOVER FOR DETAILS · CLICK TO OPEN"}
      </p>
      <button
        aria-pressed={isPaused}
        className="marquee-motion-toggle"
        onClick={() => {
          const next = !manualPaused.current;
          manualPaused.current = next;
          setIsPaused(next);
        }}
        type="button"
      >
        {isPaused
          ? locale === "zh"
            ? "继续滚动"
            : "Resume motion"
          : locale === "zh"
            ? "暂停滚动"
            : "Pause motion"}
      </button>
    </>
  );
}
