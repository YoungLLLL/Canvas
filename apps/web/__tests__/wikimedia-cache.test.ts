import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readArticCommonsCache, writeArticCommonsCache } from "@/src/lib/wikimedia-cache";
import {
  getCommonsImagesForArticIds,
  WikimediaRequestError,
  wikimediaFailureReason,
} from "@/src/lib/wikimedia";

let temporaryDirectory: string | undefined;

afterEach(async () => {
  delete process.env.WIKIMEDIA_CACHE_DIR;
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = undefined;
  }
});

describe("persistent Wikimedia metadata cache", () => {
  it("serves a cached mapping without downloading the image binary", async () => {
    temporaryDirectory = await mkdtemp(path.join(tmpdir(), "canvium-wikimedia-cache-"));
    process.env.WIKIMEDIA_CACHE_DIR = temporaryDirectory;
    const image = {
      src: "https://upload.wikimedia.org/example-843.jpg",
      originalUrl: "https://upload.wikimedia.org/example.jpg",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
      width: 843,
      height: 674,
      licenseCode: "CC-BY-NC-ND-4.0" as const,
      licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/",
      attribution: "Example artist",
      usage: {
        commercialUseAllowed: false,
        adaptationsAllowed: false,
        attributionRequired: true,
        shareAlike: false,
      },
    };
    await writeArticCommonsCache(new Map([["25781", image]]));

    const result = await getCommonsImagesForArticIds(["25781"]);
    expect(result.get("25781")).toEqual(image);
    expect((await readArticCommonsCache(["25781"])).get("25781")?.status).toBe("mapped");
  });

  it("distinguishes rate limiting from other temporary failures", () => {
    expect(wikimediaFailureReason(new WikimediaRequestError(429))).toBe("commons_rate_limited");
    expect(wikimediaFailureReason(new Error("offline"))).toBe("commons_temporarily_unavailable");
  });
});
