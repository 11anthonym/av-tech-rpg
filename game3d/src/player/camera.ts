import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { SaveData } from "../persistence/save.ts";
import { clearBoomDistance, recoverBoom } from "./camera-boom.ts";
import type { CameraObstacle } from "./camera-boom.ts";

export class FollowCamera {
  readonly camera: FreeCamera;
  state: SaveData["camera"];
  sensitivity = 1;
  actualDistance = 0;
  private obstacles: readonly CameraObstacle[];
  private initialized = false;
  constructor(scene: Scene, initial: SaveData["camera"], obstacles: readonly CameraObstacle[]) {
    this.obstacles = obstacles;
    this.state = { ...initial };
    this.camera = new FreeCamera("third-person", Vector3.Zero(), scene);
    scene.activeCamera = this.camera;
    this.camera.inputs.clear();
    this.camera.minZ = 0.05;
    this.camera.maxZ = 120;
    this.camera.fov = 0.95;
  }
  orbit(input: { x: number; y: number; zoom: number }) {
    this.state.yaw = (this.state.yaw - input.x * 0.005 * this.sensitivity) % (Math.PI * 2);
    this.state.pitch = Math.max(0.15, Math.min(1.05, this.state.pitch + input.y * 0.004 * this.sensitivity));
    this.state.distance = Math.max(2.2, Math.min(8.5, this.state.distance + input.zoom));
  }
  update(player: Vector3, delta = 0) {
    const target = player.add(new Vector3(0, 0.2, 0));
    const direction = new Vector3(Math.sin(this.state.yaw) * Math.cos(this.state.pitch),
      Math.sin(this.state.pitch), -Math.cos(this.state.yaw) * Math.cos(this.state.pitch));
    const safe = clearBoomDistance([target.x, target.y, target.z], [direction.x, direction.y, direction.z], this.state.distance, this.obstacles);
    this.actualDistance = this.initialized ? recoverBoom(this.actualDistance, safe, delta) : safe;
    this.initialized = true;
    this.camera.position.copyFrom(target.add(direction.scale(this.actualDistance)));
    this.camera.setTarget(this.camera.position.subtract(direction));
  }
  dispose() { this.camera.dispose(); }
}
