// A deliberately small bridge to existing content IDs, not a copy of the career.
export const contentIds = {
  technician: "prototype-tech",
  area: "shop",
  vehicle: "van3",
  tool: "screwdriver",
  route: "centerCityTutorial",
} as const;

export type AreaId = typeof contentIds.area;
export type TechnicianId = typeof contentIds.technician;
export type ActionId = "shop.inspect-workbench";

export const actions: Record<ActionId, { label: string; reviewLabel: string; message: string }> = {
  "shop.inspect-workbench": {
    label: "Inspect workbench",
    reviewLabel: "Review workbench",
    message: "The workbench is clear. This is where the first-day tool kit will be prepared.",
  },
};
