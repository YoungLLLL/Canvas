import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../apps/web/node_modules/playwright");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 527, height: 481 } });
await page.goto("https://www.getty.edu/tracingart/", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await page.waitForTimeout(3_000);

await page.locator(".nav__btnAbout").click();
await page.waitForTimeout(1_000);

const heading = page.getByText("About the Getty Provenance Index", { exact: true });
await heading.waitFor({ state: "visible" });
const result = await heading.evaluate((node) => {
  const ancestry = [];
  let current = node;
  for (let index = 0; current && index < 8; index += 1, current = current.parentElement) {
    const style = getComputedStyle(current);
    const rect = current.getBoundingClientRect();
    ancestry.push({
      tag: current.tagName,
      className: current.className,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      background: style.background,
      backgroundColor: style.backgroundColor,
      backdropFilter: style.backdropFilter,
      filter: style.filter,
      opacity: style.opacity,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      overflow: style.overflow,
    });
  }
  return ancestry;
});
console.log(JSON.stringify(result, null, 2));

await page.screenshot({ path: ".tmp/getty-live.png" });

await browser.close();
