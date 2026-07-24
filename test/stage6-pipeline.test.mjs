import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { evaluateStage6Candidate } from "../ai/stage6/evaluate.ts";
import { extractDeterministicPalette } from "../ai/stage6/palette.ts";
import { runStage6Job } from "../ai/stage6/pipeline.ts";
import {
  toInternalDialogueMaterial,
  toPublicArtworkKnowledge,
} from "../ai/stage6/publication.ts";
import { stage6FixtureProvider } from "../ai/stage6/providers/fixture.ts";

const artwork = {
  id: "artic:28560",
  sourceId: "28560",
  museumId: "artic",
  source: {
    id: "artic",
    label: "The Art Institute of Chicago",
    recordUrl: "https://www.artic.edu/artworks/28560",
    apiUrl: "https://api.artic.edu/api/v1/artworks/28560",
    accessedAt: "2026-07-24T08:00:00Z",
  },
  display: {
    title: "The Bedroom",
    localizedTitles: {},
    altTitles: [],
    artistDisplay: "Vincent van Gogh",
  },
  artist: null,
  date: { start: 1889, end: 1889 },
  classification: {
    artworkTypeId: 1,
    artworkTypeTitle: "Painting",
    classificationTitles: [],
  },
  images: {
    preferred: {
      id: "image-1",
      directUrl: "https://example.com/image.jpg",
      zoomable: true,
      maxZoomWindowSize: null,
      health: "ok",
    },
    alternates: [],
  },
  rights: {
    work: { status: "public_domain", notice: null },
    image: {
      licenseCode: "PDM-1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
    },
    metadata: { defaultLicense: "CC0-1.0", descriptionLicense: "CC-BY-4.0" },
    termsUrl: "https://www.artic.edu/terms",
    attribution: "Vincent van Gogh. The Bedroom, 1889.",
  },
  eligibility: {
    status: "image_displayable",
    ruleVersion: "fixture",
    checkedAt: "2026-07-24T08:00:00Z",
    reasons: [],
  },
  revision: "fixture-v1",
};

const job = {
  schemaVersion: "stage6-job/1.0.0",
  jobId: "fixture-job",
  baseUrl: "http://127.0.0.1:3100",
  items: [{ sourceId: "28560", locales: ["en"] }],
};

function mockFetch() {
  return Promise.resolve(
    new Response(JSON.stringify(artwork), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
}

test("stage 6 pipeline writes a candidate and resumes identical input", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "canvium-stage6-"));
  const sourceSnapshotRoot = path.join(outputRoot, "source-snapshots");
  const dates = [
    new Date("2026-07-24T08:00:00Z"),
    new Date("2026-07-24T08:00:01Z"),
    new Date("2026-07-24T08:00:02Z"),
    new Date("2026-07-24T08:00:03Z"),
    new Date("2026-07-24T08:00:04Z"),
  ];
  let dateIndex = 0;

  try {
    const first = await runStage6Job(job, {
      outputRoot,
      provider: stage6FixtureProvider,
      publish: false,
      force: false,
      sourceSnapshotRoot,
      fetchImpl: mockFetch,
      now: () => dates[Math.min(dateIndex++, dates.length - 1)],
    });
    assert.equal(first.results[0].status, "generated");
    const candidate = JSON.parse(
      await readFile(first.results[0].candidatePath, "utf8"),
    );
    assert.equal(candidate.dialogueCues[0].move, "mention");
    assert.equal("recommendedQuestions" in candidate.content, false);
    assert.match(
      candidate.sources[0].snapshotRef,
      /^snapshot:artic_28560:museum-record:/,
    );
    const sourceSnapshotPath = path.join(
      sourceSnapshotRoot,
      "artic_28560",
      "museum-record",
      `${candidate.sources[0].contentHash}.json`,
    );
    const sourceSnapshot = JSON.parse(
      await readFile(sourceSnapshotPath, "utf8"),
    );
    assert.equal(sourceSnapshot.artwork.id, "artic:28560");

    const resumed = await runStage6Job(job, {
      outputRoot,
      provider: stage6FixtureProvider,
      publish: false,
      force: false,
      sourceSnapshotRoot,
      fetchImpl: mockFetch,
      now: () => dates[Math.min(dateIndex++, dates.length - 1)],
    });
    assert.equal(resumed.results[0].status, "skipped");
    assert.equal(
      resumed.results[0].candidatePath,
      first.results[0].candidatePath,
    );
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test("stage 6 pipeline blocks publication before review passes", async () => {
  const outputRoot = await mkdtemp(path.join(os.tmpdir(), "canvium-stage6-"));
  try {
    const report = await runStage6Job(job, {
      outputRoot,
      provider: stage6FixtureProvider,
      publish: true,
      force: false,
      sourceSnapshotRoot: path.join(outputRoot, "source-snapshots"),
      fetchImpl: mockFetch,
      now: () => new Date("2026-07-24T08:00:00Z"),
    });
    assert.equal(report.results[0].status, "failed");
    assert.match(
      report.results[0].error,
      /cannot be published before review passes/,
    );
  } finally {
    await rm(outputRoot, { recursive: true, force: true });
  }
});

test("stage 6 deterministic review rejects ungrounded observation invitations", async () => {
  const candidate = await stage6FixtureProvider.generate({
    artwork,
    locale: "en",
    inputHash: "fixture-input",
    generatedAt: "2026-07-24T08:00:00Z",
    sourceSnapshots: {
      museumRecord: {
        snapshotRef: "snapshot:artic_28560:museum-record:fixture",
        contentHash: "a".repeat(64),
        filePath: "fixture",
      },
      imageRecord: {
        snapshotRef: "snapshot:artic_28560:image-record:fixture",
        contentHash: "b".repeat(64),
        filePath: "fixture",
      },
    },
  });
  candidate.dialogueCues[0] = {
    ...candidate.dialogueCues[0],
    move: "invite_observation",
    visualEvidenceIds: [],
  };
  const issues = evaluateStage6Candidate(candidate);
  assert.ok(
    issues.some((item) => item.code === "ungrounded_observation_invitation"),
  );
});

test("public serialization cannot expose internal dialogue cues", async () => {
  const candidate = await stage6FixtureProvider.generate({
    artwork,
    locale: "en",
    inputHash: "fixture-input",
    generatedAt: "2026-07-24T08:00:00Z",
    sourceSnapshots: {
      museumRecord: {
        snapshotRef: "snapshot:artic_28560:museum-record:fixture",
        contentHash: "a".repeat(64),
        filePath: "fixture",
      },
      imageRecord: {
        snapshotRef: "snapshot:artic_28560:image-record:fixture",
        contentHash: "b".repeat(64),
        filePath: "fixture",
      },
    },
  });
  const publicPayload = toPublicArtworkKnowledge(candidate);
  const serialized = JSON.stringify(publicPayload);
  assert.equal("dialogueCues" in publicPayload, false);
  assert.doesNotMatch(
    serialized,
    /transitionHint|triggerIntents|recommendedQuestions/,
  );

  const internalPayload = toInternalDialogueMaterial(candidate);
  assert.equal(internalPayload.dialogueCues.length, 1);
});

test("palette extraction is deterministic and preserves proportions", () => {
  const pixels = new Uint8ClampedArray([
    255, 0, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255,
  ]);
  const first = extractDeterministicPalette(
    { width: 4, height: 1, data: pixels },
    { colors: 2, locale: "zh-CN" },
  );
  const second = extractDeterministicPalette(
    { width: 4, height: 1, data: pixels },
    { colors: 2, locale: "zh-CN" },
  );
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.map((color) => color.hex),
    ["#ff0000", "#0000ff"],
  );
  assert.equal(first[0].proportion, 0.75);
  assert.equal(
    first.reduce((sum, color) => sum + color.proportion, 0),
    1,
  );
  assert.ok(
    first.every((color) => color.luminance >= 0 && color.luminance <= 1),
  );
});
