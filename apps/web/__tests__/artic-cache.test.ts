import { afterEach, describe, expect, it, vi } from "vitest";

import { collectionQuerySchema } from "@/src/schemas/routes";

const payload = {
  pagination: { total: 1, current_page: 1, total_pages: 1 },
  config: {
    iiif_url: "https://www.artic.edu/iiif/2",
    website_url: "https://www.artic.edu",
  },
  data: [
    {
      id: 28560,
      title: "The Bedroom",
      artist_id: 40610,
      artist_title: "Vincent van Gogh",
      artist_display: "Vincent van Gogh",
      image_id: "image-1",
      thumbnail: { width: 1200, height: 900 },
      is_public_domain: true,
      copyright_notice: null,
      is_zoomable: true,
      artwork_type_id: 1,
      artwork_type_title: "Painting",
      updated_at: "2026-07-20T08:00:00-05:00",
    },
  ],
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.doUnmock("@/src/lib/wikimedia");
  vi.resetModules();
});

describe("ARTIC short cache and stale fallback", () => {
  it("serves the last successful response when revalidation fails transiently", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-21T08:00:00Z"));
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(payload), { status: 200 }))
      .mockRejectedValue(new Error("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);
    vi.doMock("@/src/lib/wikimedia", () => ({
      getCommonsImagesForArticIds: vi.fn().mockResolvedValue(
        new Map([
          [
            "28560",
            {
              src: "https://upload.wikimedia.org/bedroom-843.jpg",
              originalUrl: "https://upload.wikimedia.org/bedroom.jpg",
              sourceUrl: "https://commons.wikimedia.org/wiki/File:The_Bedroom.jpg",
              width: 843,
              height: 668,
              licenseCode: "PDM-1.0",
              licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
              attribution: "Wikimedia Commons",
              usage: {
                commercialUseAllowed: true,
                adaptationsAllowed: true,
                attributionRequired: false,
                shareAlike: false,
              },
            },
          ],
        ]),
      ),
    }));
    const { getArticCollection } = await import("@/src/lib/artic");
    const query = collectionQuerySchema.parse({});

    const fresh = await getArticCollection(query);
    vi.setSystemTime(new Date("2026-07-21T08:05:01Z"));
    const stalePromise = getArticCollection(query);
    await vi.advanceTimersByTimeAsync(300);
    const stale = await stalePromise;

    expect(fresh.dataStatus.state).toBe("fresh");
    expect(stale.dataStatus).toMatchObject({
      state: "stale",
      fetchedAt: fresh.dataStatus.fetchedAt,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
