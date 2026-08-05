"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "@/src/components/floating-collection-demo.module.css";
import { iiifImageUrl } from "@/src/lib/iiif";
import { catalogPageSchema, type Artwork, type CatalogPage } from "@/src/schemas/catalog";
import { maxAccessibleSearchPage } from "@/src/schemas/routes";

const SECTOR_WIDTH = 1200;
const SECTOR_HEIGHT = 1100;
const PREFETCH_X = SECTOR_WIDTH;
const PREFETCH_Y = SECTOR_HEIGHT;
const PAGE_SIZE = 12;

type LayerName = "back" | "middle" | "front";

type InitialCatalogPage = {
  pageNumber: number;
  page: CatalogPage;
};

type DisplayArtwork = {
  id: string;
  title: string;
  secondaryTitle: string | null;
  artist: string;
  date: string;
  medium: string;
  department: string;
  creditLine: string;
  description: string;
  sourceLabel: string;
  imageUrl: string;
};

type Sector = {
  key: string;
  pageNumber: number;
  x: number;
  y: number;
};

type PositionedArtwork = DisplayArtwork & {
  height: number;
  instanceKey: string;
  layer: LayerName;
  width: number;
  x: number;
  y: number;
};

type Slot = {
  height: number;
  layer: LayerName;
  width: number;
  x: number;
  y: number;
};

const layerSpeed: Record<LayerName, number> = {
  back: 1,
  middle: 1,
  front: 1,
};

// A designed twelve-beat composition: four columns, three staggered rows.
// Every slot owns a non-overlapping safety box, so portrait and landscape images
// keep their native proportions without ever colliding with a neighboring work.
const SLOT_PATTERN: Slot[] = [
  { x: -470, y: -365, width: 168, height: 202, layer: "middle" },
  { x: -165, y: -410, width: 118, height: 172, layer: "back" },
  { x: 145, y: -350, width: 196, height: 214, layer: "front" },
  { x: 465, y: -395, width: 142, height: 180, layer: "middle" },
  { x: -500, y: 5, width: 128, height: 184, layer: "back" },
  { x: -200, y: 42, width: 204, height: 218, layer: "front" },
  { x: 120, y: -20, width: 148, height: 190, layer: "middle" },
  { x: 455, y: 35, width: 194, height: 214, layer: "front" },
  { x: -455, y: 390, width: 188, height: 210, layer: "front" },
  { x: -135, y: 340, width: 136, height: 184, layer: "middle" },
  { x: 180, y: 410, width: 202, height: 216, layer: "front" },
  { x: 490, y: 350, width: 116, height: 172, layer: "back" },
];

function localizedTitle(artwork: Artwork, locale: "en" | "zh") {
  if (locale === "en") return artwork.display.localizedTitles.en ?? artwork.display.title;
  return (
    artwork.display.localizedTitles["zh-Hans"] ??
    artwork.display.localizedTitles.zh ??
    artwork.display.title
  );
}

function toDisplayArtwork(artwork: Artwork, locale: "en" | "zh"): DisplayArtwork | null {
  const image = artwork.images.preferred;
  if (!image) return null;
  const title = localizedTitle(artwork, locale);
  const englishTitle = artwork.display.localizedTitles.en ?? artwork.display.title;
  return {
    id: artwork.id,
    title,
    secondaryTitle: title === englishTitle ? null : englishTitle,
    artist: artwork.display.artistDisplay,
    date: artwork.display.dateDisplay ?? (locale === "zh" ? "年代不详" : "Date unknown"),
    medium:
      artwork.display.mediumDisplay ??
      artwork.classification.artworkTypeTitle ??
      (locale === "zh" ? "媒介不详" : "Medium unknown"),
    department: artwork.classification.departmentTitle ?? "",
    creditLine: artwork.creditLine ?? "",
    description: artwork.description?.text ?? "",
    sourceLabel: artwork.source.label,
    imageUrl: iiifImageUrl(image, 600),
  };
}

function zigZag(value: number) {
  return value >= 0 ? value * 2 : -value * 2 - 1;
}

function pageForSector(x: number, y: number) {
  // Walk every accessible API page before repeating. Nearby sectors always map
  // to different pages, while the canvas itself remains free to move forever.
  const rawPage = zigZag(x) + zigZag(y) * 37;
  return (
    (((rawPage % maxAccessibleSearchPage) + maxAccessibleSearchPage) % maxAccessibleSearchPage) + 1
  );
}

function sectorsForLayer(
  offset: { x: number; y: number },
  viewport: { width: number; height: number },
  speed: number,
) {
  const centerX = -offset.x * speed;
  const centerY = -offset.y * speed;
  const minimumX = Math.ceil(
    (centerX - viewport.width / 2 - SECTOR_WIDTH / 2 - PREFETCH_X) / SECTOR_WIDTH,
  );
  const maximumX = Math.floor(
    (centerX + viewport.width / 2 + SECTOR_WIDTH / 2 + PREFETCH_X) / SECTOR_WIDTH,
  );
  const minimumY = Math.ceil(
    (centerY - viewport.height / 2 - SECTOR_HEIGHT / 2 - PREFETCH_Y) / SECTOR_HEIGHT,
  );
  const maximumY = Math.floor(
    (centerY + viewport.height / 2 + SECTOR_HEIGHT / 2 + PREFETCH_Y) / SECTOR_HEIGHT,
  );
  const sectors: Sector[] = [];
  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      sectors.push({ key: `${x}:${y}`, pageNumber: pageForSector(x, y), x, y });
    }
  }
  return sectors;
}

function slotForSector(slot: Slot, sector: Sector) {
  const mirrorX = Math.abs(sector.x + sector.y) % 2 === 1;
  const mirrorY = Math.abs(sector.x - sector.y) % 3 === 2;
  return {
    ...slot,
    x: mirrorX ? -slot.x : slot.x,
    y: mirrorY ? -slot.y : slot.y,
  };
}

export function FloatingCollectionDemo({
  initialPages,
  locale,
}: {
  initialPages: InitialCatalogPage[];
  locale: "en" | "zh";
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const loadingPages = useRef(new Set<number>());
  const mountedRef = useRef(true);
  const articAvailableRef = useRef(true);
  const [pageCache, setPageCache] = useState<Map<number, CatalogPage>>(
    () => new Map(initialPages.map(({ page, pageNumber }) => [pageNumber, page])),
  );
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("floating-collection-demo-active");
    return () => {
      mountedRef.current = false;
      document.body.classList.remove("floating-collection-demo-active");
    };
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const update = () => {
      const bounds = element.getBoundingClientRect();
      setViewport({ width: bounds.width, height: bounds.height });
    };
    update();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const clearSelection = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHoveredId(null);
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", clearSelection);
    return () => window.removeEventListener("keydown", clearSelection);
  }, []);

  const requiredSectors = useMemo(() => {
    const unique = new Map<string, Sector>();
    for (const layer of ["back", "middle", "front"] as LayerName[]) {
      for (const sector of sectorsForLayer(offset, viewport, layerSpeed[layer])) {
        unique.set(sector.key, sector);
      }
    }
    const centerSectorX = -offset.x / SECTOR_WIDTH;
    const centerSectorY = -offset.y / SECTOR_HEIGHT;
    return [...unique.values()].sort((first, second) => {
      const firstDistance = (first.x - centerSectorX) ** 2 + (first.y - centerSectorY) ** 2;
      const secondDistance = (second.x - centerSectorX) ** 2 + (second.y - centerSectorY) ** 2;
      return firstDistance - secondDistance || first.pageNumber - second.pageNumber;
    });
  }, [offset, viewport]);

  const missingPageNumbers = [
    ...new Set(
      requiredSectors
        .map((sector) => sector.pageNumber)
        .filter((pageNumber) => !pageCache.has(pageNumber)),
    ),
  ];
  const missingPageSignature = missingPageNumbers.join(",");

  useEffect(() => {
    const batch = missingPageSignature
      .split(",")
      .filter(Boolean)
      .map(Number)
      .filter((pageNumber) => !loadingPages.current.has(pageNumber))
      .slice(0, 4);
    if (!batch.length) return;
    batch.forEach((pageNumber) => loadingPages.current.add(pageNumber));

    const load = async () => {
      const results = await Promise.all(
        batch.map(async (pageNumber) => {
          const clevelandCursor = ((pageNumber - 1) * PAGE_SIZE) % 4800;
          const requests = [
            ...(articAvailableRef.current ? [`/api/catalog?page=${pageNumber}`] : []),
            `/api/catalog?source=cleveland&cursor=${clevelandCursor}`,
          ];
          for (const request of requests) {
            try {
              const response = await fetch(request, {
                headers: { Accept: "application/json" },
              });
              if (!response.ok) {
                if (request.startsWith("/api/catalog?page=")) articAvailableRef.current = false;
                continue;
              }
              const page = catalogPageSchema.parse(await response.json());
              if (page.items.length) return { page, pageNumber };
            } catch {
              if (request.startsWith("/api/catalog?page=")) articAvailableRef.current = false;
            }
          }
          return null;
        }),
      );
      batch.forEach((pageNumber) => loadingPages.current.delete(pageNumber));
      if (!mountedRef.current) return;
      const loaded = results.filter((result) => result !== null);
      if (!loaded.length) return;
      setPageCache((current) => {
        const next = new Map(current);
        loaded.forEach(({ page, pageNumber }) => next.set(pageNumber, page));
        return next;
      });
    };

    void load();
  }, [missingPageSignature]);

  const artworks = useMemo(() => {
    const positioned: PositionedArtwork[] = [];
    const usedPageNumbers = new Set<number>();
    const cachedPages = [...pageCache.entries()].sort(
      ([firstPageNumber], [secondPageNumber]) => firstPageNumber - secondPageNumber,
    );

    for (const sector of requiredSectors) {
      let pageNumber = sector.pageNumber;
      let page = pageCache.get(pageNumber);
      if (!page || usedPageNumbers.has(pageNumber)) {
        const fallbackStart = sector.pageNumber % Math.max(cachedPages.length, 1);
        const fallback = [
          ...cachedPages.slice(fallbackStart),
          ...cachedPages.slice(0, fallbackStart),
        ].find(([candidatePageNumber]) => !usedPageNumbers.has(candidatePageNumber));
        const repeatedFallback = cachedPages[fallbackStart];
        if (fallback) {
          [pageNumber, page] = fallback;
        } else if (repeatedFallback) {
          [pageNumber, page] = repeatedFallback;
        }
      }
      if (!page) continue;
      usedPageNumbers.add(pageNumber);
      page.items.slice(0, PAGE_SIZE).forEach((artwork, index) => {
        const baseSlot = SLOT_PATTERN[index];
        if (!baseSlot) return;
        const displayArtwork = toDisplayArtwork(artwork, locale);
        if (!displayArtwork) return;
        const slot = slotForSector(baseSlot, sector);
        positioned.push({
          ...displayArtwork,
          height: slot.height,
          instanceKey: `${sector.key}:${artwork.id}`,
          layer: slot.layer,
          width: slot.width,
          x: sector.x * SECTOR_WIDTH + slot.x,
          y: sector.y * SECTOR_HEIGHT + slot.y,
        });
      });
    }
    return positioned;
  }, [locale, pageCache, requiredSectors]);

  const detailId = hoveredId ?? selectedId;
  const detailArtwork = artworks.find((artwork) => artwork.id === detailId) ?? null;
  const selectedArtwork = artworks.find((artwork) => artwork.id === selectedId) ?? null;

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
    setIsDragging(true);
    setHoveredId(null);
    setSelectedId(null);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.moved = true;
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
    <main
      aria-label={locale === "zh" ? "可拖动的多层艺术作品空间" : "Draggable layered artwork space"}
      className={`${styles.root}${selectedArtwork ? ` ${styles.hasSelection}` : ""}`}
    >
      <div
        className={`${styles.viewport}${isDragging ? ` ${styles.dragging}` : ""}`}
        onPointerCancel={endDrag}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        ref={viewportRef}
      >
        {(["back", "middle", "front"] as LayerName[]).map((layer) => (
          <div
            className={`${styles.layer} ${styles[layer]}`}
            key={layer}
            style={{
              transform: `translate3d(${offset.x * layerSpeed[layer]}px, ${offset.y * layerSpeed[layer]}px, 0)`,
            }}
          >
            {artworks
              .filter((artwork) => artwork.layer === layer)
              .map((artwork, index) => (
                <button
                  aria-label={`${artwork.title}, ${artwork.artist}, ${artwork.date}`}
                  className={styles.artwork}
                  key={artwork.instanceKey}
                  onBlur={() => {
                    setHoveredId((current) => (current === artwork.id ? null : current));
                  }}
                  onClick={(event) => {
                    if (suppressClickRef.current) {
                      event.preventDefault();
                      suppressClickRef.current = false;
                      return;
                    }
                    setSelectedId((current) => (current === artwork.id ? null : artwork.id));
                  }}
                  onFocus={() => setHoveredId(artwork.id)}
                  onPointerEnter={() => {
                    if (!dragRef.current) setHoveredId(artwork.id);
                  }}
                  onPointerLeave={() => {
                    if (!dragRef.current) {
                      setHoveredId((current) => (current === artwork.id ? null : current));
                    }
                  }}
                  style={
                    {
                      "--art-height": `${artwork.height}px`,
                      "--art-width": `${artwork.width}px`,
                      "--art-x": `${artwork.x}px`,
                      "--art-y": `${artwork.y}px`,
                    } as React.CSSProperties
                  }
                  type="button"
                >
                  <img
                    alt=""
                    decoding="async"
                    draggable={false}
                    loading={layer === "front" && index < 8 ? "eager" : "lazy"}
                    src={artwork.imageUrl}
                  />
                </button>
              ))}
          </div>
        ))}
      </div>

      <div aria-hidden="true" className={styles.focusArtwork}>
        {selectedArtwork ? <img alt="" src={selectedArtwork.imageUrl} /> : null}
      </div>

      <aside
        aria-hidden={!detailArtwork}
        aria-live="polite"
        className={`${styles.detail}${detailArtwork ? ` ${styles.detailVisible}` : ""}`}
      >
        <p className={styles.detailKicker}>
          {[detailArtwork?.department, detailArtwork?.sourceLabel].filter(Boolean).join(" / ")}
        </p>
        <h1>{detailArtwork?.title}</h1>
        {detailArtwork?.secondaryTitle ? <h2>{detailArtwork.secondaryTitle}</h2> : null}
        <p className={styles.detailMeta}>
          {[detailArtwork?.artist, detailArtwork?.date].filter(Boolean).join(" · ")}
        </p>
        <p className={styles.detailBody}>
          {detailArtwork?.description || detailArtwork?.medium || detailArtwork?.creditLine}
        </p>
      </aside>
    </main>
  );
}
