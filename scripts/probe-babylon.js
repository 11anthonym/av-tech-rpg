#!/usr/bin/env node

// Optional, isolated browser capability probe. The pinned full UMD bundles are
// convenient for this experiment; the production plan uses bundled ES modules.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { makeGlb } = require("./fixtures/unit-cube.js");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const out = fs.mkdtempSync(path.join(os.tmpdir(), "av-tech-rpg-babylon-probe-"));
const bundles = [
  { route: "/babylon.js", url: "https://cdn.jsdelivr.net/npm/babylonjs@9.37.1/babylon.js",
    sha256: "d8cde01e4dac83deee70006fcf2c601440ca6bb0cb29ff237ea0e5b857141685" },
  { route: "/loaders.js", url: "https://cdn.jsdelivr.net/npm/babylonjs-loaders@9.37.1/babylonjs.loaders.min.js",
    sha256: "abecd7cc0ba031c6aa2520b9f7f736980213892a3e0f0ac0a701e0b2e1512051" },
];

(async () => {
  const routes = new Map([
    ["/", [fs.readFileSync(path.join(__dirname, "fixtures/babylon-feasibility.html")), "text/html"]],
    ["/content.js", [fs.readFileSync(path.join(root, "src/content/data.js")), "text/javascript"]],
    ["/unit-cube.glb", [makeGlb(), "model/gltf-binary"]],
    ["/favicon.ico", [Buffer.alloc(0), "image/x-icon"]],
  ]);
  for (const bundle of bundles) {
    const response = await fetch(bundle.url, { signal: AbortSignal.timeout(30000) });
    assert(response.ok, `Download failed: ${bundle.url}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), bundle.sha256,
      `Pinned bundle integrity failed: ${bundle.url}`);
    routes.set(bundle.route, [bytes, "text/javascript"]);
  }
  const server = http.createServer((request, response) => {
    const resource = routes.get(request.url.split("?")[0]);
    response.writeHead(resource ? 200 : 404, { "Content-Type": resource?.[1] || "text/plain" });
    response.end(resource?.[0] || "Not found");
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  let browser;
  try {
    const executablePath = process.env.CHROME_EXECUTABLE_PATH || [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ].find(candidate => fs.existsSync(candidate));
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(() => window.probe?.snapshot().frames >= 3, null, { timeout: 30000 });
    const initial = await page.evaluate(() => window.probe.snapshot());
    assert.equal(initial.version, "9.37.1");
    assert.equal(initial.sceneIds.length, 12);
    assert.equal(initial.routes, 9);
    assert(initial.cubeSize.every(size => Math.abs(size - 1) < 0.0001));
    console.log("PASS: real browser rendering, existing content, pinned engine, one-metre GLB import");
    await page.screenshot({ path: path.join(out, "shop-third-person.png") });
    await page.keyboard.down("w");
    await page.waitForFunction(() => window.probe.player.position.z > 1.15, null, { timeout: 10000 });
    const reachedFrame = await page.evaluate(() => window.probe.snapshot().frames);
    await page.waitForFunction(frame => window.probe.snapshot().frames >= frame + 5, reachedFrame);
    await page.keyboard.up("w");
    const moved = await page.evaluate(() => window.probe.snapshot());
    assert(moved.position[2] > initial.position[2] + 0.1, "Keyboard input must move the technician");
    assert(moved.position[2] >= 1.15 && moved.position[2] < 1.25,
      "Technician must reach the workbench and remain blocked while input continues");
    assert(moved.cameraTarget.every((value, i) => Math.abs(value - moved.position[i]) < 0.05),
      "Camera must follow the technician");
    console.log("PASS: keyboard movement, solid collision, third-person camera follows technician");
    const priorAlpha = await page.evaluate(() => window.probe.camera.alpha);
    await page.mouse.move(1000, 650);
    await page.mouse.down();
    await page.mouse.move(1150, 680, { steps: 8 });
    await page.mouse.up();
    await page.waitForFunction(alpha => Math.abs(window.probe.camera.alpha - alpha) > 0.05, priorAlpha);
    console.log("PASS: mouse drag orbits the third-person camera");
    const checks = await page.evaluate(() => {
      const p = window.probe;
      const hit = p.scene.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(0, 0.5, 0),
        new BABYLON.Vector3(0, 0, 1), 4), mesh => mesh === p.bench);
      const clear = p.scene.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(4, 0.5, 0),
        new BABYLON.Vector3(0, 0, 1), 4), mesh => mesh === p.bench);
      const saved = { sceneId: "shop", tools: ["screwdriver"], cash: 42, flags: { shopBrief: true } };
      localStorage.setItem("av-tech-rpg-3d-probe", JSON.stringify(saved));
      const restored = JSON.parse(localStorage.getItem("av-tech-rpg-3d-probe"));
      const gl = p.engine._gl;
      const extension = gl.getExtension("WEBGL_debug_renderer_info");
      return { obstruction: hit.hit && !clear.hit, save: JSON.stringify(saved) === JSON.stringify(restored),
        renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
        webglVersion: p.engine.webGLVersion };
    });
    assert(checks.obstruction && checks.save);
    assert.equal(checks.webglVersion, 2);
    console.log("PASS: blocked/clear picking rays and isolated localStorage save/load");
    await page.setViewportSize({ width: 960, height: 640 });
    await page.waitForFunction(() => window.probe.engine.getRenderWidth() === 960);
    console.log("PASS: canvas resizes with browser viewport");
    await page.reload();
    await page.waitForFunction(() => window.probe?.snapshot().frames >= 3);
    const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("av-tech-rpg-3d-probe")));
    assert.equal(persisted.cash, 42);
    assert.equal(persisted.flags.shopBrief, true);
    console.log("PASS: isolated saved state survives a browser reload");
    assert.deepEqual(errors, [], "Browser probe must have no console/page errors");
    fs.writeFileSync(path.join(out, "result.json"), JSON.stringify({ initial, moved, checks, errors }, null, 2));
    console.log(JSON.stringify({ renderer: checks.renderer, artifacts: out }, null, 2));
    console.log("BABYLON_FEASIBILITY_PASSED (software GPU results do not establish player hardware performance)");
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
