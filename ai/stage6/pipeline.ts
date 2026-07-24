import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  artworkKnowledgePackageSchema,
  type ArtworkKnowledgePackage,
} from "../../apps/web/src/schemas/ai-content.ts";
import {
  artworkSchema,
  type Artwork,
} from "../../apps/web/src/schemas/catalog.ts";
import { applyDeterministicReview } from "./evaluate.ts";

export type Stage6JobItem = {
  sourceId: string;
  locales: string[];
};

export type Stage6Job = {
  schemaVersion: "stage6-job/1.0.0";
  jobId: string;
  baseUrl: string;
  items: Stage6JobItem[];
};

export type Stage6GenerationContext = {
  artwork: Artwork;
  locale: string;
  inputHash: string;
  generatedAt: string;
  sourceSnapshots: Stage6SourceSnapshots;
};

export type Stage6SourceSnapshot = {
  snapshotRef: string;
  contentHash: string;
  filePath: string;
};

export type Stage6SourceSnapshots = {
  museumRecord: Stage6SourceSnapshot;
  imageRecord: Stage6SourceSnapshot | null;
};

export type Stage6Provider = {
  id: string;
  model: string;
  promptVersion: string;
  generate(context: Stage6GenerationContext): Promise<unknown>;
};

export type Stage6RunOptions = {
  outputRoot: string;
  provider: Stage6Provider;
  publish: boolean;
  force: boolean;
  sourceSnapshotRoot?: string;
  fetchImpl?: typeof fetch;
  now?: () => Date;
};

export type Stage6RunItemResult = {
  artworkId: string;
  locale: string;
  status: "generated" | "published" | "skipped" | "failed";
  candidatePath?: string;
  publishedPath?: string;
  error?: string;
};

export type Stage6RunReport = {
  jobId: string;
  provider: string;
  startedAt: string;
  completedAt: string;
  results: Stage6RunItemResult[];
};

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, stableValue(item)]),
    );
  }
  return value;
}

export function stableJson(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

export function parseStage6Job(input: unknown): Stage6Job {
  if (!input || typeof input !== "object")
    throw new Error("job must be an object");
  const job = input as Partial<Stage6Job>;
  if (job.schemaVersion !== "stage6-job/1.0.0") {
    throw new Error("unsupported stage 6 job schema");
  }
  if (!job.jobId || typeof job.jobId !== "string")
    throw new Error("jobId is required");
  if (!job.baseUrl || typeof job.baseUrl !== "string")
    throw new Error("baseUrl is required");
  new URL(job.baseUrl);
  if (!Array.isArray(job.items) || job.items.length === 0) {
    throw new Error("job requires at least one artwork");
  }

  const items = job.items.map((item, index) => {
    if (!item || typeof item !== "object")
      throw new Error(`items[${index}] must be an object`);
    if (!/^\d+$/.test(item.sourceId)) {
      throw new Error(`items[${index}].sourceId must be an ARTIC numeric id`);
    }
    if (
      !Array.isArray(item.locales) ||
      item.locales.length === 0 ||
      item.locales.some((locale) => !/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale))
    ) {
      throw new Error(`items[${index}].locales contains an invalid locale`);
    }
    return { sourceId: item.sourceId, locales: [...new Set(item.locales)] };
  });

  return {
    schemaVersion: job.schemaVersion,
    jobId: job.jobId,
    baseUrl: new URL(job.baseUrl).toString().replace(/\/$/, ""),
    items,
  };
}

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function writeJsonAtomically(
  filePath: string,
  value: unknown,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

async function readJsonIfPresent(filePath: string): Promise<unknown | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function fetchArtwork(
  job: Stage6Job,
  sourceId: string,
  fetchImpl: typeof fetch,
): Promise<Artwork> {
  const response = await fetchImpl(
    `${job.baseUrl}/api/artworks/${encodeURIComponent(sourceId)}`,
    {
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) {
    throw new Error(`artwork ${sourceId} returned HTTP ${response.status}`);
  }
  return artworkSchema.parse(await response.json());
}

function candidatePaths(
  outputRoot: string,
  knowledge: ArtworkKnowledgePackage,
): { candidatePath: string; publishedPath: string; statePath: string } {
  const directory = path.resolve(
    outputRoot,
    safeSegment(knowledge.artworkId),
    safeSegment(knowledge.locale),
  );
  return {
    candidatePath: path.join(
      directory,
      "candidates",
      `${safeSegment(knowledge.publication.version)}.json`,
    ),
    publishedPath: path.join(directory, "published.json"),
    statePath: path.join(directory, "run-state.json"),
  };
}

async function snapshotGenerationInputs(
  sourceSnapshotRoot: string,
  artwork: Artwork,
  capturedAt: string,
): Promise<Stage6SourceSnapshots> {
  const artworkDirectory = path.resolve(
    sourceSnapshotRoot,
    safeSegment(artwork.id),
  );
  const { accessedAt: _sourceAccessedAt, ...stableSource } = artwork.source;
  const { checkedAt: _eligibilityCheckedAt, ...stableEligibility } =
    artwork.eligibility;
  const stableArtwork = {
    ...artwork,
    source: stableSource,
    eligibility: stableEligibility,
  };
  const museumHash = sha256({
    schemaVersion: "artwork-source-snapshot/1.0.0",
    artwork: stableArtwork,
  });
  const museumPayload = {
    schemaVersion: "artwork-source-snapshot/1.0.0",
    capturedAt,
    artwork,
  };
  const museumPath = path.join(
    artworkDirectory,
    "museum-record",
    `${museumHash}.json`,
  );
  if ((await readJsonIfPresent(museumPath)) === null) {
    await writeJsonAtomically(museumPath, museumPayload);
  }

  let imageRecord: Stage6SourceSnapshot | null = null;
  if (artwork.images.preferred) {
    const imageHash = sha256({
      schemaVersion: "artwork-image-snapshot/1.0.0",
      artworkId: artwork.id,
      image: artwork.images.preferred,
      rights: artwork.rights.image,
      attribution: artwork.rights.attribution,
    });
    const imagePayload = {
      schemaVersion: "artwork-image-snapshot/1.0.0",
      capturedAt,
      artworkId: artwork.id,
      image: artwork.images.preferred,
      rights: artwork.rights.image,
      attribution: artwork.rights.attribution,
    };
    const imagePath = path.join(
      artworkDirectory,
      "image-record",
      `${imageHash}.json`,
    );
    if ((await readJsonIfPresent(imagePath)) === null) {
      await writeJsonAtomically(imagePath, imagePayload);
    }
    imageRecord = {
      snapshotRef: `snapshot:${safeSegment(artwork.id)}:image-record:${imageHash}`,
      contentHash: imageHash,
      filePath: imagePath,
    };
  }

  return {
    museumRecord: {
      snapshotRef: `snapshot:${safeSegment(artwork.id)}:museum-record:${museumHash}`,
      contentHash: museumHash,
      filePath: museumPath,
    },
    imageRecord,
  };
}

export async function runStage6Job(
  jobInput: unknown,
  options: Stage6RunOptions,
): Promise<Stage6RunReport> {
  const job = parseStage6Job(jobInput);
  const now = options.now ?? (() => new Date());
  const fetchImpl = options.fetchImpl ?? fetch;
  const sourceSnapshotRoot =
    options.sourceSnapshotRoot ??
    path.resolve(options.outputRoot, "..", "source-snapshots");
  const startedAt = now().toISOString();
  const results: Stage6RunItemResult[] = [];

  for (const item of job.items) {
    let artwork: Artwork;
    try {
      artwork = await fetchArtwork(job, item.sourceId, fetchImpl);
    } catch (error) {
      for (const locale of item.locales) {
        results.push({
          artworkId: `artic:${item.sourceId}`,
          locale,
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
        });
      }
      continue;
    }
    const sourceSnapshots = await snapshotGenerationInputs(
      sourceSnapshotRoot,
      artwork,
      now().toISOString(),
    );

    for (const locale of item.locales) {
      const generatedAt = now().toISOString();
      const inputHash = sha256({
        artworkRevision: artwork.revision,
        imageRevision: artwork.images.preferred?.id ?? null,
        museumSourceRevision: sourceSnapshots.museumRecord.contentHash,
        imageSourceRevision: sourceSnapshots.imageRecord?.contentHash ?? null,
        locale,
        provider: options.provider.id,
        model: options.provider.model,
        promptVersion: options.provider.promptVersion,
      });
      const initialStateDirectory = path.resolve(
        options.outputRoot,
        safeSegment(artwork.id),
        safeSegment(locale),
      );
      const initialStatePath = path.join(
        initialStateDirectory,
        "run-state.json",
      );
      const previousState = (await readJsonIfPresent(initialStatePath)) as {
        inputHash?: string;
        status?: string;
        candidatePath?: string;
        publishedPath?: string;
      } | null;

      if (
        !options.force &&
        previousState?.inputHash === inputHash &&
        ["generated", "published"].includes(previousState.status ?? "")
      ) {
        results.push({
          artworkId: artwork.id,
          locale,
          status: "skipped",
          candidatePath: previousState.candidatePath,
          publishedPath: previousState.publishedPath,
        });
        continue;
      }

      await writeJsonAtomically(initialStatePath, {
        inputHash,
        status: "running",
        attempt: Number(previousState?.inputHash === inputHash) + 1,
        updatedAt: generatedAt,
      });

      try {
        const candidate = artworkKnowledgePackageSchema.parse(
          applyDeterministicReview(
            artworkKnowledgePackageSchema.parse(
              await options.provider.generate({
                artwork,
                locale,
                inputHash,
                generatedAt,
                sourceSnapshots,
              }),
            ),
          ),
        );
        if (
          candidate.artworkId !== artwork.id ||
          candidate.artworkRevision !== artwork.revision
        ) {
          throw new Error(
            "provider returned a package for a different artwork revision",
          );
        }
        if (
          candidate.locale !== locale ||
          candidate.generation.inputHash !== inputHash
        ) {
          throw new Error(
            "provider returned a package for a different locale or input hash",
          );
        }

        const paths = candidatePaths(options.outputRoot, candidate);
        await writeJsonAtomically(paths.candidatePath, candidate);

        let status: Stage6RunItemResult["status"] = "generated";
        let publishedPath: string | undefined;
        if (options.publish) {
          if (candidate.review.status !== "passed") {
            throw new Error(
              "candidate cannot be published before review passes",
            );
          }
          const published = {
            ...candidate,
            publication: {
              ...candidate.publication,
              status: "published" as const,
              publishedAt: generatedAt,
            },
          };
          artworkKnowledgePackageSchema.parse(published);
          await writeJsonAtomically(paths.publishedPath, published);
          status = "published";
          publishedPath = paths.publishedPath;
        }

        await writeJsonAtomically(paths.statePath, {
          inputHash,
          status,
          attempt: Number(previousState?.inputHash === inputHash) + 1,
          updatedAt: generatedAt,
          candidatePath: paths.candidatePath,
          publishedPath,
        });
        results.push({
          artworkId: artwork.id,
          locale,
          status,
          candidatePath: paths.candidatePath,
          publishedPath,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await writeJsonAtomically(initialStatePath, {
          inputHash,
          status: "failed",
          attempt: Number(previousState?.inputHash === inputHash) + 1,
          updatedAt: generatedAt,
          error: message,
        });
        results.push({
          artworkId: artwork.id,
          locale,
          status: "failed",
          error: message,
        });
      }
    }
  }

  return {
    jobId: job.jobId,
    provider: options.provider.id,
    startedAt,
    completedAt: now().toISOString(),
    results,
  };
}
