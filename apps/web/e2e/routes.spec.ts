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

  await page.mouse.wheel(0, 32);

  const curtain = page.locator(".route-transition-curtain");
  await expect(curtain).toHaveClass(/covering/);
  await expect(curtain.getByRole("progressbar")).toBeVisible();
  await expect
    .poll(() => curtain.getByRole("progressbar").getAttribute("aria-valuenow"))
    .not.toBe("0");
  await expect(curtain.getByRole("progressbar")).toContainText(/%/);
});

test("returns from the collection without a pointer-style hydration mismatch", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("hydrated but some attributes")) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/zh");
  await page.locator(".canvium-loading-screen").waitFor({ state: "hidden" });
  await page.mouse.move(1_300, 180);
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/museums\/art-institute-of-chicago\/collection$/, {
    timeout: 20_000,
  });
  await expect(page.locator(".route-transition-curtain")).not.toHaveClass(/covering|revealing/, {
    timeout: 10_000,
  });

  await page.mouse.wheel(0, -50);
  await expect(page).toHaveURL(/\/zh#museum$/, { timeout: 20_000 });
  await page.waitForTimeout(500);
  expect(hydrationErrors).toEqual([]);
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
  await expect(
    page.locator(".collection-marquee-set").first().locator(".artwork-marquee-item"),
  ).toHaveCount(8);
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

test("shows bilingual artwork titles with the agreed editorial fonts", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: "Browse the full collection" }).click();
  await expect(page.getByRole("heading", { name: "The collection" })).toHaveCount(1);
  await expect(page.locator(".collection-catalog-heading")).toHaveCount(0);
  await expect(page.locator(".collection-museum-introduction")).toHaveCount(0);
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

test("scrubs the featured collection into the waterfall instead of jumping", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  const firstCard = page.locator(".collection-result-card").first();
  const translateY = () =>
    firstCard.evaluate((element) => {
      const transform = getComputedStyle(element).transform;
      return transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42;
    });

  await expect.poll(translateY).toBeGreaterThan(200);
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(1_000);
  const middle = await translateY();
  await page.evaluate(() => window.scrollTo({ top: 780, behavior: "instant" }));
  await page.waitForTimeout(1_000);
  const end = await translateY();

  expect(middle).toBeGreaterThan(20);
  expect(middle).toBeLessThan(200);
  expect(end).toBeLessThan(4);
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
  await page
    .getByRole("button", { name: "Exit the artwork conversation and return to the gallery" })
    .click();

  await expect(page).toHaveURL(collectionUrl);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThanOrEqual(scrollBefore - 2);
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe(cardId);
});

test("always re-enters the collection at its featured top from the museum screen", async ({
  page,
}) => {
  const collectionPath = "/en/museums/art-institute-of-chicago/collection";
  await page.goto(collectionPath);
  await page.evaluate((path) => {
    sessionStorage.setItem(
      "canvium:collection-return",
      JSON.stringify({
        artworkKey: "artic-80607",
        collectionUrl: path,
        scrollY: 1_400,
      }),
    );
  }, collectionPath);
  await page.goto("/en#museum");
  await page.locator("#museum").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 32);
  await expect(page).toHaveURL(collectionPath, { timeout: 20_000 });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
});

test("loads more collection works automatically near the end of the page", async ({ page }) => {
  await page.goto("/en/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: "Browse the full collection" }).click();
  const cards = page.locator(".collection-result-card");
  const initialCount = await cards.count();
  expect(initialCount).toBeGreaterThan(0);
  await page.locator(".collection-load-sentinel").scrollIntoViewIfNeeded();
  await expect(page.getByText("Loading more artworks", { exact: true })).toBeVisible();
  await expect.poll(() => cards.count(), { timeout: 20_000 }).toBeGreaterThan(initialCount);
  await expect
    .poll(() =>
      cards.evaluateAll(
        (elements) =>
          elements.filter((element) => {
            const style = getComputedStyle(element);
            return style.opacity === "0" || style.visibility === "hidden";
          }).length,
      ),
    )
    .toBe(0);
  await expect(page.locator("#collection-pagination")).toHaveCount(0);
});

test("keeps bilingual results and automatic loading usable at a mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh/museums/art-institute-of-chicago/collection");
  await page.getByRole("link", { name: /浏览完整馆藏/ }).click();
  await expect(page.locator(".collection-result-card").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "馆藏作品" })).toHaveCount(1);
  await expect(page.locator(".collection-catalog-heading")).toHaveCount(0);
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await expect(page.locator("#collection-pagination")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
