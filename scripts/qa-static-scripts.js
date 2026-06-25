#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readIndexScripts() {
  const html = fs.readFileSync(indexPath, "utf8");
  const match = html.match(/const scripts = \[([\s\S]*?)\];/);
  assert(match, "index.html should define the static script loader list.");
  return [...match[1].matchAll(/"([^"]+\.js)"/g)].map((item) => item[1]);
}

function assertNoDuplicates(scripts) {
  const seen = new Set();
  const duplicates = scripts.filter((script) => {
    if (seen.has(script)) return true;
    seen.add(script);
    return false;
  });
  assert(!duplicates.length, `Duplicate script entries: ${duplicates.join(", ")}`);
}

function assertScriptOrder(scripts) {
  assert(scripts[0] === "data.js", "data.js must load first so GAME_CONTENT exists.");
  assert(scripts[1] === "app.js", "app.js must load second so shared state and base helpers exist.");
  assert(scripts.at(-1) === "bootstrap.js", "bootstrap.js must load last so extracted helpers are available before startup.");
}

function assertFilesExist(scripts) {
  const missing = scripts.filter((script) => !fs.existsSync(path.join(projectRoot, script)));
  assert(!missing.length, `Script files missing from disk: ${missing.join(", ")}`);
}

function assertSyntax(scripts) {
  const failures = scripts
    .map((script) => {
      const result = spawnSync(process.execPath, ["--check", path.join(projectRoot, script)], {
        encoding: "utf8",
      });
      return result.status === 0 ? null : `${script}\n${result.stderr || result.stdout}`;
    })
    .filter(Boolean);
  assert(!failures.length, `JavaScript syntax check failed:\n${failures.join("\n")}`);
}

function assertExtractedHelpersAfterApp(scripts) {
  const appIndex = scripts.indexOf("app.js");
  const systemScripts = scripts.filter((script) => script.endsWith("-system.js"));
  const beforeApp = systemScripts.filter((script) => scripts.indexOf(script) < appIndex);
  assert(!beforeApp.length, `System helpers should load after app.js: ${beforeApp.join(", ")}`);
}

const scripts = readIndexScripts();
assert(scripts.length > 0, "No scripts found in the static loader list.");
assertNoDuplicates(scripts);
assertScriptOrder(scripts);
assertFilesExist(scripts);
assertExtractedHelpersAfterApp(scripts);
assertSyntax(scripts);

console.log(`Static script QA passed: ${scripts.length} scripts listed, present, ordered, and syntax-valid.`);
