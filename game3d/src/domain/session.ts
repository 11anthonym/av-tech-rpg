import { actions, contentIds, shopLoad, shopRules } from "../content/ids.ts";
import type { CargoId } from "../content/ids.ts";
import type { ActionId, AreaId, TechnicianId } from "../content/ids.ts";

export interface Session {
  areaId: AreaId;
  technicianId: TechnicianId;
  completedActions: ActionId[];
  flags: { shopBrief: boolean };
  carry: CargoId[];
  loaded: CargoId[];
  tools: (typeof contentIds.tool)[];
  energy: number;
}

export function newSession(): Session {
  return { areaId: contentIds.area, technicianId: contentIds.technician, completedActions: [],
    flags: { shopBrief: false }, carry: [], loaded: [], tools: [contentIds.tool], energy: 100 };
}

export interface ActionResult {
  state: Session;
  event: { actionId: ActionId; outcome: "completed" | "reviewed" | "blocked"; message: string; title?: string; dialog?: boolean };
}

export const vanReady = (state: Session) => state.flags.shopBrief && shopLoad.every(id => state.loaded.includes(id)) && !state.carry.length;
export function objective(state: Session) {
  if (!state.flags.shopBrief) return "Talk to the supervisor at the dispatch counter.";
  if (state.carry.length) return `Carry ${state.carry[0]} to Van #3’s open rear doors.`;
  if (vanReady(state)) return "Van #3 ready for Center City East · two video carts.";
  return `Pick up staged equipment, then load Van #3 (${state.loaded.length}/3).`;
}
export function describeAction(state: Session, actionId: ActionId) {
  if (actionId === "shop.pickup-equipment") {
    if (!state.flags.shopBrief) return { label: "Ask supervisor first", available: false };
    if (state.carry.length) return { label: "Hands full · load Van #3", available: false };
    const next = shopLoad.find(id => !state.loaded.includes(id));
    return { label: next ? `Pick up ${next}` : "All staged equipment loaded", available: Boolean(next) };
  }
  if (actionId === "shop.load-van") return { label: state.carry.length ? `Load ${state.carry[0]}` : "Review Van #3 cargo", available: true };
  const done = state.completedActions.includes(actionId);
  return { label: done ? actions[actionId].reviewLabel : actions[actionId].label, available: true };
}

export function resolveAction(state: Session, actionId: ActionId): ActionResult {
  const result = (next: Session, outcome: ActionResult["event"]["outcome"], message: string, title?: string, dialog = false): ActionResult =>
    ({ state: next, event: { actionId, outcome, message, title, dialog } });
  if (actionId === "shop.pickup-equipment") {
    const prompt = describeAction(state, actionId);
    if (!prompt.available) return result(state, "blocked", prompt.label);
    const next = shopLoad.find(id => !state.loaded.includes(id))!;
    return result({ ...state, carry: [next], energy: Math.max(0, state.energy - shopRules.pickupEnergy) }, "completed", `Picked up ${next}. Hands 1/1 · take it to Van #3.`);
  }
  if (actionId === "shop.load-van") {
    if (!state.carry.length) return result(state, "reviewed", `Cargo ${state.loaded.length}/3: ${state.loaded.join(", ") || "Nothing loaded"}.${vanReady(state) ? " Ready for Center City East." : " Load all three staged groups."}`, "Van #3 cargo", true);
    if (state.loaded.length + state.carry.length > shopRules.vanCapacity || state.carry.some(id => state.loaded.includes(id))) return result(state, "blocked", "Van #3 cannot accept that load.");
    const next = { ...state, carry: [], loaded: [...state.loaded, ...state.carry] };
    return result(next, "completed", `${state.carry[0]} loaded (${next.loaded.length}/3).${vanReady(next) ? " Van #3 ready for Center City East." : " Return to staging for the next group."}`);
  }
  const reviewed = state.completedActions.includes(actionId);
  const next = reviewed ? state : { ...state, completedActions: [...state.completedActions, actionId],
    flags: { ...state.flags, shopBrief: actionId === "shop.brief-supervisor" || state.flags.shopBrief } };
  return result(next, reviewed ? "reviewed" : "completed", actions[actionId].message,
    actionId === "shop.brief-supervisor" ? "We’re Already Late" : undefined, true);
}
