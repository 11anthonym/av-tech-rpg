# Adding Content to AV Tech RPG

The prototype separates content from game logic:

- `data.js` contains technicians, tools, vehicles, tutorial items, and scene
  layouts.
- `app.js` contains movement, interaction rules, progression, and rendering.
- `styles.css` contains presentation.

Start by editing `data.js`. Most new content should not require changes to the
game engine.

## Save Data

The browser prototype autosaves career progress to local storage under
`av-tech-rpg-save-v1`. The save records the technician, tools, scene, position,
carried item, tutorial progress, fatigue, flags, and field log.

When changing saved data structures later:

1. Add a version migration for existing saves, or
2. Change the save-key version and treat it as a clean prototype reset.

Avoid storing functions, DOM nodes, or open dialog callbacks. Reconstruct those
from saved progression flags when the game resumes.

## Add a Tool

1. Open `data.js`.
2. Add a new entry inside `tools`.
3. Give it a unique ID, name, description, and readable effect.
4. Add the ID to `tutorial.rewardTools` if it should appear after the tutorial.

Example:

```js
labeler: {
  id: "labeler",
  name: "Basic Labeler",
  description: "Your cables can finally explain themselves.",
  effect: "Future effect: reduce callback risk during commissioning.",
},
```

Early tool effects are descriptive placeholders. When a tool needs to alter
gameplay, add its rule deliberately in `app.js` and keep the tool ID stable.

## Add a Technician

Add another entry inside `technicians`:

```js
{
  id: "organized-rookie",
  name: "Organized Rookie",
  tagline: "Not experienced, but brought snacks and a notebook.",
  stats: { energy: 105, burnout: 0, craftsmanship: 2, confidence: 1 },
  startingTools: ["screwdriver", "toolBag"],
},
```

The selection screen will render the new profile automatically.

## Add a Vehicle

Add another entry inside `vehicles`:

```js
van5: {
  id: "van5",
  name: "Company Van #5",
  cargoCapacity: 5,
  organization: "Acceptable",
  reliability: "Mostly reliable",
  fuelEconomy: "Average",
  clearance: "Standard garage",
  comfort: "The air conditioning works when moving.",
},
```

The prototype currently assigns `van3` directly in `app.js`. A later vehicle
selection screen can choose from this data without changing the vehicle shape.

## Add a Scene Layout

Add an entry inside `scenes` with a name, location kicker, player start, and
decor objects. Coordinates are pixels inside a `960 x 540` map.

```js
warehouse: {
  name: "Client Warehouse",
  kicker: "South Philadelphia",
  playerStart: { x: 120, y: 420 },
  decor: [
    { type: "label", x: 45, y: 36, w: 220, h: 38, text: "WAREHOUSE" },
  ],
},
```

Scene-specific interactions still belong in `getInteractions()` inside
`app.js`. Keep new maps small and test whether every walking trip creates a
decision, a joke, or a useful sense of place.

## Add a Job

The tutorial is intentionally scripted while the core loop is being tested.
Before adding several jobs, extract its job-specific arrays and progression into
a reusable job format. Do that only after the first playable loop feels good;
otherwise the abstraction will encode assumptions that have not been tested.

## Practical Rule

Add one small content item, reload the browser, and walk through the affected
interaction. Avoid adding several systems at once. The goal is to keep the
project teachable while it grows.
