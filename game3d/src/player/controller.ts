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
    this.body.ellipsoid.set(0.3, 0.9, 0.3);
    this.syncVisual(0, 0);
  }
  get position() { return this.body.position; }
  step(input: MoveInput, yaw: number, delta: number) {
    const direction = movementVector(input, yaw);
    // M1's authored shop is flat. Avoid a partial gravity/stair solver here;
    // the movement adapter can gain qualified slope/step handling in M2.
    this.body.moveWithCollisions(new Vector3(direction.x * 3.4 * delta, 0, direction.z * 3.4 * delta));
    const speed = Math.hypot(direction.x, direction.z);
    if (speed) this.visual.root.rotation.y = Math.atan2(direction.x, direction.z);
    this.syncVisual(speed, delta);
  }
  private syncVisual(speed: number, delta: number) {
    this.visual.root.position.copyFrom(this.body.position);
    this.visual.root.position.y -= 0.9;
    this.visual.setMotion(speed, delta);
  }
  dispose() { this.body.dispose(); this.visual.dispose(); }
}
