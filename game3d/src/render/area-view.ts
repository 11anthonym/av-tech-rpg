import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import type { AreaDefinition } from "../world/shop.ts";
import { loadModel } from "./assets.ts";

export async function createAreaView(scene: Scene, area: AreaDefinition) {
  const root = new TransformNode(area.id, scene);
  const meshes = new Map<string, AbstractMesh>();
  const colors = { concrete: "#7b8584", wall: "#bec8c5", steel: "#3e6973", wood: "#9b7549", carton: "#ae8854" };
  const materials = new Map<string, StandardMaterial>();
  for (const [name, color] of Object.entries(colors)) {
    const material = new StandardMaterial(name, scene);
    material.diffuseColor = Color3.FromHexString(color);
    material.specularColor.set(0.05, 0.05, 0.05);
    materials.set(name, material);
  }
  for (const prop of area.props) {
    const mesh = MeshBuilder.CreateBox(prop.id, { width: prop.size[0], height: prop.size[1], depth: prop.size[2] }, scene);
    mesh.parent = root;
    mesh.position.set(...prop.position);
    mesh.material = materials.get(prop.material)!;
    mesh.checkCollisions = prop.solid;
    mesh.metadata = { blocksSight: prop.solid, cameraSolid: prop.solid };
    meshes.set(prop.id, mesh);
  }
  // Clone the focus material so highlighting cannot recolor other wood props.
  for (const interaction of area.interactions) {
    const mesh = meshes.get(interaction.meshId)!;
    mesh.metadata.interactionId = interaction.id;
    mesh.material = (mesh.material as StandardMaterial).clone(`${interaction.id}-focus`);
  }
  const caseRoot = new TransformNode("engineering-toolcase", scene);
  caseRoot.parent = root;
  caseRoot.position.set(0.8, 1.18, 0);
  caseRoot.scaling.set(0.45, 0.25, 0.3);
  const caseAsset = await loadModel(scene, "engineering-toolcase.glb", caseRoot);
  caseAsset.meshes.forEach(mesh => { mesh.isPickable = false; });
  let focused: AbstractMesh | undefined;
  return {
    root, meshes,
    focus(meshId: string | undefined) {
      const next = meshId ? meshes.get(meshId) : undefined;
      if (next === focused) return;
      if (focused?.material instanceof StandardMaterial) focused.material.emissiveColor.set(0, 0, 0);
      focused = next;
      if (focused?.material instanceof StandardMaterial) focused.material.emissiveColor.set(0.18, 0.12, 0.025);
    },
    dispose() { caseAsset.dispose(); root.dispose(false, true); },
  };
}
