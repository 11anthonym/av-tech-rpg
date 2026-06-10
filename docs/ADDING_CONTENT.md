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
carried items, tutorial progress, fatigue, cash, experience, reputation, field
training, flags, and field log. It also stores a compact career ledger for
completed-job statistics. Premade careers store a `technicianId`; custom
careers also store a derived `customTechnician` object so the build can resume
without rebuilding it from current creator data.

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
  skillBonuses: { documentation: 1 },
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

Tools can also add stable skill bonuses with `skillBonuses`. These bonuses are
summed automatically by `getToolSkillBonus()`, shown anywhere the tool effect is
rendered, and then folded into task checks. For example, a drill can add
`install: 1`, a labeler can add `documentation: 1`, and a tool bag can add
`fieldcraft: 1`.

When a tool needs a new kind of behavior, add its modifier to `data.js`, read it
through `getToolModifier()` in `app.js`, and keep the tool ID stable.

## Add Career Progression

`data.js` contains the early career ranks, skill tree, and field-training
goals, and field-training choices. Each rank has a level, display name, and
experience requirement. Each career goal has a stable ID, readable name, metric,
target, and reward preview. Each skill has a stable ID, readable branch, display
name, and description. Each training choice has a stable ID, branch,
description, readable effect, modifier map, and optional `skillBonuses` map.

The current reusable skill IDs are:

- `install`
- `troubleshooting`
- `documentation`
- `clientCommunication`
- `fieldcraft`

The first reusable training modifiers are:

- `craftsmanship`
- `confidence`
- `maxEnergy`

The first reusable career-goal metrics are:

- `xp`
- `jobsCompleted`
- `clientReputation`
- `coworkerReputation`
- `managementReputation`
- `carefulFinishes`
- `documentedRisks`
- `ownedTools`
- `ownedPaidTools`
- `callbacksResolved`
- `skillChecksPassed`
- `fieldTaskChoicesMade`

Career goals are visible on the clipboard. Use them as short-term RPG tracks:
rank, trust, tool ownership, field-task habits, documentation habits, and other
values that future jobs can branch from. If a new metric is not already covered
by `getCareerGoalValue()`, add it there rather than hardcoding display text in a
job modal.

Skills affect deterministic task checks in `app.js`. A task compares the
active technician's skill value plus tools, training, and small prep bonuses
against a difficulty. Results are visible in the field log or modal text. A
passed check can reduce energy or protect the closeout; a strained check can
cost extra energy, soften reputation gains, lower XP, add callback risk, or
make a later choice more important.

When adding a new task check:

1. Add or reuse a skill in `data.js`.
2. Call `resolveSkillCheck("stable-flag-key", { skillId, difficulty, contextBonus })`.
3. Show `getSkillCheckMarkup(result)` in the modal when useful.
4. Record consequences through existing energy, reputation, XP, callback, and
   ledger fields instead of adding a separate hidden system.

For richer jobs, separate the inspection from the field-task choice. The South
Philadelphia commissioning visit does this with the loose credenza termination:
inspection identifies the fault, then the player chooses whether to re-land it
fast, re-terminate cleanly, trace it with the labeler, or document the mismatch.
The chosen task stores its own saved flags and then changes the final closeout,
reputation, XP, callback debt, and career ledger.

Jobs award experience and reputation in `app.js` when their result is recorded.
Keep those awards guarded by a saved flag so reopening a result modal cannot
grant the same progression twice.

Completed dispatches should return through `returnToShopAfterDispatch()` or,
for shop-based jobs, `finishWarehouseShift()`. Those helpers set up the
end-of-shift closeout so the next dispatch does not unlock until the player
clocks out, stays late to prep, helps Josh, or takes a recovery day. Ordinary
overnight rest restores energy with a burnout penalty; recovery days restore
more but cost management reputation. Staying late should feel useful but heavy:
it can improve the next shift or coworker trust, while costing more energy,
adding burnout, and sometimes hurting management reputation.

The break area is for same-day choices. `showBreakArea()` supports short breaks,
packed lunch, coffee, and unpaid recovery days. Packed lunch uses the shared
`packedLunchReady` flag and is consumed by `consumePackedLunch()` when a
dispatch starts.

Career ledger stats can also create small future effects. Keep these effects
readable and visible on the career clipboard. The current examples are:

- repeated documented access issues reduce report/access-delay paperwork costs
- repeated careful finishes reduce repair/punch-list costs
- unresolved callbacks add a small energy penalty to later access checks
- energy costs can run the meter to zero; unpaid energy beyond zero becomes
  exhaustion debt, and every 10 unpaid energy adds 1 burnout
- consecutive late nights cap next-morning energy until the player clocks out
  normally or takes a recovery day

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
  name: "Casey",
  role: "Shop-Organized Apprentice",
  tagline: "Brought a tool bag, snacks, and a dangerous belief in written notes.",
  stats: { energy: 105, burnout: 0, craftsmanship: 2, confidence: 1 },
  characterStats: { install: 2, troubleshooting: 2, documentation: 3, clientCommunication: 1, fieldcraft: 3 },
  traits: ["measureTwice", "notebookHabit"],
  startingTools: ["screwdriver", "toolBag"],
},
```

The selection screen will render the new profile automatically.
If a technician starts with a tool that is normally offered after the tutorial,
the reward screen automatically filters out already-owned tools.

Optional technician fields can make characters more distinct without changing
the selection UI:

- `role`
- `description`
- `strengths`
- `weaknesses`
- `playstyle`
- `difficulty`
- `trait`
- `tendency`
- `characterStats`
- `traits`

Use `characterStats` for skill-tree baselines such as `install`,
`troubleshooting`, `documentation`, `clientCommunication`, `fieldcraft`,
`commercialProcess`, `networking`, `dspAudio`, and `controlSystems`, and for
character-specific flavor stats such as `toolPreparedness` and `improvisation`.
Skill-tree baselines should create tradeoffs, not a profile that is best at
everything.

Use `traits` for simple hooks such as unlocking a special choice, changing a
line, or recording a flag. Current examples include Wiley's
`circuitHutPartsBrain`, `makeThatWork`, and `residentialInstinct`.

## Add Character Creation Pieces

The custom creator is documented in
[CHARACTER_CREATION.md](CHARACTER_CREATION.md). Its first-release data lives in
`content.characterCreation` and derives playable custom technicians from the
same fields the current premade technicians already use.

When adding creator content:

1. Add a `background`, `workStyle`, or `trait` in `data.js`.
2. Give it a stable ID, readable name, effect, and tradeoff.
3. Use `skillBonuses`, `statModifiers`, and `startingTools` where the choice
   should affect the derived technician.
4. Update `premadeTemplates` if a one-click profile should explain which creator
   pieces it represents.

Do not add a creator option unless it can affect an early task, visible skill
value, starting kit, reputation pressure, or career-goal track. Character
creation should make the first workday feel different, not just decorate the
selection screen.

## Add RPG Expansion Content

For jobs, skills, traits, companies, and job families, start with
[EXPANSION_SKELETON.md](EXPANSION_SKELETON.md). That guide describes the current
RPG contract:

- technician identity
- career progression
- job families
- company context

Use `content.jobFamilies` to describe the kind of RPG work a dispatch is
testing. Pass the family ID into `getDispatchBoardMarkup({ familyId })` so the
dispatch board can explain the core skills and loop. Use this for writer-facing
and player-facing clarity; it is not a generic quest engine.

Use `content.companies` and `currentCompanyId` to describe the current employer.
The career clipboard renders the current company profile so future employers can
change shop culture, supplied tools, and reputation pressure without rewriting
technician profiles. Add short `pressureRules` when the shop has visible bad
incentives the dispatch board should remind the player about.

Use `content.traitContextBonuses` for small trait bonuses on specific job
moments. A rule names a skill, a list of context IDs, and a bonus:

```js
notebookHabit: [
  { skillId: "documentation", contextIds: ["survey-documentation"], bonus: 1 },
],
```

When adding a new check with `resolveSkillCheck()`, give it a `contextId` if
traits should matter. Prefer specific contexts such as `service-diagnosis` or
`commissioning-termination` over broad permanent bonuses.

## Add Character-Specific Lines

`data.js` has a `characterLines` object keyed by technician ID. Scene logic can
call `getCharacterLine("lineId", fallback)` and safely fall back to default text
when the active character has no custom line.

Keep these lines short and practical. A good line should add flavor or clarify a
choice; it should not turn a character into a one-liner machine.

Current early line IDs include:

- `accessoryTote`
- `inspectVan`
- `finishChoice`
- `workaroundLog`
- `partsBrainQuote`
- `serviceInspect`
- `surveyWall`

## Add Shortcut Risk

For quick-workaround versus proper-process choices, record future risk through
`recordReturnTripRisk(riskId, detail)`. The current prototype stores those risks
inside save `flags` so later dispatches can reference them without adding a new
inventory or issue-tracker system.

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
Before adding a job, fill out the short job design template and
`Job Design Checklist V1` in [EXPANSION_SKELETON.md](EXPANSION_SKELETON.md).
Then add only the data and engine hooks the job actually needs.

Keep the starter geography intact while expanding: Radnor Rack & Wire is near
Wayne, and the first playable tutorial job still goes to Center City East in
Philadelphia.

Do not extract a fully generic job runner yet. The current dispatches still
benefit from hand-authored scenes and choices. Extract only after two or three
jobs repeat the same structure closely enough that the abstraction is obvious.

### Current Dispatch Pattern To Copy

Use **King of Prussia Room Offline** as the current worked example for a compact
new dispatch.

The implementation is intentionally hand-authored:

- `content.systemsDispatch` in `data.js` stores the title, summary, task cards,
  and three check definitions.
- `content.scenes.systemsService` stores the small walkable room.
- `showSystemsDispatchPreview()` renders the dispatch-board pitch.
- `showSystemsPreparation()` and `chooseSystemsPreparation()` handle one small
  prep decision before travel.
- `inspectSystemsCondition()` uses `resolveSkillCheck()` for the three checks.
- `showSystemsChoice()` and `finishSystemsService()` record XP, reputation,
  cash, callback debt, and systems ledger stats.
- `getInteractions()` wires the room's clickable/NPC hotspots.
- `getObjective()`, `render()`, `serializeGame()`, and `continueGame()` keep
  the new job visible, saved, and resumable.

When adding the next dispatch, copy the shape, not the topic. Pick one primary
RPG question, one prep choice, two or three checks, and one final consequence.

## Practical Rule

Add one small content item, reload the browser, and walk through the affected
interaction. Avoid adding several systems at once. The goal is to keep the
project teachable while it grows.
