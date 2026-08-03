import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getArticCollection } = vi.hoisted(() => ({
  getArticCollection: vi.fn(),
}));

vi.mock("@/src/lib/artic", () => ({
  getArticCollection,
}));

vi.mock("@/src/components/collection-infinite-grid", () => ({
  CollectionInfiniteGrid: () => <div>live collection</div>,
}));

vi.mock("@/src/components/collection-marquee", () => ({
  CollectionMarquee: () => <div>curated collection</div>,
}));

vi.mock("@/src/components/collection-state", () => ({
  CollectionStateRestorer: () => null,
}));

vi.mock("@/src/components/collection-wheel-return", () => ({
  CollectionWheelReturn: () => null,
}));

vi.mock("@/src/components/demo-styles", () => ({
  DemoStyles: () => null,
}));

import CollectionPage from "@/app/[locale]/museums/[museumSlug]/collection/page";

describe("collection page fallback", () => {
  beforeEach(() => {
    getArticCollection.mockReset();
  });

  it("keeps curated works available when the museum API cannot be reached", async () => {
    getArticCollection.mockRejectedValueOnce(new TypeError("fetch failed"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const page = await CollectionPage({
      params: Promise.resolve({
        locale: "zh",
        museumSlug: "art-institute-of-chicago",
      }),
      searchParams: Promise.resolve({}),
    });
    render(page);

    expect(screen.getByText("curated collection")).toBeInTheDocument();
    expect(
      screen.getByText("馆方实时数据暂时无法连接，顶部精选作品仍可浏览。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "重试实时馆藏 ↻" })).toHaveAttribute(
      "href",
      "/zh/museums/art-institute-of-chicago/collection",
    );
    expect(screen.queryByText("live collection")).not.toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
