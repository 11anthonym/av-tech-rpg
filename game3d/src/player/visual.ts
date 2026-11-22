import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";

export interface TechnicianVisual {
  root: TransformNode;
  setMotion(speed: number, delta: number): void;
  dispose(): void;
}

// Engineering proxy only. M2 replaces this adapter with a human GLB and clips;
// collision, camera, domain actions and saves do not depend on its meshes.
export function createPlaceholderVisual(scene: Scene): TechnicianVisual {
  const root = new TransformNode("technician-visual", scene);
  const material = new StandardMaterial("engineering-proxy-orange", scene);
  material.diffuseColor = Color3.FromHexString("#e59b42");
  material.specularColor.set(0.05, 0.05, 0.05);
  const body = MeshBuilder.CreateCapsule("technician-proxy", { height: 1.8, radius: 0.3 }, scene);
  body.parent = root;
  body.position.y = 0.9;
  body.material = material;
  body.isPickable = false;
  const front = MeshBuilder.CreateBox("proxy-forward-marker", { width: 0.22, height: 0.12, depth: 0.08 }, scene);
  front.parent = root;
  front.position.set(0, 1.55, 0.29);
  front.material = material;
  front.isPickable = false;
  return { root, setMotion() {}, dispose: () => root.dispose(false, true) };
}
