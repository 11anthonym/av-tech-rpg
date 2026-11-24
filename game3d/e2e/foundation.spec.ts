import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import fs from "node:fs";
import type { Diagnostics } from "../src/app.ts";

const legacyKey = "av-tech-rpg-save-v1";
const legacyBytes = '{"legacy-preservation-sentinel":true}';
const snapshot = (page: Page): Promise<Diagnostics> => page.evaluate(() => window.__AV3D__!.snapshot());
// Stop the WebGL render loop before the recorder/context is finalized. This
// avoids software-GPU ReadPixels teardown stalls, without skipping assertions.
test.afterEach(async ({ page }) => { if (!page.isClosed()) await page.goto("about:blank"); });
async function ready(page: Page) {
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true", { timeout: 30000 });
}
async function frames(page: Page, count = 8) {
  const prior = (await snapshot(page)).loopTicks;
  await page.waitForFunction(({ prior, count }) => window.__AV3D__!.snapshot().loopTicks >= prior + count, { prior, count });
}

test("normal keyboard/mouse play: follow, collision, orbit, interaction, focus and reload", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on("requestfailed", request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: legacyKey, value: legacyBytes });
  await page.goto("./?debug=1");
  await ready(page);
  const initial = await snapshot(page);
  expect(initial.webgl).toBe(2);
  expect(initial.activeMeshes).toBeGreaterThan(0);
  expect(initial.actualCameraDistance).toBeLessThan(initial.camera.distance); // Front wall shortens orbit.
  expect(initial.cameraPosition[2]).toBeGreaterThan(-6.75);
  await page.screenshot({ path: testInfo.outputPath("m1-shop.png") });

  await page.keyboard.down("w");
  await page.waitForFunction(() => window.__AV3D__!.snapshot().position[2]! > -1, null, { timeout: 12000 });
  await frames(page);
  await page.keyboard.up("w");
  const atBench = await snapshot(page);
  expect(atBench.position[2]).toBeGreaterThan(-1);
  expect(atBench.position[2]).toBeLessThan(-0.75); // Input continued against a solid workbench.
  expect(atBench.cameraPosition[2]).toBeGreaterThan(initial.cameraPosition[2]!);
  await expect(page.getByRole("button", { name: "Inspect workbench" })).toBeEnabled();
  await page.keyboard.press("e");
  await expect(page.getByRole("heading", { name: "Workbench checked", exact: true })).toBeVisible();
  const paused = await snapshot(page);
  await page.keyboard.down("w");
  await frames(page);
  await page.keyboard.up("w");
  expect((await snapshot(page)).position).toEqual(paused.position);
  await page.getByRole("button", { name: "Back to shop" }).click();
  await page.keyboard.press("e");
  await expect(page.getByRole("heading", { name: "Workbench already checked" })).toBeVisible();
  expect((await snapshot(page)).completedActions).toEqual(["shop.inspect-workbench"]);
  await page.getByRole("button", { name: "Back to shop" }).click();

  await page.getByRole("button", { name: "Pause / settings" }).click();
  await page.getByRole("slider", { name: "Camera sensitivity" }).focus();
  const focused = await snapshot(page);
  await page.keyboard.down("w");
  await frames(page);
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await frames(page);
  await page.keyboard.up("w");
  expect((await snapshot(page)).position).toEqual(focused.position);
  expect((await snapshot(page)).camera).toEqual(focused.camera);

  await page.mouse.move(1000, 450);
  await page.mouse.down();
  await page.mouse.move(1150, 450, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => Math.abs((await snapshot(page)).camera.yaw)).toBeGreaterThan(0.25);
  const rotated = await snapshot(page);
  await page.keyboard.down("s");
  await page.waitForFunction(x => window.__AV3D__!.snapshot().position[0]! < x - 0.3, rotated.position[0]!, { timeout: 10000 });
  await page.keyboard.up("s");
  const cameraRelative = await snapshot(page);
  expect(cameraRelative.position[2]).toBeLessThan(rotated.position[2]!);
  await page.mouse.wheel(0, -400);
  await expect.poll(async () => (await snapshot(page)).camera.distance).toBeLessThan(rotated.camera.distance);
  await page.setViewportSize({ width: 960, height: 640 });
  await expect.poll(() => page.locator("canvas").evaluate(canvas => (canvas as HTMLCanvasElement).width)).toBe(960);
  const beforeReload = await snapshot(page);
  await page.reload();
  await ready(page);
  const restored = await snapshot(page);
  expect(restored.completedActions).toEqual(["shop.inspect-workbench"]);
  expect(restored.camera).toEqual(beforeReload.camera);
  expect(Math.hypot(...restored.position.map((n, i) => n - beforeReload.position[i]!))).toBeLessThan(0.06);
  expect(await page.evaluate(key => localStorage.getItem(key), legacyKey)).toBe(legacyBytes);
  expect(restored.errors).toEqual([]);
  expect(errors).toEqual([]);
  await testInfo.attach("diagnostics", { body: JSON.stringify(restored, null, 2), contentType: "application/json" });
});

test("production paths serve real assets, preserve legacy bytes, and expose no debug by default", async ({ page, request }) => {
  await page.goto("./");
  await ready(page);
  await expect(page.locator("#debug-panel")).toBeHidden();
  expect(await page.evaluate(() => window.__AV3D__)).toBeUndefined();
  const response = await request.get("../");
  expect(response.status()).toBe(200);
  expect(await response.body()).toEqual(fs.readFileSync(new URL("../../index.html", import.meta.url)));
  expect((await request.get("./assets/missing-resource.glb")).status()).toBe(404);
  expect(await page.locator("#legacy-link").getAttribute("href")).toMatch(/\/av-tech-rpg\/$/);
  await page.getByRole("link", { name: "Original 2D career" }).click();
  await page.waitForFunction(() => (window as Window & { AV_TECH_RPG_READY?: boolean }).AV_TECH_RPG_READY === true);
  await expect(page.getByRole("button", { name: "New Career", exact: true })).toBeVisible();
});

test("damaged 3D saves remain intact and cannot cause a crash", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("av-tech-rpg-3d-dev-v1", "retain-damaged-data"));
  await page.goto("./?debug=1");
  await ready(page);
  await expect(page.locator("#notice")).toContainText("retained");
  await page.getByRole("button", { name: "Pause / settings" }).click(); // Attempts a save.
  expect(await page.evaluate(() => localStorage.getItem("av-tech-rpg-3d-dev-v1"))).toBe("retain-damaged-data");
  expect((await snapshot(page)).errors).toEqual([]);
});

test("storage denial keeps the scene playable", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage denied", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Storage denied", "SecurityError"); };
  });
  await page.goto("./?debug=1");
  await ready(page);
  expect((await snapshot(page)).errors).toEqual([]);
  await expect(page.locator("#notice")).toContainText("without saving");
});

test("missing required GLB produces a visible recoverable error", async ({ page }) => {
  await page.route("**/assets/engineering-toolcase.glb", route => route.fulfill({ status: 404, body: "Missing fixture" }));
  await page.goto("./");
  await expect(page.locator("#error-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reload 3D scene" })).toBeVisible();
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "false");
});

test("unsupported WebGL produces an error instead of a blank canvas", async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: any[]) {
      if (String(args[0]).includes("webgl")) return null;
      return getContext.apply(this, args as Parameters<typeof getContext>);
    } as typeof getContext;
  });
  await page.goto("./");
  await expect(page.locator("#error-panel")).toBeVisible();
  await expect(page.locator("#error-copy")).not.toBeEmpty();
});
