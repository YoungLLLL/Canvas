import { act, cleanup, render, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionInfiniteGrid } from "@/src/components/collection-infinite-grid";
import type { CatalogPage } from "@/src/schemas/catalog";

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(),
}));

vi.mock("gsap", () => ({
  default: { registerPlugin: vi.fn() },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("@/src/components/collection-state", () => ({
  ArtworkCardLink: (props: { children: ReactNode; artworkKey: string; [key: string]: unknown }) => {
    const { children, artworkKey, ...linkProps } = props;
    void artworkKey;
    return <a {...linkProps}>{children}</a>;
  },
}));

vi.mock("@/src/schemas/catalog", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/src/schemas/catalog")>();
  return {
    ...original,
    catalogPageSchema: { parse: (value: unknown) => value },
  };
});

const artwork = (sourceId: string) => ({
  sourceId,
  display: {
    title: `Artwork ${sourceId}`,
    localizedTitles: { en: `Artwork ${sourceId}` },
    altTitles: [],
    artistDisplay: "Test artist",
  },
  classification: { artworkTypeTitle: "Painting" },
  images: { preferred: null, alternates: [] },
});

const page = (sourceId: string, hasNextPage: boolean) =>
  ({
    items: [artwork(sourceId)],
    pageInfo: {
      totalEligible: 3,
      hasNextPage,
      nextCursor: hasNextPage ? String(Number(sourceId) + 1) : null,
    },
    query: { q: "", filters: {}, sort: "recent" },
    snapshotVersion: `test-page-${sourceId}`,
    dataStatus: { state: "fresh", fetchedAt: "2026-07-29T00:00:00Z" },
  }) as unknown as CatalogPage;

describe("collection infinite loading", () => {
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
        takeRecords() {
          return [];
        }
        root = null;
        rootMargin = "";
        thresholds = [];
      },
    );
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      top: 500,
      bottom: 680,
      left: 0,
      right: 100,
      width: 100,
      height: 180,
      x: 0,
      y: 500,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps loading while the sentinel remains inside the preload zone", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(page("2", true))))
      .mockResolvedValueOnce(new Response(JSON.stringify(page("3", false))));
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <CollectionInfiniteGrid initialPage={page("1", true)} locale="en" />,
    );

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    await waitFor(() =>
      expect(container.querySelectorAll(".collection-result-card")).toHaveLength(3),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/catalog?page=3",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });
});
