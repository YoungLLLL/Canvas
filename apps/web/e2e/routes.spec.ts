import { expect, test } from "@playwright/test";

test("moves through the stable home and museum routes", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("gallery");
  await page.getByRole("link", { name: "Enter the museum" }).click();
  await expect(page).toHaveURL(/\/en\/museums\/art-institute-of-chicago$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Art Institute");
});
