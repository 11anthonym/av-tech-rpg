// Add or edit content here before changing the game engine in app.js.
window.GAME_CONTENT = {
  technicians: [
    {
      id: "prototype-tech",
      name: "Prototype Tech",
      tagline: "First day. One screwdriver. No onboarding packet.",
      stats: { energy: 100, burnout: 0, craftsmanship: 2, confidence: 1 },
      startingTools: ["screwdriver"],
    },
  ],

  tools: {
    screwdriver: {
      id: "screwdriver",
      name: "Basic Screwdriver",
      description: "The one tool you knew to bring.",
      effect: "Allows basic assembly.",
    },
    toolBag: {
      id: "toolBag",
      name: "Tool Bag",
      description: "A place for your tools that is not a cardboard box.",
      effect: "Future effect: improve organization.",
    },
    drill: {
      id: "drill",
      name: "Basic Drill",
      description: "Entry-level, but the battery is yours.",
      effect: "Future effect: speed up assembly.",
    },
    handTruck: {
      id: "handTruck",
      name: "Folding Hand Truck",
      description: "Carry more gear before your next garage trip.",
      effect: "Future effect: increase carry capacity.",
    },
  },

  vehicles: {
    van3: {
      id: "van3",
      name: "Company Van #3",
      cargoCapacity: 3,
      organization: "Poor",
      reliability: "Questionable",
      fuelEconomy: "Not discussed",
      clearance: "Garage-sized, probably",
      comfort: "The passenger window mostly closes.",
    },
  },

  tutorial: {
    shopLoad: ["Cart frame boxes", "Display boxes", "Accessory tote"],
    garageUnload: ["Cart frame boxes", "Display boxes", "Accessory tote"],
    assembly: [
      { id: "cart-1-frame", label: "Cart 1 frame", destination: "cart1" },
      { id: "cart-1-display", label: "Cart 1 display", destination: "cart1" },
      { id: "cart-2-frame", label: "Cart 2 frame", destination: "cart2" },
      { id: "cart-2-display", label: "Cart 2 display", destination: "cart2" },
    ],
    rewardTools: ["toolBag", "drill", "handTruck"],
  },

  scenes: {
    shop: {
      name: "Trunkslammer Shop",
      kicker: "Broomall, PA",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 44, y: 36, w: 220, h: 38, text: "BROOMALL SHOP / UNIT 4" },
        { type: "office", x: 58, y: 110, w: 170, h: 140, text: "SALES OFFICE" },
        { type: "shelf", x: 480, y: 88, w: 220, h: 92, text: "STAGING AREA" },
        { type: "shelf", x: 500, y: 355, w: 160, h: 92, text: "MYSTERY RETURNS" },
        { type: "van", x: 760, y: 280, w: 150, h: 190, text: "VAN #3" },
        { type: "floor-note", x: 278, y: 208, w: 150, h: 30, text: "UNLABELED CABLES" },
      ],
    },
    garage: {
      name: "Parking Garage",
      kicker: "Center City East",
      playerStart: { x: 760, y: 420 },
      decor: [
        { type: "label", x: 45, y: 36, w: 230, h: 38, text: "LEVEL B2 / SECTION C" },
        { type: "exit", x: 44, y: 115, w: 145, h: 110, text: "STREET EXIT" },
        { type: "van", x: 715, y: 260, w: 170, h: 210, text: "VAN #3" },
        { type: "floor-note", x: 330, y: 280, w: 210, h: 34, text: "A LONGER WALK THAN QUOTED" },
      ],
    },
    lobby: {
      name: "Client Lobby",
      kicker: "Center City East",
      playerStart: { x: 130, y: 420 },
      decor: [
        { type: "label", x: 45, y: 36, w: 210, h: 38, text: "CLIENT LOBBY" },
        { type: "desk", x: 295, y: 145, w: 220, h: 96, text: "SECURITY DESK" },
        { type: "elevator", x: 720, y: 95, w: 150, h: 190, text: "ELEVATORS" },
        { type: "floor-note", x: 232, y: 360, w: 270, h: 32, text: "VISITOR BADGE REQUIRED" },
      ],
    },
    client: {
      name: "Conference Room",
      kicker: "Center City East / Client Floor",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 220, h: 38, text: "TEMPORARY WORK AREA" },
        { type: "boxes", x: 90, y: 265, w: 175, h: 120, text: "DELIVERED BOXES" },
        { type: "build", x: 455, y: 120, w: 150, h: 150, text: "CART 1" },
        { type: "build", x: 680, y: 290, w: 150, h: 150, text: "CART 2" },
        { type: "floor-note", x: 345, y: 410, w: 210, h: 30, text: "PACKAGING ACCUMULATES HERE" },
      ],
    },
  },
};
