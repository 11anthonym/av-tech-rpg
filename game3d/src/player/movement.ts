export interface MoveInput { x: number; z: number }

// yaw=0 looks towards +Z; right is +X. Independent of Babylon and frame rate.
export function movementVector(input: MoveInput, yaw: number): { x: number; z: number } {
  const length = Math.hypot(input.x, input.z);
  if (!length) return { x: 0, z: 0 };
  const x = input.x / length;
  const z = input.z / length;
  return { x: Math.cos(yaw) * x - Math.sin(yaw) * z,
    z: Math.sin(yaw) * x + Math.cos(yaw) * z };
}
