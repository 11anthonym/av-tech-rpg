import { contentIds } from "../content/ids.ts";
import type { ActionId, AreaId } from "../content/ids.ts";

export type Vec3 = readonly [number, number, number];
export interface PropDefinition {
  id: string;
  position: Vec3;
  size: Vec3;
  material: "concrete" | "wall" | "steel" | "wood" | "carton";
  solid: boolean;
}
export interface InteractionDefinition {
  id: string;
  actionId: ActionId;
  anchor: Vec3;
  meshId: string;
  radius: number;
  priority: number;
}
export interface AreaDefinition {
  id: AreaId;
  label: string;
  spawn: Vec3;
  props: PropDefinition[];
  interactions: InteractionDefinition[];
}

export const shop: AreaDefinition = {
  id: contentIds.area,
  label: "Trunkslammer Shop",
  spawn: [0, 0.92, -4],
  props: [
    { id: "floor", position: [0, -0.1, 1], size: [18, 0.2, 16], material: "concrete", solid: true },
    { id: "wall-back", position: [0, 1.6, 9], size: [18, 3.2, 0.25], material: "wall", solid: true },
    { id: "wall-front", position: [0, 1.6, -7], size: [18, 3.2, 0.25], material: "wall", solid: true },
    { id: "wall-left", position: [-9, 1.6, 1], size: [0.25, 3.2, 16], material: "wall", solid: true },
    { id: "wall-right", position: [9, 1.6, 1], size: [0.25, 3.2, 16], material: "wall", solid: true },
    { id: "workbench", position: [0, 0.5, 0], size: [3, 1, 1], material: "wood", solid: true },
    { id: "staging", position: [-5.5, 1, 5], size: [3, 2, 0.8], material: "steel", solid: true },
    { id: "staging-cartons", position: [-5.5, 2.25, 5], size: [2.5, 0.5, 0.6], material: "carton", solid: false },
    { id: "supply-counter", position: [-5.5, 0.6, -2], size: [2.5, 1.2, 1], material: "wood", solid: true },
    { id: contentIds.vehicle, position: [5.8, 1.1, 4.5], size: [2.2, 2.2, 4.8], material: "steel", solid: true },
  ],
  interactions: [{ id: "shop.workbench", actionId: "shop.inspect-workbench", anchor: [0, 1.05, -0.55],
    meshId: "workbench", radius: 2.1, priority: 1 }],
};

export function isSafePosition(position: Vec3): boolean {
  return position.every(Number.isFinite) && Math.abs(position[0]) < 8.4
    && position[1] >= 0.85 && position[1] <= 2 && position[2] > -6.4 && position[2] < 8.4
    && !shop.props.some(prop => prop.solid && prop.id !== "floor" &&
      Math.abs(position[0] - prop.position[0]) < prop.size[0] / 2 + 0.29 &&
      Math.abs(position[2] - prop.position[2]) < prop.size[2] / 2 + 0.29);
}
