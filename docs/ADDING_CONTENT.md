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
`av-tech-rpg-save-v1`. The internal save format is currently version `7`. The
save records the technician, tools, scene, position, carried items, tutorial
progress, fatigue, cash, experience, reputation, field training, flags, and
field log. It also stores a compact career ledger for completed-job statistics.

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
  effect: "Reduce callback risk during commissioning.",
  modifiers: { callbackRiskReduction: 1 },
  price: 75,
},
```

Set `price` to a positive number to stock the tool at the post-tutorial supply
counter. The HUD renders the `effect` text automatically. Modifier keys only
change gameplay after `app.js` reads them. The first reusable modifiers are:

- `pickupEnergyReduction`
- `assemblyEnergyReduction`
- `garageCarryCapacityBonus`
- `verificationEnergyReduction`

When a tool needs a new kind of behavior, add its modifier to `data.js`, read it
through `getToolModifier()` in `app.js`, and keep the tool ID stable.

## Add Career Progression

`data.js` contains the early career ranks and field-training choices. Each rank
has a level, display name, and experience requirement. Each training choice has
a stable ID, description, readable effect, and modifier map.

The first reusable training modifiers are:

- `craftsmanship`
- `confidence`
- `maxEnergy`

Jobs award experience and reputation in `app.js` when their result is recorded.
Keep those awards guarded by a saved flag so reopening a result modal cannot
grant the same progression twice.

Coworker relationship milestones can grant a tool without stocking it at the
supply counter. Keep the tool's `price` at `0`, give the relationship a readable
reputation requirement in `data.js`, and award the stable tool ID from the
shop interaction after the requirement is met.

The Conshohocken dispatch and University City survey each have one lightweight
preparation choice before travel. Keep preparation effects small and legible:
one saved flag, one visible payoff during the job, and no separate inventory
screen.

Add future job ideas to `upcomingDispatches` in `data.js` before implementing
them. The current-prototype summary renders these as locked previews so players
can see nearby goals without expanding the playable scope prematurely.

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
    { type: "boxes", x: 220, y: 180, w: 140, h: 90, text: "GEAR", solid: true },
  ],
},
```

Set `solid: true` on furniture, vehicles, boxes, and other objects the player
should walk around. Leave signs and floor notes non-solid. The movement engine
handles collision automatically.

Scene-specific interactions still belong in `getInteractions()` inside
`app.js`. Add `npc: "SUP"` or another short label to an interaction when it
should render as a visible person. Keep new maps small and test whether every
walking trip creates a decision, a joke, or a useful sense of place.

## Add a Job

The tutorial is intentionally scripted while the core loop is being tested.
Before adding several jobs, extract its job-specific arrays and progression into
a reusable job format. Do that only after the first playable loop feels good;
otherwise the abstraction will encode assumptions that have not been tested.

## Practical Rule

Add one small content item, reload the browser, and walk through the affected
interaction. Avoid adding several systems at once. The goal is to keep the
project teachable while it grows.
