# Character Creation First Release

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
- The **Stardew Valley skills model** is useful because skills improve through
  relevant actions, then specializations make future play feel different without
  turning the game into a spreadsheet. AV Tech RPG should use that lesson for
  dispatch habits: a documentation-minded tech should feel different during
  surveys, access problems, and handoffs.
  [Source](https://stardewvalleywiki.com/Skills)
- **AVIXA's CTS overview** frames general AV work around creating,
  implementing, supporting, and servicing AV solutions for client needs. That
  maps cleanly to this prototype's five readable skill branches: install,
  troubleshooting, documentation, client communication, and fieldcraft.
  [Source](https://www.avixa.org/training-certification/certification/cts-certification)

## Design Goals

1. Keep the creator grounded in AV work: backgrounds, habits, tools, and job
   pressure replace fantasy race, birthsign, and combat class.
2. Make every pick create a tradeoff. A choice that only adds bonuses should be
   a tool purchase, not a character identity.
3. Let premade characters remain valid. Wiley should be both a one-click
   profile and an example formula that custom characters can approximate.
4. Keep early choices readable in the first dispatch. If a background or trait
   does not affect an early task, it should not be in the first creator pass.
5. Prefer data definitions in `src/content/data.js` over one-off conditionals
   in `src/core/app.js` or job-specific systems.

## Creation Formula

The first-release creator uses four layers:

1. **Background:** where the tech learned their habits.
2. **Work style:** a defining upside and complication, similar to a birthsign in
   function but grounded in work behavior.
3. **Major skills:** two primary and two secondary skill branches from the
   existing skill tree.
4. **Traits:** two smaller modifiers or hooks that add flavor and tradeoffs.

The creator can now choose both early field skills and advanced AV skills such
as Commercial Process, Networking, DSP / Audio, and Control Systems. Those
advanced choices are future-facing until a dispatch or training choice checks
them directly.

The creator data lives in `content.characterCreation`:

- `backgrounds`
- `workStyles`
- `traits`
- `premadeTemplates`
- `baseStats`
- `baseSkills`
- `primarySkillBonus`
- `secondarySkillBonus`
- `traitSlots`

## Current Backgrounds

- **Residential Installer:** strong install and fieldcraft, weaker commercial
  documentation.
- **Warehouse Runner:** strong prep, carrying, and staging habits, weaker
  client confidence.
- **Helpdesk Convert:** strong troubleshooting and ticket discipline, weaker
  physical install.
- **Live Events Tech:** strong pressure handling and client communication, but
  more burnout risk.
- **Green Apprentice:** balanced and teachable, but no strong specialty.

## Current Work Styles

- **Measure Twice:** safer careful work, slower rushed work.
- **Make It Work:** unlocks workaround choices, but creates callback risk when
  used carelessly.
- **Calm Under Fire:** stronger pressure checks, less hands-on specialization.
- **Parts Brain:** can find testing aids, but still needs clean closeout.
- **By The Book:** stronger documentation and management protection, but can
  cost coworker trust on messy jobs.

## Current Traits

- **Steady Hands:** better termination checks.
- **Notebook Habit:** better survey and access documentation.
- **Tool Debt:** extra starting tool, less starting cash.
- **Knows A Guy:** extra coworker or vendor paths, smaller management gains.
- **Bad Knees:** better planning around access, worse repeated carrying/stairs.

## Premade Template Mapping

- **Wiley:** Residential Installer + Parts Brain + Make It Work.
- **Alex:** Green Apprentice + Calm Under Fire.
- **Casey:** Warehouse Runner + Measure Twice + Notebook Habit.
- **Jordan:** Helpdesk Convert + By The Book + Notebook Habit + Knows A Guy.
- **Morgan:** Live Events Tech + Calm Under Fire + Knows A Guy + Steady Hands.

## Current Implementation

1. Premade cards show their creator formula so players can read Wiley and other
   profiles as examples of the same system.
2. The selection screen includes a working "Custom Technician Creator" card.
3. Alex keeps the internal `prototype-tech` ID for save compatibility, but the
   player-facing starter profile is now a balanced commercial helper.
4. The creator modal lets the player:
   - name the technician
   - pick a background
   - pick a work style
   - pick two traits
   - pick two primary and two secondary skills
   - preview final stats, starting tools, tradeoffs, and core skill values
5. Custom characters are stored as ordinary technician objects in the save under
   `customTechnician`, while premade careers still store only `technicianId`.
6. Save format `16` is the first version that persists custom technician builds.

## Open Balance Questions

- Should primary skills grow faster, start higher, or both?
- Should traits be limited by background, or should unusual combinations be
  allowed for roleplay?
- Should negative traits like `bad-knees` grant extra trait points, or should
  every trait be a mixed upside/downside by default?
- Should custom creator picks unlock unique early dialogue, or should the first
  expansion focus only on skill checks and task consequences?
