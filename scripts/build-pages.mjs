import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.resolve(root, ".pages");
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== ".pages") {
  throw new Error("Refusing to replace an unexpected staging directory");
}
if (!fs.existsSync(path.join(root, "game3d/dist/index.html"))) throw new Error("Build game3d before staging Pages");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
// Explicit allowlist: never deploy node_modules, source maps, credentials or tooling.
for (const entry of ["index.html", "styles.css", "src"]) {
  fs.cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
}
fs.cpSync(path.join(root, "game3d/dist"), path.join(output, "3d"), { recursive: true,
  filter: source => !source.endsWith(".map") });
fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log("Pages staged: legacy root + 3d/ in .pages/");
