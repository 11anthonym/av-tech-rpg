#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");
const appCorePath = path.join(projectRoot, "src/core/app.js");
const systemsPath = path.join(projectRoot, "src/systems");
const APP_CORE_MAX_LINES = 320;

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
  assert(scripts[0] === "src/content/data.js", "src/content/data.js must load first so GAME_CONTENT exists.");
  assert(scripts[1] === "src/core/app.js", "src/core/app.js must load second so shared state and base helpers exist.");
  assert(scripts.at(-1) === "src/core/bootstrap.js", "src/core/bootstrap.js must load last so extracted helpers are available before startup.");
}

function assertScriptLayout(scripts) {
  const misplaced = scripts.filter((script) => {
    if (script === "src/content/data.js") return false;
    if (script === "src/core/app.js") return false;
    if (script === "src/core/bootstrap.js") return false;
    return !script.startsWith("src/systems/");
  });
  assert(!misplaced.length, `Runtime scripts should live under src/content, src/core, or src/systems: ${misplaced.join(", ")}`);
}

function assertFilesExist(scripts) {
  const missing = scripts.filter((script) => !fs.existsSync(path.join(projectRoot, script)));
  assert(!missing.length, `Script files missing from disk: ${missing.join(", ")}`);
}

function assertSystemsDirectoryListed(scripts) {
  const systemFiles = fs.readdirSync(systemsPath)
    .filter((file) => file.endsWith(".js"))
    .map((file) => `src/systems/${file}`)
    .sort();
  const listedSystemFiles = scripts
    .filter((script) => script.startsWith("src/systems/"))
    .sort();
  const missing = systemFiles.filter((script) => !listedSystemFiles.includes(script));
  const unknown = listedSystemFiles.filter((script) => !systemFiles.includes(script));
  assert(!missing.length, `System files missing from index.html loader: ${missing.join(", ")}`);
  assert(!unknown.length, `index.html references unknown system files: ${unknown.join(", ")}`);
}

function assertAppCoreStaysLean() {
  const lineCount = fs.readFileSync(appCorePath, "utf8").split(/\r?\n/).length;
  assert(
    lineCount <= APP_CORE_MAX_LINES,
    `src/core/app.js is ${lineCount} lines; keep core lean and move gameplay surfaces into src/systems/ (limit ${APP_CORE_MAX_LINES}).`,
  );
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
  const appIndex = scripts.indexOf("src/core/app.js");
  const systemScripts = scripts.filter((script) => script.endsWith("-system.js"));
  const beforeApp = systemScripts.filter((script) => scripts.indexOf(script) < appIndex);
  assert(!beforeApp.length, `System helpers should load after app.js: ${beforeApp.join(", ")}`);
}

const scripts = readIndexScripts();
assert(scripts.length > 0, "No scripts found in the static loader list.");
assertNoDuplicates(scripts);
assertScriptOrder(scripts);
assertScriptLayout(scripts);
assertFilesExist(scripts);
assertSystemsDirectoryListed(scripts);
assertExtractedHelpersAfterApp(scripts);
assertAppCoreStaysLean();
assertSyntax(scripts);

console.log(`Static script QA passed: ${scripts.length} scripts listed, present, ordered, lean, and syntax-valid.`);
