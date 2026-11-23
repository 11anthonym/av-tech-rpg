import type { Vec3 } from "../world/shop.ts";

export interface CameraObstacle { id: string; position: Vec3; size: Vec3 }
// A conservative sphere sweep: expand each authored box by the camera radius,
// then intersect the entire boom segment. It also protects the near-plane
// corners that a single centre ray misses. Rounded box corners are conservative.
export const CAMERA_RADIUS = 0.18;
export function clearBoomDistance(origin: Vec3, direction: Vec3, length: number, obstacles: readonly CameraObstacle[]) {
  let nearest = length;
  for (const box of obstacles) {
    let enter = 0, exit = length;
    for (let axis = 0; axis < 3; axis++) {
      const half = box.size[axis]! / 2 + CAMERA_RADIUS;
      const min = box.position[axis]! - half, max = box.position[axis]! + half;
      const start = origin[axis]!, velocity = direction[axis]!;
      if (Math.abs(velocity) < 1e-8) {
        if (start < min || start > max) { exit = -1; break; }
      } else {
        const a = (min - start) / velocity, b = (max - start) / velocity;
        enter = Math.max(enter, Math.min(a, b)); exit = Math.min(exit, Math.max(a, b));
      }
      if (exit < enter) break;
    }
    if (exit >= enter && enter <= length) nearest = Math.min(nearest, Math.max(0, enter - 0.02));
  }
  return nearest;
}

export function recoverBoom(previous: number, safe: number, delta: number) {
  // Obstruction always wins immediately. Only return to open space is damped.
  return safe <= previous ? safe : previous + (safe - previous) * (1 - Math.exp(-8 * delta));
}
export function cameraOpacity(distance: number) {
  return Math.max(0, Math.min(1, (distance - 0.4) / 0.85));
}
