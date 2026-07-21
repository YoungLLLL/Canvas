import { expect, test } from "@playwright/test";

test("moves through the stable home and museum routes", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/gallery/i);
  await page.getByRole("link", { name: "Enter the museum" }).click();
  await expect(page).toHaveURL(/\/en\/museums\/art-institute-of-chicago$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Art Institute");
});

test("keeps the approved Demo composition usable on a mobile screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Canvium Gallery");
  await expect(page.getByRole("link", { name: "打开今日作品《自画像》" })).toBeVisible();
  await expect(page.locator(".home-recommendation")).toBeVisible();
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
    .locator(".home-artist-card h2")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  const chineseFont = await page
    .locator(".home-recommendation h2")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(displayFont).toMatch(/Cormorant/i);
  expect(chineseFont).toMatch(/Cormorant|Noto Serif SC/i);

  await page.waitForTimeout(1200);
  const artwork = page.locator(".home-daily-art");
  const initialTransform = await artwork.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(1320, 180);
  await expect
    .poll(() => artwork.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initialTransform);

  await page.goto("/zh/museums/art-institute-of-chicago");
  const globe = page.locator(".museum-globe");
  await expect(globe).toHaveClass(/is-webgl-ready/);
  await expect(globe.locator("canvas")).toBeVisible();
  await expect(globe.locator(".globe-marker.selected .globe-marker-dot")).toBeVisible();
});

test("browses the live ARTIC collection and opens a shareable artwork route", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("paintings");

  const firstArtwork = page.locator(".artwork-card").first();
  await expect(firstArtwork).toBeVisible();
  await firstArtwork.click();

  await expect(page).toHaveURL(/\/en\/artworks\/artic-\d+$/);
  await expect(page.locator(".artwork-stage img, .artwork-stage .image-fallback")).toBeVisible();
  await page.getByRole("button", { name: "Zoom in" }).click();
  await expect(page.locator(".viewer-controls")).toContainText("150%");
  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator(".viewer-controls")).toContainText("100%");
  await expect(page.getByText("CC0 1.0")).toBeVisible();
  await expect(page.getByRole("link", { name: "Museum source" })).toBeVisible();
});

test("writes submitted filters to a canonical shareable URL and keeps them on language switch", async ({
  page,
}) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("searchbox").fill("monet");
  await page.getByLabel("From year").fill("1800");
  await page.getByLabel("Sort").selectOption("title-asc");
  await page.getByRole("button", { name: /Apply filters/ }).click();

  await expect(page).toHaveURL(
    /\/en\/museums\/art-institute-of-chicago\/collection\?q=monet&from=1800&sort=title-asc$/,
  );
  await page.getByRole("link", { name: "ZH" }).click();
  await expect(page).toHaveURL(
    /\/zh\/museums\/art-institute-of-chicago\/collection\?q=monet&from=1800&sort=title-asc$/,
  );
});

test("restores collection URL, scroll position, and card focus after opening an artwork", async ({
  page,
}) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection?q=monet");
  const card = page.locator(".artwork-card").nth(2);
  await card.scrollIntoViewIfNeeded();
  const collectionUrl = page.url();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const cardId = await card.getAttribute("id");
  await card.click();
  await page.getByRole("button", { name: "Back to collection" }).click();

  await expect(page).toHaveURL(collectionUrl);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(scrollBefore - 2);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe(cardId);
});

test("shows rights-safe metadata-only paintings without fabricating an image", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection?availability=metadata");
  await expect(page.locator(".metadata-artwork-card").first()).toBeVisible();
  await expect(
    page.locator(".metadata-artwork-card").first().getByText("Metadata-only record"),
  ).toBeVisible();
  await page.locator(".artwork-card").first().click();
  await expect(page.locator(".artwork-no-image")).toBeVisible();
  await expect(page.getByText("No displayed image")).toBeVisible();
  await expect(page.getByRole("link", { name: "Museum source" })).toBeVisible();
});

test("keeps filters, results, rights, and navigation usable at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/museums/art-institute-of-chicago/collection?q=monet");
  await expect(page.getByRole("searchbox")).toHaveValue("monet");
  await expect(page.getByLabel("图片状态")).toBeVisible();
  await expect(page.locator(".artwork-card").first()).toBeVisible();
  await expect(page.locator("#collection-pagination")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
