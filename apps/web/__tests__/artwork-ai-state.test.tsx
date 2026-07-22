import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DemoArtworkDetail } from "@/src/components/demo-artwork-detail";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
}));

const props = {
  locale: "en" as const,
  imageUrl: "https://upload.wikimedia.org/example.jpg",
  ratio: 1.2,
  title: "Water Lilies",
  originalTitle: "Water Lilies",
  artist: "Claude Monet",
  date: "1906",
  description: "Museum description",
  medium: "Oil on canvas",
  dimensions: "90 × 100 cm",
  museumUrl: "https://www.artic.edu/artworks/1",
  imageSourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  licenseLabel: "CC0 1.0",
};

describe("unpublished artist persona state", () => {
  it("explains that AI dialogue is unavailable without simulating an artist", () => {
    render(<DemoArtworkDetail {...props} />);

    expect(
      screen.getByRole("heading", { name: "The artist persona is not available yet" }),
    ).toBeVisible();
    expect(screen.getByText(/will not simulate the artist before publication/i)).toBeVisible();
    expect(screen.getByRole("button", { name: "View artwork records and sources" })).toBeVisible();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/VINCENT VAN GOGH/i)).not.toBeInTheDocument();
  });
});
