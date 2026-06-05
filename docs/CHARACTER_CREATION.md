# Character Creation Research Plan

This feature should make the player feel like they are building a specific kind
of AV technician, not filling out an unrelated fantasy RPG sheet. The useful
lesson from Elder Scrolls-style character creation is layered identity: an
origin, a class or specialty, a defining sign or style, and skills that improve
through use.

## Sources

- The **Oblivion PC manual** describes race selection with skill bonuses and
  special traits, attributes that influence derived stats, skill mastery levels,
  and class selection during the introduction. Use this as structural
  inspiration only. In AV Tech RPG, the equivalent of race is work background,
  not biology.
  [Source](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/22330/manuals/obliv_goty_pc_man-v2.pdf?t=1745343031)
- **Bethesda Support for Oblivion Remastered leveling** summarizes the
  use-skills-to-grow loop and the risk of leveling too narrowly. For this game,
  the practical lesson is that field tasks should improve or validate the skills
  they exercise, while over-specializing should create visible job weaknesses.
  [Source](https://help.bethesda.net/app/answers/detail/a_id/69731/)
- **MDA: A Formal Approach to Game Design and Game Research** argues that
  mechanics, dynamics, and player experience need to cohere. The target
  experience here is: "my technician is becoming a recognizable kind of field
  tech because of the work I choose and the habits I build."
  [Source](https://www.cs.northwestern.edu/~hunicke/MDA.pdf)

## Design Goals

1. Keep the creator grounded in AV work: backgrounds, habits, tools, and job
   pressure replace fantasy race, birthsign, and combat class.
2. Make every pick create a tradeoff. A choice that only adds bonuses should be
   a tool purchase, not a character identity.
3. Let premade characters remain valid. Wiley should be both a one-click
   profile and an example formula that custom characters can approximate.
4. Keep early choices readable in the first dispatch. If a background or trait
   does not affect an early task, it should not be in the first creator pass.
5. Prefer data definitions in `data.js` over one-off conditionals in `app.js`.

## Creation Formula

The planned creator should use four layers:

1. **Background:** where the tech learned their habits.
2. **Work style:** a defining upside and complication, similar to a birthsign in
   function but grounded in work behavior.
3. **Major skills:** two primary and two secondary skill branches from the
   existing skill tree.
4. **Traits:** two smaller modifiers or hooks that add flavor and tradeoffs.

The initial data skeleton lives in `content.characterCreation`:

- `backgrounds`
- `workStyles`
- `traits`
- `premadeTemplates`

## Current Planned Backgrounds

- **Residential Installer:** strong install and fieldcraft, weaker commercial
  documentation.
- **Warehouse Runner:** strong prep, carrying, and staging habits, weaker
  client confidence.
- **Helpdesk Convert:** strong troubleshooting and ticket discipline, weaker
  physical install.
- **Live Events Tech:** strong pressure handling and client communication, but
  more burnout risk.
- **Green Apprentice:** balanced and teachable, but no strong specialty.

## Current Planned Work Styles

- **Measure Twice:** safer careful work, slower rushed work.
- **Make It Work:** unlocks workaround choices, but creates callback risk when
  used carelessly.
- **Calm Under Fire:** stronger pressure checks, less hands-on specialization.
- **Parts Brain:** can find testing aids, but still needs clean closeout.
- **By The Book:** stronger documentation and management protection, but can
  cost coworker trust on messy jobs.

## Current Planned Traits

- **Steady Hands:** better termination checks.
- **Notebook Habit:** better survey and access documentation.
- **Tool Debt:** extra starting tool, less starting cash.
- **Knows A Guy:** extra coworker or vendor paths, smaller management gains.
- **Bad Knees:** better planning around access, worse repeated carrying/stairs.

## Premade Template Mapping

- **Wiley:** Residential Installer + Parts Brain + Make It Work.
- **Organized Rookie:** Green Apprentice + Measure Twice + Notebook Habit.
- **Prototype Tech:** Green Apprentice + Calm Under Fire.

## Implementation Steps

1. Keep the current premade cards, but show their creator formula so players
   learn the future system before it becomes interactive.
2. Add a disabled "Custom Technician Creator" preview card to the selection
   screen that lists the planned backgrounds, work styles, and traits.
3. Add a real creator flow later:
   - pick a background
   - pick a work style
   - pick two traits
   - pick two primary and two secondary skills
   - preview final stats, starting tools, tradeoffs, and first-job consequences
4. Store custom characters as ordinary technician objects in the save, or store
   the selected formula and reconstruct the derived technician on load.

## Open Balance Questions

- Should primary skills grow faster, start higher, or both?
- Should traits be limited by background, or should unusual combinations be
  allowed for roleplay?
- Should negative traits like `bad-knees` grant extra trait points, or should
  every trait be a mixed upside/downside by default?
- Should the first custom creator support free naming immediately, or wait until
  the formula system is stable?
