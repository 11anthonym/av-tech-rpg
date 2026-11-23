import { contentIds, actions, shopLoad, shopRules } from "../content/ids.ts";
import type { ActionId } from "../content/ids.ts";
import { newSession } from "../domain/session.ts";
import type { Session } from "../domain/session.ts";
import { isSafePosition, shop } from "../world/shop.ts";
import type { Vec3 } from "../world/shop.ts";

export const SAVE_KEY = "av-tech-rpg-3d-dev-v1";
export interface SaveData {
  version: 2;
  session: Session;
  position: Vec3;
  camera: { yaw: number; pitch: number; distance: number };
}
export function freshSave(): SaveData {
  return { version: 2, session: newSession(), position: shop.spawn,
    camera: { yaw: 0, pitch: 0.35, distance: 5.5 } };
}

export function parseSave(raw: string): SaveData {
  const data = JSON.parse(raw) as SaveData;
  if (![1, 2].includes(data?.version) || data.session?.areaId !== contentIds.area ||
    data.session.technicianId !== contentIds.technician ||
    !Array.isArray(data.session.completedActions) ||
    !data.session.completedActions.every((id: unknown) => typeof id === "string" && Object.hasOwn(actions, id)) ||
    !Array.isArray(data.position) || data.position.length !== 3 ||
    !data.position.every((n: unknown) => typeof n === "number" && Number.isFinite(n)) ||
    !data.camera || ![data.camera.yaw, data.camera.pitch, data.camera.distance].every(Number.isFinite)) {
    throw new Error("Unsupported or damaged 3D save");
  }
  let session = { ...newSession(), completedActions: [...new Set(data.session.completedActions)] as ActionId[] };
  if (session.completedActions.some(id => id !== "shop.inspect-workbench" && id !== "shop.brief-supervisor") ||
    (data.version !== 2 && session.completedActions.some(id => id !== "shop.inspect-workbench"))) throw new Error("Invalid action history");
  if (data.version === 2) {
    const s = data.session;
    const validCargo = (value: unknown): value is Session["carry"] => Array.isArray(value) && value.every(id => shopLoad.includes(id)) && new Set(value).size === value.length;
    if (typeof s.flags?.shopBrief !== "boolean" || !validCargo(s.carry) || !validCargo(s.loaded) || s.carry.length > shopRules.carryCapacity ||
      s.loaded.length > shopRules.vanCapacity || s.carry.some(id => s.loaded.includes(id)) ||
      (!s.flags.shopBrief && (s.carry.length || s.loaded.length)) || s.flags.shopBrief !== s.completedActions.includes("shop.brief-supervisor") ||
      !Array.isArray(s.tools) || s.tools.length !== 1 || s.tools[0] !== contentIds.tool ||
      !Number.isInteger(s.energy) || s.energy < 0 || s.energy > 100) throw new Error("Invalid shop progress");
    session = { ...session, flags: { shopBrief: s.flags.shopBrief }, carry: [...s.carry], loaded: [...s.loaded], tools: [...s.tools], energy: s.energy };
  }
  return { version: 2,
    session,
    position: isSafePosition(data.position) ? data.position : shop.spawn,
    camera: { yaw: data.camera.yaw % (Math.PI * 2), pitch: Math.max(0.15, Math.min(1.05, data.camera.pitch)),
      distance: Math.max(2.2, Math.min(8.5, data.camera.distance)) } };
}

export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }

export class SaveRepository {
  private storage: StoragePort;
  private writable = true;
  constructor(storage: StoragePort) { this.storage = storage; }

  load(): { data: SaveData; message: string } {
    try {
      const raw = this.storage.getItem(SAVE_KEY);
      return { data: raw ? parseSave(raw) : freshSave(), message: raw ? "3D session restored" : "New 3D session" };
    } catch {
      // Preserve damaged/unknown saves for recovery; do not overwrite them.
      this.writable = false;
      return { data: freshSave(), message: "3D save unavailable. Playing without saving; existing data was retained." };
    }
  }

  save(data: SaveData): boolean {
    if (!this.writable) return false;
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(data)); return true; }
    catch { return false; }
  }
}
