# AV Tech RPG: Design References

Use references for patterns, not copied stories. Keep jobs fictionalized and
combine common field situations into readable scenarios.

## Compact RPG Structure

- [Stardew Valley: About](https://www.stardewvalley.net/about/) describes an
  open-ended RPG built around gradual skill improvement, practical upgrades,
  relationships, and visible restoration goals.
- [Stardew Valley Wiki: Skills](https://wiki.stardewvalley.net/Skills) documents
  a readable progression rhythm: relevant actions award experience, levels
  improve proficiency, and selected milestones offer specialization choices.
- [Stardew Valley Wiki: Community Center](https://wiki.stardewvalley.net/Community_Center)
  is a useful reference for showing nearby locked goals and giving progress a
  visible place in the world.

For AV Tech RPG, keep the equivalent small: complete jobs, improve a practical
kit, build shop relationships, and preview nearby career milestones.

## World Structure And Travel

- [AV Tech RPG North Star](NORTH_STAR.md) records the long-term target:
  Stardew Valley-style daily RPG structure, Pokemon-style compact area
  transitions, and old-GTA-style vehicle/travel flavor.
- [Tiled: Introduction](https://doc.mapeditor.org/en/stable/manual/introduction/)
  is the strongest map-authoring reference for future tile maps and object
  metadata such as collision, doors, spawn points, and route triggers.
- [Phaser: Scenes](https://docs.phaser.io/phaser/concepts/scenes) is the
  strongest browser-game reference for splitting map boards, UI overlays,
  travel cards, and future driving or regional-map views into separate scenes.
- [Phaser: Cameras](https://docs.phaser.io/phaser/concepts/cameras) is a useful
  reference for later maps that scroll instead of fitting on one fixed board.
- [Excalibur TileMaps](https://excaliburjs.com/docs/tilemap) is a lighter
  JavaScript option with Tiled support if Phaser feels too heavy for the next
  prototype stage.
- [Godot TileMap](https://docs.godotengine.org/en/stable/classes/class_tilemap.html)
  is the editor-first reference if the project eventually leaves the browser
  prototype and becomes a fuller 2D game project.

For AV Tech RPG, do not jump to manual driving or a full engine migration just
because those references exist. Build areas, portals, van interactions, route
choices, and fast travel first.

## Fatigue And Push-Your-Luck Pressure

- Stardew Valley is the main reference for stamina as a daily budget: players
  can push too hard, but the real design value is that fatigue makes tomorrow
  and recovery choices matter.
- Harvest Moon / Story of Seasons games are useful references for readable
  routine pressure: chores are simple, but a day has limits, so prioritization
  becomes the game.
- Darkest Dungeon is a useful stress reference, not a tone reference: pressure
  should accumulate in visible ways and create hard tradeoffs before it becomes
  a collapse.
- Slay the Spire is a useful risk/reward reference: the player should often
  understand the upside of taking damage or pressure now, then decide whether
  the future cost is worth it.

Do not copy exact pass-out, hospital, money-loss, or stress-affliction rules.
For AV Tech RPG, zero energy means field judgment gets worse: skill checks can
take an exhaustion penalty, unpaid effort can create incidents, and ordinary
rest can wake the player below full energy unless they spend a recovery day.

## Commercial AV Patterns

- [AVIXA Glossary of Audiovisual Terms](https://www.avixa.org/certification/AVIXA-AV-Glossary-of-Terms)
  is the baseline vocabulary reference for AV system terms. Use it when naming
  devices, signal-path concepts, room conditions, and technical checks.
- [AVIXA: Project Management in the AV Industry](https://xchange.avixa.org/posts/project-management-in-the-av-industry-ensuring-seamless-technological-integration)
  frames AV project work around coordinating resources, managing timelines,
  quality control, and multiple stakeholders.
- [NSCA: Frontline PM & Jobsite Management](https://www.nsca.org/training-solutions/frontline-pm-jobsite-management/)
  is a useful reference for jobsite language such as project team
  responsibilities, field work, subcontractors, scope creep, field changes,
  safety, and project financials.
- [NSCA: Guide to State Licensing](https://www.nsca.org/resources/guide-to-state-licensing/)
  uses "limited energy systems" as the broad commercial-electronic-systems
  framing. Use this kind of term when the game needs a grounded trade category
  rather than a jokey label.
- [r/CommercialAV: How Do You Quote Labor for Larger AV Projects?](https://www.reddit.com/r/CommercialAV/comments/1hvbs7a)
  discusses underestimated labor, phased work, site access, partial installs,
  and the need for field input during estimates.
- [r/CommercialAV: What's Up With All the Design, Product, and Construction Flaws?](https://www.reddit.com/r/CommercialAV/comments/1jnhn3r)
  discusses missing drops, misplaced infrastructure, wrong equipment, and field
  technicians spending time resolving coordination problems onsite.
- [r/CommercialAV: Unfinished / Poor Quality Installs](https://www.reddit.com/r/CommercialAV/comments/ta9nhn)
  discusses commissioning incomplete rooms, missing cables, bad terminations,
  and the cost of returning to finish work later.
- [r/CommercialAV: Tools](https://www.reddit.com/r/CommercialAV/comments/umi11o)
  discusses the mix of personal hand tools, company equipment, stocked vans,
  and technicians gradually building dependable kits.
- [DRPA Bridge Toll Schedule](https://drpa.org/travel/toll-schedule.html)
  lists the current passenger/small-truck toll used as grounded detail for the
  Cherry Hill return-toll micro-job.

These patterns support fictional jobs such as underestimated downtown
carries, undocumented couplers, rooms marked ready before commissioning, and
equipment reportedly stored in one of the vans.

Terminology guardrail: "dispatch board" is acceptable as the game's shop-board
surface, but do not blame every coordination failure on dispatch as a person or
department. Use "coordination," "scope," "field change," "project handoff,"
"service ticket," "work order," "site access," "closeout," and "return trip"
when those are the sharper terms.
