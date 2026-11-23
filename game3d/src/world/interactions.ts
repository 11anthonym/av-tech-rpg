import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Ray } from "@babylonjs/core/Culling/ray";
import type { Scene } from "@babylonjs/core/scene";
import type { InteractionDefinition } from "./shop.ts";

export function selectInteraction(scene: Scene, player: Vector3, interactions: InteractionDefinition[]): InteractionDefinition | undefined {
  const eye = player.add(new Vector3(0, 0.5, 0));
  const candidates = interactions.map(definition => ({ definition,
    distance: Vector3.Distance(player, Vector3.FromArray(definition.anchor)) }))
    .filter(candidate => candidate.distance <= candidate.definition.radius)
    .sort((a, b) => b.definition.priority - a.definition.priority || a.distance - b.distance ||
      a.definition.id.localeCompare(b.definition.id));
  return candidates.find(({ definition }) => {
    const anchor = Vector3.FromArray(definition.anchor);
    const offset = anchor.subtract(eye);
    const hit = scene.pickWithRay(new Ray(eye, offset.normalizeToNew(), offset.length()),
      mesh => Boolean(mesh.metadata?.blocksSight || mesh.metadata?.interactionId));
    return !hit?.hit || hit.pickedMesh?.metadata?.interactionId === definition.id;
  })?.definition;
}
