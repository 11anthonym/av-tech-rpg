import { contentIds, actions, shopLoad, shopRules,areaIds } from "../content/ids.ts";
import type { ActionId } from "../content/ids.ts";
import { newSession } from "../domain/session.ts";
import type { Session } from "../domain/session.ts";
import { isSafePosition, shop } from "../world/shop.ts";
import type { Vec3 } from "../world/shop.ts";
import { getArea } from '../world/areas.ts';
import { validTravelProgress } from '../domain/travel.ts';
import {validWorkday,supervisorPresent} from '../domain/workday.ts';

export const SAVE_KEY = "av-tech-rpg-3d-dev-v4";
export const M4A_SAVE_KEY = "av-tech-rpg-3d-dev-v3";
export const PREVIOUS_SAVE_KEY = "av-tech-rpg-3d-dev-v2";
export const M1_SAVE_KEY = "av-tech-rpg-3d-dev-v1";
export interface SaveData {
  version: 4;
  session: Session;
  position: Vec3;
  camera: { yaw: number; pitch: number; distance: number };
}
export function freshSave(seed=173): SaveData {
  const session=newSession();session.travel.seed=seed;
  return { version: 4, session, position: shop.spawn,
    camera: { yaw: 0, pitch: 0.35, distance: 5.5 } };
}

export function parseSave(raw: string): SaveData {
  const data = JSON.parse(raw) as Omit<SaveData,'version'> & {version:number};
  if (![1, 2,3,4].includes(data?.version) || !areaIds.includes(data.session?.areaId) ||
    (data.version<3&&data.session.areaId!==contentIds.area) ||
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
    (data.version === 1 && session.completedActions.some(id => id !== "shop.inspect-workbench"))) throw new Error("Invalid action history");
  if (data.version >= 2) {
    const s = data.session;
    const validCargo = (value: unknown): value is Session["carry"] => Array.isArray(value) && value.every(id => shopLoad.includes(id)) && new Set(value).size === value.length;
    if (typeof s.flags?.shopBrief !== "boolean" || !validCargo(s.carry) || !validCargo(s.loaded) || s.carry.length > shopRules.carryCapacity ||
      s.loaded.length > shopRules.vanCapacity || s.carry.some(id => s.loaded.includes(id)) ||
      (!s.flags.shopBrief && (s.carry.length || s.loaded.length)) || s.flags.shopBrief !== s.completedActions.includes("shop.brief-supervisor") ||
      !Array.isArray(s.tools) || s.tools[0] !== contentIds.tool ||new Set(s.tools).size!==s.tools.length||
      !s.tools.every(id=>['screwdriver','toolBag','drill','handTruck'].includes(id))||(data.version<4&&s.tools.length!==1)||
      !Number.isInteger(s.energy) || s.energy < 0 || s.energy > 100) throw new Error("Invalid shop progress");
    session = { ...session, flags: { ...session.flags,shopBrief: s.flags.shopBrief }, carry: [...s.carry], loaded: [...s.loaded], tools: [...s.tools], energy: s.energy };
  }
  if(data.version>=3) {
    session={...session,areaId:data.session.areaId,flags:{...data.session.flags},burnout:data.session.burnout,
      delivered:data.session.delivered,travel:data.session.travel};
    if(data.version===4)session={...session,workday:data.session.workday,career:data.session.career};
    if(!validTravelProgress(session)||!validWorkday(session))throw new Error('Invalid workday progress');
    session=structuredClone(session);
  }
  const area=getArea(session.areaId);
  const collisionArea=supervisorPresent(session)?area:{...area,props:area.props.filter(prop=>prop.id!=='supervisor')};
  return { version: 4,
    session,
    position: isSafePosition(data.position,collisionArea) ? data.position : area.spawn,
    camera: { yaw: data.camera.yaw % (Math.PI * 2), pitch: Math.max(0.15, Math.min(1.05, data.camera.pitch)),
      distance: Math.max(2.2, Math.min(8.5, data.camera.distance)) } };
}

export interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void }

export class SaveRepository {
  private storage: StoragePort;
  private writable = true;
  private lastRaw: string | null = null;
  problem: string | undefined;
  constructor(storage: StoragePort) { this.storage = storage; }

  load(): { data: SaveData; message: string } {
    try {
      this.lastRaw = this.storage.getItem(SAVE_KEY);
      const raw = this.lastRaw ?? this.storage.getItem(M4A_SAVE_KEY) ?? this.storage.getItem(PREVIOUS_SAVE_KEY) ?? this.storage.getItem(M1_SAVE_KEY);
      return { data: raw ? parseSave(raw) : freshSave(crypto.getRandomValues(new Uint32Array(1))[0]!), message: raw ? "3D session restored" : "New 3D session" };
    } catch {
      // Preserve damaged/unknown saves for recovery; do not overwrite them.
      this.writable = false;
      this.problem = "Saving unavailable · existing data was retained.";
      return { data: freshSave(), message: "3D save unavailable. Playing without saving; existing data was retained." };
    }
  }

  save(data: SaveData): boolean {
    if (!this.writable) return false;
    try {
      if (this.storage.getItem(SAVE_KEY) !== this.lastRaw) {
        this.writable = false;
        this.problem = "Another tab saved this session. Reload to use its latest progress.";
        return false;
      }
      const raw = JSON.stringify(data);
      this.storage.setItem(SAVE_KEY, raw); this.lastRaw = raw; return true;
    }
    catch { return false; }
  }
}
