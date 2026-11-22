import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { newSession, resolveAction } from "../src/domain/session.ts";
import { contentIds } from "../src/content/ids.ts";
import { movementVector } from "../src/player/movement.ts";
import { freshSave, parseSave, SaveRepository, SAVE_KEY } from "../src/persistence/save.ts";
import { shop, isSafePosition } from "../src/world/shop.ts";

test("stable ID bridge agrees with the actual legacy content", () => {
  const context = { window: {} as { GAME_CONTENT?: any } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL("../../src/content/data.js", import.meta.url), "utf8"), context);
  const data = context.window.GAME_CONTENT;
  assert(data.technicians.some((tech: { id: string }) => tech.id === contentIds.technician));
  assert(data.tools[contentIds.tool]);
  assert(data.vehicles[contentIds.vehicle]);
  assert(data.world.areas[contentIds.area]);
  assert(data.world.routes[contentIds.route]);
});

test("actions are deterministic, immutable and cannot add duplicate completion/rewards", () => {
  const start = newSession();
  const first = resolveAction(start, "shop.inspect-workbench");
  const again = resolveAction(first.state, "shop.inspect-workbench");
  assert.deepEqual(start.completedActions, []);
  assert.deepEqual(first.state.completedActions, ["shop.inspect-workbench"]);
  assert.equal(first.event.outcome, "completed");
  assert.equal(again.event.outcome, "reviewed");
  assert.equal(again.state, first.state);
  assert.deepEqual(resolveAction(start, "shop.inspect-workbench"), first);
});

test("movement normalizes diagonals and rotates relative to camera", () => {
  assert.deepEqual(movementVector({ x: 0, z: 0 }, 0), { x: 0, z: 0 });
  const diagonal = movementVector({ x: 1, z: 1 }, 0);
  assert(Math.abs(Math.hypot(diagonal.x, diagonal.z) - 1) < 1e-10);
  const turned = movementVector({ x: 0, z: 1 }, Math.PI / 2);
  assert(Math.abs(turned.x + 1) < 1e-10 && Math.abs(turned.z) < 1e-10);
});

test("save round trip preserves domain and safe transforms", () => {
  const data = freshSave();
  data.session = resolveAction(data.session, "shop.inspect-workbench").state;
  assert.deepEqual(parseSave(JSON.stringify(data)), data);
  const invalidPosition = { ...data, position: [0, 1, 0] };
  assert.deepEqual(parseSave(JSON.stringify(invalidPosition)).position, shop.spawn);
  assert(!isSafePosition([NaN, 1, 0]));
});

test("unknown versions/actions and malformed numbers are rejected", () => {
  for (const value of ["broken", JSON.stringify({ ...freshSave(), version: 99 }),
    JSON.stringify({ ...freshSave(), camera: { yaw: "0", pitch: 0, distance: 5 } }),
    JSON.stringify({ ...freshSave(), session: { ...newSession(), completedActions: ["unrecognized"] } })]) {
    assert.throws(() => parseSave(value));
  }
});

test("repository touches only its namespace and preserves damaged data", () => {
  const legacy = '{"version":30,"cash":123}';
  const values = new Map([["av-tech-rpg-save-v1", legacy], [SAVE_KEY, "damaged"]]);
  const repository = new SaveRepository({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
  assert.match(repository.load().message, /retained/);
  assert.equal(repository.save(freshSave()), false);
  assert.equal(values.get(SAVE_KEY), "damaged");
  assert.equal(values.get("av-tech-rpg-save-v1"), legacy);
});

test("storage denial is recoverable without touching legacy data", () => {
  const repository = new SaveRepository({ getItem() { throw new Error("denied"); }, setItem() { throw new Error("denied"); } });
  assert.deepEqual(repository.load().data, freshSave());
  assert.equal(repository.save(freshSave()), false);
});

test("interaction definitions reference an authored mesh and stable action", () => {
  for (const interaction of shop.interactions) {
    assert(shop.props.some(prop => prop.id === interaction.meshId));
    assert(interaction.radius > 0);
    assert.equal(resolveAction(newSession(), interaction.actionId).event.actionId, interaction.actionId);
  }
});
