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

describe("collection page initial load", () => {
  beforeEach(() => getCatalogCollection.mockReset());

  it("only blocks navigation on the first two catalog pages", async () => {
    getCatalogCollection.mockResolvedValue(catalogPage);

    const page = await CollectionPage({
      params: Promise.resolve({
        locale: "zh",
        museumSlug: "art-institute-of-chicago",
      }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByText("loaded pages: 2")).toBeInTheDocument();
    expect(getCatalogCollection).toHaveBeenCalledTimes(2);
    expect(getCatalogCollection.mock.calls.map(([, query]) => query.page)).toEqual(
      expect.arrayContaining([1, 2]),
    );
  });

  it("keeps the successful page when the other initial request fails", async () => {
    getCatalogCollection
      .mockResolvedValueOnce(catalogPage)
      .mockRejectedValueOnce(new TypeError("fetch failed"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const page = await CollectionPage({
      params: Promise.resolve({
        locale: "zh",
        museumSlug: "art-institute-of-chicago",
      }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByText("loaded pages: 1")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
