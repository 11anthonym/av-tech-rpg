import { test, expect } from "@playwright/test";

test("host-portable root build loads its own JS, CSS and GLB without repository paths", async ({ page, request }) => {
  const errors: string[] = [];
  const assets: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("response", response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (new URL(response.url()).pathname.startsWith("/assets/")) assets.push(response.url());
  });
  await page.goto("./");
  await expect(page.locator("#app")).toHaveAttribute("data-ready", "true", { timeout: 30000 });
  expect(assets.some(url => url.endsWith("engineering-toolcase.glb"))).toBe(true);
  expect(assets.some(url => url.endsWith(".css"))).toBe(true);
  expect(assets.some(url => url.endsWith(".js"))).toBe(true);
  expect(assets.every(url => !url.includes("/av-tech-rpg/"))).toBe(true);
  expect(await page.locator("#legacy-link").getAttribute("href")).toBe("https://11anthonym.github.io/av-tech-rpg/");
  expect((await request.get("./assets/not-a-real-file.glb")).status()).toBe(404);
  expect(errors).toEqual([]);
  await page.goto("about:blank");
});
