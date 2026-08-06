"use client";

/* eslint-disable @next/next/no-img-element */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { startArtworkEnterTransition } from "@/src/components/artwork-shared-transition";
import { saveCollectionReturnState } from "@/src/components/collection-state";
import styles from "@/src/components/floating-collection-demo.module.css";
import { artworkKey, type CatalogSource } from "@/src/lib/catalog-source";
import { iiifImageUrl } from "@/src/lib/iiif";
import { catalogPageSchema, type Artwork, type CatalogPage } from "@/src/schemas/catalog";
import { maxAccessibleSearchPage } from "@/src/schemas/routes";

const SECTOR_WIDTH = 1200;
const SECTOR_HEIGHT = 1100;
const PREFETCH_X = SECTOR_WIDTH;
const PREFETCH_Y = SECTOR_HEIGHT;
const PAGE_SIZE = 12;
const GRID_SIDE_PADDING = 32;
const GRID_ROW_HEIGHT = 132;
const GRID_TOP_PADDING = 44;
const GRID_PAGE_BATCH_SIZE = 4;
const ZOOM_WHEEL_THRESHOLD = 96;
const VIEW_TRANSITION_EXIT_LOCK_MS = 900;
const HOVER_EXIT_GRACE_MS = 700;
const DETAIL_EXIT_DELAY_MS = 160;

const POINTER_PARALLAX: Record<LayerName, { duration: number; x: number; y: number }> = {
  back: { duration: 1.15, x: 8, y: 6 },
  middle: { duration: 0.88, x: 18, y: 13 },
  front: { duration: 0.68, x: 30, y: 21 },
};

gsap.registerPlugin(useGSAP);

type LayerName = "back" | "middle" | "front";
type ViewMode = "floating" | "grid";

type InitialCatalogPage = {
  pageNumber: number;
  page: CatalogPage;
};

type DisplayArtwork = {
  artworkKey: string;
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

function toDisplayArtwork(
  artwork: Artwork,
  locale: "en" | "zh",
  source: CatalogSource,
): DisplayArtwork | null {
  const image = artwork.images.preferred;
  if (!image) return null;
  const title = localizedTitle(artwork, locale);
  const englishTitle = artwork.display.localizedTitles.en ?? artwork.display.title;
  return {
    artworkKey: artworkKey(source, artwork.sourceId),
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

function gridMetrics(width: number, artworkCount: number) {
  const columns = Math.max(3, Math.min(12, Math.floor((width - GRID_SIDE_PADDING * 2) / 116)));
  const cellWidth = (width - GRID_SIDE_PADDING * 2) / columns;
  const rows = Math.ceil(artworkCount / columns);
  return {
    cellWidth,
    columns,
    height: Math.max(1, GRID_TOP_PADDING * 2 + rows * GRID_ROW_HEIGHT),
  };
}

export function FloatingCollectionDemo({
  initialPages,
  initialViewMode = "floating",
  locale,
  source = "artic",
}: {
  initialPages: InitialCatalogPage[];
  initialViewMode?: ViewMode;
  locale: "en" | "zh";
  source?: CatalogSource;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const artworkPlaneRef = useRef<HTMLDivElement>(null);
  const focusArtworkRef = useRef<HTMLDivElement>(null);
  const artworkElementsRef = useRef(new Map<string, HTMLButtonElement>());
  const artworkMotionElementsRef = useRef(new Map<string, HTMLSpanElement>());
  const layoutInitializedRef = useRef(false);
  const previousViewModeRef = useRef<ViewMode>(initialViewMode);
  const transitioningRef = useRef(false);
  const zoomWheelRef = useRef(0);
  const hoverIntentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverExitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerArtworkRef = useRef<string | null>(null);
  const dragRef = useRef<{
    currentX: number;
    currentY: number;
    pointerId: number;
    setX: (value: number) => void;
    setY: (value: number) => void;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const transitionNavigationRef = useRef(false);
  const loadingPages = useRef(new Set<number>());
  const mountedRef = useRef(true);
  const sourceAvailableRef = useRef(true);
  const gridRequestInFlightRef = useRef(false);
  const lastInitialPage = initialPages.at(-1);
  const initialGridHasNextPage = lastInitialPage?.page.pageInfo.hasNextPage ?? false;
  const gridNextPageNumberRef = useRef(
    initialPages.reduce((highest, entry) => Math.max(highest, entry.pageNumber), 0) + 1,
  );
  const gridNextCursorRef = useRef(lastInitialPage?.page.pageInfo.nextCursor ?? null);
  const gridHasNextPageRef = useRef(initialGridHasNextPage);
  const [pageCache, setPageCache] = useState<Map<number, CatalogPage>>(
    () => new Map(initialPages.map(({ page, pageNumber }) => [pageNumber, page])),
  );
  const [gridLoadState, setGridLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [gridHasNextPage, setGridHasNextPage] = useState(initialGridHasNextPage);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragArtworkSnapshot, setDragArtworkSnapshot] = useState<PositionedArtwork[] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [routeExitReady, setRouteExitReady] = useState(initialViewMode === "floating");
  const [frozenArtworks, setFrozenArtworks] = useState<PositionedArtwork[] | null>(null);
  const [hoveredInstanceKey, setHoveredInstanceKey] = useState<string | null>(null);
  const [selectedInstanceKey, setSelectedInstanceKey] = useState<string | null>(null);
  const [displayedArtwork, setDisplayedArtwork] = useState<PositionedArtwork | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    document.body.classList.add("floating-collection-demo-active");
    return () => {
      if (hoverIntentTimerRef.current) clearTimeout(hoverIntentTimerRef.current);
      if (hoverExitTimerRef.current) clearTimeout(hoverExitTimerRef.current);
      mountedRef.current = false;
      document.body.classList.remove("floating-collection-demo-active");
    };
  }, []);

  useEffect(() => {
    if (viewMode !== "floating" || routeExitReady) return;
    const timer = window.setTimeout(() => setRouteExitReady(true), VIEW_TRANSITION_EXIT_LOCK_MS);
    return () => window.clearTimeout(timer);
  }, [routeExitReady, viewMode]);

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
        setHoveredInstanceKey(null);
        setSelectedInstanceKey(null);
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
    if (viewMode === "grid") return;
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
          if (!sourceAvailableRef.current || source === "europeana") return null;
          const cursor = ((pageNumber - 1) * PAGE_SIZE) % 4800;
          const request =
            source === "artic"
              ? `/api/catalog?page=${pageNumber}&fast=1`
              : `/api/catalog?source=${source}&cursor=${cursor}`;
          try {
            const response = await fetch(request, {
              headers: { Accept: "application/json" },
            });
            if (!response.ok) {
              sourceAvailableRef.current = false;
              return null;
            }
            const page = catalogPageSchema.parse(await response.json());
            return page.items.length ? { page, pageNumber } : null;
          } catch {
            sourceAvailableRef.current = false;
            return null;
          }
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
  }, [missingPageSignature, source, viewMode]);

  const artworks = useMemo(() => {
    const positioned: PositionedArtwork[] = [];
    const usedPageNumbers = new Set<number>();
    const usedArtworkIds = new Set<string>();
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
        if (fallback) {
          [pageNumber, page] = fallback;
        } else {
          continue;
        }
      }
      if (!page) continue;
      usedPageNumbers.add(pageNumber);
      page.items.slice(0, PAGE_SIZE).forEach((artwork, index) => {
        const baseSlot = SLOT_PATTERN[index];
        if (!baseSlot) return;
        const displayArtwork = toDisplayArtwork(artwork, locale, source);
        if (!displayArtwork || usedArtworkIds.has(displayArtwork.id)) return;
        usedArtworkIds.add(displayArtwork.id);
        const slot = slotForSector(baseSlot, sector);
        positioned.push({
          ...displayArtwork,
          height: slot.height,
          instanceKey: `artwork:${artwork.id}`,
          layer: slot.layer,
          width: slot.width,
          x: sector.x * SECTOR_WIDTH + slot.x,
          y: sector.y * SECTOR_HEIGHT + slot.y,
        });
      });
    }
    return positioned;
  }, [locale, pageCache, requiredSectors, source]);

  const gridArtworks = useMemo(() => {
    const positioned: PositionedArtwork[] = [];
    const usedArtworkIds = new Set<string>();
    const cachedPages = [...pageCache.entries()].sort(
      ([firstPageNumber], [secondPageNumber]) => firstPageNumber - secondPageNumber,
    );

    cachedPages.forEach(([, page], pageIndex) => {
      const sectorX = (pageIndex % 4) - 1.5;
      const sectorY = Math.floor(pageIndex / 4);
      page.items.slice(0, PAGE_SIZE).forEach((artwork, index) => {
        const slot = SLOT_PATTERN[index];
        if (!slot) return;
        const displayArtwork = toDisplayArtwork(artwork, locale, source);
        if (!displayArtwork || usedArtworkIds.has(displayArtwork.id)) return;
        usedArtworkIds.add(displayArtwork.id);
        positioned.push({
          ...displayArtwork,
          height: slot.height,
          instanceKey: `artwork:${artwork.id}`,
          layer: slot.layer,
          width: slot.width,
          x: sectorX * SECTOR_WIDTH + slot.x,
          y: sectorY * SECTOR_HEIGHT + slot.y,
        });
      });
    });

    return positioned;
  }, [locale, pageCache, source]);

  const currentArtworks = viewMode === "grid" && !frozenArtworks ? gridArtworks : artworks;
  const renderedArtworks =
    (isDragging ? dragArtworkSnapshot : null) ?? frozenArtworks ?? currentArtworks;
  const renderedArtworkSignature = renderedArtworks.map((artwork) => artwork.instanceKey).join(",");
  const grid = gridMetrics(viewport.width, renderedArtworks.length);
  const activeInstanceKey =
    viewMode === "floating" ? (hoveredInstanceKey ?? selectedInstanceKey) : null;
  const selectedArtwork =
    renderedArtworks.find((artwork) => artwork.instanceKey === selectedInstanceKey) ??
    (displayedArtwork?.instanceKey === selectedInstanceKey ? displayedArtwork : null);
  const detailArtwork =
    renderedArtworks.find((artwork) => artwork.instanceKey === activeInstanceKey) ??
    (activeInstanceKey === selectedInstanceKey ? selectedArtwork : null) ??
    (viewMode === "floating" ? displayedArtwork : null);

  useGSAP(
    () => {
      const plane = artworkPlaneRef.current;
      const viewportElement = viewportRef.current;
      if (!plane || !viewportElement || !renderedArtworks.length) return;

      const nodes = renderedArtworks.flatMap((artwork) => {
        const element = artworkElementsRef.current.get(artwork.instanceKey);
        return element ? [element] : [];
      });
      if (!nodes.length) return;

      const reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isModeTransition =
        layoutInitializedRef.current && previousViewModeRef.current !== viewMode;
      const duration = reducedMotion || !isModeTransition ? 0 : 0.82;
      const timeline = gsap.timeline({
        defaults: { duration, ease: "power3.inOut", overwrite: "auto" },
        onComplete: () => {
          transitioningRef.current = false;
          if (frozenArtworks) setFrozenArtworks(null);
        },
      });

      timeline.to(
        plane,
        {
          x: viewMode === "floating" ? offset.x : 0,
          y: viewMode === "floating" ? offset.y + viewportElement.scrollTop : 0,
        },
        0,
      );
      timeline.to(
        nodes,
        {
          filter: (index) => {
            if (viewMode === "grid") {
              return "saturate(0.94) drop-shadow(0 8px 12px rgba(36, 31, 25, 0.08))";
            }
            const layer = renderedArtworks[index]?.layer;
            if (layer === "back") {
              return "saturate(0.72) drop-shadow(0 10px 16px rgba(36, 31, 25, 0.04))";
            }
            if (layer === "middle") {
              return "saturate(0.88) drop-shadow(0 14px 18px rgba(36, 31, 25, 0.08))";
            }
            return "saturate(1) drop-shadow(0 18px 22px rgba(36, 31, 25, 0.1))";
          },
          opacity: 1,
          scale: (index) => {
            if (viewMode === "floating") return 1;
            const artwork = renderedArtworks[index];
            if (!artwork) return 0.5;
            return Math.min(0.56, (grid.cellWidth * 0.72) / artwork.width, 92 / artwork.height);
          },
          stagger: duration ? { amount: 0.08, from: "center" } : 0,
          transformOrigin: "center center",
          x: (index) => {
            const artwork = renderedArtworks[index];
            if (!artwork) return 0;
            if (viewMode === "floating") return viewport.width / 2 + artwork.x;
            const column = index % grid.columns;
            return GRID_SIDE_PADDING + column * grid.cellWidth + grid.cellWidth / 2;
          },
          xPercent: -50,
          y: (index) => {
            const artwork = renderedArtworks[index];
            if (!artwork) return 0;
            if (viewMode === "floating") return viewport.height / 2 + artwork.y;
            const row = Math.floor(index / grid.columns);
            return GRID_TOP_PADDING + row * GRID_ROW_HEIGHT + GRID_ROW_HEIGHT / 2;
          },
          yPercent: -50,
          zIndex: (index) => {
            if (viewMode === "grid") return 1;
            const layer = renderedArtworks[index]?.layer;
            return layer === "back" ? 1 : layer === "middle" ? 2 : 3;
          },
        },
        0,
      );

      layoutInitializedRef.current = true;
      previousViewModeRef.current = viewMode;
    },
    {
      dependencies: [
        grid.cellWidth,
        grid.columns,
        Boolean(frozenArtworks),
        renderedArtworkSignature,
        viewMode,
        viewport.height,
        viewport.width,
      ],
      scope: rootRef,
    },
  );

  useGSAP(
    () => {
      const plane = artworkPlaneRef.current;
      const viewportElement = viewportRef.current;
      if (!plane || viewMode !== "floating" || transitioningRef.current) return;
      gsap.set(plane, { x: offset.x, y: offset.y + (viewportElement?.scrollTop ?? 0) });
    },
    { dependencies: [offset.x, offset.y, viewMode], scope: rootRef },
  );

  useGSAP(
    () => {
      const viewportElement = viewportRef.current;
      if (!viewportElement) return;

      const layers = (["back", "middle", "front"] as LayerName[]).map((layer) => ({
        elements: renderedArtworks.flatMap((artwork) => {
          if (artwork.layer !== layer) return [];
          const element = artworkMotionElementsRef.current.get(artwork.instanceKey);
          return element ? [element] : [];
        }),
        layer,
      }));
      const allElements = layers.flatMap(({ elements }) => elements);
      if (!allElements.length) return;

      const reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const finePointer =
        typeof window.matchMedia !== "function" || window.matchMedia("(pointer: fine)").matches;

      if (viewMode !== "floating" || isDragging || reducedMotion || !finePointer) {
        gsap.to(allElements, {
          duration: reducedMotion ? 0 : 0.36,
          ease: "power2.out",
          overwrite: "auto",
          x: 0,
          y: 0,
        });
        return;
      }

      const controllers = layers.map(({ elements, layer }) => {
        const config = POINTER_PARALLAX[layer];
        return {
          config,
          xTo: gsap.quickTo(elements, "x", {
            duration: config.duration,
            ease: "power3.out",
          }),
          yTo: gsap.quickTo(elements, "y", {
            duration: config.duration,
            ease: "power3.out",
          }),
        };
      });

      const reset = () => {
        controllers.forEach(({ xTo, yTo }) => {
          xTo(0);
          yTo(0);
        });
      };
      const move = (event: PointerEvent) => {
        if (transitioningRef.current || dragRef.current || event.pointerType === "touch") {
          reset();
          return;
        }
        const bounds = viewportElement.getBoundingClientRect();
        const normalizedX = gsap.utils.clamp(
          -1,
          1,
          (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2),
        );
        const normalizedY = gsap.utils.clamp(
          -1,
          1,
          (event.clientY - bounds.top - bounds.height / 2) / (bounds.height / 2),
        );
        controllers.forEach(({ config, xTo, yTo }) => {
          xTo(-normalizedX * config.x);
          yTo(-normalizedY * config.y);
        });
      };

      viewportElement.addEventListener("pointerleave", reset);
      viewportElement.addEventListener("pointermove", move, { passive: true });
      return () => {
        viewportElement.removeEventListener("pointerleave", reset);
        viewportElement.removeEventListener("pointermove", move);
        gsap.killTweensOf(allElements);
      };
    },
    {
      dependencies: [isDragging, renderedArtworkSignature, viewMode],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  useGSAP(
    () => {
      const focusElement = focusArtworkRef.current;
      if (!focusElement) return;

      const reducedMotion =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!activeInstanceKey || !detailArtwork) {
        gsap.to(focusElement, {
          autoAlpha: 0,
          duration: reducedMotion ? 0 : 0.22,
          ease: "power1.out",
          overwrite: "auto",
          scale: 0.97,
        });
        return;
      }

      const focusImage = focusElement.querySelector("img");
      if (!focusImage) return;

      gsap.fromTo(
        focusElement,
        {
          autoAlpha: reducedMotion ? 1 : 0.2,
          scale: reducedMotion ? 1 : 0.92,
        },
        {
          autoAlpha: 1,
          duration: reducedMotion ? 0 : 0.46,
          ease: "power3.out",
          overwrite: true,
          scale: 1,
          transformOrigin: "center center",
        },
      );
    },
    {
      dependencies: [activeInstanceKey, detailArtwork?.instanceKey, displayedArtwork?.instanceKey],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  const enterGridView = () => {
    if (viewMode !== "floating" || !renderedArtworks.length) return;
    transitioningRef.current = true;
    zoomWheelRef.current = 0;
    setRouteExitReady(false);
    setFrozenArtworks(renderedArtworks.slice());
    setHoveredInstanceKey(null);
    setSelectedInstanceKey(null);
    setViewMode("grid");
  };

  const enterFloatingView = (anchor?: PositionedArtwork | null) => {
    if (viewMode !== "grid") return;
    transitioningRef.current = true;
    zoomWheelRef.current = 0;
    setRouteExitReady(false);
    if (!frozenArtworks) setFrozenArtworks(renderedArtworks.slice());
    if (anchor) {
      setOffset({ x: -anchor.x, y: -anchor.y });
      setDisplayedArtwork(anchor);
    }
    setHoveredInstanceKey(null);
    setSelectedInstanceKey(anchor?.instanceKey ?? null);
    setViewMode("floating");
  };

  const loadNextGridBatch = useCallback(async () => {
    if (!gridHasNextPageRef.current || gridRequestInFlightRef.current) return;
    gridRequestInFlightRef.current = true;
    setGridLoadState("loading");

    try {
      const loaded: InitialCatalogPage[] = [];
      if (source === "artic") {
        const firstPageNumber = gridNextPageNumberRef.current;
        const pageNumbers = Array.from(
          { length: GRID_PAGE_BATCH_SIZE },
          (_, index) => firstPageNumber + index,
        );
        const pages = await Promise.all(
          pageNumbers.map(async (pageNumber) => {
            const params = new URLSearchParams(window.location.search);
            params.delete("cursor");
            params.delete("source");
            params.set("page", String(pageNumber));
            if (source === "artic") params.set("fast", "1");
            const response = await fetch(`/api/catalog?${params}`, {
              headers: { Accept: "application/json" },
            });
            if (!response.ok) throw new Error(`catalog page failed with ${response.status}`);
            return { page: catalogPageSchema.parse(await response.json()), pageNumber };
          }),
        );
        const terminalIndex = pages.findIndex(({ page }) => !page.pageInfo.hasNextPage);
        loaded.push(...(terminalIndex >= 0 ? pages.slice(0, terminalIndex + 1) : pages));
      } else {
        let cursor = gridNextCursorRef.current;
        for (let index = 0; index < GRID_PAGE_BATCH_SIZE && cursor; index += 1) {
          const pageNumber = gridNextPageNumberRef.current + loaded.length;
          const params = new URLSearchParams(window.location.search);
          params.delete("page");
          params.set("fast", "1");
          params.set("source", source);
          params.set("cursor", cursor);
          const response = await fetch(`/api/catalog?${params}`, {
            headers: { Accept: "application/json" },
          });
          if (!response.ok) throw new Error(`catalog page failed with ${response.status}`);
          const page = catalogPageSchema.parse(await response.json());
          loaded.push({ page, pageNumber });
          cursor = page.pageInfo.nextCursor;
        }
      }

      if (!mountedRef.current || !loaded.length) return;
      setPageCache((current) => {
        const next = new Map(current);
        loaded.forEach(({ page, pageNumber }) => next.set(pageNumber, page));
        return next;
      });
      const lastLoadedPage = loaded.at(-1)!;
      gridNextPageNumberRef.current = lastLoadedPage.pageNumber + 1;
      gridNextCursorRef.current = lastLoadedPage.page.pageInfo.nextCursor;
      gridHasNextPageRef.current = lastLoadedPage.page.pageInfo.hasNextPage;
      setGridHasNextPage(gridHasNextPageRef.current);
      setGridLoadState("idle");
    } catch (error) {
      console.error(error);
      if (mountedRef.current) setGridLoadState("error");
    } finally {
      gridRequestInFlightRef.current = false;
    }
  }, [source]);

  useEffect(() => {
    if (viewMode !== "grid" || !gridHasNextPage) return;
    const frame = window.requestAnimationFrame(() => {
      const element = viewportRef.current;
      if (!element) return;
      const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= element.clientHeight * 2) void loadNextGridBatch();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [grid.height, gridHasNextPage, loadNextGridBatch, pageCache.size, viewMode]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (transitioningRef.current) {
      event.preventDefault();
      return;
    }

    if (viewMode === "floating") {
      if (event.deltaY <= 0) {
        zoomWheelRef.current = 0;
        return;
      }
      event.preventDefault();
      zoomWheelRef.current += Math.min(event.deltaY, ZOOM_WHEEL_THRESHOLD);
      if (zoomWheelRef.current >= ZOOM_WHEEL_THRESHOLD) enterGridView();
      return;
    }

    const viewportElement = event.currentTarget;
    if (event.deltaY >= 0 || viewportElement.scrollTop > 3) {
      zoomWheelRef.current = 0;
      return;
    }

    event.preventDefault();
    zoomWheelRef.current += Math.min(-event.deltaY, ZOOM_WHEEL_THRESHOLD);
    if (zoomWheelRef.current >= ZOOM_WHEEL_THRESHOLD) enterFloatingView();
  };

  const clearHoverIntent = () => {
    if (!hoverIntentTimerRef.current) return;
    clearTimeout(hoverIntentTimerRef.current);
    hoverIntentTimerRef.current = null;
  };

  const clearHoverExit = () => {
    if (!hoverExitTimerRef.current) return;
    clearTimeout(hoverExitTimerRef.current);
    hoverExitTimerRef.current = null;
  };

  const scheduleArtworkHover = (artwork: PositionedArtwork) => {
    if (viewMode !== "floating" || dragRef.current) return;
    pointerArtworkRef.current = artwork.instanceKey;
    clearHoverExit();
    if (hoveredInstanceKey === artwork.instanceKey) return;
    clearHoverIntent();
    hoverIntentTimerRef.current = setTimeout(() => {
      hoverIntentTimerRef.current = null;
      if (pointerArtworkRef.current !== artwork.instanceKey || dragRef.current) return;
      setDisplayedArtwork(artwork);
      setHoveredInstanceKey(artwork.instanceKey);
    }, 140);
  };

  const scheduleTransientArtworkClear = (delay = HOVER_EXIT_GRACE_MS) => {
    if (!hoveredInstanceKey && !hoverIntentTimerRef.current) return;
    pointerArtworkRef.current = null;
    clearHoverIntent();
    if (hoverExitTimerRef.current) return;
    hoverExitTimerRef.current = setTimeout(() => {
      hoverExitTimerRef.current = null;
      if (pointerArtworkRef.current || dragRef.current) return;
      setDisplayedArtwork(selectedArtwork);
      setHoveredInstanceKey(null);
    }, delay);
  };

  const leaveArtwork = (artwork: PositionedArtwork) => {
    if (pointerArtworkRef.current !== artwork.instanceKey) return;
    clearHoverExit();
    scheduleTransientArtworkClear();
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (viewMode !== "floating" || transitioningRef.current || event.button !== 0) return;
    const plane = artworkPlaneRef.current;
    if (!plane) return;
    pointerArtworkRef.current = null;
    clearHoverIntent();
    clearHoverExit();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragArtworkSnapshot(renderedArtworks.slice());
    dragRef.current = {
      currentX: offset.x,
      currentY: offset.y,
      pointerId: event.pointerId,
      setX: gsap.quickSetter(plane, "x", "px") as (value: number) => void,
      setY: gsap.quickSetter(plane, "y", "px") as (value: number) => void,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      moved: false,
    };
    setIsDragging(true);
    setHoveredInstanceKey(null);
    setSelectedInstanceKey(null);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    drag.currentX = drag.originX + deltaX;
    drag.currentY = drag.originY + deltaY;
    drag.setX(drag.currentX);
    drag.setY(drag.currentY + (viewportRef.current?.scrollTop ?? 0));
  };

  const moveAcrossViewport = (event: React.PointerEvent<HTMLDivElement>) => {
    moveDrag(event);
    if (viewMode !== "floating" || dragRef.current) return;
    const target = event.target;
    if (target instanceof Element && target.closest("[data-floating-artwork]")) return;
    scheduleTransientArtworkClear();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    if (drag.moved) setOffset({ x: drag.currentX, y: drag.currentY });
    setIsDragging(false);
    setDragArtworkSnapshot(null);
  };

  const rootLabel =
    locale === "zh"
      ? viewMode === "grid"
        ? "仅含画作的纵向馆藏网格"
        : "可拖动的多层艺术作品空间"
      : viewMode === "grid"
        ? "Vertical artwork-only collection grid"
        : "Draggable layered artwork space";

  return (
    <main
      aria-label={rootLabel}
      className={`${styles.root}${viewMode === "grid" ? ` ${styles.gridMode}` : ""}`}
      data-floating-collection-root=""
      data-route-exit-ready={routeExitReady}
      data-view-mode={viewMode}
      ref={rootRef}
    >
      <Link
        aria-label={locale === "zh" ? "返回 Canvium 首页" : "Back to Canvium home"}
        className={styles.wordmark}
        href={`/${locale}`}
      >
        Canvium
      </Link>

      <div
        aria-label={locale === "zh" ? "馆藏视图" : "Collection view"}
        className={styles.viewSwitcher}
        role="group"
      >
        <button
          aria-label={locale === "zh" ? "悬浮视图" : "Floating view"}
          aria-pressed={viewMode === "floating"}
          className={viewMode === "floating" ? styles.viewSwitcherActive : undefined}
          onClick={() => enterFloatingView()}
          type="button"
        >
          <span aria-hidden="true" className={styles.viewSwitcherIcon}>
            ◉
          </span>
          <span>{locale === "zh" ? "悬浮视图" : "Floating"}</span>
        </button>
        <button
          aria-label={locale === "zh" ? "网格视图" : "Grid view"}
          aria-pressed={viewMode === "grid"}
          className={viewMode === "grid" ? styles.viewSwitcherActive : undefined}
          onClick={enterGridView}
          type="button"
        >
          <span aria-hidden="true" className={styles.viewSwitcherIcon}>
            ▦
          </span>
          <span>{locale === "zh" ? "网格视图" : "Grid"}</span>
        </button>
      </div>

      <div
        className={`${styles.viewport}${isDragging ? ` ${styles.dragging}` : ""}`}
        data-collection-viewport=""
        onScroll={(event) => {
          if (viewMode !== "grid") return;
          zoomWheelRef.current = 0;
          const element = event.currentTarget;
          const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
          if (remaining <= element.clientHeight * 2) void loadNextGridBatch();
        }}
        onWheel={handleWheel}
        onPointerCancel={endDrag}
        onPointerDown={beginDrag}
        onPointerLeave={() => scheduleTransientArtworkClear()}
        onPointerMove={moveAcrossViewport}
        onPointerUp={endDrag}
        ref={viewportRef}
      >
        <div
          className={styles.artworkPlane}
          ref={artworkPlaneRef}
          style={{ height: viewMode === "grid" ? `${grid.height}px` : "100%" }}
        >
          {renderedArtworks.map((artwork, index) => (
            <button
              aria-label={`${artwork.title}, ${artwork.artist}, ${artwork.date}`}
              className={`${styles.artwork} ${styles[artwork.layer]}${
                activeInstanceKey === artwork.instanceKey ? ` ${styles.artworkFocused}` : ""
              }`}
              data-floating-artwork=""
              id={`floating-card-${artwork.instanceKey}`}
              key={artwork.instanceKey}
              onBlur={() => {
                if (viewMode !== "floating") return;
                if (selectedArtwork) setDisplayedArtwork(selectedArtwork);
                setHoveredInstanceKey((current) =>
                  current === artwork.instanceKey ? null : current,
                );
              }}
              onClick={(event) => {
                if (viewMode === "grid") {
                  enterFloatingView(artwork);
                  return;
                }
                if (suppressClickRef.current) {
                  event.preventDefault();
                  suppressClickRef.current = false;
                  return;
                }
                setDisplayedArtwork(artwork);
                setSelectedInstanceKey((current) =>
                  current === artwork.instanceKey ? null : artwork.instanceKey,
                );
              }}
              onFocus={() => {
                if (viewMode !== "floating") return;
                if (
                  artworkElementsRef.current.get(artwork.instanceKey)?.dataset.collectionReturnFocus
                ) {
                  delete artworkElementsRef.current.get(artwork.instanceKey)?.dataset
                    .collectionReturnFocus;
                  return;
                }
                setDisplayedArtwork(artwork);
                setHoveredInstanceKey(artwork.instanceKey);
              }}
              onPointerEnter={() => scheduleArtworkHover(artwork)}
              onPointerMove={() => scheduleArtworkHover(artwork)}
              onPointerLeave={() => {
                if (viewMode === "floating") leaveArtwork(artwork);
              }}
              ref={(element) => {
                if (element) artworkElementsRef.current.set(artwork.instanceKey, element);
                else artworkElementsRef.current.delete(artwork.instanceKey);
              }}
              style={{ height: `${artwork.height}px`, width: `${artwork.width}px` }}
              type="button"
            >
              <span
                className={styles.artworkMotion}
                data-parallax-layer={artwork.layer}
                ref={(element) => {
                  if (element) {
                    artworkMotionElementsRef.current.set(artwork.instanceKey, element);
                  } else {
                    artworkMotionElementsRef.current.delete(artwork.instanceKey);
                  }
                }}
              >
                <span className={styles.artworkFrame}>
                  <img
                    alt=""
                    decoding="async"
                    draggable={false}
                    loading={artwork.layer === "front" && index < 8 ? "eager" : "lazy"}
                    src={artwork.imageUrl}
                  />
                </span>
              </span>
            </button>
          ))}
          {viewMode === "grid" ? (
            <p aria-live="polite" className={styles.gridLoadStatus}>
              {gridLoadState === "loading"
                ? locale === "zh"
                  ? "正在加载更多作品"
                  : "Loading more artworks"
                : gridLoadState === "error"
                  ? locale === "zh"
                    ? "继续滚动以重试加载"
                    : "Keep scrolling to retry"
                  : !gridHasNextPage
                    ? locale === "zh"
                      ? "已浏览全部可用作品"
                      : "All available artworks loaded"
                    : ""}
            </p>
          ) : null}
        </div>
      </div>

      <div aria-hidden="true" className={styles.focusArtwork} ref={focusArtworkRef}>
        {displayedArtwork ? <img alt="" src={displayedArtwork.imageUrl} /> : null}
      </div>

      <aside
        aria-hidden={!detailArtwork}
        aria-live="polite"
        className={`${styles.detail}${detailArtwork ? ` ${styles.detailVisible}` : ""}`}
        onPointerEnter={() => {
          if (!detailArtwork) return;
          pointerArtworkRef.current = detailArtwork.instanceKey;
          clearHoverExit();
        }}
        onPointerLeave={() => {
          if (!detailArtwork) return;
          pointerArtworkRef.current = null;
          clearHoverExit();
          scheduleTransientArtworkClear(DETAIL_EXIT_DELAY_MS);
        }}
      >
        <p className={styles.detailKicker}>
          {[displayedArtwork?.department, displayedArtwork?.sourceLabel]
            .filter(Boolean)
            .join(" / ")}
        </p>
        <h1>{displayedArtwork?.title}</h1>
        {displayedArtwork?.secondaryTitle ? <h2>{displayedArtwork.secondaryTitle}</h2> : null}
        <p className={styles.detailMeta}>
          {[displayedArtwork?.artist, displayedArtwork?.date].filter(Boolean).join(" · ")}
        </p>
        <p className={styles.detailFacts}>
          {[displayedArtwork?.medium, displayedArtwork?.creditLine].filter(Boolean).join(" · ")}
        </p>
        <p className={styles.detailBody}>{displayedArtwork?.description}</p>
        {detailArtwork ? (
          <Link
            aria-label={
              locale === "zh"
                ? `进入《${detailArtwork.title}》作品对话`
                : `Enter the conversation about ${detailArtwork.title}`
            }
            className={styles.chatEntry}
            href={`/${locale}/artworks/${detailArtwork.artworkKey}`}
            onClick={(event) => {
              if (transitionNavigationRef.current) {
                transitionNavigationRef.current = false;
                return;
              }
              const sourceCard = artworkElementsRef.current.get(detailArtwork.instanceKey);
              saveCollectionReturnState(detailArtwork.artworkKey, sourceCard?.id);
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              ) {
                return;
              }
              const transitionSource = focusArtworkRef.current || sourceCard;
              if (!transitionSource) return;
              event.preventDefault();
              const link = event.currentTarget;
              startArtworkEnterTransition(transitionSource, () => {
                transitionNavigationRef.current = true;
                link.click();
              });
            }}
          >
            <span>{locale === "zh" ? "进入作品对话" : "Enter conversation"}</span>
            <small>{locale === "zh" ? "ENTER CONVERSATION" : "与作品对话"}</small>
            <i aria-hidden="true">↗</i>
          </Link>
        ) : null}
      </aside>
    </main>
  );
}
