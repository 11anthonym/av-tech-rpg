export interface MoveInput { x: number; z: number; sprint?: boolean }

// Metres/second. Keep the established indoor walk and offer a held-key hurry
// pace; carrying remains slower. Locomotion does not invent an energy tax.
export function movementSpeed(sprint: boolean, carrying: boolean): number {
  return sprint ? (carrying ? 2 : 2.6) : (carrying ? 1.4 * 7 / 8 : 1.4);
}

// yaw=0 looks towards +Z; right is +X. Independent of Babylon and frame rate.
export function movementVector(input: MoveInput, yaw: number): { x: number; z: number } {
  const length = Math.hypot(input.x, input.z);
  if (!length) return { x: 0, z: 0 };
  const x = input.x / length;
  const z = input.z / length;
  return { x: Math.cos(yaw) * x - Math.sin(yaw) * z,
    z: Math.sin(yaw) * x + Math.cos(yaw) * z };
}
