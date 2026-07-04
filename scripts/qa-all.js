#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const args = new Set(process.argv.slice(2));
const fastOnly = args.has("--fast");
const includeSmoke = !fastOnly;

function runStep(label, script, { required = true } = {}) {
  console.log(`\n== ${label} ==`);
  const result = spawnSync(process.execPath, [path.join(projectRoot, script)], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status === 0) return true;
  if (!required) {
    console.warn(`${label} skipped or failed, but it is marked optional.`);
    return false;
  }
  console.error(`${label} failed.`);
  process.exit(result.status || 1);
}

if (args.has("--help") || args.has("-h")) {
  console.log([
    "Usage:",
    "  node scripts/qa-all.js          Run static, unit, and browser smoke QA.",
    "  node scripts/qa-all.js --fast   Run static and unit QA only.",
    "",
    "The smoke pass requires Playwright to be resolvable by Node.",
    "Set NODE_PATH if Playwright is installed outside this repository.",
  ].join("\n"));
  process.exit(0);
}

runStep("Static script QA", "scripts/qa-static-scripts.js");
runStep("Unit and contract QA", "scripts/qa-unit.js");

if (includeSmoke) {
  runStep("Browser smoke QA", "scripts/qa-smoke.js");
} else {
  console.log("\n== Browser smoke QA ==");
  console.log("Skipped in --fast mode. Run `node scripts/qa-all.js` locally before larger gameplay changes.");
}

console.log(`\nQA passed${fastOnly ? " (fast mode)" : ""}.`);
