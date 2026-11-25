import { Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import { Ray } from "@babylonjs/core/Culling/ray.js";
import type { Scene } from "@babylonjs/core/scene";
import type { InteractionDefinition } from "./shop.ts";

export function selectInteraction(scene: Scene, player: Vector3, interactions: InteractionDefinition[]): InteractionDefinition | undefined {
  const eye = player.add(new Vector3(0, 0.5, 0));
  const candidates = interactions.map(definition => ({ definition,
    distance: Vector3.Distance(player, Vector3.FromArray(definition.anchor)) }))
    .filter(candidate => candidate.distance <= candidate.definition.radius &&
      (candidate.definition.minApproachZ === undefined || player.z >= candidate.definition.minApproachZ))
    .sort((a, b) => b.definition.priority - a.definition.priority || a.distance - b.distance ||
      a.definition.id.localeCompare(b.definition.id));
  return candidates.find(({ definition }) => {
    const anchor = Vector3.FromArray(definition.anchor);
    const offset = anchor.subtract(eye);
    const length=offset.length();
    const hit = scene.pickWithRay(new Ray(eye, offset.normalizeToNew(), length),
      mesh => Boolean(mesh.metadata?.blocksSight || mesh.metadata?.interactionId));
    // Babylon's mesh picking can report a triangle beyond the short ray's end.
    // Geometry behind the anchor must not hide a reachable contextual action.
    return !hit?.hit || hit.distance>=length-.001 || hit.pickedMesh?.metadata?.interactionId === definition.id;
  })?.definition;
}
