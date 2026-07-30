import { describe, expect, it } from "vitest";

import { museumById, museumCollectionHref, museumDirectory } from "@/src/lib/museum-directory";
import { collectionQuerySchema, collectionQueryString } from "@/src/schemas/routes";

describe("museum directory", () => {
  it("only publishes mapped museums with coordinates and collection entries", () => {
    expect(museumDirectory.length).toBeGreaterThanOrEqual(4);
    for (const museum of museumDirectory) {
      expect(museum.lat).toBeGreaterThanOrEqual(-90);
      expect(museum.lat).toBeLessThanOrEqual(90);
      expect(museum.lng).toBeGreaterThanOrEqual(-180);
      expect(museum.lng).toBeLessThanOrEqual(180);
      expect(museumCollectionHref(museum.id, "zh")).toContain("/zh/museums/");
    }
  });

  it("creates a route that keeps the selected Europeana museum", () => {
    expect(museumById("rijksmuseum")?.collection.source).toBe("europeana");
    expect(museumCollectionHref("rijksmuseum", "zh")).toBe(
      "/zh/museums/europeana/collection?museum=rijksmuseum",
    );

    const query = collectionQuerySchema.parse({ museum: "rijksmuseum" });
    expect(query.museum).toBe("rijksmuseum");
    expect(collectionQueryString(query)).toContain("museum=rijksmuseum");
  });

  it("publishes direct official collection routes for The Met and Cleveland", () => {
    expect(museumById("met")?.collection.source).toBe("met");
    expect(museumCollectionHref("met", "zh")).toBe(
      "/zh/museums/metropolitan-museum-of-art/collection",
    );
    expect(museumById("cleveland")?.collection.source).toBe("cleveland");
    expect(museumCollectionHref("cleveland", "en")).toBe(
      "/en/museums/cleveland-museum-of-art/collection",
    );
  });
});
