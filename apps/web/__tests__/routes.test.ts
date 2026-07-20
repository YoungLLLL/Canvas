import { describe, expect, it } from "vitest";

import { artworkKeySchema, collectionQuerySchema, museumSlugSchema } from "@/src/schemas/routes";

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
});
