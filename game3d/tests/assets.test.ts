import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import validator from "gltf-validator";

test("committed technician is validated, rigged, clothed and matches its provenance", async () => {
  const report = JSON.parse(fs.readFileSync(new URL("../../docs/qa/m2/character-build.json", import.meta.url), "utf8"));
  const bytes = fs.readFileSync(new URL("../public/assets/technician.glb", import.meta.url));
  assert.equal(bytes.length, report.runtime.bytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), report.runtime.sha256);
  const result = await validator.validateBytes(new Uint8Array(bytes));
  assert.equal(result.issues.numErrors, 0, JSON.stringify(result.issues.messages));
  assert.equal(result.issues.numWarnings, 0, JSON.stringify(result.issues.messages));
  const length = bytes.readUInt32LE(12);
  const gltf = JSON.parse(bytes.toString("utf8", 20, 20 + length));
  assert.deepEqual(gltf.animations.map((a: { name: string }) => a.name), ["Idle", "Walk"]);
  assert.equal(gltf.skins[0].joints.length, 80);
  for (const name of report.runtime.outfit) assert(gltf.nodes.some((n: { name: string }) => n.name === name));
  assert(gltf.meshes.every((m: { primitives: { attributes: { JOINTS_0: number; WEIGHTS_0: number } }[] }) =>
    m.primitives.every(p => p.attributes.JOINTS_0 !== undefined && p.attributes.WEIGHTS_0 !== undefined)));
  for (const file of ["ROCKETBOX.md", "AVATAR_STUDIO.txt", "CC0-1.0.txt"]) {
    assert(fs.readFileSync(new URL(`../public/assets/licenses/${file}`, import.meta.url), "utf8").length > 500);
  }
});

test("prefiltered lighting matches its documented source conversion", () => {
  const report = JSON.parse(fs.readFileSync(new URL("../../docs/qa/m2/lighting-build.json", import.meta.url), "utf8"));
  const bytes = fs.readFileSync(new URL("../public/assets/shop-lighting.env", import.meta.url));
  assert.equal(bytes.length, report.runtimeBytes);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), report.runtimeSha256);
});
