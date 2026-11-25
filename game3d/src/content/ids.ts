// A deliberately small bridge to existing content IDs, not a copy of the career.
export const contentIds = {
  technician: "prototype-tech",
  area: "shop",
  vehicle: "van3",
  tool: "screwdriver",
  route: "centerCityTutorial",
} as const;

export const areaIds = ['shop','centerCityGarage','centerCityLobby','centerCityConferenceRoom','serviceOffice'] as const;
export type AreaId = typeof areaIds[number];
export type TechnicianId = typeof contentIds.technician;
export type ShopActionId = "shop.inspect-workbench" | "shop.brief-supervisor" | "shop.pickup-equipment" | "shop.load-van";
export const travelActions = ['shop.choose-route','route.garageRoute','route.loadingZoneGamble','route.circleForCurb',
  'garage.brief-supervisor','garage.unload-equipment','garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const;
export type TravelActionId = typeof travelActions[number];
export const workdayActions = ['conference.pickup-part','install.cart1','install.cart2','conference.verify',
  'pressure.sort-labels','pressure.match-by-memory','pressure.square-caster','pressure.snug-caster-fast','pressure.leave',
  'finish.tidy','finish.rush','finish.wiley-workaround','reward.toolBag','reward.drill','reward.handTruck',
  'centerCityConferenceRoomToShop','shift.clock-out','shift.prep','shift.recovery-day','morning.accept'] as const;
export type WorkdayActionId=typeof workdayActions[number];
export const serviceActions=['service.prepare','service.prep-review','service.prep-josh','service.prep-none','service.depart',
  'service-client','client-symptom-timeline','service-display','service-room-pressure','service-pickup','service.review-findings','serviceOfficeToShop'] as const;
export type ServiceActionId=typeof serviceActions[number];
export const isServiceAction=(id:ActionId):id is ServiceActionId=>(serviceActions as readonly string[]).includes(id);
export type ActionId = ShopActionId | TravelActionId | WorkdayActionId | ServiceActionId;
export const isWorkdayAction=(id:ActionId):id is WorkdayActionId=>(workdayActions as readonly string[]).includes(id);
export type ToolId='screwdriver'|'toolBag'|'drill'|'handTruck';
export const isTravelAction = (id:ActionId):id is TravelActionId => (travelActions as readonly string[]).includes(id);
// Canonical saved cargo labels from GAME_CONTENT.tutorial.shopLoad.
export const shopLoad = ["Cart frame boxes", "Display boxes", "Accessory tote"] as const;
export type CargoId = typeof shopLoad[number];
export const shopRules = { carryCapacity: 1, vanCapacity: 3, pickupEnergy: 2 } as const;

export const actions: Record<ShopActionId, { label: string; reviewLabel: string; message: string }> = {
  "shop.inspect-workbench": {
    label: "Inspect workbench",
    reviewLabel: "Review workbench",
    message: "Personal kit: screwdriver. You already own it. The staged cart hardware goes in Van #3 after the supervisor briefing.",
  },
  "shop.brief-supervisor": { label: "Talk to supervisor", reviewLabel: "Review assignment", message: '"You must be the new tech. Grab those cart boxes and load Van #3. We have a simple two-cart build downtown. I’ll show you everything onsite."' },
  "shop.pickup-equipment": { label: "Pick up staged equipment", reviewLabel: "Review staging", message: "" },
  "shop.load-van": { label: "Load Van #3", reviewLabel: "Review Van #3 cargo", message: "" },
};
