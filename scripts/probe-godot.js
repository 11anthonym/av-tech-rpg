#!/usr/bin/env node

// Optional engine evaluation. Builds an isolated temporary fixture; never edits
// the browser game, its saves, or an installed engine. No npm install is needed.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { makeGlb } = require("./fixtures/unit-cube.js");

const projectRoot = path.resolve(__dirname, "..");
const engineArg = process.argv.indexOf("--godot");
const godot = engineArg >= 0 ? process.argv[engineArg + 1] : process.env.GODOT_BIN;
if (!godot) {
  console.error('Usage: node scripts/probe-godot.js --godot "C:\\path\\to\\Godot_console.exe"');
  process.exit(1);
}

function runEngine(args) {
  const result = spawnSync(godot, args, { encoding: "utf8", timeout: 120000 });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  process.stdout.write(output);
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `Godot failed with exit code ${result.status}`);
  assert(!/SCRIPT ERROR:|Parse Error:|^ERROR:/m.test(output), "Godot reported an engine/script error");
  return output;
}

try {
  const version = runEngine(["--version"]);
  assert(/^4\.7\.2\.stable/m.test(version), "This evidence fixture is pinned to Godot 4.7.2 stable");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(projectRoot, "src/content/data.js"), "utf8"), context);
  const content = context.window.GAME_CONTENT;
  function requireJsonValues(value, location = "content") {
    assert(!["function", "undefined", "symbol", "bigint"].includes(typeof value), `${location} is not JSON data`);
    if (typeof value === "number") assert(Number.isFinite(value), `${location} is non-finite`);
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, item]) => requireJsonValues(item, `${location}.${key}`));
    }
  }
  requireJsonValues(content);
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "av-tech-rpg-godot-probe-"));
  console.log(`Isolated fixture: ${fixture}`);
  fs.writeFileSync(path.join(fixture, "content.json"), JSON.stringify(content));
  fs.writeFileSync(path.join(fixture, "expected.json"), JSON.stringify({
    technicians: content.technicians.length, scenes: Object.keys(content.scenes).length,
    sceneIds: Object.keys(content.scenes), routes: Object.keys(content.world.routes).length,
    portals: Object.keys(content.world.portals).length, regions: Object.keys(content.world.regions).length,
  }));
  fs.writeFileSync(path.join(fixture, "project.godot"), [
    'config_version=5', '[application]', 'config/name="AV Tech RPG feasibility fixture"',
    '[rendering]', 'renderer/rendering_method="gl_compatibility"',
    'renderer/rendering_method.mobile="gl_compatibility"', '',
  ].join("\n"));
  fs.copyFileSync(path.join(__dirname, "fixtures/godot-feasibility.gd"), path.join(fixture, "probe.gd"));
  fs.writeFileSync(path.join(fixture, "unit-cube.glb"), makeGlb());
  runEngine(["--headless", "--path", fixture, "--editor", "--import", "--quit"]);
  const output = runEngine(["--headless", "--path", fixture, "--script", "res://probe.gd", "--quit-after", "300"]);
  assert(output.includes("GODOT_FEASIBILITY_PASSED"), "Probe did not reach its completion marker");
  console.log("Feasibility passed. Rendering, performance, exports, Blender and RPG parity remain untested.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
