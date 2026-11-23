import { actions, contentIds } from "../content/ids.ts";
import type { ActionId, AreaId, TechnicianId } from "../content/ids.ts";

export interface Session {
  areaId: AreaId;
  technicianId: TechnicianId;
  completedActions: ActionId[];
}

export function newSession(): Session {
  return { areaId: contentIds.area, technicianId: contentIds.technician, completedActions: [] };
}

export interface ActionResult {
  state: Session;
  event: { actionId: ActionId; outcome: "completed" | "reviewed"; message: string };
}

export function resolveAction(state: Session, actionId: ActionId): ActionResult {
  const reviewed = state.completedActions.includes(actionId);
  return {
    state: reviewed ? state : { ...state, completedActions: [...state.completedActions, actionId] },
    event: { actionId, outcome: reviewed ? "reviewed" : "completed", message: actions[actionId].message },
  };
}
