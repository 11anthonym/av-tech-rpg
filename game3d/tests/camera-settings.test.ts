import test from "node:test";
import assert from "node:assert/strict";
import { clearBoomDistance, recoverBoom, cameraOpacity, CAMERA_RADIUS } from "../src/player/camera-boom.ts";
import { shop } from "../src/world/shop.ts";
import type { Vec3 } from "../src/world/shop.ts";
import { SettingsRepository, SETTINGS_KEY, defaultSettings } from "../src/persistence/settings.ts";

test("camera volume catches a corner the old centre ray missed", () => {
  const box = { id: "cab", position: [0, 1, 4] as Vec3, size: [2, 2, 2] as Vec3 };
  // x=1.1 clears a box ending at x=1, but clips the camera's near-plane volume.
  assert(clearBoomDistance([1.1, 1, 0], [0, 0, 1], 6, [box]) < 3);
  assert.equal(clearBoomDistance([1.3, 1, 0], [0, 0, 1], 6, [box]), 6);
  assert.equal(clearBoomDistance([0, 1, 4], [0, 0, 1], 6, [box]), 0);
  assert.equal(clearBoomDistance([0, 1, 0], [0, 0, -1], 6, [box]), 6);
});

test("orbit endpoints clear authored walls, bench, shelf, cart and van at resting positions", () => {
  const boxes = shop.props.filter(p => p.solid);
  const positions: Vec3[] = [[0, .92, -4], [0, .92, -.7806628815], [4.419, .92, 4.5],
    [8.60, .92, 0], [-7.3, .92, 5], [-4.1, .92, 1.6]];
  for (const p of positions) for (const pitch of [.15, .35, 1.05]) for (let i = 0; i < 72; i++) {
    const yaw = i / 72 * Math.PI * 2;
    const direction: Vec3 = [Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw)*Math.cos(pitch)];
    const origin: Vec3 = [p[0], p[1] + .2, p[2]];
    const distance = clearBoomDistance(origin, direction, 8.5, boxes);
    assert(distance >= 0 && distance <= 8.5);
    const end = origin.map((v, a) => v + direction[a]! * distance);
    for (const box of boxes) assert(!box.size.every((size, a) =>
      Math.abs(end[a]! - box.position[a]!) < size / 2 + CAMERA_RADIUS - 1e-6), `${box.id}: ${p}, yaw ${yaw}`);
  }
});

test("camera retracts immediately, recovers smoothly and fades only at close range", () => {
  assert.equal(recoverBoom(5.5, .1, 1/60), .1);
  const first = recoverBoom(.1, 5.5, 1/60);
  assert(first > .1 && first < 1);
  assert(Math.abs(recoverBoom(recoverBoom(.1, 5.5, .1), 5.5, .1) - recoverBoom(.1, 5.5, .2)) < 1e-10);
  assert.equal(recoverBoom(2, 5, 0), 2);
  assert.equal(cameraOpacity(.1), 0);
  assert.equal(cameraOpacity(2.8), 1);
  assert(cameraOpacity(.8) > 0 && cameraOpacity(.8) < 1);
});

test("preferences round-trip in their own key without changing career/session saves", () => {
  const values = new Map([["av-tech-rpg-save-v1", "legacy"], ["av-tech-rpg-3d-dev-v1", "session"]]);
  const port = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const repository = new SettingsRepository(port);
  assert.deepEqual(repository.load(), defaultSettings());
  assert(repository.save({ version: 1, quality: "low", sensitivity: 1.5 }));
  assert.deepEqual(new SettingsRepository(port).load(), { version: 1, quality: "low", sensitivity: 1.5 });
  assert.equal(values.get("av-tech-rpg-save-v1"), "legacy");
  assert.equal(values.get("av-tech-rpg-3d-dev-v1"), "session");
  assert(values.has(SETTINGS_KEY));
});

test("invalid or denied preferences recover safely and preserve damaged bytes", () => {
  for (const raw of ["broken", '{"version":9,"quality":"high","sensitivity":1}',
    '{"version":1,"quality":"__proto__","sensitivity":1}', '{"version":1,"quality":"high","sensitivity":"1"}',
    '{"version":1,"quality":"high","sensitivity":20}']) {
    let bytes = raw;
    const repository = new SettingsRepository({ getItem: () => bytes, setItem: (_key, value) => { bytes = value; } });
    assert.deepEqual(repository.load(), defaultSettings());
    assert.equal(repository.save(defaultSettings()), false);
    assert.equal(bytes, raw);
  }
  const denied = new SettingsRepository({ getItem() { throw Error("denied"); }, setItem() { throw Error("denied"); } });
  assert.deepEqual(denied.load(), defaultSettings());
  assert.equal(denied.save(defaultSettings()), false);
});
