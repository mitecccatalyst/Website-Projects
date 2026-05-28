import { test, expect } from "@playwright/test";

test.describe("RoutePilot planner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with 60 slots but shows 10 first", async ({ page }) => {
    await expect(page.locator(".slot-row")).toHaveCount(60);
    await expect(page.locator(".slot-row:not(.slot-hidden)")).toHaveCount(10);
  });

  test("sample creates 3 normal routes and 2 busy routes", async ({ page }) => {
    await page.getByRole("button", { name: "Sample" }).click();
    await expect(page.locator("#stopCounter")).toHaveText("12 stops");
    await expect(page.locator(".route-card")).toHaveCount(3);

    await page.getByRole("button", { name: "Busy" }).click();
    await expect(page.locator("#routeMode")).toHaveText("Busy: top 2 only");
    await expect(page.locator(".route-card")).toHaveCount(2);
  });

  test("large route creates Google route segments", async ({ page }) => {
    await page.locator("#startAddress").fill("1 Dundas St W, Toronto");
    const stops = Array.from({ length: 60 }, (_, index) => `${100 + index} Test Stop Ave, Toronto`).join("\n");
    await page.locator("#bulkAddresses").fill(stops);
    await page.getByRole("button", { name: "Fill slots" }).click();

    await page.getByRole("button", { name: "Optimize routes" }).click();
    await expect(page.locator("#stopCounter")).toHaveText("60 stops");
    await expect(page.locator(".segment-links a")).toHaveCount(3);
  });
});
