import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CollectionMarquee } from "@/src/components/collection-marquee";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/museums/art-institute-of-chicago/collection",
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const artworks = [
  {
    sourceId: "1",
    title: "Painted work",
    artist: "Artist One",
    date: "1901",
    medium: "Oil on canvas",
    origin: "Chicago",
    imageUrl: "https://upload.wikimedia.org/painted.jpg",
    ratio: 1.2,
  },
  {
    sourceId: "2",
    title: "Second work",
    artist: "Artist Two",
    date: "1902",
    medium: "Oil on canvas",
    origin: "Chicago",
    imageUrl: "https://upload.wikimedia.org/second.jpg",
    ratio: 0.8,
  },
  {
    sourceId: "3",
    title: "Record without image",
    artist: "Artist Three",
    date: "1903",
    medium: "Oil on canvas",
    origin: "Chicago",
    imageUrl: null,
    ratio: 0.78,
  },
];

describe("collection marquee performance and rights states", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
  });

  afterEach(() => cleanup());

  it("uses two loop sets and eagerly loads only the first two unique images", () => {
    const { container } = render(<CollectionMarquee artworks={artworks} locale="en" />);

    expect(container.querySelectorAll(".collection-marquee-set")).toHaveLength(2);
    expect(container.querySelectorAll("#card-artic-1")).toHaveLength(1);
    expect(container.querySelectorAll("#card-artic-1-clone")).toHaveLength(1);
    expect(container.querySelectorAll('img[loading="eager"]')).toHaveLength(2);
    expect(container.querySelectorAll('img[fetchpriority="high"]')).toHaveLength(2);
    expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(2);
  });

  it("renders metadata-only records without inventing an image", () => {
    render(<CollectionMarquee artworks={artworks} locale="en" />);

    expect(screen.getAllByText("Metadata-only record")).toHaveLength(2);
    expect(screen.queryByRole("img", { name: /Record without image/ })).not.toBeInTheDocument();
  });

  it("offers an explicit motion control", () => {
    render(<CollectionMarquee artworks={artworks} locale="en" />);

    const pause = screen.getByRole("button", { name: "Pause motion" });
    expect(pause).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(pause);
    expect(screen.getByRole("button", { name: "Resume motion" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
