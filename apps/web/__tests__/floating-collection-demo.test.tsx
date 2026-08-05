import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FloatingCollectionDemo } from "@/src/components/floating-collection-demo";
import type { CatalogPage } from "@/src/schemas/catalog";

const initialPage = {
  items: [
    {
      id: "artic:101",
      sourceId: "101",
      display: {
        title: "Quiet Interior",
        localizedTitles: { en: "Quiet Interior", "zh-Hans": "安静的室内" },
        artistDisplay: "Test Artist",
        dateDisplay: "1892",
        mediumDisplay: "Oil on canvas",
      },
      classification: {
        artworkTypeTitle: "Painting",
        departmentTitle: "Painting and Sculpture",
      },
      images: {
        preferred: {
          id: "image-101",
          width: 800,
          height: 1000,
          directUrl: "https://example.com/artwork.jpg",
        },
      },
      source: { label: "Art Institute of Chicago" },
      creditLine: "Museum purchase",
      description: { text: "A quiet interior rendered in muted color." },
    },
  ],
  pageInfo: { totalEligible: 1, hasNextPage: false, nextCursor: null },
} as unknown as CatalogPage;

describe("floating collection demo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        removeEventListener: vi.fn(),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows artwork details after the pointer settles without linking away", async () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;

    expect(container.querySelector('a[href*="/artworks/"]')).not.toBeInTheDocument();
    expect(artwork.style.getPropertyValue("--art-rotation")).toBe("");
    expect(artwork.style.height).not.toBe("");
    expect(artwork.style.opacity).toBe("1");
    expect(artwork.querySelector('[data-parallax-layer="middle"]')).toBeInTheDocument();
    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "true");

    fireEvent.pointerEnter(artwork);

    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "安静的室内" })).toBeVisible(),
    );
    expect(screen.getByText("Test Artist · 1892")).toBeVisible();
    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector('main > div[aria-hidden="true"] img')).toHaveAttribute(
      "src",
      "https://example.com/artwork.jpg",
    );

    const viewport = container.querySelector<HTMLElement>("[data-collection-viewport]")!;
    fireEvent.pointerMove(viewport);
    const detail = container.querySelector("aside")!;
    fireEvent.pointerEnter(detail);

    await new Promise((resolve) => setTimeout(resolve, 750));
    expect(detail).toHaveAttribute("aria-hidden", "false");
    expect(container.querySelector('a[href*="/artworks/"]')).toBeInTheDocument();

    fireEvent.pointerLeave(detail);

    await waitFor(() => expect(detail).toHaveAttribute("aria-hidden", "true"));
    expect(container.querySelector('a[href*="/artworks/"]')).not.toBeInTheDocument();
  });

  it("does not open the focus view during a quick pointer pass", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;

    fireEvent.pointerEnter(artwork);
    fireEvent.pointerMove(artwork);
    fireEvent.pointerLeave(artwork);

    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "true");
  });

  it("does not render the same artwork more than once across cached pages", () => {
    render(
      <FloatingCollectionDemo
        initialPages={[
          { page: initialPage, pageNumber: 1 },
          { page: initialPage, pageNumber: 2 },
        ]}
        locale="zh"
      />,
    );

    expect(screen.getAllByRole("button", { name: "安静的室内, Test Artist, 1892" })).toHaveLength(
      1,
    );
  });

  it("opens the selected artwork in the central focus area", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;

    fireEvent.click(artwork);

    expect(container.querySelector('main > div[aria-hidden="true"] img')).toHaveAttribute(
      "src",
      "https://example.com/artwork.jpg",
    );
  });

  it("keeps the same artwork set while switching to the image-only grid and back", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const main = container.querySelector("main")!;
    const viewport = main.querySelector<HTMLElement>("[data-collection-viewport]")!;
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;
    const artworkCount = screen.getAllByRole("button").length;

    fireEvent.wheel(viewport, { deltaY: 120 });

    expect(main).toHaveAttribute("data-view-mode", "grid");
    expect(screen.getAllByRole("button")).toHaveLength(artworkCount);
    expect(screen.getAllByRole("button", { name: "安静的室内, Test Artist, 1892" })[0]).toBe(
      artwork,
    );
    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "true");

    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      value: 600,
      writable: true,
    });
    fireEvent.wheel(viewport, { deltaY: -240 });

    expect(main).toHaveAttribute("data-view-mode", "grid");

    fireEvent.click(artwork);

    expect(main).toHaveAttribute("data-view-mode", "floating");
    expect(screen.getAllByRole("button")).toHaveLength(artworkCount);
  });

  it("returns from the grid top with an upward gesture", () => {
    const { container } = render(
      <FloatingCollectionDemo
        initialPages={[{ page: initialPage, pageNumber: 1 }]}
        initialViewMode="grid"
        locale="zh"
      />,
    );
    const main = container.querySelector("main")!;
    const viewport = main.querySelector<HTMLElement>("[data-collection-viewport]")!;

    expect(main).toHaveAttribute("data-view-mode", "grid");

    fireEvent.wheel(viewport, { deltaY: -120 });

    expect(main).toHaveAttribute("data-view-mode", "floating");
    expect(main).toHaveAttribute("data-route-exit-ready", "false");
  });

  it("switches back from deep in the grid and preserves the grid scroll position", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const main = container.querySelector("main")!;
    const viewport = main.querySelector<HTMLElement>("[data-collection-viewport]")!;

    fireEvent.click(screen.getByRole("button", { name: "网格视图" }));
    Object.defineProperty(viewport, "scrollTop", {
      configurable: true,
      value: 840,
      writable: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "悬浮视图" }));

    expect(main).toHaveAttribute("data-view-mode", "floating");
    expect(viewport.scrollTop).toBe(840);

    fireEvent.click(screen.getByRole("button", { name: "网格视图" }));
    expect(main).toHaveAttribute("data-view-mode", "grid");
    expect(viewport.scrollTop).toBe(840);
  });

  it("moves the artwork plane directly while dragging without replacing artworks", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const viewport = container.querySelector<HTMLElement>("[data-collection-viewport]")!;
    const plane = viewport.firstElementChild as HTMLDivElement;
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;
    const initialTransform = plane.style.transform;
    Object.defineProperty(viewport, "setPointerCapture", { value: vi.fn() });

    fireEvent.pointerDown(viewport, { button: 0, clientX: 600, clientY: 400, pointerId: 7 });
    fireEvent.pointerMove(viewport, { clientX: 240, clientY: 160, pointerId: 7 });

    expect(plane.style.transform).not.toBe(initialTransform);
    expect(screen.getAllByRole("button", { name: "安静的室内, Test Artist, 1892" })[0]).toBe(
      artwork,
    );

    fireEvent.pointerUp(viewport, { pointerId: 7 });
  });
});
