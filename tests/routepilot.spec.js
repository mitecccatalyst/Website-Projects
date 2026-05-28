import { test, expect } from "@playwright/test";

test.describe("RoutePilot planner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads with 60 slots but shows 10 first", async ({ page }) => {
    await expect(page.locator(".slot-row")).toHaveCount(60);
    await expect(page.locator(".slot-row:not(.slot-hidden)")).toHaveCount(10);
    await expect(page.locator(".slot-postal")).toHaveCount(60);
    await expect(page.locator(".slot-address")).toHaveCount(60);
    await expect(page.locator(".slot-city")).toHaveCount(60);
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

  test("mixed pasted addresses create structured rows and draft pins", async ({ page }) => {
    await page.locator("#bulkAddresses").fill([
      "- 123 Main St, Toronto, M5V 2T6",
      "45 Market Ave | Etobicoke | M9W 5L2",
      "900 North Road Toronto ON M4M 1A1",
    ].join("\n"));
    await page.getByRole("button", { name: "Fill slots" }).click();

    await expect(page.locator("#stopCounter")).toHaveText("3 stops");
    await expect(page.locator(".slot-address").first()).toHaveValue("123 Main St");
    await expect(page.locator(".slot-city").first()).toHaveValue("Toronto");
    await expect(page.locator(".slot-postal").first()).toHaveValue("M5V 2T6");
    await expect(page.locator(".map-node.draft")).toHaveCount(3);
  });

  test("typed voice request updates notes, traffic, days, and route advice", async ({ page }) => {
    await page.getByRole("button", { name: "Sample" }).click();
    await page.locator("#voiceTranscript").fill("Start from the warehouse, go north west first, use busy traffic, two days, gas near midpoint, eight hours");
    await page.getByRole("button", { name: "Analyze request" }).click();

    await expect(page.locator("#driverNotes")).toHaveValue(/Voice request:/);
    await expect(page.locator("#tripDays")).toHaveValue("2");
    await expect(page.locator("#maxHours")).toHaveValue("8");
    await expect(page.locator("[data-traffic='busy']")).toHaveClass(/active/);
    await expect(page.locator("#voiceAgentStatus")).toContainText("Analyzed request");
    await expect(page.locator(".route-card")).toHaveCount(2);
  });

  test("launch controls include PWA manifest, secure proxy setup, and saved data clearing", async ({ page }) => {
    await expect(page.locator("link[rel='manifest']")).toHaveAttribute("href", "./manifest.webmanifest");
    await expect(page.locator("#mapProxyBase")).toBeVisible();

    await page.getByRole("button", { name: "Verify exact pins" }).click();
    await expect(page.locator("#geocodeStatus")).toContainText("backend");

    await page.locator("#startAddress").fill("1 Dundas St W, Toronto");
    await page.locator(".slot-address").first().fill("123 Main St");
    await page.locator(".slot-city").first().fill("Toronto");
    await page.getByRole("button", { name: "Save plan" }).click();
    await page.getByRole("button", { name: "Delete saved data" }).click();
    await expect(page.locator("#assistantMessage")).toContainText("Saved browser data is deleted");
  });

  test("secure proxy can provide exact pins and live traffic times", async ({ page }) => {
    await page.route("**/.netlify/functions/google-geocode", async (route) => {
      const request = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          configured: true,
          results: request.addresses.map((query, index) => ({
            query,
            status: "OK",
            formatted: query,
            lat: 43.65 + index * 0.01,
            lng: -79.38 - index * 0.01,
          })),
        }),
      });
    });

    await page.route("**/.netlify/functions/google-route", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          configured: true,
          source: "google-routes-api",
          durationMinutes: 42,
          staticDurationMinutes: 35,
          trafficDelayMinutes: 7,
          distanceMiles: 18,
          segmentCount: 1,
        }),
      });
    });

    await page.locator("#startAddress").fill("1 Dundas St W, Toronto");
    await page.locator("#bulkAddresses").fill("123 Main St, Toronto, M5V 2T6\n45 Market Ave, Toronto, M4M 1A1");
    await page.getByRole("button", { name: "Fill slots" }).click();
    await page.getByRole("button", { name: "Optimize routes" }).click();
    await page.getByRole("button", { name: "Get live times" }).click();

    await expect(page.locator(".map-node.exact")).toHaveCount(2);
    await expect(page.locator(".route-card").first()).toContainText("Live Google traffic: 42m drive, 18 mi.");
    await expect(page.locator("#assistantMessage")).toContainText("Live Google traffic is active");
  });
});
