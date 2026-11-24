// Canonical centerCityTutorial approaches from the original GAME_CONTENT.
// tests/travel.test.ts compares this bridge with the actual 2D definitions.
export const routeApproaches = [
  { id: 'garageRoute', label: 'Use the reliable garage route', arrival: 483,
    detail: 'Predictable garage arrival at 8:03 AM. No extra energy or burnout.',
    energy: 0, burnout: 0, chance: 0 },
  { id: 'loadingZoneGamble', label: 'Try the loading-zone approach', arrival: 478,
    detail: 'Arrive five minutes earlier. Costs 2 energy; 35% curb-conflict risk costs another 2 energy and 1 burnout. No dock was booked.',
    energy: 2, burnout: 0, chance: .35 },
  { id: 'circleForCurb', label: 'Circle for curb access', arrival: 491,
    detail: 'Look for curb access before accepting the garage. Arrive at 8:11 AM with 1 extra burnout.',
    energy: 0, burnout: 1, chance: 0 },
] as const;
export type RouteChoiceId = typeof routeApproaches[number]['id'];
export interface RouteDecision {
  routeId: 'centerCityTutorial'; choiceId: RouteChoiceId; roll: number;
  incident: boolean; energyCost: number; burnoutGain: number; arrival: number;
}
export interface TravelProgress {
  seed: number; route: RouteDecision | null; parkingExpense: number; clockMinutes: number;
}
export const newTravel = (seed = 173) : TravelProgress => ({ seed, route: null, parkingExpense: 0, clockMinutes: 431 });
export function routeOutcome(choiceId: RouteChoiceId, seed: number): RouteDecision {
  const choice=routeApproaches.find(item=>item.id===choiceId)!;
  const roll=(Math.imul((seed^0x9e3779b9)>>>0,0x45d9f3b)>>>0)/4294967296;
  const incident=roll<choice.chance;
  return {routeId:'centerCityTutorial',choiceId,roll,incident,energyCost:choice.energy+(incident?2:0),
    burnoutGain:choice.burnout+(incident?1:0),arrival:choice.arrival};
}
export function workdayClock(minutes:number) {
  const hour=Math.floor(minutes/60); return `MON ${hour>12?hour-12:hour}:${String(minutes%60).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
}
