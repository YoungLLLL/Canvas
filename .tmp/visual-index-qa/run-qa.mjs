import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "../../apps/web/node_modules/playwright/index.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(here, "../..");
const webRoot = path.join(workspace, "apps/web");
const nextBin = path.join(webRoot, "node_modules/next/dist/bin/next");
const origin = "http://127.0.0.1:3000";
const logs = [];

let server;

async function waitForServer() {
  try {
    const current = await fetch(`${origin}/en`);
    if (current.ok) return;
  } catch {
    server = spawn(
      process.execPath,
      [nextBin, "dev", "--hostname", "127.0.0.1", "--port", "3000"],
      {
        cwd: webRoot,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    server.stdout.on("data", (chunk) => logs.push(chunk.toString()));
    server.stderr.on("data", (chunk) => logs.push(chunk.toString()));
  }
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/en`);
      if (response.ok) return;
    } catch {
      // The development server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Dev server did not become ready.\n${logs.join("")}`);
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleErrors = [];
  desktop.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await desktop.goto(`${origin}/en`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: path.join(here, "desktop-top.png") });
  await desktop.locator("#index").scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(900);
  await desktop.screenshot({ path: path.join(here, "desktop-index.png") });
  await desktop.evaluate(() => window.scrollTo({ top: 3300, behavior: "instant" }));
  await desktop.waitForTimeout(900);
  await desktop.screenshot({ path: path.join(here, "desktop-middle.png") });
  const desktopState = await desktop.evaluate(() => ({
    artworkLinks: document.querySelectorAll('a[href*="/artworks/"]').length,
    images: document.images.length,
    loadedImages: [...document.images].filter((image) => image.complete && image.naturalWidth > 0)
      .length,
    height: document.documentElement.scrollHeight,
    bodyClass: document.body.className,
  }));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto(`${origin}/zh`, { waitUntil: "networkidle" });
  await mobile.screenshot({ path: path.join(here, "mobile-top.png") });
  await mobile.locator("#index").scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(700);
  await mobile.screenshot({ path: path.join(here, "mobile-index.png") });
  const mobileState = await mobile.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
    height: document.documentElement.scrollHeight,
  }));

  console.log(JSON.stringify({ consoleErrors, desktopState, mobileState }, null, 2));
} finally {
  await browser?.close();
  server?.kill();
}
