import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { runStage6Job } from "../ai/stage6/pipeline.ts";
import { stage6FixtureProvider } from "../ai/stage6/providers/fixture.ts";
import { stage6QwenVlProvider } from "../ai/stage6/providers/qwen-vl.ts";

type CliOptions = {
  jobPath: string;
  outputRoot: string;
  publish: boolean;
  force: boolean;
  limit?: number;
  baseUrl?: string;
  provider: "fixture" | "qwen-vl";
  locale?: string;
  report?: string;
};

function usage(): string {
  return [
    "Usage: npm run generate:stage6 -- --job <path> [options]",
    "",
    "Options:",
    "  --output <path>  Versioned artifact root (default: data/generated/artwork-knowledge)",
    "  --publish        Publish only candidates whose review status already passed",
    "  --force          Ignore matching successful run-state entries",
    "  --limit <count>   Process only the first N artwork entries",
    "  --base-url <url>  Override the job's local application URL",
    "  --provider <id>    fixture or qwen-vl (default: fixture)",
    "  --locale <locale>   Process only this locale from each selected artwork",
    "  --report <path>     Write the run report to this JSON file",
    "  --help           Show this help",
  ].join("\n");
}

function parseArgs(argv: string[]): CliOptions {
  let jobPath = "";
  let outputRoot = "data/generated/artwork-knowledge";
  let publish = false;
  let force = false;
  let limit: number | undefined;
  let baseUrl: string | undefined;
  let provider: CliOptions["provider"] = "fixture";
  let locale: string | undefined;
  let report: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help") {
      console.log(usage());
      process.exit(0);
    } else if (argument === "--job") {
      jobPath = argv[++index] ?? "";
    } else if (argument === "--output") {
      outputRoot = argv[++index] ?? "";
    } else if (argument === "--publish") {
      publish = true;
    } else if (argument === "--force") {
      force = true;
    } else if (argument === "--limit") {
      limit = Number(argv[++index]);
      if (!Number.isInteger(limit) || limit < 1)
        throw new Error("--limit must be a positive integer");
    } else if (argument === "--base-url") {
      baseUrl = new URL(argv[++index] ?? "").toString().replace(/\/$/, "");
    } else if (argument === "--provider") {
      const selected = argv[++index];
      if (!["fixture", "qwen-vl"].includes(selected))
        throw new Error("--provider must be fixture or qwen-vl");
      provider = selected as CliOptions["provider"];
    } else if (argument === "--locale") {
      locale = argv[++index];
      if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(locale ?? ""))
        throw new Error("--locale must be a valid locale such as en or zh");
    } else if (argument === "--report") {
      report = argv[++index];
      if (!report) throw new Error("--report requires a path");
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }

  if (!jobPath) throw new Error("--job is required");
  if (!outputRoot) throw new Error("--output cannot be empty");
  return {
    jobPath: path.resolve(jobPath),
    outputRoot: path.resolve(outputRoot),
    publish,
    force,
    limit,
    baseUrl,
    provider,
    locale,
    report,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const job = JSON.parse(await readFile(options.jobPath, "utf8"));
  if (options.limit) job.items = job.items.slice(0, options.limit);
  if (options.locale) {
    job.items = job.items
      .map((item: { sourceId: string; locales: string[] }) => ({
        ...item,
        locales: item.locales.filter((locale) => locale === options.locale),
      }))
      .filter((item: { locales: string[] }) => item.locales.length > 0);
    if (job.items.length === 0)
      throw new Error(`job has no items for locale ${options.locale}`);
  }
  if (options.baseUrl) job.baseUrl = options.baseUrl;
  const report = await runStage6Job(job, {
    outputRoot: options.outputRoot,
    provider:
      options.provider === "qwen-vl"
        ? stage6QwenVlProvider
        : stage6FixtureProvider,
    publish: options.publish,
    force: options.force,
  });
  if (options.report) {
    const reportPath = path.resolve(options.report);
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.results.some((result) => result.status === "failed"))
    process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
