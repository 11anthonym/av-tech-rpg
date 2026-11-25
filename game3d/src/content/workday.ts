// Generated from src/content/data.js by scripts/extract-workday-content.mjs.
export const workdayContent = {
  "assembly": [
    {
      "id": "cart-1-frame",
      "label": "Cart 1 frame",
      "destination": "cart1",
      "type": "cart frame assembly",
      "skillId": "install",
      "difficulty": 3,
      "contextId": "cart-assembly",
      "energyCost": 7,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "cartAssemblyStrained",
      "riskLabel": "frame alignment",
      "successText": "Cart frame lands square enough for the display to mount cleanly.",
      "strainedText": "Cart frame holds, but alignment takes extra effort and should be watched.",
      "log": "the first cart frame is assembled",
      "detail": "The first cart frame is the training pass: rails, casters, shelf, and a bag of bolts that pretends to be obvious."
    },
    {
      "id": "cart-1-display",
      "label": "Cart 1 display",
      "destination": "cart1",
      "type": "display mount",
      "skillId": "install",
      "difficulty": 4,
      "contextId": "cart-assembly",
      "energyCost": 7,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "cartAssemblyStrained",
      "riskLabel": "display mount strain",
      "successText": "Display seats cleanly on the first cart with the supervisor still pretending this was quick.",
      "strainedText": "Display mounts, but the awkward lift makes the first cart feel less clean.",
      "log": "the first display is mounted on the cart",
      "detail": "The first display is not complicated. It is simply large enough to make the word helper feel literal."
    },
    {
      "id": "cart-2-frame",
      "label": "Cart 2 frame",
      "destination": "cart2",
      "type": "cart frame assembly",
      "skillId": "install",
      "difficulty": 3,
      "contextId": "cart-assembly",
      "energyCost": 7,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "cartAssemblyStrained",
      "riskLabel": "repeat frame alignment",
      "successText": "Second frame goes together faster now that the first cart taught the pattern.",
      "strainedText": "Second frame is assembled, but repetition does not make the hardware less stubborn.",
      "log": "the second cart frame is assembled",
      "detail": "The second frame should be familiar now, which mostly means you know which bolt bag is lying."
    },
    {
      "id": "cart-2-display",
      "label": "Cart 2 display",
      "destination": "cart2",
      "type": "display mount",
      "skillId": "install",
      "difficulty": 4,
      "contextId": "cart-assembly",
      "energyCost": 7,
      "requiredTool": "screwdriver",
      "optionalTool": "drill",
      "riskFlag": "cartAssemblyStrained",
      "riskLabel": "second display strain",
      "successText": "Second display mounts cleanly and the room finally looks like an install instead of a pile.",
      "strainedText": "Second display mounts, but the last lift leaves a note-shaped concern.",
      "log": "the second display is mounted on the cart",
      "detail": "The second display is the last heavy piece between this room and a closeout conversation."
    }
  ],
  "installPressures": [
    {
      "id": "cable-bag-mismatch",
      "label": "Cable bag mismatch",
      "revealedSummary": "The accessory bag has two cables with room labels that do not match the carts. It is small enough to ignore and annoying enough to remember.",
      "checkModifiers": {
        "cart-2-display": {
          "difficulty": 1,
          "energy": 1
        }
      },
      "carefulOption": {
        "id": "sort-labels",
        "label": "Sort and label the cable bag",
        "detail": "Spend a little effort now so the closeout does not turn into cable archaeology.",
        "result": "Cable labels are sorted before the second cart is closed up.",
        "log": "Sorted the mismatched cart cable labels before closeout.",
        "energyCost": 2,
        "reputation": {
          "coworkers": 1,
          "management": -1
        },
        "stat": "documentedTaskRisks"
      },
      "quickOption": {
        "id": "match-by-memory",
        "label": "Match cables by memory",
        "detail": "Fast field judgment might keep the schedule moving, but a bad guess will show up when the cart is tested.",
        "result": "The cable match holds after a quick check.",
        "log": "Matched the cart cables by memory and the signal held during the room test.",
        "energyCost": 1,
        "incidentChance": 0.3,
        "incidentResult": "The cart drops signal during the quick test. The client sees the screen blink before you catch it.",
        "incidentLog": "Immediate first-day pressure: the second cart blinked after a rushed cable match."
      },
      "leaveResult": "Cable label mismatch is left for closeout.",
      "closeoutRisk": "A rushed closeout can leave the wrong cable path as the next service mystery."
    },
    {
      "id": "wobbly-caster-kit",
      "label": "Wobbly caster kit",
      "revealedSummary": "One caster kit fits, but not with the confidence promised by the parts bag. The cart rolls; the question is whether it should.",
      "checkModifiers": {
        "cart-2-frame": {
          "difficulty": 1,
          "energy": 1
        }
      },
      "carefulOption": {
        "id": "square-caster",
        "label": "Square the caster hardware",
        "detail": "Spend steady effort making the cart feel less like a shopping cart with ambition.",
        "result": "Caster hardware is squared before the second cart gets dressed.",
        "log": "Squared the wobbly caster hardware before closeout.",
        "energyCost": 2,
        "reputation": {
          "clients": 1,
          "management": -1
        },
        "stat": "carefulFinishes"
      },
      "quickOption": {
        "id": "snug-caster-fast",
        "label": "Snug the caster fast",
        "detail": "A fast hardware pass saves time if the wobble is smaller than it looks.",
        "result": "The caster holds after a quick hardware pass.",
        "log": "Snugged the wobbly caster hardware quickly and it held under test.",
        "energyCost": 1,
        "incidentChance": 0.35,
        "incidentResult": "The cart wobbles during the final roll test. Nothing falls, but the client notices the wobble.",
        "incidentLog": "Immediate first-day pressure: the second cart wobbled after a rushed caster pass."
      },
      "leaveResult": "Wobbly caster pressure is left for closeout.",
      "closeoutRisk": "A rushed closeout can leave a physical cart problem for a future return trip."
    }
  ],
  "rewardTools": [
    {
      "id": "toolBag",
      "name": "Tool Bag",
      "description": "A place for your tools that is not a cardboard box.",
      "effect": "Reduce energy spent picking up equipment by 1.",
      "modifiers": {
        "pickupEnergyReduction": 1
      },
      "skillBonuses": {
        "fieldcraft": 1
      },
      "price": 65
    },
    {
      "id": "drill",
      "name": "Basic Drill",
      "description": "Entry-level, but the battery is yours.",
      "effect": "Reduce energy spent assembling equipment by 4.",
      "modifiers": {
        "assemblyEnergyReduction": 4
      },
      "skillBonuses": {
        "install": 1
      },
      "price": 125
    },
    {
      "id": "handTruck",
      "name": "Folding Hand Truck",
      "description": "Carry more gear before your next garage trip.",
      "effect": "Carry one additional equipment group during garage unloads.",
      "modifiers": {
        "garageCarryCapacityBonus": 1
      },
      "skillBonuses": {
        "fieldcraft": 1
      },
      "price": 100
    }
  ]
} as const;
