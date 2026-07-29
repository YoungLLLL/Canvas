"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ArtworkCardLink } from "@/src/components/collection-state";
import { artworkKey, type CatalogSource } from "@/src/lib/catalog-source";
import { iiifImageUrl } from "@/src/lib/iiif";
import { resolveChineseArtworkTitle } from "@/src/lib/localized-artwork-title";
import { catalogPageSchema, type Artwork, type CatalogPage } from "@/src/schemas/catalog";

const PRELOAD_MARGIN_PX = 900;

function imageFor(artwork: Artwork) {
  const image = artwork.images.preferred;
  if (!image) return null;
  return {
    src: image.directUrl || iiifImageUrl(image, 843),
    srcSet: image.directUrl2x ? `${image.directUrl} 1x, ${image.directUrl2x} 2x` : undefined,
    ratio: image.width && image.height ? image.width / image.height : 0.78,
    alt: image.altText || `${artwork.display.artistDisplay}, ${artwork.display.title}`,
  };
}

export function CollectionInfiniteGrid({
  initialPage,
  locale,
  source = "artic",
}: {
  initialPage: CatalogPage;
  locale: "en" | "zh";
  source?: CatalogSource;
}) {
  const [artworks, setArtworks] = useState(initialPage.items);
  const [hasNextPage, setHasNextPage] = useState(initialPage.pageInfo.hasNextPage);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const nextCursorRef = useRef(initialPage.pageInfo.nextCursor);
  const hasNextPageRef = useRef(initialPage.pageInfo.hasNextPage);
  const requestInFlight = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadNextPageRef = useRef<() => Promise<void>>(async () => {});

  const loadNextPage = useCallback(async () => {
    if (!hasNextPageRef.current || requestInFlight.current) return;
    requestInFlight.current = true;
    setLoadState("loading");
    try {
      const cursor = nextCursorRef.current;
      if (!cursor) return;
      const requestUrl =
        source === "artic"
          ? (() => {
              const params = new URLSearchParams(window.location.search);
              params.delete("source");
              params.delete("cursor");
              params.set("page", cursor);
              return `/api/catalog?${params}`;
            })()
          : (() => {
              const params = new URLSearchParams(window.location.search);
              params.set("source", source);
              params.set("cursor", cursor);
              return `/api/catalog?${params}`;
            })();
      const response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`catalog page failed with ${response.status}`);
      const nextPage = catalogPageSchema.parse(await response.json());
      nextCursorRef.current = nextPage.pageInfo.nextCursor;
      setArtworks((current) => {
        const known = new Set(current.map((artwork) => artwork.sourceId));
        return [...current, ...nextPage.items.filter((artwork) => !known.has(artwork.sourceId))];
      });
      hasNextPageRef.current = nextPage.pageInfo.hasNextPage;
      setHasNextPage(nextPage.pageInfo.hasNextPage);
      setLoadState("idle");
    } catch (error) {
      console.error(error);
      setLoadState("error");
    } finally {
      requestInFlight.current = false;
      window.requestAnimationFrame(() => {
        const sentinel = sentinelRef.current;
        if (
          hasNextPageRef.current &&
          sentinel &&
          sentinel.getBoundingClientRect().top <= window.innerHeight + PRELOAD_MARGIN_PX
        ) {
          void loadNextPageRef.current();
        }
      });
    }
  }, [source]);

  useEffect(() => {
    loadNextPageRef.current = loadNextPage;
  }, [loadNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPageRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadNextPageRef.current();
      },
      { rootMargin: `${PRELOAD_MARGIN_PX}px 0px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const cards = useMemo(
    () =>
      artworks.map((artwork, index) => {
        const image = imageFor(artwork);
        const englishTitle = artwork.display.localizedTitles.en || artwork.display.title;
        const chineseTitle = resolveChineseArtworkTitle(artwork);
        const primaryTitle = locale === "zh" ? chineseTitle.text : englishTitle;
        const secondaryTitle =
          locale === "zh"
            ? chineseTitle.hasChinese
              ? englishTitle
              : "暂无可靠中文译名"
            : chineseTitle.hasChinese
              ? chineseTitle.text
              : null;
        return (
          <ArtworkCardLink
            artworkKey={artworkKey(source, artwork.sourceId)}
            className={`collection-result-card${image ? "" : " is-metadata-only"}`}
            key={artwork.sourceId}
            style={
              {
                "--result-ratio": Math.min(1.9, Math.max(0.65, image?.ratio ?? 0.78)),
              } as React.CSSProperties
            }
          >
            <figure>
              {image ? (
                <img
                  alt={image.alt}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "auto"}
                  loading={index < 3 ? "eager" : "lazy"}
                  src={image.src}
                  srcSet={image.srcSet}
                />
              ) : (
                <span className="collection-result-placeholder">
                  <small>{locale === "zh" ? "仅资料记录" : "Metadata-only record"}</small>
                  <strong>{primaryTitle}</strong>
                </span>
              )}
              <span className="collection-result-open">
                <span>{locale === "zh" ? "进入作品" : "Open artwork"}</span>
                <small>{locale === "zh" ? "OPEN ARTWORK" : "进入作品"}</small> ↗
              </span>
            </figure>
            <div className="collection-result-copy">
              <h3
                title={
                  chineseTitle.status === "provisional"
                    ? locale === "zh"
                      ? "暂译，等待资料核验"
                      : "Provisional Chinese translation"
                    : undefined
                }
              >
                <span className="collection-result-title-text">{primaryTitle}</span>
                {chineseTitle.status === "provisional" ? (
                  <small className="collection-result-title-status">
                    {locale === "zh" ? "暂译" : "PROVISIONAL"}
                  </small>
                ) : null}
              </h3>
              {secondaryTitle ? <h4>{secondaryTitle}</h4> : null}
              <p>{artwork.display.artistDisplay}</p>
              <span>
                {artwork.display.dateDisplay || (locale === "zh" ? "年代不详" : "Date unknown")}
              </span>
            </div>
          </ArtworkCardLink>
        );
      }),
    [artworks, locale, source],
  );

  return (
    <>
      <div
        className="collection-results-grid"
        aria-label={locale === "zh" ? "馆藏作品列表" : "Collection artworks"}
      >
        {cards}
      </div>
      <div className="collection-load-sentinel" ref={sentinelRef}>
        {loadState === "loading" ? (
          <p aria-live="polite">
            <span>{locale === "zh" ? "正在加载更多作品" : "Loading more artworks"}</span>
            <small>{locale === "zh" ? "LOADING MORE ARTWORKS" : "正在加载更多作品"}</small>
          </p>
        ) : null}
        {loadState === "error" ? (
          <button onClick={() => void loadNextPage()} type="button">
            {locale === "zh" ? "加载失败，点击重试" : "Could not load more — retry"}
          </button>
        ) : null}
        {!hasNextPage ? (
          <p>
            <span>{locale === "zh" ? "已浏览全部开放作品" : "All available works loaded"}</span>
            <small>{locale === "zh" ? "END OF COLLECTION" : "馆藏已全部加载"}</small>
          </p>
        ) : null}
      </div>
    </>
  );
}
