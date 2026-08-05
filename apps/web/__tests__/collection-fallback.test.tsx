import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CatalogPage } from "@/src/schemas/catalog";

const { getCatalogCollection } = vi.hoisted(() => ({
  getCatalogCollection: vi.fn(),
}));

vi.mock("@/src/lib/catalog", () => ({ getCatalogCollection }));

vi.mock("@/src/components/collection-route-ready", () => ({
  CollectionRouteReady: () => null,
}));

vi.mock("@/src/components/floating-collection-demo", () => ({
  FloatingCollectionDemo: ({ initialPages }: { initialPages: unknown[] }) => (
    <div>loaded pages: {initialPages.length}</div>
  ),
}));

import CollectionPage from "@/app/[locale]/museums/[museumSlug]/collection/page";

const catalogPage = {
  items: [],
  pageInfo: { totalEligible: 100, hasNextPage: true, nextCursor: null },
} as unknown as CatalogPage;

describe("collection page fallback", () => {
  beforeEach(() => getCatalogCollection.mockReset());

  it("keeps successful preload pages when one museum request fails", async () => {
    let requestNumber = 0;
    getCatalogCollection.mockImplementation(() =>
      ++requestNumber === 2
        ? Promise.reject(new TypeError("fetch failed"))
        : Promise.resolve(catalogPage),
    );
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const page = await CollectionPage({
      params: Promise.resolve({
        locale: "zh",
        museumSlug: "art-institute-of-chicago",
      }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByText("loaded pages: 13")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
