import { expect, test } from "@playwright/test";

test("shows the initial monitoring workspace", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "SYLVASENSE" })).toBeVisible();
  await expect(page.getByText("No monitoring data configured")).toBeVisible();
});
