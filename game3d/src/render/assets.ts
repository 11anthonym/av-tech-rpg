import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
// Register only the glTF 2 loader. Optional compressed/advanced extensions can
// be registered when an accepted M2 asset actually needs them.
import "@babylonjs/loaders/glTF/2.0/glTFLoader";

// Asset ownership is explicit: callers retain/dispose the returned container.
// M2 character rigs/animation groups can use this same import boundary.
export async function loadModel(scene: Scene, assetPath: string, parent: TransformNode) {
  const container = await LoadAssetContainerAsync(`${import.meta.env.BASE_URL}assets/${assetPath}`, scene);
  container.addAllToScene();
  for (const node of container.rootNodes) node.parent = parent;
  return container;
}
