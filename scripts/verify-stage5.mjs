import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultBaseUrl = "http://127.0.0.1:3101";

function numberOption(
  value,
  fallback,
  { integer = true, min = 0, max = Infinity } = {},
) {
  const parsed = Number(value ?? fallback);
  if (
    !Number.isFinite(parsed) ||
    (integer && !Number.isInteger(parsed)) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(`Invalid numeric option: ${value}`);
  }
  return parsed;
}

export function parseOptions(argv) {
  const values = new Map();
  const flags = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--"))
      throw new Error(`Unexpected argument: ${token}`);
    if (["--help", "--no-start-server"].includes(token)) {
      flags.add(token);
      continue;
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${token}`);
    values.set(token, value);
    index += 1;
  }

  const baseUrl = (values.get("--base-url") ?? defaultBaseUrl).replace(
    /\/$/,
    "",
  );
  return {
    help: flags.has("--help"),
    baseUrl,
    startServer: !flags.has("--no-start-server") && !values.has("--base-url"),
    pages: numberOption(values.get("--pages"), 2, { min: 1, max: 834 }),
    startPage: numberOption(values.get("--start-page"), 1, {
      min: 1,
      max: 834,
    }),
    concurrency: numberOption(values.get("--concurrency"), 1, {
      min: 1,
      max: 12,
    }),
    pageDelayMs: numberOption(values.get("--page-delay-ms"), 250, {
      min: 0,
      max: 10_000,
    }),
    imageDelayMs: numberOption(values.get("--image-delay-ms"), 750, {
      min: 0,
      max: 10_000,
    }),
    maxImageProbes: numberOption(values.get("--max-image-probes"), 5, {
      min: 1,
      max: 100,
    }),
    requestTimeoutMs: numberOption(values.get("--request-timeout-ms"), 15_000, {
      min: 1_000,
      max: 120_000,
    }),
    minMappingRate: numberOption(values.get("--min-mapping-rate"), 0.95, {
      integer: false,
      min: 0,
      max: 1,
    }),
    minImageReachabilityRate: numberOption(
      values.get("--min-image-rate"),
      0.98,
      {
        integer: false,
        min: 0,
        max: 1,
      },
    ),
    minImageProbeCoverageRate: numberOption(
      values.get("--min-image-coverage"),
      0.98,
      {
        integer: false,
        min: 0,
        max: 1,
      },
    ),
    userAgent:
      values.get("--user-agent") ??
      process.env.CANVIUM_VERIFY_USER_AGENT ??
      process.env.ARTIC_USER_AGENT ??
      "CanviumGallery-Stage5Verifier/1.0",
    output: values.get("--output"),
  };
}

export function analyzeRecords(records, imageChecks, pageResults, thresholds) {
  const seen = new Set();
  const duplicates = [];
  const rightsFailures = [];
  const mappingGaps = [];
  let displayable = 0;
  let metadataOnly = 0;
  let mappingCandidates = 0;
  let mapped = 0;

  for (const record of records) {
    const id = typeof record?.id === "string" ? record.id : "unknown";
    if (seen.has(id)) duplicates.push(id);
    seen.add(id);

    const status = record?.eligibility?.status;
    const reasons = Array.isArray(record?.eligibility?.reasons)
      ? record.eligibility.reasons
      : [];
    const preferred = record?.images?.preferred;
    const isDisplayable = status === "image_displayable";
    const mappingMissing = reasons.includes("commons_image_unavailable");
    if (isDisplayable) {
      displayable += 1;
      mappingCandidates += 1;
      mapped += 1;
    } else if (status === "metadata_only_no_image") {
      metadataOnly += 1;
      if (mappingMissing) {
        mappingCandidates += 1;
        mappingGaps.push({
          id,
          title: record?.display?.title ?? null,
          artist: record?.display?.artistDisplay ?? null,
        });
      }
    }

    const baseRightsComplete =
      record?.rights?.work?.status === "public_domain" &&
      record?.rights?.metadata?.defaultLicense === "CC0-1.0" &&
      record?.rights?.metadata?.descriptionLicense === "CC-BY-4.0" &&
      typeof record?.rights?.termsUrl === "string" &&
      typeof record?.rights?.attribution === "string" &&
      typeof record?.source?.recordUrl === "string";
    const imageRightsComplete =
      !isDisplayable ||
      (["CC0-1.0", "PDM-1.0"].includes(record?.rights?.image?.licenseCode) &&
        typeof record?.rights?.image?.licenseUrl === "string" &&
        typeof preferred?.directUrl === "string" &&
        typeof preferred?.sourceUrl === "string");
    if (!baseRightsComplete || !imageRightsComplete) {
      rightsFailures.push({ id, baseRightsComplete, imageRightsComplete });
    }
  }

  const inconclusiveImages = imageChecks.filter(
    (check) => check.inconclusive,
  ).length;
  const conclusiveImages = imageChecks.length - inconclusiveImages;
  const reachableImages = imageChecks.filter((check) => check.reachable).length;
  const mappingRate = mappingCandidates ? mapped / mappingCandidates : 1;
  const imageProbeCoverageRate = imageChecks.length
    ? conclusiveImages / imageChecks.length
    : 1;
  const imageReachabilityRate = conclusiveImages
    ? reachableImages / conclusiveImages
    : 0;
  const rightsCompletenessRate = records.length
    ? (records.length - rightsFailures.length) / records.length
    : 0;
  const pageFailures = pageResults.filter((page) => page.error);
  const passed =
    records.length > 0 &&
    pageFailures.length === 0 &&
    duplicates.length === 0 &&
    rightsFailures.length === 0 &&
    mappingRate >= thresholds.minMappingRate &&
    imageProbeCoverageRate >= (thresholds.minImageProbeCoverageRate ?? 1) &&
    imageReachabilityRate >= thresholds.minImageReachabilityRate;

  return {
    passed,
    sampledRecords: records.length,
    uniqueRecords: seen.size,
    duplicateRecords: duplicates.length,
    displayableRecords: displayable,
    metadataOnlyRecords: metadataOnly,
    mappingCandidates,
    mappedRecords: mapped,
    mappingRate,
    checkedImages: imageChecks.length,
    conclusiveImageChecks: conclusiveImages,
    inconclusiveImageChecks: inconclusiveImages,
    imageProbeCoverageRate,
    reachableImages,
    imageReachabilityRate,
    rightsCompletenessRate,
    pageFailures: pageFailures.length,
    failures: {
      duplicateIds: duplicates.slice(0, 25),
      mappings: mappingGaps.slice(0, 100),
      rights: rightsFailures.slice(0, 25),
      images: imageChecks
        .filter((check) => !check.reachable && !check.inconclusive)
        .slice(0, 25),
      imageProbes: imageChecks
        .filter((check) => check.inconclusive)
        .slice(0, 25),
      pages: pageFailures.slice(0, 25),
    },
  };
}

function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function isServerReady(baseUrl, timeoutMs = 2_000) {
  try {
    const response = await fetchWithTimeout(`${baseUrl}/en`, {}, timeoutMs);
    await response.body?.cancel();
    return response.ok;
  } catch {
    return false;
  }
}

async function startFormalApp(baseUrl) {
  if (await isServerReady(baseUrl)) return null;
  const url = new URL(baseUrl);
  const nextBin = join(
    root,
    "apps",
    "web",
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );
  const child = spawn(
    process.execPath,
    [nextBin, "dev", "--hostname", url.hostname, "--port", url.port || "80"],
    { cwd: join(root, "apps", "web"), stdio: ["ignore", "pipe", "pipe"] },
  );
  let recentOutput = "";
  const capture = (chunk) => {
    recentOutput = `${recentOutput}${chunk}`.slice(-4_000);
  };
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);

  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(`Formal app exited early:\n${recentOutput}`);
    if (await isServerReady(baseUrl)) return child;
    await wait(500);
  }
  child.kill();
  throw new Error(`Timed out starting the formal app:\n${recentOutput}`);
}

async function fetchCatalogPage(baseUrl, page, timeoutMs) {
  const startedAt = performance.now();
  const url = `${baseUrl}/api/catalog?availability=all&page=${page}&sort=recent`;
  const response = await fetchWithTimeout(
    url,
    { headers: { Accept: "application/json" } },
    timeoutMs,
  );
  const durationMs = Math.round(performance.now() - startedAt);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.items))
    throw new Error("Response does not contain an items array");
  return { payload, durationMs, url };
}

async function mapLimit(items, concurrency, task) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await task(items[index], index);
      }
    }),
  );
  return results;
}

export function selectEvenly(items, limit) {
  if (items.length <= limit) return [...items];
  if (limit === 1) return [items[0]];
  return Array.from(
    { length: limit },
    (_, index) => items[Math.round((index * (items.length - 1)) / (limit - 1))],
  );
}

async function checkImage(record, timeoutMs, userAgent) {
  const url = record?.images?.preferred?.directUrl;
  const id = record?.id ?? "unknown";
  if (!url)
    return { id, url: null, reachable: false, error: "missing_direct_url" };
  const startedAt = performance.now();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchWithTimeout(
        url,
        {
          method: "HEAD",
          headers: { Accept: "image/*", "User-Agent": userAgent },
        },
        timeoutMs,
      );
      const contentType = response.headers.get("content-type") ?? "";
      await response.body?.cancel();
      if (response.status === 429) {
        if (attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after"));
          await wait(
            Number.isFinite(retryAfter)
              ? Math.min(retryAfter * 1_000, 5_000)
              : 750 * (attempt + 1),
          );
          continue;
        }
        return {
          id,
          url,
          reachable: false,
          inconclusive: true,
          status: response.status,
          error: "rate_limited",
          durationMs: Math.round(performance.now() - startedAt),
        };
      }
      return {
        id,
        url,
        reachable: response.ok && contentType.startsWith("image/"),
        status: response.status,
        contentType,
        durationMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      if (attempt < 2) {
        await wait(750 * (attempt + 1));
        continue;
      }
      return {
        id,
        url,
        reachable: false,
        inconclusive: error instanceof Error && error.name === "AbortError",
        durationMs: Math.round(performance.now() - startedAt),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  return {
    id,
    url,
    reachable: false,
    inconclusive: true,
    error: "probe_exhausted",
  };
}

function percentile(values, value) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)
  ];
}

function timestampName(date = new Date()) {
  return date
    .toISOString()
    .replaceAll(":", "-")
    .replace(/\.\d{3}Z$/, "Z");
}

export async function runVerification(options) {
  if (options.startPage + options.pages - 1 > 834) {
    throw new Error(
      "Requested page range exceeds ARTIC's accessible search window",
    );
  }

  let ownedServer = null;
  if (options.startServer) ownedServer = await startFormalApp(options.baseUrl);
  else if (!(await isServerReady(options.baseUrl, options.requestTimeoutMs))) {
    throw new Error(`Formal app is not reachable at ${options.baseUrl}`);
  }

  try {
    const records = [];
    const pageResults = [];
    for (let offset = 0; offset < options.pages; offset += 1) {
      const page = options.startPage + offset;
      try {
        const result = await fetchCatalogPage(
          options.baseUrl,
          page,
          options.requestTimeoutMs,
        );
        const pageItems = result.payload.items;
        const mappedRecords = pageItems.filter(
          (record) => record?.eligibility?.status === "image_displayable",
        ).length;
        const mappingCandidates = pageItems.filter(
          (record) =>
            record?.eligibility?.status === "image_displayable" ||
            record?.eligibility?.reasons?.includes("commons_image_unavailable"),
        ).length;
        records.push(...pageItems);
        pageResults.push({
          page,
          durationMs: result.durationMs,
          records: pageItems.length,
          mappedRecords,
          mappingCandidates,
          mappingRate: mappingCandidates
            ? mappedRecords / mappingCandidates
            : 1,
          dataState: result.payload.dataStatus?.state ?? "unknown",
          fetchedAt: result.payload.dataStatus?.fetchedAt ?? null,
        });
        process.stdout.write(
          `Page ${page}: ${pageItems.length} records, ${mappedRecords}/${mappingCandidates} mapped in ${result.durationMs}ms\n`,
        );
      } catch (error) {
        pageResults.push({
          page,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      if (offset < options.pages - 1) await wait(options.pageDelayMs);
    }

    const displayable = records.filter(
      (record) => record?.eligibility?.status === "image_displayable",
    );
    const imageProbeRecords = selectEvenly(displayable, options.maxImageProbes);
    const imageChecks = await mapLimit(
      imageProbeRecords,
      options.concurrency,
      async (record, index) => {
        if (index >= options.concurrency) await wait(options.imageDelayMs);
        return checkImage(record, options.requestTimeoutMs, options.userAgent);
      },
    );
    let cacheProbe = null;
    try {
      const probe = await fetchCatalogPage(
        options.baseUrl,
        options.startPage,
        options.requestTimeoutMs,
      );
      cacheProbe = { page: options.startPage, durationMs: probe.durationMs };
    } catch (error) {
      cacheProbe = {
        page: options.startPage,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const thresholds = {
      minMappingRate: options.minMappingRate,
      minImageReachabilityRate: options.minImageReachabilityRate,
      minImageProbeCoverageRate: options.minImageProbeCoverageRate,
      requiredRightsCompletenessRate: 1,
      allowedDuplicateRecords: 0,
      allowedPageFailures: 0,
    };
    const summary = analyzeRecords(
      records,
      imageChecks,
      pageResults,
      thresholds,
    );
    const pageDurations = pageResults.flatMap((page) =>
      typeof page.durationMs === "number" ? [page.durationMs] : [],
    );
    const imageDurations = imageChecks.flatMap((check) =>
      typeof check.durationMs === "number" ? [check.durationMs] : [],
    );
    return {
      schemaVersion: "canvium-stage5-verification-v1",
      generatedAt: new Date().toISOString(),
      target: {
        baseUrl: options.baseUrl,
        startPage: options.startPage,
        pages: options.pages,
        expectedMaximumRecords: options.pages * 12,
        maxImageProbes: options.maxImageProbes,
      },
      thresholds,
      summary,
      timing: {
        pageRequestMs: {
          min: pageDurations.length ? Math.min(...pageDurations) : null,
          median: percentile(pageDurations, 0.5),
          p95: percentile(pageDurations, 0.95),
          max: pageDurations.length ? Math.max(...pageDurations) : null,
        },
        imageProbeMs: {
          median: percentile(imageDurations, 0.5),
          p95: percentile(imageDurations, 0.95),
        },
        cacheProbe,
      },
      pages: pageResults,
      imageChecks,
    };
  } finally {
    if (ownedServer) {
      ownedServer.kill();
      await Promise.race([
        new Promise((resolvePromise) =>
          ownedServer.once("exit", resolvePromise),
        ),
        wait(3_000),
      ]);
    }
  }
}

function usage() {
  return `Canvium Stage 5 catalog verifier

Usage:
  npm run verify:stage5 -- [options]

Options:
  --pages <n>                 Pages to sample; 42 pages is about 500 records (default: 2)
  --start-page <n>            First catalog page (default: 1)
  --concurrency <n>           Concurrent image probes (default: 1)
  --page-delay-ms <n>         Delay between catalog pages (default: 250)
  --image-delay-ms <n>        Delay between image-probe waves (default: 750)
  --max-image-probes <n>      Evenly sampled direct-image probes (default: 5)
  --request-timeout-ms <n>    Per-request timeout (default: 15000)
  --min-mapping-rate <0..1>   Required Commons mapping rate (default: 0.95)
  --min-image-rate <0..1>     Required reachable image rate (default: 0.98)
  --min-image-coverage <0..1> Required conclusive probe rate (default: 0.98)
  --user-agent <value>        Verifier User-Agent sent to image hosts
  --output <path>             JSON report path; otherwise a timestamped path is used
  --base-url <url>            Verify an already running app; disables automatic startup
  --no-start-server           Do not start the formal app
  --help                      Show this help
`;
}

async function main() {
  const options = parseOptions(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage());
    return;
  }
  const report = await runVerification(options);
  const output = resolve(
    root,
    options.output ??
      join("evaluation", "runs", `stage5-catalog-${timestampName()}.json`),
  );
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(
    `\n${report.summary.passed ? "PASS" : "FAIL"}: ${report.summary.sampledRecords} records, ` +
      `${(report.summary.mappingRate * 100).toFixed(1)}% mapped, ` +
      `${(report.summary.imageReachabilityRate * 100).toFixed(1)}% images reachable ` +
      `(${(report.summary.imageProbeCoverageRate * 100).toFixed(1)}% probe coverage)\n` +
      `Report: ${output}\n`,
  );
  if (!report.summary.passed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
