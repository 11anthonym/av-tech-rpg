import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { SaveData } from "../persistence/save.ts";

export class FollowCamera {
  readonly camera: FreeCamera;
  state: SaveData["camera"];
  sensitivity = 1;
  actualDistance = 0;
  private scene: Scene;
  constructor(scene: Scene, initial: SaveData["camera"]) {
    this.scene = scene;
    this.state = { ...initial };
    this.camera = new FreeCamera("third-person", Vector3.Zero(), scene);
    scene.activeCamera = this.camera;
    this.camera.inputs.clear();
    this.camera.minZ = 0.05;
    this.camera.maxZ = 120;
    this.camera.fov = 0.85;
  }
  orbit(input: { x: number; y: number; zoom: number }) {
    this.state.yaw = (this.state.yaw - input.x * 0.005 * this.sensitivity) % (Math.PI * 2);
    this.state.pitch = Math.max(0.15, Math.min(1.05, this.state.pitch + input.y * 0.004 * this.sensitivity));
    this.state.distance = Math.max(2.2, Math.min(8.5, this.state.distance + input.zoom));
  }
  update(player: Vector3) {
    const target = player.add(new Vector3(0, 0.2, 0));
    const direction = new Vector3(Math.sin(this.state.yaw) * Math.cos(this.state.pitch),
      Math.sin(this.state.pitch), -Math.cos(this.state.yaw) * Math.cos(this.state.pitch));
    const hit = this.scene.pickWithRay(new Ray(target, direction, this.state.distance + 0.25),
      mesh => Boolean(mesh.metadata?.cameraSolid));
    this.actualDistance = hit?.hit ? Math.max(0.25, Math.min(this.state.distance, hit.distance - 0.25)) : this.state.distance;
    this.camera.position.copyFrom(target.add(direction.scale(this.actualDistance)));
    this.camera.setTarget(target);
  }
  dispose() { this.camera.dispose(); }
}
