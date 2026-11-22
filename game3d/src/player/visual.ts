import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { loadModel } from "../render/assets.ts";

export interface TechnicianVisual {
  root: TransformNode;
  setMotion(speed: number, delta: number): void;
  snapshot(): { model: string; joints: number; height: number; speed: number; walkWeight: number; idleFrame: number; walkFrame: number; pose: number[] };
  dispose(): void;
}

export async function createTechnicianVisual(scene: Scene): Promise<TechnicianVisual> {
  const root = new TransformNode("technician-visual", scene);
  const model = new TransformNode("technician-model", scene);
  model.parent = root;
  const asset = await loadModel(scene, "technician.glb", model);
  const idle = asset.animationGroups.find(group => group.name === "Idle");
  const walk = asset.animationGroups.find(group => group.name === "Walk");
  const skeleton = asset.skeletons[0];
  if (!idle || !walk || !skeleton) { asset.dispose(); root.dispose(); throw new Error("Technician requires a rig and Idle/Walk clips"); }
  for (const mesh of asset.meshes) {
    mesh.isPickable = false;
    mesh.checkCollisions = false;
    mesh.receiveShadows = true;
    mesh.computeWorldMatrix(true);
  }
  const bounds = model.getHierarchyBoundingVectors(true);
  const height = bounds.max.y - bounds.min.y;
  if (!Number.isFinite(height) || height < 1 || height > 3) throw new Error(`Unexpected technician height ${height}`);
  const scale = 1.78 / height;
  model.scaling.setAll(scale);
  model.position.y = -bounds.min.y * scale;
  idle.start(true, 1);
  walk.start(true, 1);
  idle.setWeightForAllAnimatables(1);
  walk.setWeightForAllAnimatables(0);
  let weight = 0;
  let speed = 0;
  return {
    root,
    setMotion(metresPerSecond, delta) {
      speed = metresPerSecond;
      const target = speed > 0.08 ? 1 : 0;
      weight += (target - weight) * (1 - Math.exp(-12 * delta));
      if (Math.abs(target - weight) < 0.001) weight = target;
      idle.setWeightForAllAnimatables(1 - weight);
      walk.setWeightForAllAnimatables(weight);
      // Native stride travels 1.213m in 1.2s, scaled with this model.
      walk.speedRatio = Math.max(0.1, speed / (1.213 / 1.2 * scale));
    },
    snapshot: () => ({ model: "Rocketbox Andre / tee", joints: skeleton.bones.length, height: 1.78, speed,
      walkWeight: weight, idleFrame: idle.getCurrentFrame(), walkFrame: walk.getCurrentFrame(),
      pose: Array.from(skeleton.bones.find(bone => bone.name === "mixamorig:LeftLeg")?.getLocalMatrix().asArray().slice(0, 12) ?? []) }),
    dispose() { asset.dispose(); root.dispose(false, true); },
  };
}
