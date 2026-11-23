import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { TechnicianVisual } from "./visual.ts";
import { movementVector } from "./movement.ts";
import type { MoveInput } from "./movement.ts";
import type { Vec3 } from "../world/shop.ts";

export class CharacterController {
  private body;
  private visual: TechnicianVisual;
  constructor(scene: Scene, spawn: Vec3, visual: TechnicianVisual) {
    this.visual = visual;
    this.body = MeshBuilder.CreateCapsule("player-collision", { height: 1.8, radius: 0.3 }, scene);
    this.body.isVisible = false;
    this.body.isPickable = false;
    this.body.position.set(...spawn);
    this.body.position.y = .92;
    this.body.ellipsoid.set(0.3, 0.9, 0.3);
    this.syncVisual(0, 0);
  }
  get position() { return this.body.position; }
  get character() { return this.visual.snapshot(); }
  updateCamera(distance: number) { this.visual.setCameraDistance(distance); }
  step(input: MoveInput, yaw: number, delta: number, carrying = false) {
    this.visual.setCarrying(carrying);
    const direction = movementVector(input, yaw);
    // This shop is flat. Slopes/stairs need a separately qualified movement
    // adapter; importing a human rig does not change collision or save rules.
    const before = this.body.position.clone();
    // Prototype PLAYER_SPEED=8, one carried group contributes speedDelta=-1.
    const pace = carrying ? 1.4 * (7 / 8) : 1.4;
    this.body.moveWithCollisions(new Vector3(direction.x * pace * delta, 0, direction.z * pace * delta));
    // Horizontal ellipsoid contacts can introduce a small upward slide even
    // with zero vertical input. This authored shop has one flat floor.
    this.body.position.y = .92;
    const speed = Vector3.Distance(before, this.body.position) / delta;
    if (Math.hypot(direction.x, direction.z)) {
      const difference = Math.atan2(Math.sin(Math.atan2(direction.x, direction.z) - this.visual.root.rotation.y),
        Math.cos(Math.atan2(direction.x, direction.z) - this.visual.root.rotation.y));
      this.visual.root.rotation.y += Math.max(-8 * delta, Math.min(8 * delta, difference));
    }
    this.syncVisual(speed, delta);
  }
  private syncVisual(speed: number, delta: number) {
    this.visual.root.position.copyFrom(this.body.position);
    // Capsule has 2cm flat-floor clearance; visible soles rest on the floor.
    this.visual.root.position.y -= 0.92;
    this.visual.setMotion(speed, delta);
  }
  dispose() { this.body.dispose(); this.visual.dispose(); }
}
