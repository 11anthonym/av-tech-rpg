import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector.js";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";

// Original two-bone solve layered after the licensed native gait. This is a
// procedural hold pose, not a sourced carry or pickup animation clip.
function aim(node: TransformNode, current: Vector3, desired: Vector3) {
  // glTF's handedness-conversion parent contains a reflection. Convert vectors
  // through its full matrix rather than decomposing a world quaternion.
  const inverseParent = node.parent!.getWorldMatrix().clone().invert();
  const from = Vector3.TransformNormal(current, inverseParent).normalize();
  const to = Vector3.TransformNormal(desired, inverseParent).normalize();
  const axis = Vector3.Cross(from, to); const dot = Math.max(-1, Math.min(1, Vector3.Dot(from, to)));
  if (axis.lengthSquared() < 1e-10) return;
  const delta = Quaternion.RotationAxis(axis.normalize(), Math.acos(dot));
  node.rotationQuaternion = delta.multiply(node.rotationQuaternion ?? Quaternion.Identity()).normalize();
  node.computeWorldMatrix(true);
}
export function applyCarryPose(nodes: readonly TransformNode[], root: TransformNode) {
  const world = root.computeWorldMatrix(true);
  let maxError = 0;
  for (const [side, sign] of [["Left", -1], ["Right", 1]] as const) {
    const upper = nodes.find(n => n.name === `mixamorig:${side}Arm`);
    const lower = nodes.find(n => n.name === `mixamorig:${side}ForeArm`);
    const hand = nodes.find(n => n.name === `mixamorig:${side}Hand`);
    if (!upper || !lower || !hand) continue;
    upper.computeWorldMatrix(true); lower.computeWorldMatrix(true); hand.computeWorldMatrix(true);
    const a = upper.getAbsolutePosition().clone(), b = lower.getAbsolutePosition().clone(), c = hand.getAbsolutePosition().clone();
    const l1 = Vector3.Distance(a,b), l2 = Vector3.Distance(b,c);
    const target = Vector3.TransformCoordinates(new Vector3(sign * .3, 1.15, .35), world);
    const direction = target.subtract(a).normalize();
    const distance = Math.max(Math.abs(l1-l2)+.001, Math.min(l1+l2-.001, Vector3.Distance(a,target)));
    const pole = Vector3.TransformNormal(new Vector3(sign, -.4, -.1), world);
    const bend = pole.subtract(direction.scale(Vector3.Dot(pole, direction))).normalize();
    const along = (l1*l1-l2*l2+distance*distance)/(2*distance);
    const elbow = a.add(direction.scale(along)).add(bend.scale(Math.sqrt(Math.max(0,l1*l1-along*along))));
    aim(upper, b.subtract(a), elbow.subtract(a));
    lower.computeWorldMatrix(true); hand.computeWorldMatrix(true);
    aim(lower, hand.getAbsolutePosition().subtract(lower.getAbsolutePosition()), target.subtract(lower.getAbsolutePosition()));
    hand.computeWorldMatrix(true);
    maxError = Math.max(maxError, Vector3.Distance(hand.getAbsolutePosition(), target));
  }
  return maxError;
}
