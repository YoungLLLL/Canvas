import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArticImage } from "@/src/components/artic-image";

const asset = {
  id: "image-1",
  width: 1200,
  height: 800,
  lqip: "data:image/gif;base64,R0lGODlhAQABAAAAACw=",
  iiifBaseUrl: "https://www.artic.edu/iiif/2/image-1",
  zoomable: true,
  maxZoomWindowSize: null,
  health: "unknown" as const,
};

describe("responsive ARTIC image", () => {
  it("offers documented IIIF sizes and keeps a real low-resolution preview on failure", () => {
    render(<ArticImage alt="Artwork" asset={asset} failureLabel="Temporarily unavailable" />);
    const image = screen.getByRole("img", { name: "Artwork" });
    expect(image.getAttribute("srcset")).toContain("/full/200,/0/default.jpg 200w");
    expect(image.getAttribute("srcset")).toContain("/full/1686,/0/default.jpg 1686w");

    fireEvent.error(image);
    const fallback = screen.getByText("Temporarily unavailable").parentElement;
    expect(fallback).toHaveClass("has-preview");
    expect(fallback).toHaveStyle({ backgroundImage: `url(${asset.lqip})` });
  });

  it("renders a verified Wikimedia Commons image without constructing an ARTIC IIIF URL", () => {
    render(
      <ArticImage
        alt="Commons artwork"
        asset={{
          ...asset,
          iiifBaseUrl: undefined,
          directUrl: "https://upload.wikimedia.org/artwork-843.jpg",
          directUrl2x: "https://upload.wikimedia.org/artwork-1686.jpg",
          sourceUrl: "https://commons.wikimedia.org/wiki/File:Artwork.jpg",
        }}
      />,
    );
    const image = screen.getByRole("img", { name: "Commons artwork" });
    expect(image).toHaveAttribute("src", "https://upload.wikimedia.org/artwork-843.jpg");
    expect(image.getAttribute("srcset")).toContain(
      "https://upload.wikimedia.org/artwork-1686.jpg 2400w",
    );
    expect(image.getAttribute("srcset")).not.toContain("www.artic.edu/iiif");
  });
});
