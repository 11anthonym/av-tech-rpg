// A deliberately small bridge to existing content IDs, not a copy of the career.
export const contentIds = {
  technician: "prototype-tech",
  area: "shop",
  vehicle: "van3",
  tool: "screwdriver",
  route: "centerCityTutorial",
} as const;

export const areaIds = ['shop','centerCityGarage','centerCityLobby','centerCityConferenceRoom'] as const;
export type AreaId = typeof areaIds[number];
export type TechnicianId = typeof contentIds.technician;
export type ShopActionId = "shop.inspect-workbench" | "shop.brief-supervisor" | "shop.pickup-equipment" | "shop.load-van";
export const travelActions = ['shop.choose-route','route.garageRoute','route.loadingZoneGamble','route.circleForCurb',
  'garage.brief-supervisor','garage.unload-equipment','garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const;
export type TravelActionId = typeof travelActions[number];
export type ActionId = ShopActionId | TravelActionId;
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
