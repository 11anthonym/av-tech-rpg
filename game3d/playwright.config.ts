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
    video: { mode: "on", size: { width: 960, height: 540 } } },
  projects: [
    { name: "chromium", use: { browserName: "chromium", launchOptions: { ...(chrome ? { executablePath: chrome } : {}),
      args: ["--enable-unsafe-swiftshader"] } } },
    { name: "firefox", use: { browserName: "firefox", launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } } } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: "node ../scripts/build-pages.mjs && node ../scripts/serve-pages.mjs --port 4174",
    url: "http://127.0.0.1:4174/av-tech-rpg/3d/", reuseExistingServer: false, timeout: 30000,
  },
});
