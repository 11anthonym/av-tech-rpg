import { defineConfig } from "@playwright/test";
const chrome = process.env.CHROME_EXECUTABLE_PATH;
export default defineConfig({
  testDir: "./e2e",
  timeout: 120000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4174/av-tech-rpg/3d/",
    viewport: { width: 1280, height: 720 }, trace: "retain-on-failure", screenshot: "only-on-failure",
    video: process.env.RECORD_VIDEO === "1" ? { mode: "on", size: { width: 960, height: 540 } } : "off" },
  projects: [
    { name: "chromium", testIgnore: "portable.spec.ts", use: { browserName: "chromium", launchOptions: { ...(chrome ? { executablePath: chrome } : {}),
      args: ["--enable-unsafe-swiftshader"] } } },
    { name: "firefox", testIgnore: "portable.spec.ts", use: { browserName: "firefox", headless: process.platform !== "linux",
      launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } } } },
    { name: "portable-root", testMatch: "portable.spec.ts", use: { browserName: "chromium",
      baseURL: process.env.PLAYWRIGHT_PORTABLE_URL ?? "http://127.0.0.1:4175/",
      launchOptions: { ...(chrome ? { executablePath: chrome } : {}), args: ["--enable-unsafe-swiftshader"] } } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : [{
    command: "node ../scripts/build-pages.mjs && node ../scripts/serve-pages.mjs --port 4174",
    url: "http://127.0.0.1:4174/av-tech-rpg/3d/", reuseExistingServer: false, timeout: 30000,
  }, { command: "node ../scripts/serve-pages.mjs --portable --port 4175", url: "http://127.0.0.1:4175/", reuseExistingServer: false, timeout: 30000 }],
});
