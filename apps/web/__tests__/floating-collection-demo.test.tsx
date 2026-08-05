import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows artwork details at the bottom on hover without linking away", () => {
    const { container } = render(
      <FloatingCollectionDemo initialPages={[{ page: initialPage, pageNumber: 1 }]} locale="zh" />,
    );
    const artwork = screen.getAllByRole("button", {
      name: "安静的室内, Test Artist, 1892",
    })[0]!;

    expect(container.querySelector("a")).not.toBeInTheDocument();
    expect(artwork.style.getPropertyValue("--art-rotation")).toBe("");
    expect(artwork.style.getPropertyValue("--art-height")).not.toBe("");
    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "true");

    fireEvent.pointerEnter(artwork);

    expect(screen.getByRole("heading", { level: 1, name: "安静的室内" })).toBeVisible();
    expect(screen.getByText("Test Artist · 1892")).toBeVisible();
    expect(container.querySelector("aside")).toHaveAttribute("aria-hidden", "false");
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
});
