import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../apps/web/node_modules/playwright");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 463, height: 760 } });
await page.goto("http://localhost:3000/zh/chat-demo", { waitUntil: "domcontentloaded" });
await page.getByRole("button", { name: /作品聊天|聊天|Talk with/i }).first().click();
await page.waitForTimeout(600);

const result = await page.locator("[role=dialog]").evaluate((node) => {
  const matchedRules = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (rule.cssText?.includes("chatSurface")) matchedRules.push(rule.cssText);
    }
  }
  const style = getComputedStyle(node);
  return {
    supports: CSS.supports("backdrop-filter", "blur(1px)"),
    inlineSupport: node.style.backdropFilter,
    computed: style.backdropFilter,
    webkitComputed: style.webkitBackdropFilter,
    className: node.className,
    matchedRules,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
