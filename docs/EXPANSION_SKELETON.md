# RPG Expansion Skeleton

This is the lightweight contract for growing AV Tech RPG without turning the
prototype into a big engine rewrite. The long-term target is captured in
[NORTH_STAR.md](NORTH_STAR.md). The goal here is not to make every future job
pure data. The goal is to keep the RPG pieces consistent enough that a new job,
skill, trait, tool, company, or area feels like it belongs.

## Current Shape

The game now has five reusable layers:

1. **Technician identity:** premade and custom technicians define stats,
   skill baselines, traits, tools, strengths, weaknesses, and playstyle.
2. **Career progression:** XP, ranks, training choices, goals, reputation,
   ledger stats, and active career effects describe how the player is growing.
3. **Job families:** jobs can identify whether they are install,
   service, survey, commissioning, logistics, or handoff work.
4. **Company context:** the current employer describes shop culture,
   pressure, dysfunction, and the reputation tradeoff behind bad-company humor.
5. **World skeleton:** regions, areas, portals, vehicles, and routes describe
   where a job happens and how the player moves between shop, van,
   parking, buildings, and job rooms.

Keep those five layers readable in the UI. If a mechanic is invisible, players
will experience it as randomness rather than roleplaying.

## Add A New Job

Start with this one-page design before adding code:

```txt
Job title:
Job family:
Company:
Map/scene:
Why it is on the dispatch board:
Core skills:
Preparation choice:
Three things to inspect or do:
Final choice:
Good outcome:
Fast/bad-company outcome:
What stat, reputation, XP, callback, or ledger value changes:
What future job or goal can remember it:
```

### Job Design Checklist V1

Use this checklist before implementing the job. If a proposed job cannot
answer most of these, keep it in the idea backlog until the hook is clearer.

- **Place:** Where does the job start, where does it happen, and why does that
  route make sense from Radnor Rack & Wire near Wayne?
- **First-job continuity:** The first playable job still goes from the
  Wayne-area shop to Center City East in Philadelphia. Do not move the tutorial
  job when adding new geography.
- **Job family:** Which existing family owns the work: install, service, survey,
  commissioning, logistics, or handoff?
- **Company pressure:** What does the bad starter company want the player to do
  that may conflict with good field work?
- **Primary RPG test:** Which one skill, trait, tool, reputation lean, or ledger
  habit is the job really testing?
- **Prep:** What is the one small preparation choice before travel?
- **Field actions:** What are the two or three things the player inspects,
  carries, installs, traces, explains, or documents?
- **Final choice:** What is the clean field-tech choice, the fast
  management-friendly choice, and the risky compromise?
- **Consequence:** Which visible values change: energy, burnout, cash, XP,
  client rep, coworker rep, management rep, callbacks, return-trip risk, or a
  career ledger stat?
- **Condition pressure:** What will feel harder, easier, unavailable, or more
  expensive because of energy, burnout, carry load, cash, route friction,
  preparation, confidence, or unresolved risk?
- **Memory:** What future job, goal, or active career effect could remember
  the outcome?
- **AV truth:** What detail would make a real AV tech nod without needing a
  simulator?
- **Joke target:** Is the joke aimed at bad process, bad estimates, weird job
  realities, or management pressure rather than at the field tech for knowing
  less?

### Small Worked Example

Use this as a planning shape, not a commitment to build this exact job next.

```txt
Job title: Law Office Intermittent Audio
Job family: service
Company: Radnor Rack & Wire
Map/scene: Center City office conference room
Why it is on the dispatch board: Client says audio drops after ten minutes; the service ticket says "probably cable."
Core skills: troubleshooting, documentation, clientCommunication
Preparation choice: review ticket history, text someone who knows the room, or leave immediately
Three things to inspect or do: check USB path, inspect table box, ask client what "drops" means
Final choice: verify full meeting path, swap the obvious cable, or document likely DSP/control issue
Good outcome: client trust and coworker trust, more energy spent, management annoyed by scope
Fast/bad-company outcome: management likes the quick swap, callback risk remains
What changes: XP, client/coworker/management rep, callback ledger, documentedTaskRisks
What remembers it: future callback return or a documentation-habit goal
```

### Implemented Worked Example: King Of Prussia Room Offline

This is the current example for adding one compact job without extracting a
generic job engine.

```txt
Job title: King of Prussia Room Offline
Job family: service
Company: Radnor Rack & Wire
Map/scene: King of Prussia conference room with client table, display wall, rack/processer, panel note, and stale network note
Why it is on the dispatch board: Client says the room is offline; the service ticket says it probably just needs a reboot.
Core skills: troubleshooting, networking, controlSystems, documentation
Preparation choice: review room/network notes, ask Josh what changed, or leave with work-order notes as written
Three things to inspect or do: check touch panel status, verify device network path, compare rack note to the actual room
Final choice: document the network/control mismatch, call out the scope miss, or quick reboot and close the ticket
Good outcome: useful systems note, client/coworker trust, documented task risk, possible management friction
Fast/bad-company outcome: management likes the quick close, client trust drops, callback debt increases
What changes: XP, cash, client/coworker/management rep, callbacks, systems ledger stats, documentedTaskRisks
What remembers it: callback ledger can route quick-reboot debt into Warranty Return; career clipboard records systems jobs and mismatches
```

Why this shape works:

- It proves advanced skills in one place instead of adding a separate systems
  career act.
- It uses real AV texture: vague "offline" reports, stale room notes, control
  path confusion, and reboot pressure.
- It keeps the player choice legible: useful closeout versus clean-looking
  ticket.
- It reuses the existing callback ledger instead of inventing a new failure
  system.

What not to copy blindly:

- Do not make every future service job test three advanced skills.
- Do not add a new scene if an existing room can carry the joke and decision.
- Do not add real IP addressing, subnet math, or manufacturer-specific trivia
  unless the player choice remains readable without specialist knowledge.

Then implement in this order:

1. Add or reuse a job family in `content.jobFamilies`.
2. Add the job's content block in `src/content/data.js`.
3. Add the scene layout if it needs a new walkable space.
4. Add a dispatch preview using `getDispatchBoardMarkup({ familyId })`.
5. Use `resolveSkillCheck()` for one to three meaningful task checks.
6. Save consequences with flags, stats, XP, reputation, callback debt, or
   return-trip risks.
7. Return through the existing shift closeout helpers unless the job is a short
   shop-based task.

Avoid making a job that only pays cash. A good dispatch should test at least one
RPG identity: a skill, a trait, a tool, a reputation lean, or a ledger habit.

### RPG Consequence Pressure Direction

The current stats need to feel less like end-of-modal numbers and more like
field condition. Borrow the pressure-design lesson from games like The Long
Dark without turning AV Tech RPG into a survival sim:

- **Condition, not punishment:** low energy, burnout, weak prep, and heavy carry
  should change what actions cost or how risky they feel before they become a
  fail state.
- **Tradeoffs with texture:** a shortcut can save energy now but increase
  callback risk, social pressure, or the next check's difficulty.
- **Small consequences in the room:** walking back to exits, carrying gear,
  talking to contacts, and choosing closeout paths should be places where
  condition and prior choices matter.
- **Uncertainty over math walls:** show likely pressure in plain language, then
  reveal exact consequences after the action.
- **No giant rewrite:** add one pressure hook at a time to existing helpers:
  route travel, carrying, portals, field tasks, closeout, and end-shift recovery.

## Incremental Roadmap

Do these in small commits. Each step should answer one playability question and
be easy to verify in the browser.

1. **Done - Job checklist pass:** Keep this document current and use it before
   adding any new job.
2. **Done - Choice clarity pass:** Add short skill/reputation hints to a few
   existing choices so players understand why stats matter.
3. **Done - Company pressure pass:** Give Radnor Rack & Wire visible
   company-pressure rules, such as management favoring clean tickets while
   field-quality choices build client and coworker trust.
4. **Done - Skill identity pass:** Advanced AV areas are now visible skills:
   Commercial Process, Networking, DSP / Audio, and Control Systems.
5. **Done - Worked job pass:** Added one systems-flavored service dispatch using
   the checklist.
6. **Done - Authoring example pass:** Documented the systems service dispatch
   as a worked example for future contributors.
7. **Done - Travel skeleton pass:** Current dispatch travel now goes through
   `content.world.routes` and `showTravelRouteModal()` so future area exits,
   vehicle selection, route choices, and fast travel have a shared foundation.
8. **Done - Portal skeleton pass:** The tutorial garage entrance and lobby
   elevator now use `content.world.portals`, `getScenePortalInteractions()`,
   and `usePortal()` so future doors, elevators, exits, and building interiors
   have a reusable path.
9. **Done - Vehicle interaction pass:** The shop van now opens a reusable
   vehicle surface for cargo, loadout, mapped route launch, and the future
   fast-travel hook.
10. **Done - Regional map surface pass:** The van now opens a regional map
   surface that shows current area, known regions, mapped routes, route
   history, and fast-travel candidates without bypassing dispatch gates.
11. **Done - Playtest tuning pass:** Played through the systems service
   dispatch in simulation and made strained diagnostic quality visible on the
   closeout/result cards.
12. **Done - Save migration pass:** Save loading now goes through
   `migrateSavedGame()` so older local careers can pick up vehicle, area,
   route-history, array, and progress-award fields without changing the save
   key.
13. **Done - Route choice pass:** The Center City tutorial drive now has a
   reusable `choices` array and `showRouteChoiceModal()` path for time, energy,
   cash, and burnout tradeoffs before broad fast travel unlocks.
14. **Done - Fast-travel unlock pass:** Eligible routes now unlock fast travel
   after they have been driven once, but only when they match the current
   dispatch route, start from the current area, and pay an energy cost.
15. **Done - Repeat route content pass:** A compact Conshohocken label
   follow-up now appears after the service call and Josh debrief, reusing the
   known route so fast travel becomes naturally visible.
16. **Done - Route map polish pass:** The regional map now groups routes into
   Active Route, Unlocked Fast Travel, and Route Atlas sections so route state
   stays readable as the map grows.
17. **Done - Building exit pass:** Completed job rooms now have reusable
   `returnRoute` portals, and result screens use the same current-area exit
   helper. Resumed saves can walk to the room/site exit instead of depending on
   a one-off result modal.
18. **Done - Playtest debug helper pass:** Appending `?debug=1` exposes
   `AV_TECH_RPG_DEBUG.jump(...)` scenarios for post-first-job, service-ready,
   service-complete, and low-energy end-shift checks.
19. **Done - Early-flow playtest pass:** Simulated a tidy first-day closeout
   into a rushed Conshohocken service callback, then verified the Josh intro,
   end-of-shift closeout, callback note, labeler gift, Josh service debrief,
   training gate, fast-travel follow-up, and return exits. Callback service
   returns now explain that the shift closes first and Josh has the note
   waiting.
20. **Done - Mid-board route-and-dispatch pass:** Simulated the path from the
   Conshohocken follow-up through University City, South Philadelphia
   commissioning, the warehouse run, and Navy Yard. Verified dispatch-board
   gates, route exits, end-of-shift closeouts, the second training prompt,
   warehouse exploration, and the Navy Yard access-plus-rack-update sequence.
21. **Done - Late-board consequence pass:** Simulated Navy Yard into both late
   branches: unresolved callback pressure triggers the warranty return before
   handoff, while a clean callback ledger skips warranty and goes straight to
   handoff. Verified executive handoff, systems service, Cherry Hill toll, and
   completion snapshot. Systems-created callback pressure now stays visible on
   the travel board and final summary without stealing the Cherry Hill beat.
22. **Done - Character replay pass:** Replayed the expanded board with Wiley
   and Jordan. Verified Wiley's organizer/workaround, low-confidence pressure
   locks, install/service strengths, and documentation/systems weak spots.
   Verified Jordan's service contact prep, documentation reductions, pressure
   choices, clean troubleshooting/process checks, and physical-install weak
   spots. Also verified old post-first-job saves resume into the required Josh
   intro before the next board route unlocks.
23. **Done - Custom creator and save/resume pass:** Built a tool-heavy retrofit
   custom tech and a process-heavy helpdesk custom tech. Verified creator
   validation, sanitized custom names, derived tools/traits/cash penalties,
   parts-brain use, bad-knees/tool-bag carry math, save summaries, mid-shift
   finish-choice resume, post-dispatch Josh intro resume, service contact prep,
   documentation reductions, pressure choices, and systems skill checks.
24. **Done - Creator readability pass:** Added a shared early-readout surface
   for premade profile cards and custom creator previews. Each build now shows
   shop start, early unlocks, first-job feel, and watch-outs from the same
   tools, traits, skills, and cash data used by play.
25. **Done - Dispatch consequence readability pass:** Dispatch-board previews
   now surface current build edge, route memory, and board routing in the shared
   renderer. Verified organizer availability, fast-travel readiness, forced
   warranty return routing, clean-ledger handoff routing, and coordination-cost
   travel language.
26. **Done - Industry terminology consistency pass:** Audited player-facing copy
   against the terminology guardrail: keep "dispatch board" as the game surface,
   but use sharper AV/integration terms such as work order, service ticket,
   scope, field change, coordination, closeout, return trip, site access, and
   limited energy where they fit. Tightened next-job prep, parts-organizer,
   access, systems, travel, and service wording without changing save data.
27. **Done - Job-authoring queue pass:** Picked Burlington County Retrofit
   Walkdown as the next compact work order and wrote it as a data-first planned
   job. The locked preview now uses the shared board renderer, including job
   family, current build edge, route memory, task cards, and consequence hooks,
   before any bespoke scene exists.
28. **Done - Playable walkdown pass:** Turned Burlington County Retrofit
   Walkdown into the smallest playable site-survey job: one prep choice, three
   pathway/existing-conditions checks, one scope/closeout decision, and saved
   consequences that can protect or risk the later retrofit install preview.
29. **Done - Future install consequence pass:** Kept the retrofit install
   locked, but made its preview and eventual first implementation read the
   walkdown result first. The install now branches around protected pathway,
   partial warning, or inherited pathway risk instead of starting from a blank
   work order.
30. **Done - Playable retrofit install pass:** Turned the locked Burlington
   install preview into the smallest playable install loop: read the inherited
   walkdown branch, load for known conditions, complete one pathway/install
   check, and close with record/as-built notes.
31. **Done - Post-install pacing pass:** Rechecked the late-board pacing now
   that Burlington has both walkdown and install beats. The final career
   snapshot now waits until the player closes the shift and checks in with Josh
   for a short retrofit debrief, so the two-step job gets a recovery breath
   before the board summary.
32. **Done - Burlington branch playtest pass:** Played the protected, partial,
   and inherited-risk Burlington branches through install closeout, return
   portal, end-of-shift closeout, Josh debrief, and the final career snapshot.
   The branch labels, risk state, debrief, and snapshot consequence text all
   preserved the install outcome.
33. **Done - Post-debrief save continuity pass:** Bumped the internal save
   version to 23. Older saves that already viewed the final career snapshot
   infer the retrofit debrief as complete, while mid-flow Burlington saves still
   route through Josh before the snapshot.
34. **Done - Late-board manual playthrough pass:** Ran the late board forward
   in-browser from the existing service-complete debug helper through
   Conshohocken follow-up, survey, commissioning, warehouse, secure access,
   handoff, systems, Cherry Hill, Burlington walkdown, Burlington install, Josh
   debrief, and the final career snapshot. The Cherry Hill-to-Burlington pacing
   held together, no browser errors appeared, and the final board still landed
   as complete.
35. **Done - Playable loop consolidation pass:** Stabilized the shop -> van ->
   map -> route -> job -> closeout loop without adding new content. The van now
   clearly separates cargo review, loading, dispatch review, regional map, and
   active route launch. Regional map route cards now show destination, purpose,
   status, travel cost/risk, route history, fast-travel state, and lock reason.
   Dispatch cards now expose tools, risk tags, rewards, unlocks, and
   callback/return-trip effects. Secure-access rack tasks and systems checks now
   share a reusable field-task resolver.
36. **Done - Route data consolidation and smoke QA pass:** Moved route job
   presentation and dispatch tool expectations into content data keyed by stable
   route IDs. The app now resolves stateful route variants, such as Conshohocken
   follow-up and Burlington install, from data-backed helpers instead of a
   hardcoded route-job object. Retrofit walkdown and install task checks now use
   the shared field-task resolver. Added a lightweight Playwright smoke harness
   for roster/custom start, van/map route cards, fast-travel gating,
   task-check state, and save/continue continuity.
37. **Done - Field-task data pass:** Existing secure-access, systems service,
   retrofit walkdown, and Burlington install checks now carry structured task
   metadata for type, skill, difficulty or branch difficulty, base energy or
   branch energy, tools, success text, strained text, and named risk flags. The
   shared field-task resolver records result data in save flags, and dispatch
   previews show field-task cards before the player accepts the job.
38. **Done - Consequence ledger pass:** Added a reusable consequence ledger
   surface over callback debt, open return-trip risks, and resolved risk
   history. Systems quick-reboot closeout now records a named systems risk,
   warranty root-cause cleanup can move matching risk into resolved history, and
   secure access, commissioning, systems, Burlington walkdown, and Burlington
   install closeout cards explain cause, future effect, and open/resolved/
   inherited status.
39. **Done - Workday guidance and transition clarity pass:** Added reusable
   workday guidance for the current step, van menu, regional map, and
   dispatch-board previews. Portal transitions now show from/to/status details,
   locked transitions explain their blocker, and the early garage entrance
   interaction exposes why the client entrance is blocked before cargo is
   delivered.
40. **Done - Dispatch board state consolidation pass:** Centralized the active
   dispatch-board item, blocked item, in-progress item, route ID, HUD
   title/status, and preview action. `getCurrentDispatchRouteId()` now reads
   from board state, dispatch previews report blocked reasons from the same
   helper, and job cards show a Board state row with active/blocked status,
   route/no-route state, and why the item is on the board.
41. **Done - Commissioning field-task choice pass:** Moved the South
   Philadelphia termination choice metadata into content data, including task
   type, skill, difficulty, energy, tools, context, success/strained text, and
   named risk metadata. Shared field-task result recording now supports both
   ordinary skill checks and choice-style tasks, and the commissioning preview
   shows termination tasks before the job is accepted. Career clipboard and
   final snapshot now include a field-task history sourced from the reusable
   result entries.
42. **Done - Callback and handoff task consolidation pass:** Warranty return
   and executive handoff checks now carry structured field-task metadata, show
   as field-task previews on dispatch cards, resolve through
   `resolveFieldTaskCheck()`, and write reusable `fieldTaskResults` entries.
43. **Done - Survey task consolidation pass:** University City survey
   inspections now carry structured field-task metadata, show as field-task
   previews on the survey dispatch card, resolve through
   `resolveFieldTaskCheck()`, and write reusable `fieldTaskResults` entries.
44. **Done - Warehouse task consolidation pass:** Warehouse search locations
   now carry structured field-task metadata, show as field-task previews on the
   warehouse dispatch card, resolve through `resolveFieldTaskCheck()`, and
   write reusable `fieldTaskResults` entries.
45. **Done - Commissioning inspection consolidation pass:** South Philadelphia
   commissioning inspection checks now carry structured field-task metadata,
   show alongside the termination choices on the commissioning dispatch card,
   resolve through `resolveFieldTaskCheck()`, and write reusable
   `fieldTaskResults` entries.
46. **Done - Secure access check consolidation pass:** Navy Yard access checks
   now carry structured field-task metadata, show alongside the rack work on
   the secure-access dispatch card, resolve through `resolveFieldTaskCheck()`,
   and write reusable `fieldTaskResults` entries.
47. **Done - Service call task consolidation pass:** The Conshohocken service
   dispatch now previews signal-path verification and replacement-install
   tasks, resolves both through `resolveFieldTaskCheck()`, and writes reusable
   `fieldTaskResults` entries while preserving existing service progress state.
48. **Done - Tutorial assembly consolidation pass:** First-day cart assembly
   components now carry structured field-task metadata, resolve through
   `resolveFieldTaskCheck()`, write reusable `fieldTaskResults`, and preserve
   the existing `assembled` tutorial progress state.
49. **Done - Player-facing language cleanup pass:** Locked planned-work
   previews now use dispatch-board language instead of "not playable yet"
   phrasing, while save-compatible internal prototype IDs remain unchanged.
50. **Done - Field task history readability pass:** Field-task result entries
   now save readable risk labels, task outcome text, and tool context, and the
   career clipboard history displays those player-facing consequences while
   retaining fallbacks for older saves.
51. **Done - Travel result readability pass:** Route travel now writes compact
   latest-result data and a short travel-result log, and route cards show the
   latest travel mode, stat deltas, arrival clock, and drive count.
52. **Done - Field task result wording pass:** Field-task result modals now
   label player-facing consequence rows as `Risk tracked` instead of exposing
   internal risk-flag terminology.
53. **Done - Workday path pass:** Current-work guidance now shows the
   full Shop-to-next-job path and brackets the current step on shared van/map
   and dispatch guidance surfaces.
54. **Done - Return marker flow pass:** Ready return-route portals now keep the
   player on site after closeout, point them to a readable `RETURN` marker, and
   only send them back to the shop when they interact with the marked portal.
55. **Done - RPG consequence pressure roadmap pass:** Added a condition-pressure
   roadmap lane inspired by The Long Dark's readable pressure design: fatigue,
   carry load, route friction, prep, confidence, and unresolved risk should
   change action costs and future friction without becoming a survival sim.
56. **Done - Condition movement pressure pass:** Walking speed now reacts to
   active carry load, low or zero energy, high burnout, and bad-knees loaded
   walks. The carry card and workday guidance name the active pressure so a player
   can connect field condition to how the room feels without adding manual
   driving or survival meters.
57. **Done - Condition skill-check pressure pass:** Low-but-not-zero energy and
   high burnout now feed the shared skill-check result as visible condition
   penalties. Field-task result rows, saved field-task history, active effects,
   and the career clipboard show the pressure so stats affect outcomes without
   adding bespoke room scripts.
58. **Done - Action pressure preview pass:** Added shared action-pressure
   previews for expected energy, field condition, movement/carry pressure, tool
   fit, skill fit, callback debt, and return-trip risk. Choice panels,
   field-task preview cards, and key nearby task objects can now show why a
   click is risky before the result modal lands.
59. **Done - Spatial marker affordance pass:** Interaction markers now render
   as readable named NPC, task-specific, VAN, DOOR, or RETURN tags. The nearby
   card and interact button use the same marker label, and smoke QA checks
   contact, task, van, door, return, generic-label leaks, and prop-label
   overlap behavior.
60. **Done - Task state presentation pass:** Reusable task-state helpers now
   turn field-task results, completion arrays, locked flags, and portal readiness
   into READY, LOCKED, IN PROGRESS, COMPLETED, STRAINED, or RISK INHERITED copy.
   Nearby cards, marker datasets, marker styling, and dispatch task cards use
   that same state so players can see why an interaction is available before
   pressing it.
61. **Current roadmap complete, remaining hardening lane:** The current
   incremental roadmap has no remaining `Next` item. The remaining work is
   consolidation: broaden reusable task/check patterns to older bespoke checks
   when they are touched, keep dispatch/route/consequence state visible on
   player-facing cards, keep smoke coverage close to the full RPG loop, and
   avoid new content, manual driving, or engine migration until the menu/card
   loop is stable enough to be uneventful.
62. **Done - Commissioning hotspot review pass:** The South Philadelphia loose
   termination choice now exposes READY/COMPLETED state on the credenza
   interaction and reopens a saved field-task review instead of collapsing to a
   one-line notify. Loop guidance also avoids confusing "training room" with
   career-training UI.
63. **Done - University City survey closeout guard pass:** The filed survey
   report is now idempotent. The facilities contact becomes a completed
   review-only interaction after closeout, repeated closeout calls cannot spend
   energy or rewrite rewards/stats, and smoke QA covers the regression.
64. **Done - Completed-room audit pass:** Commissioning, warranty return,
   executive handoff, and systems service now collapse to the return-route
   layer after closeout instead of leaving active job hotspots behind. Stale
   closeout calls show an already-complete review, completed survey inspections
   disappear after filing, and the current-dispatch key now follows the active
   board item instead of older completed flags.
65. **Done - Single-use closeout guard pass:** First-day finish, service,
   Conshohocken follow-up, warehouse, secure access, travel cost, Burlington
   walkdown, and Burlington install closeout functions now guard completed
   state before applying costs, rewards, callbacks, branch flags, or stats.
   Smoke QA verifies stale closeout calls leave player state unchanged.
66. **Done - Shift result delta pass:** End-shift choices now use a reusable
   tracked-state delta helper to show what changed after the player commits:
   energy, burnout, cash, XP, reputation, callbacks, return-trip risk, recovery
   days, late-night streak, next-shift prep, and the next step. This proves
   a small post-choice consequence pattern before applying it to more closeouts.
67. **Done - First job closeout delta pass:** The Two Quick Carts result screen
   now reuses the tracked-state delta helper after the player commits to the
   cable closeout choice. The Wiley workaround path proves the risky case by
   showing cash, XP, reputation, callback debt, and return-trip risk changes
   without rewriting later dispatches.
68. **Done - Route/job card tool-plan pass:** Regional-map route cards now use
   `routeJobs`, `jobFamilies`, routes, route history, consequence ledger state,
   and `dispatchToolPlans` to show family, purpose, summary, required tools,
   recommended tools, owned/missing prep, risk tags, unlocks, rewards, status,
   fast-travel state, and callback/return-trip context. Burlington retrofit
   install cards now expose the saved walkdown branch as the proof case.
69. **Done - Map transition card pass:** Regional-map routes now split active
   job routes, launchable routes, unlocked fast-travel routes, completed
   history, and locked future candidates into separate sections. The same map
   also surfaces current-area portal cards with origin, destination, status,
   requirement, travel/return effect, and current work step, so spatial movement
   reads more like an RPG route/entrance system.
70. **Done - Return portal and route prep integration pass:** Completed-job
   review modals now send the player back to the room and let the RETURN portal
   perform the actual trip to the shop. Van and regional-map drive actions now
   open a reusable route prep card using route job metadata, tool plans, route
   status, travel risk, fast-travel state, and open callback/return-trip context
   before the route launches.
71. **Done - Current-step transition awareness pass:** The current-step panel
   now summarizes visible area transitions from portal data, including locked
   requirements and ready destinations. Burlington route cards and route prep
   also show saved walkdown result and install branch rows, making the
   walkdown-to-install consequence chain visible before travel.
72. **Done - Consequence route pressure pass:** Open callback and return-trip
   ledger entries now map back onto affected routes. The regional map groups
   routes carrying callback/return-trip pressure, route cards and prep cards
   show mapped consequence pressure, and the van can open a concise consequence
   review with affected routes.
73. **Done - Dispatch route prep handoff pass:** Route-backed dispatch-board
   actions now open the same reusable route prep card used by the van and
   regional map before continuing into existing prep or travel flows. Job cards,
   route prep, tool plans, consequence pressure, and route launch now stay on
   one readable path without adding dispatch content.
74. **Done - Route launch clarity pass:** Route prep cards now include a
   state-derived next-step row explaining whether the button opens route
   choices, a job prep step, a fast-travel summary, a package review, or the
   normal route summary. This keeps stacked modal handoffs readable without
   adding new work orders.
75. **Done - Bloat audit pass:** Removed planned-work preview buttons,
   authoring-style future-job text, and meta playtest questions from the live
   career snapshot and dispatch-card flow. Keep save-compatible internal IDs,
   but keep player screens focused on in-world work, consequences, recovery,
   and the next practical shop step.
76. **Done - Save-flag intent cleanup pass:** Kept the save-compatible
   `prototypeSummaryViewed` flag, but moved new writes behind career snapshot
   helper functions. Future cleanup should favor small intent-revealing helpers
   over broad module churn while the static browser prototype is still proving
   the workday rhythm.
77. **Done - Static asset bootstrap cleanup pass:** Replaced `document.write()`
   cache-busting with small DOM-created stylesheet and script loaders. The page
   still stays no-build and GitHub Pages friendly, but avoids parser-writing
   behavior and keeps `src/content/data.js` loading before `src/core/app.js`.
78. **Done - Dispatch action cleanup pass:** Route-backed dispatch previews now
   share one `getDispatchRoutePrepAction()` helper and one player-facing
   "Review Route & Prep" button. This removes bespoke route-prep action labels
   without changing the board-to-route-prep flow.
79. **Done - Current-step language cleanup pass:** Removed "Interface:" wording
   from player-facing guidance and renamed the garage/lobby transition stage to
   "Route / Building Entry." Current-step copy should read like practical work
   direction, not implementation terminology.
80. **Done - Route launch flow consolidation pass:** Route prep preview text and
   route launch behavior now resolve through one `getRouteLaunchFlow()` helper.
   New routes should add one launch flow instead of updating separate preview
   and launch chains, keeping the board/van/map handoff safer to expand.
81. **Done - Route-card next-step pass:** Regional route cards and the Current
   Step route brief now surface the same travel handoff preview used by route
   prep. The van, board, map, and prep screens should all explain what the next
   route action does from one resolver instead of separate copy.
82. **Done - Job-site departure consequence pass:** Closeout choices now save a
   compact job-site summary with tracked before/after state and closeout
   consequence entries. Return markers show a "Before You Leave" recap with
   what changed, current closeout effect, risk carried back, and the next shop
   step, keeping the consequence handoff spatial instead of adding another
   automatic return popup.
83. **Done - First variable gameplay slice:** The Conshohocken service job now
   rolls saved room conditions that can change check difficulty, energy
   pressure, and callback risk. Prep and optional client context can reveal
   conditions before checks, known conditions can offset service pressure, and
   unresolved room pressure records a named Conshohocken return-trip risk that
   Josh can later resolve.
84. **Done - Job pressure helper pass:** Seeded condition selection, readable
   odds, immediate incident rolls, and stable incident IDs now live in a small
   reusable pressure helper. Keep dispatch-specific copy and consequences in
   the dispatch file until another existing job proves the same pattern.
85. **Done - First-day pressure teaching pass:** The first cart job now rolls
   one small install pressure after the supervisor leaves. It affects cart-task
   cost, creates a visible room decision, can trigger an immediate incident on
   a quick fix, and can be controlled by careful closeout or carried back as
   Center City return-trip risk.
86. **Done - Pressure response consolidation pass:** Shared pressure-response
   bookkeeping now lives in the job-pressure helper. Service and tutorial
   dispatches still own their saved state, copy, logs, and closeout details,
   but energy, reputation, stats, burnout, incident flags, and incident rolls
   now resolve through one reusable path.
87. **Done - Consequence review audit pass:** The van/map consequence review now
   opens when the last job-site closeout has a saved record, even if no open
   callback or return-trip debt remains. The review shows the last closeout,
   tracked state changes, saved consequence result, active debt, and mapped
   route pressure in one place.

Stop after each pass and play through the affected area. The prototype should
grow by proving a loop, not by accumulating menus.

## Add A New Skill

Add the skill to `content.career.skills` with a stable ID. Then decide where it
matters before adding it to the creator.

The current expanded skill tree includes:

- `install`: mounting, dressing, landing, and terminating physical work.
- `troubleshooting`: proving signal path before replacing parts.
- `documentation`: notes, labels, closeout, surveys, and handoff details.
- `clientCommunication`: explaining tradeoffs when people are watching.
- `fieldcraft`: prep, tools, staging, and practical job survival.
- `commercialProcess`: scope, access rules, closeout, and change-order reality.
- `networking`: VLANs, DHCP, switch ports, device discovery, IP conflicts.
- `dspAudio`: gain structure, routing, AEC, mute logic, ceiling speaker faults.
- `controlSystems`: button logic, source routing, panel labels, room presets.

For a skill to be worth adding, it should appear in at least two of these:

- a technician or creator build preview
- a tool bonus
- a dispatch task check
- a training choice
- a career goal
- a future job-family description

If it only appears once, keep it as flavor text or a character stat for now.

## Add A New Trait

Traits work best when they are small, readable, and contextual. Add the trait ID
to a technician, creator piece, or both. If it should affect checks, add a rule
to `content.traitContextBonuses`:

```js
steadyHands: [
  { skillId: "install", contextIds: ["cart-assembly"], bonus: 1 },
],
```

Use context IDs for specific job moments instead of global bonuses. "Good at
everything install-related forever" becomes invisible power creep. "Better at
cart assembly and clean terminations" feels like a character tendency.

## Add A New Company

Add a company to `content.companies`, then switch `currentCompanyId` when the
career is ready to move employers.

A company profile should define:

- `name`
- `culture`
- `homeBase`
- `summary`
- `strengths`
- `dysfunctions`
- `reputationPressure`
- `pressureRules`
- `expansionUse`

Future companies should change how jobs feel, not just rename the shop. For
example:

- A better integrator might supply standard tools but expect cleaner paperwork.
- A chaotic subcontractor might pay more cash and create more access surprises.
- A university in-house team might have lower travel friction but more politics.
- A live-events company might reward pressure handling and punish burnout.

Use `pressureRules` for visible shop incentives that can appear on the career
clipboard and dispatch board. Keep each rule short: what management pushes for,
and what good field work usually needs instead. They do not need mechanical
effects until a job explicitly checks them.

## Add A New Job Family

Use a job family when several jobs share the same RPG rhythm. Each family
should have:

- `coreSkills`
- `loop`
- `commonChoices`
- `expansionUse`

Do not add a family for every single dispatch. Add one when it helps future
writers understand the kind of choices that job type should create.

## Balance Guardrails

- One job should usually test one primary skill and one secondary skill.
- One trait bonus should usually be `+1` in specific contexts.
- One dispatch should usually have one prep choice, a few checks, and one final
  consequence choice.
- Better field work should often bother management at a bad company.
- Management-friendly shortcuts should usually create callback, reputation, or
  ledger risk somewhere.
- Tools should reduce friction, unlock a path, or improve a skill check. They
  should not solve the whole dispatch by themselves.

## What To Extract Later

Do not extract these until multiple jobs need the same pattern:

- a fully generic dispatch runner
- company-specific dispatch board logic
- manual driving or a full regional-map UI
- vehicle selection UI
- toll, parking, fuel, and traffic sub-systems
- multi-step save migrations
- branching employer/career acts

Right now, repeat a small pattern two or three times before abstracting it. The
prototype should stay easy to read by someone who is more interested in making a
funny AV job than designing middleware.

## Stabilization Notes

Current-step briefing is now a reusable state-derived helper shared by the HUD,
van menu, and regional map. Keep future objective, route, fast-travel, callback,
return-risk, and condition-pressure copy flowing through that helper instead of
adding separate one-off "what now?" text in each scene.
