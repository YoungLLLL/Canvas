import { describe, expect, it } from "vitest";

import {
  artworkKeySchema,
  collectionQuerySchema,
  collectionQueryString,
  museumSlugSchema,
} from "@/src/schemas/routes";

describe("stable route contracts", () => {
  it("accepts documented resource identifiers", () => {
    expect(museumSlugSchema.parse("art-institute-of-chicago")).toBe("art-institute-of-chicago");
    expect(artworkKeySchema.parse("artic-28560")).toBe("artic-28560");
  });

  it("normalizes collection defaults", () => {
    expect(collectionQuerySchema.parse({})).toMatchObject({
      q: "",
      artist: [],
      availability: "image",
      sort: "recent",
      page: 1,
    });
  });

  it("uses relevance for text search and rejects reversed date ranges", () => {
    expect(collectionQuerySchema.parse({ q: "  monet  " }).sort).toBe("relevance");
    expect(collectionQuerySchema.safeParse({ from: "1900", to: "1880" }).success).toBe(false);
  });

  it("drops invalid values and serializes canonical query keys in a fixed order", () => {
    const query = collectionQuerySchema.parse({
      q: " monet ",
      artist: ["40610", "not-an-id"],
      from: "invalid",
      availability: "invalid",
      sort: "recent",
      page: "1",
      extra: "discarded",
    });
    expect(query).toMatchObject({
      artist: ["40610"],
      from: undefined,
      availability: "image",
      page: 1,
    });
    expect(collectionQueryString(query)).toBe("q=monet&artist=40610&sort=recent");
  });

  it("normalizes pages beyond the ARTIC 10,000-result boundary back to page one", () => {
    expect(collectionQuerySchema.parse({ page: "835" }).page).toBe(1);
  });

  it("does not keep relevance sorting when there is no text query", () => {
    expect(collectionQuerySchema.parse({ sort: "relevance" }).sort).toBe("recent");
  });
});
