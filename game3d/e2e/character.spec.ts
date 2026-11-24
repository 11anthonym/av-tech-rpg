import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Diagnostics } from "../src/app.ts";
const snapshot = (page: Page): Promise<Diagnostics> => page.evaluate(() => window.__AV3D__!.snapshot());
test.afterEach(async ({ page }) => { if (!page.isClosed()) await page.goto("about:blank"); });

test("real human animates through keyboard travel, blends to idle at collision and freezes on pause", async ({ page }) => {
  await page.goto("./?debug=1");
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true", { timeout: 30000 });
  const start = await snapshot(page);
  expect(start.character?.joints).toBe(80);
  expect(start.character?.height).toBe(1.78);
  expect(start.character?.walkWeight).toBe(0);
  await page.keyboard.down("w");
  await expect.poll(async () => (await snapshot(page)).character?.walkWeight).toBeGreaterThan(0.8);
  const walking = await snapshot(page);
  expect(walking.character?.speed).toBeGreaterThan(1);
  await page.waitForFunction(z => window.__AV3D__!.snapshot().position[2]! > z + 0.25, walking.position[2]!);
  const moved = await snapshot(page);
  expect(moved.character?.walkFrame).not.toBe(walking.character?.walkFrame);
  expect(moved.character?.pose).not.toEqual(walking.character?.pose);
  await expect.poll(async () => (await snapshot(page)).position[2], { timeout: 15000 }).toBeGreaterThan(-0.85);
  await expect.poll(async () => (await snapshot(page)).character?.walkWeight).toBeLessThan(0.01);
  expect((await snapshot(page)).character?.speed).toBeLessThan(0.08);
  await page.keyboard.up("w");
  await page.getByRole("button", { name: "Pause / settings" }).click();
  // Save at the actual low-speed collision resting point, then reload there.
  const resting = await snapshot(page);
  await page.reload();
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true", { timeout: 30000 });
  const reloaded = await snapshot(page);
  expect(Math.hypot(...reloaded.position.map((n, i) => n - resting.position[i]!))).toBeLessThan(0.03);
  await page.getByRole("button", { name: "Pause / settings" }).click();
  const paused = await snapshot(page);
  await page.waitForFunction(tick => window.__AV3D__!.snapshot().loopTicks > tick + 5, paused.loopTicks);
  const still = await snapshot(page);
  expect(still.character?.idleFrame).toBe(paused.character?.idleFrame);
  expect(still.character?.pose).toEqual(paused.character?.pose);
  expect(still.position).toEqual(paused.position);
  expect(still.frames).toBeLessThanOrEqual(paused.frames + 1);
  expect(still.errors).toEqual([]);
});

test("a missing technician reports failure without substituting a capsule", async ({ page }) => {
  await page.route("**/assets/technician.glb", route => route.fulfill({ status: 404, body: "Missing technician fixture" }));
  await page.goto("./?debug=1");
  await expect(page.locator("#error-panel")).toBeVisible();
  expect((await snapshot(page)).character).toBeNull();
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "false");
});

test("missing shop lighting fails visibly instead of waiting forever", async ({ page }) => {
  await page.route("**/assets/shop-lighting.env", route => route.fulfill({ status: 404, body: "Missing environment fixture" }));
  await page.goto("./");
  await expect(page.locator("#error-panel")).toBeVisible();
  await expect(page.locator("#error-copy")).toContainText("Shop lighting could not load");
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "false");
});
