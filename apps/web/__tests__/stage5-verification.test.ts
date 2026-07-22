import { describe, expect, it } from "vitest";

import { analyzeRecords, parseOptions, selectEvenly } from "../../../scripts/verify-stage5.mjs";

function record({ id, status, reason }: { id: string; status: string; reason?: string }) {
  const displayable = status === "image_displayable";
  return {
    id,
    source: { recordUrl: `https://www.artic.edu/artworks/${id}` },
    eligibility: { status, reasons: reason ? [reason] : [] },
    images: {
      preferred: displayable
        ? {
            directUrl: `https://upload.wikimedia.org/${id}.jpg`,
            sourceUrl: `https://commons.wikimedia.org/wiki/File:${id}.jpg`,
          }
        : null,
    },
    rights: {
      work: { status: "public_domain" },
      image: {
        licenseCode: displayable ? "PDM-1.0" : "unknown",
        licenseUrl: displayable ? "https://creativecommons.org/publicdomain/mark/1.0/" : null,
      },
      metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
      termsUrl: "https://www.artic.edu/terms",
      attribution: "Art Institute of Chicago",
    },
  };
}

describe("Stage 5 verification report", () => {
  it("parses a bounded smoke configuration", () => {
    expect(parseOptions(["--pages", "3", "--concurrency", "2"])).toMatchObject({
      pages: 3,
      concurrency: 2,
      startServer: true,
      minMappingRate: 0.95,
      minImageProbeCoverageRate: 0.98,
      maxImageProbes: 5,
    });
  });

  it("samples image probes across the complete result set", () => {
    expect(selectEvenly([0, 1, 2, 3, 4, 5, 6, 7, 8], 3)).toEqual([0, 4, 8]);
  });

  it("measures mapping candidates separately from native metadata-only records", () => {
    const records = [
      record({ id: "artic:1", status: "image_displayable" }),
      record({
        id: "artic:2",
        status: "metadata_only_no_image",
        reason: "commons_image_unavailable",
      }),
      record({ id: "artic:3", status: "metadata_only_no_image" }),
    ];
    const result = analyzeRecords(
      records,
      [{ id: "artic:1", reachable: true }],
      [{ page: 1, records: 3, durationMs: 100 }],
      {
        minMappingRate: 0.5,
        minImageReachabilityRate: 1,
        minImageProbeCoverageRate: 1,
      },
    );

    expect(result).toMatchObject({
      passed: true,
      sampledRecords: 3,
      mappingCandidates: 2,
      mappedRecords: 1,
      mappingRate: 0.5,
      rightsCompletenessRate: 1,
    });
    expect(result.failures.mappings).toEqual([{ id: "artic:2", title: null, artist: null }]);
  });

  it("fails records with duplicate ids or incomplete rights", () => {
    const invalid = record({ id: "artic:1", status: "image_displayable" });
    invalid.rights.image.licenseUrl = null;
    const result = analyzeRecords(
      [invalid, invalid],
      [{ id: "artic:1", reachable: false }],
      [{ page: 1, records: 2, durationMs: 100 }],
      {
        minMappingRate: 0.9,
        minImageReachabilityRate: 0.9,
        minImageProbeCoverageRate: 1,
      },
    );

    expect(result.passed).toBe(false);
    expect(result.duplicateRecords).toBe(1);
    expect(result.failures.rights).toHaveLength(2);
  });

  it("reports rate limiting as inconclusive instead of a broken image", () => {
    const result = analyzeRecords(
      [record({ id: "artic:1", status: "image_displayable" })],
      [{ id: "artic:1", reachable: false, inconclusive: true, error: "rate_limited" }],
      [{ page: 1, records: 1, durationMs: 100 }],
      {
        minMappingRate: 1,
        minImageReachabilityRate: 1,
        minImageProbeCoverageRate: 1,
      },
    );

    expect(result.passed).toBe(false);
    expect(result.inconclusiveImageChecks).toBe(1);
    expect(result.failures.images).toHaveLength(0);
    expect(result.failures.imageProbes).toHaveLength(1);
  });
});
