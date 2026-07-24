import { expect, type Page, test } from "@playwright/test";

async function artworkInViewport(page: Page) {
  const cards = page.locator(".artwork-card");
  const index = await cards.evaluateAll((elements) =>
    elements.findIndex((element) => {
      const rect = element.getBoundingClientRect();
      return rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
    }),
  );
  expect(index).toBeGreaterThanOrEqual(0);
  return cards.nth(index);
}

test("moves through the stable home and museum routes", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Chat with.*Van Gogh/i);
  await expect(page.getByRole("button", { name: "Explore collection" })).toBeVisible();
  await page.goto("/en/museums/art-institute-of-chicago");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Art Institute");
});

test("opens the collection curtain after moving repeatedly between the first two screens", async ({
  page,
}) => {
  await page.goto("/en", { waitUntil: "domcontentloaded" });
  await page.locator("#museum").scrollIntoViewIfNeeded();
  await page.waitForTimeout(50);
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.waitForTimeout(50);
  await page.locator("#museum").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await page.mouse.wheel(0, 12);

  const curtain = page.locator(".route-transition-curtain");
  await expect(curtain).toHaveClass(/covering/);
  await expect(curtain.getByRole("progressbar")).toBeVisible();
  await expect
    .poll(() => curtain.getByRole("progressbar").getAttribute("aria-valuenow"))
    .not.toBe("0");
  await expect(curtain.getByRole("progressbar")).toContainText(/%/);
});

test("keeps the approved Demo composition usable on a mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Chat with");
  await expect(page.getByRole("button", { name: "打开今日作品《自画像》" })).toBeVisible();
  await expect(page.locator(".recommendation-card")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.goto("/zh/museums/art-institute-of-chicago");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("芝加哥艺术博物馆");
  await expect(page.getByRole("link", { name: /进入数字画廊/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});

test("loads the editorial fonts and keeps the Demo motion interactive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/zh");
  await page.evaluate(() => document.fonts.ready);

  const displayFont = await page
    .locator(".glass-card h1")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  const chineseFont = await page
    .locator(".recommendation-card h2")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(displayFont).toMatch(/Otomanopee/i);
  expect(chineseFont).toMatch(/Noto Sans SC/i);

  await page.waitForTimeout(1200);
  const unreadableText = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return (
          !element.closest(".canvium-loading-screen") &&
          element.children.length === 0 &&
          Boolean(element.textContent?.trim()) &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.right > 0 &&
          rect.left < innerWidth &&
          rect.bottom > 0 &&
          rect.top < innerHeight &&
          style.visibility === "visible" &&
          style.display !== "none" &&
          Number.parseFloat(style.fontSize) < 12
        );
      })
      .map((element) => `${element.textContent?.trim()}: ${getComputedStyle(element).fontSize}`),
  );
  expect(unreadableText).toEqual([]);

  const artwork = page.locator(".daily-art");
  const initialTransform = await artwork.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(1320, 180);
  await expect
    .poll(() => artwork.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initialTransform);

  await page.goto("/zh/museums/art-institute-of-chicago");
  const globe = page.locator(".museum-globe");
  await expect(globe).toHaveClass(/is-webgl-ready/);
  await expect(globe.locator("canvas")).toBeVisible();
  await expect(globe.locator("canvas")).toHaveCSS("filter", "none");
  await expect(globe.locator(".globe-marker.selected .globe-marker-dot")).toBeVisible();
});

test("browses the live ARTIC collection and opens a shareable artwork route", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Art Institute");
  await page.getByRole("button", { name: "Pause motion" }).click();

  const firstArtwork = await artworkInViewport(page);
  await expect(firstArtwork).toBeVisible();
  expect(
    await firstArtwork.evaluate((element) => Number.parseFloat(getComputedStyle(element).opacity)),
  ).toBeGreaterThan(0.5);
  await firstArtwork.click();

  await expect(page).toHaveURL(/\/en\/artworks\/artic-\d+$/);
  await expect(page.locator(".art-pane img, .art-pane .artwork-no-image")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.locator(".viewer-controls")).toContainText("125%");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".viewer-controls")).toContainText("100%");
  await page.getByRole("button", { name: "View artwork records and sources" }).click();
  await expect(page.getByRole("link", { name: "View museum record" })).toBeVisible();
});

test("shows bilingual museum and artwork titles with the agreed editorial fonts", async ({
  page,
}) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: "Browse the full collection" }).click();
  await expect(page.getByRole("heading", { name: /馆藏作品.*THE COLLECTION/ })).toBeVisible();
  await expect(page.getByText("芝加哥艺术博物馆", { exact: true }).last()).toBeVisible();
  await expect(page.getByText("ART INSTITUTE OF CHICAGO", { exact: true }).last()).toBeVisible();
  const firstCard = page.locator(".collection-result-card").first();
  await expect(firstCard.locator("h3")).toBeVisible();
  await expect(firstCard.locator("h4")).toBeVisible();
  expect(
    await firstCard.locator("h3").evaluate((node) => getComputedStyle(node).fontFamily),
  ).toMatch(/Noto Sans SC/i);
  expect(
    await firstCard.locator("h4").evaluate((node) => getComputedStyle(node).fontFamily),
  ).toMatch(/Otomanopee One/i);
  await expect(page.getByRole("searchbox")).toHaveCount(0);
});

test("restores collection URL, scroll position, and card focus after opening an artwork", async ({
  page,
}) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: "Browse the full collection" }).click();
  const card = page.locator(".collection-result-card").first();
  await card.scrollIntoViewIfNeeded();
  const collectionUrl = page.url();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const cardId = await card.getAttribute("id");
  await card.click();
  await page.getByRole("button", { name: "Close artwork and return to gallery" }).click();

  await expect(page).toHaveURL(collectionUrl);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(scrollBefore - 2);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe(cardId);
});

test("loads more collection works automatically near the end of the page", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: "Browse the full collection" }).click();
  const cards = page.locator(".collection-result-card");
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(0);
  await page.locator(".collection-load-sentinel").scrollIntoViewIfNeeded();
  await expect.poll(() => cards.count(), { timeout: 20_000 }).toBeGreaterThan(initialCount);
  await expect(page.locator("#collection-pagination")).toHaveCount(0);
});

test("keeps bilingual results and automatic loading usable at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: /浏览完整馆藏/ }).click();
  await expect(page.locator(".collection-result-card").first()).toBeVisible();
  await expect(page.locator(".collection-museum-copy")).toContainText("芝加哥艺术博物馆");
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.locator("#collection-pagination")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
