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
    {
      id: "organized-rookie",
      name: "Organized Rookie",
      tagline: "Brought a tool bag, snacks, and a dangerous belief in written notes.",
      stats: { energy: 105, burnout: 0, craftsmanship: 2, confidence: 0 },
      startingTools: ["screwdriver", "toolBag"],
    },
  ],

  tools: {
    screwdriver: {
      id: "screwdriver",
      name: "Basic Screwdriver",
      description: "The one tool you knew to bring.",
      effect: "Allows basic assembly.",
      price: 0,
    },
    toolBag: {
      id: "toolBag",
      name: "Tool Bag",
      description: "A place for your tools that is not a cardboard box.",
      effect: "Reduce energy spent picking up equipment by 1.",
      modifiers: { pickupEnergyReduction: 1 },
      price: 65,
    },
    drill: {
      id: "drill",
      name: "Basic Drill",
      description: "Entry-level, but the battery is yours.",
      effect: "Reduce energy spent assembling equipment by 4.",
      modifiers: { assemblyEnergyReduction: 4 },
      price: 125,
    },
    handTruck: {
      id: "handTruck",
      name: "Folding Hand Truck",
      description: "Carry more gear before your next garage trip.",
      effect: "Carry one additional equipment group during garage unloads.",
      modifiers: { garageCarryCapacityBonus: 1 },
      price: 100,
    },
    labeler: {
      id: "labeler",
      name: "Josh's Rebuilt Labeler",
      description: "Josh repaired the feed roller and wrote your name inside the battery cover.",
      effect: "Reduce energy spent verifying signal paths by 2.",
      modifiers: { verificationEnergyReduction: 2 },
      price: 0,
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

  career: {
    ranks: [
      { level: 1, name: "Helper", xpRequired: 0 },
      { level: 2, name: "Junior Tech", xpRequired: 80 },
      { level: 3, name: "Field Tech", xpRequired: 180 },
    ],
    trainingChoices: [
      {
        id: "craftsmanship",
        name: "Neater Installs",
        description: "Practice cable dressing, labeling, and the quiet art of leaving a room better than you found it.",
        effect: "+1 Craftsmanship",
        modifiers: { craftsmanship: 1 },
      },
      {
        id: "confidence",
        name: "Calm Troubleshooting",
        description: "Build a repeatable process for the moment when everyone else starts guessing.",
        effect: "+1 Confidence",
        modifiers: { confidence: 1 },
      },
      {
        id: "endurance",
        name: "Pack A Lunch",
        description: "A small amount of planning makes the long days less punishing.",
        effect: "+10 maximum energy",
        modifiers: { maxEnergy: 10 },
      },
    ],
  },

  coworkers: {
    josh: {
      id: "josh",
      name: "Josh",
      role: "Lead Technician",
      description: "Patient, capable, and somehow blamed whenever the schedule meets reality.",
      labelerTrustRequired: 2,
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

  serviceDispatch: {
    title: "One Quick Display Swap",
    summary: "Replace a conference-room display at a Conshohocken office.",
    swapItems: [
      { id: "replacement-display", label: "Replacement display" },
      { id: "mount-hardware", label: "Mount hardware tote" },
    ],
  },

  surveyDispatch: {
    title: "University City Site Survey",
    summary: "Confirm whether a quoted classroom display can reach its intended wall.",
    inspections: [
      {
        id: "elevator",
        label: "Freight elevator opening",
        log: "the proposed display carton is wider than the clear opening",
        detail: "The freight elevator is functional and reasonably clean. Its clear opening is narrower than the unopened 98-inch display carton shown on the sales sketch.",
      },
      {
        id: "hallway",
        label: "Hallway turn",
        log: "the corner removes the optimistic diagonal approach",
        detail: "The hallway makes a tight turn immediately after the elevator. Angling the carton might have been a theory in a larger hallway. This is not that hallway.",
      },
      {
        id: "wall",
        label: "Classroom display wall",
        log: "the wall works, which is how the access problem escaped the quote",
        detail: "The intended wall has enough space and nearby power. Sales measured this part correctly, then apparently stopped walking.",
      },
    ],
  },

  commissioningDispatch: {
    title: "South Philadelphia Commissioning",
    summary: "Commission a training room that is more complete on paper than in person.",
    checks: [
      {
        id: "speaker-zone",
        label: "Ceiling speaker zone",
        log: "the third speaker remains silent during the test tone",
        detail: "The first two ceiling speakers play the test tone. The third contributes a thoughtful silence from the back of the room.",
      },
      {
        id: "termination",
        label: "Credenza termination",
        log: "the silent speaker line is loose at the output block",
        detail: "The third speaker line is landed loosely at the output block. It is close enough to the terminal to suggest optimism, but not close enough to carry audio.",
      },
      {
        id: "drawing",
        label: "Closeout drawing",
        log: "the drawing belongs to the mirrored room across the hall",
        detail: "The closeout drawing is neat, legible, and for the mirrored room across the hall. Somebody changed the room number in the filename and declared victory.",
      },
    ],
  },

  warehouseDispatch: {
    title: "Warehouse Run",
    summary: "Find a replacement power supply reportedly stored in one of the vans.",
    checks: [
      {
        id: "staging",
        label: "Staging shelf",
        log: "the shelf contains the loaner-drill charger and several remotes for unknown displays",
        detail: "The staging shelf has the missing charger for the shop loaner drill, three remotes for displays the company does not own, and no matching power supply.",
      },
      {
        id: "van3",
        label: "Van #3",
        log: "the van crate contains power supplies for two different models and one empty tester case",
        detail: "Van #3 has a milk crate labeled MISC. Inside are two power supplies for the wrong display family and a cable-tester case containing no cable tester.",
      },
      {
        id: "returns",
        label: "Mystery-return pile",
        log: "the matching power supply is beneath a box labeled HDMI EXTENDERS / DO NOT STOCK / RETURN?",
        detail: "The correct power supply is in the mystery-return pile beneath a box labeled HDMI EXTENDERS / DO NOT STOCK / RETURN? The question mark appears to be the current inventory process.",
      },
    ],
  },

  secureAccessDispatch: {
    title: "Navy Yard Secure Access",
    summary: "Deliver a small rack update to a secure building after dispatch sends the wrong access note.",
    checks: [
      {
        id: "gate",
        label: "Security gate",
        log: "the guard has the company name but not today's visitor list",
        detail: "The guard recognizes the company because Josh was here last month, which is not the same as having your name on today's visitor list.",
      },
      {
        id: "building",
        label: "Building number",
        log: "the dispatch ticket and the security booth disagree by one building",
        detail: "Dispatch wrote Building 12. Security says the work order is for Building 13. The buildings are close enough to be annoying and far enough to matter.",
      },
      {
        id: "escort",
        label: "Escort requirement",
        log: "the telecom room requires an escort who is currently in another meeting",
        detail: "The telecom room is behind a badge reader and a policy nobody attached to the ticket. The escort is available after a meeting labeled 'quick sync.'",
      },
    ],
  },

  callbackCleanupDispatch: {
    title: "Warranty Return",
    summary: "Revisit a room that was marked complete before the callback ledger agreed.",
    checks: [
      {
        id: "client-notes",
        label: "Client complaint notes",
        log: "the complaint says intermittent, which is a word tickets use when they want company",
        detail: "The client reported that the issue comes back whenever the room is actually used. The ticket summary says 'user error?' with the question mark doing a lot of legal work.",
      },
      {
        id: "ticket-history",
        label: "Ticket history",
        log: "the previous closeout note is technically short enough to fit on a receipt",
        detail: "The closeout note says 'tested good.' It does not say what was tested, how long it was tested, or why the client immediately reopened the ticket.",
      },
      {
        id: "actual-fault",
        label: "Actual fault",
        log: "the original issue is still present behind a very confident status update",
        detail: "The fault is not exotic. It is a loose path, a bad assumption, and a room that got called complete before the boring verification happened.",
      },
    ],
  },

  handoffDispatch: {
    title: "Executive Handoff",
    summary: "Teach a client how to use a room that technically works but explains itself poorly.",
    checks: [
      {
        id: "control-panel",
        label: "Control panel labels",
        log: "the panel labels are technically words, just not the client's words",
        detail: "The panel has buttons named PRESENT, PC, SHARE, and AUX. The client asks which one starts the meeting. This is the correct question.",
      },
      {
        id: "daily-use",
        label: "Daily user path",
        log: "the common path is three steps if you already know the secret fourth step",
        detail: "Starting a normal meeting requires display power, laptop input, room audio, and the mute state nobody notices until the first sentence disappears.",
      },
      {
        id: "client-need",
        label: "Client's actual need",
        log: "the executive assistant needs repeatability more than feature coverage",
        detail: "The client does not need a tour of every input. They need the same morning meeting to work every time without texting facilities.",
      },
    ],
  },

  upcomingDispatches: [
    {
      title: "Cherry Hill Return Toll",
      summary: "Dispatch accounted for the bridge on the way there.",
    },
  ],

  scenes: {
    shop: {
      name: "Trunkslammer Shop",
      kicker: "Broomall, PA",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 44, y: 36, w: 220, h: 38, text: "BROOMALL SHOP / UNIT 4" },
        { type: "office", x: 58, y: 110, w: 170, h: 140, text: "SALES OFFICE", solid: true },
        { type: "shelf", x: 480, y: 88, w: 220, h: 92, text: "STAGING AREA", solid: true },
        { type: "shelf", x: 500, y: 355, w: 160, h: 92, text: "MYSTERY RETURNS", solid: true },
        { type: "workbench", x: 270, y: 420, w: 170, h: 60, text: "TOOL WORKBENCH", solid: true },
        { type: "counter", x: 68, y: 300, w: 150, h: 64, text: "SUPPLY COUNTER", solid: true },
        { type: "break-area", x: 285, y: 95, w: 130, h: 70, text: "BREAK AREA", solid: true },
        { type: "van", x: 760, y: 280, w: 150, h: 190, text: "VAN #3", solid: true },
        { type: "floor-note", x: 278, y: 208, w: 150, h: 30, text: "UNLABELED CABLES" },
        { type: "floor-note", x: 432, y: 246, w: 150, h: 30, text: "CAREER CLIPBOARD" },
      ],
    },
    garage: {
      name: "Parking Garage",
      kicker: "Center City East",
      playerStart: { x: 650, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 230, h: 38, text: "LEVEL B2 / SECTION C" },
        { type: "exit", x: 44, y: 115, w: 145, h: 110, text: "STREET EXIT", solid: true },
        { type: "van", x: 715, y: 260, w: 170, h: 210, text: "VAN #3", solid: true },
        { type: "floor-note", x: 330, y: 280, w: 210, h: 34, text: "A LONGER WALK THAN QUOTED" },
      ],
    },
    lobby: {
      name: "Client Lobby",
      kicker: "Center City East",
      playerStart: { x: 130, y: 420 },
      decor: [
        { type: "label", x: 45, y: 36, w: 210, h: 38, text: "CLIENT LOBBY" },
        { type: "desk", x: 295, y: 145, w: 220, h: 96, text: "SECURITY DESK", solid: true },
        { type: "elevator", x: 720, y: 95, w: 150, h: 190, text: "ELEVATORS", solid: true },
        { type: "floor-note", x: 232, y: 360, w: 270, h: 32, text: "VISITOR BADGE REQUIRED" },
      ],
    },
    client: {
      name: "Conference Room",
      kicker: "Center City East / Client Floor",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 220, h: 38, text: "TEMPORARY WORK AREA" },
        { type: "boxes", x: 90, y: 265, w: 175, h: 120, text: "DELIVERED BOXES", solid: true },
        { type: "build", x: 455, y: 120, w: 150, h: 150, text: "CART 1", solid: true },
        { type: "build", x: 680, y: 290, w: 150, h: 150, text: "CART 2", solid: true },
        { type: "floor-note", x: 345, y: 410, w: 210, h: 30, text: "PACKAGING ACCUMULATES HERE" },
      ],
    },
    serviceOffice: {
      name: "Conference Room 2B",
      kicker: "Conshohocken, PA",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 250, h: 38, text: "CONFERENCE ROOM 2B" },
        { type: "desk", x: 80, y: 120, w: 175, h: 92, text: "CLIENT TABLE", solid: true },
        { type: "boxes", x: 92, y: 315, w: 175, h: 92, text: "REPLACEMENT GEAR", solid: true },
        { type: "build", x: 680, y: 135, w: 180, h: 155, text: "FAILED DISPLAY", solid: true },
        { type: "floor-note", x: 390, y: 380, w: 210, h: 30, text: "CABLES LABELED: MOSTLY" },
      ],
    },
    universitySurvey: {
      name: "Campus Classroom Access",
      kicker: "University City, Philadelphia",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 270, h: 38, text: "CAMPUS CLASSROOM ACCESS" },
        { type: "desk", x: 82, y: 112, w: 190, h: 92, text: "FACILITIES DESK", solid: true },
        { type: "elevator", x: 735, y: 90, w: 155, h: 185, text: "FREIGHT ELEVATOR", solid: true },
        { type: "build", x: 645, y: 350, w: 225, h: 88, text: "DISPLAY WALL", solid: true },
        { type: "floor-note", x: 390, y: 235, w: 175, h: 32, text: "TIGHT HALLWAY TURN" },
        { type: "floor-note", x: 385, y: 390, w: 190, h: 30, text: "SALES SKETCH: ONE ARROW" },
      ],
    },
    southPhillyCommissioning: {
      name: "Training Room 3B",
      kicker: "South Philadelphia",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 245, h: 38, text: "TRAINING ROOM 3B" },
        { type: "desk", x: 78, y: 110, w: 185, h: 92, text: "CLIENT TABLE", solid: true },
        { type: "counter", x: 665, y: 325, w: 205, h: 105, text: "AV CREDENZA", solid: true },
        { type: "build", x: 390, y: 105, w: 185, h: 82, text: "CEILING SPEAKER ZONE" },
        { type: "floor-note", x: 430, y: 250, w: 185, h: 30, text: "TEST TONE: 2 OF 3" },
        { type: "floor-note", x: 300, y: 395, w: 230, h: 30, text: "CLOSEOUT DRAWING / ROOM 3A?" },
        { type: "floor-note", x: 690, y: 465, w: 170, h: 30, text: "TICKET STATUS: CLOSED" },
      ],
    },
    navyYardAccess: {
      name: "Secure Loading Dock",
      kicker: "Navy Yard, Philadelphia",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 250, h: 38, text: "NAVY YARD SECURE ACCESS" },
        { type: "desk", x: 78, y: 112, w: 185, h: 92, text: "SECURITY BOOTH", solid: true },
        { type: "elevator", x: 735, y: 90, w: 155, h: 185, text: "LOADING DOCK", solid: true },
        { type: "build", x: 630, y: 345, w: 225, h: 88, text: "TELECOM ROOM", solid: true },
        { type: "floor-note", x: 360, y: 240, w: 190, h: 32, text: "BUILDING 12 / 13?" },
        { type: "floor-note", x: 410, y: 390, w: 210, h: 30, text: "ESCORT REQUIRED" },
        { type: "floor-note", x: 685, y: 465, w: 175, h: 30, text: "ETA: STILL OPTIMISTIC" },
      ],
    },
    warrantyReturn: {
      name: "Callback Room",
      kicker: "Warranty Return Visit",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 230, h: 38, text: "CALLBACK / WARRANTY RETURN" },
        { type: "desk", x: 78, y: 110, w: 185, h: 92, text: "CLIENT TABLE", solid: true },
        { type: "counter", x: 665, y: 325, w: 205, h: 105, text: "AV CREDENZA", solid: true },
        { type: "build", x: 390, y: 105, w: 185, h: 82, text: "SYSTEM OUTPUT" },
        { type: "floor-note", x: 430, y: 250, w: 185, h: 30, text: "TESTED GOOD?" },
        { type: "floor-note", x: 300, y: 395, w: 235, h: 30, text: "PREVIOUS CLOSEOUT NOTE: BRIEF" },
        { type: "floor-note", x: 690, y: 465, w: 170, h: 30, text: "WARRANTY HOURS: WATCHED" },
      ],
    },
    executiveHandoff: {
      name: "Executive Boardroom",
      kicker: "Client Handoff",
      playerStart: { x: 120, y: 430 },
      decor: [
        { type: "label", x: 45, y: 36, w: 230, h: 38, text: "EXECUTIVE BOARDROOM" },
        { type: "desk", x: 78, y: 110, w: 185, h: 92, text: "CLIENT TABLE", solid: true },
        { type: "counter", x: 665, y: 325, w: 205, h: 105, text: "CREDENZA / LAPTOP", solid: true },
        { type: "build", x: 650, y: 110, w: 205, h: 110, text: "DISPLAY WALL", solid: true },
        { type: "floor-note", x: 410, y: 245, w: 210, h: 30, text: "TOUCH PANEL: PRESENT" },
        { type: "floor-note", x: 315, y: 390, w: 250, h: 30, text: "CHEAT SHEET: NOT PROVIDED" },
        { type: "floor-note", x: 690, y: 465, w: 175, h: 30, text: "MEETING IN 22 MIN" },
      ],
    },
  },
};
