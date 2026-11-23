import { LoadAssetContainerAsync } from "@babylonjs/core/Loading/sceneLoader";
import type { Scene } from "@babylonjs/core/scene";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
// The pinned technician embeds WebP. Register only its required extension;
// no remote decoder, runtime model CDN or optional compression service.
import "@babylonjs/loaders/glTF/2.0/glTFLoader";
import "@babylonjs/loaders/glTF/2.0/Extensions/EXT_texture_webp";

// Asset ownership is explicit: callers retain/dispose the returned container.
// M2 character rigs/animation groups can use this same import boundary.
export async function loadModel(scene: Scene, assetPath: string, parent: TransformNode) {
  const container = await LoadAssetContainerAsync(`${import.meta.env.BASE_URL}assets/${assetPath}`, scene);
  container.addAllToScene();
  for (const node of container.rootNodes) node.parent = parent;
  return container;
}
