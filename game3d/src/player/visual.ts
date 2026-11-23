import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import { loadModel } from "../render/assets.ts";
import { Material } from "@babylonjs/core/Materials/material";
import { cameraOpacity } from "./camera-boom.ts";
import { applyCarryPose } from "./carry-pose.ts";

export interface TechnicianVisual {
  root: TransformNode;
  setMotion(speed: number, delta: number): void;
  setCameraDistance(distance: number): void;
  setCarrying(value: boolean): void;
  createSupervisor(): { dispose(): void };
  snapshot(): { model: string; joints: number; height: number; opacity: number; carryPoseError: number | null; speed: number; walkWeight: number; idleFrame: number; walkFrame: number; pose: number[] };
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
  for (const material of asset.materials) {
    if (material.transparencyMode === Material.MATERIAL_OPAQUE) material.transparencyMode = null;
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
  let opacity = 1;
  let carrying = false;
  let carryPoseError: number | null = null;
  const carryObserver = scene.onAfterAnimationsObservable.add(() => { carryPoseError = carrying ? applyCarryPose(asset.transformNodes, root) : null; });
  return {
    root,
    setCarrying(value) { carrying = value; },
    createSupervisor() {
      const npc = new TransformNode("supervisor-visual", scene);
      npc.position.set(-5.5, 0, -1); npc.rotation.y = Math.PI;
      const npcModel = new TransformNode("supervisor-model", scene); npcModel.parent = npc;
      npcModel.scaling.copyFrom(model.scaling); npcModel.position.copyFrom(model.position);
      const entries = asset.instantiateModelsToScene(name => `supervisor/${name}`, false, { doNotInstantiate: true });
      for (const node of entries.rootNodes) node.parent = npcModel;
      for (const group of entries.animationGroups) { group.stop(); if (group.name.endsWith("Idle")) group.start(true, 1); }
      for (const mesh of npc.getChildMeshes()) { mesh.isPickable = false; mesh.receiveShadows = true; }
      return { dispose() { entries.dispose(); npc.dispose(); } };
    },
    setCameraDistance(distance) {
      opacity = cameraOpacity(distance);
      for (const mesh of asset.meshes) mesh.visibility = opacity;
    },
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
    snapshot: () => ({ model: "Rocketbox Andre / tee", joints: skeleton.bones.length, height: 1.78, opacity, carryPoseError, speed,
      walkWeight: weight, idleFrame: idle.getCurrentFrame(), walkFrame: walk.getCurrentFrame(),
      pose: Array.from(skeleton.bones.find(bone => bone.name === "mixamorig:LeftLeg")?.getLocalMatrix().asArray().slice(0, 12) ?? []) }),
    dispose() { scene.onAfterAnimationsObservable.remove(carryObserver); asset.dispose(); root.dispose(false, true); },
  };
}
