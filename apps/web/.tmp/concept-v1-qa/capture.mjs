import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 943 } });
page.on("console", (message) => console.log("BROWSER", message.type(), message.text()));
page.on("pageerror", (error) => console.log("PAGEERROR", error.message));

await page.goto("http://127.0.0.1:3000/concept-v1");
await page.waitForTimeout(3000);
await page.screenshot({ path: ".tmp/concept-v1-qa/audit-home-2.png" });

const homeAudit = await page.evaluate(() => {
  const card = document.querySelector(".glass-card")?.getBoundingClientRect();
  const title = document.querySelector(".glass-card h1")?.getBoundingClientRect();
  const action = document.querySelector(".glass-card .primary-wide")?.getBoundingClientRect();
  const globe = document.querySelector(".shared-globe");
  return {
    scrollY: window.scrollY,
    heroHeight: document.querySelector("#conceptHome")?.clientHeight,
    card: card && { top: card.top, bottom: card.bottom },
    title: title && { top: title.top, bottom: title.bottom },
    action: action && { top: action.top, bottom: action.bottom },
    globeOpacity: globe && getComputedStyle(globe).opacity,
    globeInlineOpacity: globe?.style.opacity,
    globeClass: globe?.className,
  };
});

await page.evaluate(() => {
  const museum = document.querySelector("#conceptMuseum");
  window.scrollTo({ top: museum?.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
});
await page.waitForTimeout(3000);
await page.screenshot({ path: ".tmp/concept-v1-qa/audit-museum-2.png" });

const museumAudit = await page.evaluate(() => {
  const copy = document.querySelector(".museum-copy");
  const globe = document.querySelector(".shared-globe");
  return {
    scrollY: window.scrollY,
    copyVisible: copy && getComputedStyle(copy).opacity,
    globeOpacity: globe && getComputedStyle(globe).opacity,
    globeClasses: globe?.className,
  };
});

console.log(JSON.stringify({ homeAudit, museumAudit }, null, 2));
await browser.close();
