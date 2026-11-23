import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Diagnostics } from "../src/app.ts";

const snapshot = (page: Page): Promise<Diagnostics> => page.evaluate(() => window.__AV3D__!.snapshot());
async function ready(page: Page) { await expect(page.locator("#app")).toHaveAttribute("data-ready", "true", { timeout: 30000 }); }
async function frames(page: Page, count = 8) {
  const prior = (await snapshot(page)).frames;
  await page.waitForFunction(({ prior, count }) => window.__AV3D__!.snapshot().frames >= prior + count, { prior, count });
}
async function walk(page: Page, key: string, axis: number, target: number) {
  await page.keyboard.down(key);
  try { await page.waitForFunction(({ axis, target }) => window.__AV3D__!.snapshot().position[axis]! > target, { axis, target }); }
  finally { await page.keyboard.up(key); }
}
test.afterEach(async ({ page }) => { if (!page.isClosed()) await page.goto("about:blank"); });

test("graphics and sensitivity persist, resize correctly and leave pause/session controls intact", async ({ page }) => {
  await page.goto("./?debug=1"); await ready(page);
  const before = await snapshot(page);
  await page.getByRole("button", { name: "Pause / settings" }).click();
  await page.getByRole("combobox", { name: "Graphics quality" }).selectOption("low");
  await expect.poll(async () => (await snapshot(page)).performance?.renderWidth).toBe(832);
  expect((await snapshot(page)).performance?.shadowSize).toBe(512);
  await page.getByRole("slider", { name: "Camera sensitivity" }).focus();
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.down("w"); await frames(page); await page.keyboard.up("w");
  expect((await snapshot(page)).position).toEqual(before.position);
  expect((await snapshot(page)).character?.idleFrame).toBeGreaterThanOrEqual(0);
  await page.setViewportSize({ width: 960, height: 640 });
  await expect.poll(async () => (await snapshot(page)).performance?.renderWidth).toBe(624);
  await page.reload(); await ready(page);
  expect((await snapshot(page)).performance?.quality).toBe("low");
  expect((await snapshot(page)).performance?.shadowSize).toBe(512);
  await page.getByRole("button", { name: "Pause / settings" }).click();
  await expect(page.getByRole("slider", { name: "Camera sensitivity" })).toHaveValue("1.5");
  await expect(page.getByRole("combobox", { name: "Graphics quality" })).toHaveValue("low");
  await page.getByRole("combobox", { name: "Graphics quality" }).selectOption("balanced");
  await expect.poll(async () => (await snapshot(page)).performance?.renderWidth).toBe(816);
  expect((await snapshot(page)).performance?.shadowSize).toBe(1024);
  await page.getByRole("combobox", { name: "Graphics quality" }).selectOption("high");
  await expect.poll(async () => (await snapshot(page)).performance?.renderWidth).toBe(960);
  expect((await snapshot(page)).performance?.shadowSize).toBe(2048);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  expect((await snapshot(page)).errors).toEqual([]);
});

test("normal walk to van: camera volume stays outside bodywork, near avatar hides, return restores it", async ({ page }, info) => {
  await page.goto("./?debug=1"); await ready(page);
  await page.getByRole("button", { name: "Pause / settings" }).click();
  await page.getByRole("combobox", { name: "Graphics quality" }).selectOption("low");
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await walk(page, "w", 2, -2); await walk(page, "d", 0, 3.8);
  await walk(page, "w", 2, 4.5); await walk(page, "d", 0, 4.36);
  await page.keyboard.down("d"); await frames(page); await page.keyboard.up("d");
  await page.mouse.move(900, 400); await page.mouse.down();
  await page.mouse.move(586, 400, { steps: 12 }); await page.mouse.up();
  await expect.poll(async () => (await snapshot(page)).actualCameraDistance).toBeLessThan(.3);
  const near = await snapshot(page);
  expect(near.cameraPosition[0]).toBeLessThan(4.52); // Van begins at x=4.7; sweep radius .18.
  expect(near.character?.opacity).toBe(0);
  await page.screenshot({ path: info.outputPath("van-tight-orbit.png") });
  await page.mouse.move(586, 400); await page.mouse.down();
  await page.mouse.move(900, 400, { steps: 12 }); await page.mouse.up();
  await expect.poll(async () => (await snapshot(page)).actualCameraDistance).toBeGreaterThan(5.4);
  expect((await snapshot(page)).character?.opacity).toBe(1);
  expect((await snapshot(page)).position).toEqual(near.position);
  expect((await snapshot(page)).errors).toEqual([]);
  await page.screenshot({ path: info.outputPath("van-clear-orbit.png") });
});
