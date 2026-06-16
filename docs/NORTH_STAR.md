# AV Tech RPG North Star

This file is the project memory for the larger game we are aiming toward. The
prototype can stay small, but each structural pass should keep this destination
in view.

## Target Experience

AV Tech RPG should grow into a top-down workplace RPG about becoming a better
commercial AV technician in a fictionalized Greater Philadelphia region.

The long-term feel is:

- **Stardew Valley-style daily life RPG:** readable days, practical skills,
  relationships, fatigue, tools, routines, and visible long-term growth.
- **Pokemon-style not-to-scale areas:** compact towns, rooms, routes, building
  interiors, entrances, elevators, and exits that are spatially readable rather
  than realistically sized.
- **Old GTA-style vehicle/world layer:** the van matters as a work object and
  traversal object. Driving should eventually feel like moving through a city
  with routes, parking, travel friction, music/radio flavor, and shortcuts, but
  the prototype can use route cards and fast travel first.
- **The Long Dark-style pressure, not survival simulation:** ordinary actions
  should feel different when the tech is tired, underprepared, overloaded,
  low on cash, or carrying unresolved risk. The lesson to borrow is readable
  condition pressure and tradeoffs, not wilderness meters.

The game should not become a literal sim of Philadelphia traffic, AV wiring, or
personal finances. The fun is making readable RPG choices inside recognizable
field-work pressure.

RPG consequence should increasingly come from small contextual pressure:
choosing a shortcut, skipping documentation, carrying too much, staying late,
or arriving underprepared should change what the next walk, check, closeout, or
route costs. A good choice can still hurt now; a bad choice can still feel
tempting because it saves time, energy, cash, or social friction in the moment.

## Research Anchors

- [Stardew Valley: About](https://www.stardewvalley.net/about/) is the main
  reference for an open-ended RPG loop where practical skills, upgrades,
  relationships, and restoration goals grow over many days.
- [Tiled documentation](https://doc.mapeditor.org/en/stable/manual/introduction/)
  supports the future map-authoring direction: tile maps plus object metadata
  for doors, collision, spawn points, exits, and triggers.
- [Phaser Scenes](https://docs.phaser.io/phaser/concepts/scenes) and
  [Phaser Scene API](https://docs.phaser.io/api-documentation/class/scene) are
  the strongest web-first reference for splitting the game into map scenes,
  UI overlays, loading scenes, and future route/travel scenes.
- [Phaser Cameras](https://docs.phaser.io/phaser/concepts/cameras) is a useful
  reference for eventual larger maps where the camera follows the player instead
  of every scene fitting on one fixed board.
- [Excalibur TileMaps](https://excaliburjs.com/docs/tilemap) is a lighter
  JavaScript-engine alternative if the game needs Tiled support without a full
  Phaser migration.
- [Godot TileMap](https://docs.godotengine.org/en/stable/classes/class_tilemap.html)
  is the stronger editor-first reference if the project eventually moves out of
  a browser prototype and into a fuller 2D game editor.
- [Rockstar's GTA Trilogy page](https://www.rockstargames.com/GTATrilogy) is a
  reminder that the old-GTA influence is not the crime fantasy; it is readable
  city traversal, cars as identity, route flavor, radio texture, and mission
  launch points.
- [Bulbapedia's Town Map summary](https://bulbapedia.bulbagarden.net/wiki/Town_Map)
  is a useful reference for a simple world map that identifies current location
  and selectable destinations without needing realistic scale.

## Skeleton To Preserve

The current loop should remain recognizable as the game expands:

```txt
Shop/home base -> van/loadout -> route/travel -> parking/exterior
-> building interior -> job room -> result -> return route -> shop/end shift
```

The world data should keep these concepts separate:

- **Region:** a readable map node like Wayne Area, Center City East, University
  City, Navy Yard, Conshohocken, King of Prussia, South Philadelphia, or Cherry
  Hill.
- **Area:** a specific place the player can be in, such as shop, garage, lobby,
  job room, loading dock, campus gate, or warehouse.
- **Scene:** the current playable top-down board.
- **Portal:** a door, elevator, building entrance, van exit, or return route.
- **Route:** a planned travel step between areas.
- **Vehicle:** a persistent work object with storage, comfort, reliability,
  and future route capabilities.

## Expansion Priorities

Build toward the full vision in this order:

1. **Keep the current browser prototype stable.** Do not migrate engines just
   because the future is bigger.
2. **Make world structure explicit.** Areas, routes, portals, and vehicles
   should be data-backed before the maps get larger.
3. **Add a real area-transition pass.** Doors/elevators/building exits should
   use reusable portal data instead of bespoke interaction code.
4. **Add a van interaction pass.** The van should support inspect, load,
   drive, route choice, and eventually fast travel from one consistent place.
5. **Add a regional-map pass.** Route cards can become selectable map nodes
   before any manual driving exists.
6. **Only then evaluate engine migration.** If fixed HTML/CSS maps fight
   camera scrolling, collision, and tile workflows, compare Phaser, Excalibur,
   and Godot with a small spike.

## Guardrails

- Compact maps are a feature, not a compromise. Use not-to-scale interiors and
  readable transitions like classic handheld RPGs.
- Manual driving is not the next step. Route choice, parking, tolls, loading
  zones, and fast travel should come first.
- The van should matter without becoming a separate car simulator.
- Every new area should answer a gameplay question: what choice, job pressure,
  character, tool, or joke lives here?
- Preserve save continuity unless there is an explicit prototype reset.
- Prefer adding reusable skeleton pieces before adding more one-off dispatch
  code.
