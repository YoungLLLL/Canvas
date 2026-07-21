"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type MarqueeArtwork = {
  sourceId: string;
  title: string;
  artist: string;
  date: string;
  medium: string;
  origin: string;
  imageUrl: string;
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
  const paused = useRef(false);
  const [selected, setSelected] = useState<MarqueeArtwork | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = firstSetRef.current;
    if (!track || !firstSet || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let frame = 0;
    let offset = -Math.min(firstSet.getBoundingClientRect().width * 0.28, innerWidth * 0.24);
    let previous = performance.now();
    const tick = (now: number) => {
      const width = firstSet.getBoundingClientRect().width;
      const elapsed = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if (!paused.current && width) {
        offset -= 40 * elapsed;
        if (offset <= -width) offset += width;
        track.style.transform = `translate3d(${offset}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div
        className="collection-marquee"
        aria-label={locale === "zh" ? "自动滚动的馆藏艺术品" : "Automatically scrolling collection"}
      >
        <div className="collection-marquee-track" ref={trackRef}>
          {[0, 1, 2].map((copy) => (
            <div
              className="collection-marquee-set"
              aria-hidden={copy ? "true" : undefined}
              key={copy}
              ref={copy === 0 ? firstSetRef : undefined}
            >
              {artworks.map((artwork, index) => (
                <Link
                  aria-label={`${artwork.artist}, ${artwork.title}, ${artwork.date}`}
                  className={`artwork-marquee-item ${ratioClass(artwork.ratio)}`}
                  href={`/${locale}/artworks/artic-${artwork.sourceId}`}
                  key={`${copy}-${artwork.sourceId}`}
                  onBlur={() => {
                    paused.current = false;
                    setSelected(null);
                  }}
                  onFocus={() => {
                    paused.current = true;
                    setSelected(artwork);
                  }}
                  onPointerEnter={() => {
                    paused.current = true;
                    setSelected(artwork);
                  }}
                  onPointerLeave={() => {
                    paused.current = false;
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
                      viewTransitionName: `artwork-${artwork.sourceId}`,
                    } as React.CSSProperties
                  }
                  tabIndex={copy ? -1 : 0}
                >
                  <span className="artwork-marquee-card">
                    <figure>
                      <img
                        alt={`${artwork.artist}, ${artwork.title}`}
                        draggable={false}
                        loading={copy ? "lazy" : index < 3 ? "eager" : "lazy"}
                        src={artwork.imageUrl}
                      />
                      <span className="artwork-open-pill">
                        {locale === "zh" ? "进入作品" : "Open artwork"} <i>↗</i>
                      </span>
                    </figure>
                  </span>
                </Link>
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
    </>
  );
}
