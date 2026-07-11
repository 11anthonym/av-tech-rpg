# AV Tech RPG: Prototype Playtest Plan

The prototype should prove that a small AV workday loop is readable, funny, and
satisfying before the game grows. New content is useful when it answers a
question about playability. It is not useful merely because the dispatch board
has room for another joke.

## Current Build

The playable slice now has:

1. A first-day install tutorial with walking, loading, carrying, assembly, and a
   starter-tool reward.
2. Five premade technician profiles plus a custom creator that test whether
   tools, stats, documentation habits, client pressure, and character-specific
   tension make the same dispatch sequence replay differently.
3. A short service call with one morning-preparation choice, a diagnosis choice,
   tool payoffs, and a possible callback.
4. A walkable shop hub with rest, purchases, career XP, reputation, one training
   focus, and a small Josh relationship milestone.
5. A University City site survey with three observations, a short preparation
   choice, and a management-versus-field-judgment report decision.
6. A South Philadelphia commissioning visit with three checks, an incomplete
   room, and a craftsmanship-based punch-list option.
7. A short Wayne-area warehouse run that reuses the shop map and tests whether
   stockroom exploration works as a change of pace.
8. A Navy Yard secure-access job with a preparation choice, three access checks,
   a telecom-room rack update, and a bad-company closeout decision.
9. Lightweight career effects where repeated documentation, careful finishes,
   and unresolved callbacks change future energy costs.
10. A conditional warranty return that appears only when the callback ledger has
   unresolved work.
11. An executive handoff that tests whether confidence, documentation, and
   client-facing choices matter when the room already works.
12. A clearer dispatch board that explains why the next job is available, what
   choices can affect, and what future work is still locked.
13. Reusable character hooks for character-specific lines, simple traits,
   lightweight character stats, and return-trip risk flags.
14. A career clipboard with visible skill branches, build identity, goal
   tracks, active effects, and a ledger for future branching.
15. Data-driven tool skill bonuses, so new tools can matter to task checks
   without adding one-off UI or calculation code.
16. A sourced first-release custom technician creator with premade formulas,
   background/work-style/trait picks, major skill picks, build preview, and save
   support.
17. A completion card with a career snapshot, nearby locked work, and career
   check-in questions.
18. A lightweight expansion skeleton for job families, company context, and
   data-driven trait bonuses.
19. Visible company-pressure rules for Radnor Rack & Wire, so bad-company
   incentives are legible before they become hidden balance math.
20. An expanded skill foundation for Commercial Process, Networking,
   DSP / Audio, and Control Systems, including a first Systems Fundamentals
   training choice.
21. A heavier end-of-shift fatigue tradeoff where staying late or, after the
   Josh intro shift, helping Josh is useful but meaningfully borrows from
   tomorrow.
22. A King of Prussia systems service job that tests Networking,
   Control Systems, Documentation, prep choices, and bad-company reboot
   pressure without adding a technical minigame.
23. A Cherry Hill return-toll micro-job that tests cash, reimbursement pressure,
   management optics, and documentation without adding a route simulator.
24. Burlington retrofit walkdown and install beats that carry pathway risk from
   survey closeout into a later install and debrief.
25. A clearer van and regional-map layer where cargo, dispatch routes, active
   route launch, route history, fast travel, and locked candidates are visible
   as menu/card systems.
26. Stronger dispatch cards that show route, location, tools, skills, rewards,
   unlocks, risk tags, and callback or return-trip effects before accepting a
   job.
27. A shared field-task resolver now used by secure-access rack tasks and
   systems service checks as the first step toward reusable task/check patterns.
28. Data-backed route job metadata and dispatch tool plans, so route and job
   cards can expand without adding a bespoke app helper for every route.
29. A lightweight smoke QA script that checks roster/custom start, van/map
   route cards, fast-travel gating, reusable task checks, and save/continue.
30. Structured field-task metadata for secure access, systems service,
   retrofit walkdown, and Burlington install checks, including type, skill,
   difficulty or branch difficulty, energy, tools, success/strained text, and
   named risk flags.
31. Field-task previews and result rows that show task cost, skill check,
   helpful tools, and risk state before and during field work.
32. A reusable consequence ledger that shows open callback debt, named
   return-trip risks, resolved risk history, and closeout cause/effect language.
33. Workday guidance on the current-step panel, van menu, regional map,
   and dispatch-board previews, plus clearer locked/ready transition text for
   portals and early building-entry blockers.
34. A centralized dispatch-board state helper that keeps the active board item,
   route ID, blocker reason, HUD title/status, and dispatch preview action in
   sync.
35. Data-backed commissioning termination task choices that preview as field
   tasks, resolve through shared result recording, and preserve their task
   outcome in save data and career clipboard history.
36. Callback cleanup and executive handoff checks now use structured field-task
   metadata, shared resolver output, and saved field-task result history.
37. University City survey inspections now use structured field-task metadata,
   shared resolver output, and saved field-task result history.
38. Warehouse search checks now use structured field-task metadata, shared
   resolver output, and saved field-task result history.
39. South Philadelphia commissioning inspection checks now use structured
   field-task metadata, shared resolver output, and saved field-task result
   history.
40. Navy Yard access checks now use structured field-task metadata, shared
   resolver output, and saved field-task result history before the rack tasks
   begin.
41. The Conshohocken service call now previews signal-path and replacement
   install field tasks, and both rolls save reusable field-task history.
42. First-day cart assembly now uses structured field-task metadata and shared
   resolver output while preserving tutorial assembly progress.
43. Locked planned-work previews now use dispatch-board language instead of
   player-facing "not playable yet" phrasing.
44. Field-task history now stores and shows readable risk labels, tool context,
   and task outcome text instead of relying on internal risk flag names.
45. Route travel now records compact travel results and route cards show the
   latest mode, stat deltas, arrival clock, and drive count.
46. Field-task result modals now label consequence rows as tracked risk instead
   of exposing "risk flag" as player-facing terminology.
47. Current-work guidance now shows the full workday path and brackets the
   current step on van/map/dispatch surfaces.
48. Completed job closeouts now keep the player onsite and point them to a
   readable RETURN marker instead of teleporting directly back to the shop.
49. The roadmap now includes a condition-pressure lane inspired by The Long
   Dark: fatigue, loadout, carry burden, route friction, and unresolved risk
   should change what actions cost without adding a survival sim.
50. Walking speed now reacts to carry load, low or zero energy, high burnout,
   and bad-knees loaded walks, with the carry card and workday guidance naming the
   active condition pressure.
51. Low-but-not-zero energy and high burnout now apply visible condition
   penalties to shared skill checks, and field-task result/history surfaces
   show the penalty that affected the roll.
52. Action-pressure previews now show expected energy, condition, movement/carry
   pressure, tool fit, skill fit, callback debt, or return-trip risk on choice
   panels, field-task cards, and key nearby task objects before the click.
53. Walk-around interaction markers now use readable named NPC, task-specific,
   VAN, DOOR, and RETURN tags, and the nearby card/interact button repeat that
   marker type.
54. Nearby interactions and dispatch task cards now show task state such as
   READY, LOCKED, IN PROGRESS, COMPLETED, STRAINED, or RISK INHERITED from
   shared helpers tied to field-task results, completion arrays, and portal
   readiness.
55. The University City survey closeout is now single-use: after the report is
   filed, the facilities contact becomes a review-only completed interaction
   that points the player to the site exit.
56. Completed later job rooms now collapse to the return-route layer instead of
   leaving closeout/client/task hotspots active after the objective says to
   return to the shop.
57. Closeout functions across the current board are now single-use, so stale
   modals or resume prompts cannot re-spend energy, re-award rewards, or
   rewrite branch consequences after completion.
58. University City survey checks now use prep and inspection order as visible
   task modifiers. Checking the wall before the access path creates immediate
   survey pressure, while trusting the quote saves work now but records open
   University City access pressure on route/consequence surfaces.
59. Consequence review now groups existing ledger and closeout records into
   Active today, Resolved, and Inherited sections, with the same compact summary
   visible near the top of the career clipboard.

## Playtest Questions

Watch a player complete the current build before expanding it. Look for:

- Do players understand where to walk and what to interact with?
- Do the premade profiles make the same workday feel meaningfully different
  before the player tries the custom creator?
- Does Wiley feel like a competent residential installer learning commercial
  process, rather than a weak or joke character?
- Does Circuit Hut Parts Brain feel useful without becoming a free solution?
- Does Wiley's workaround option make the quick-vs-clean tension clearer?
- Do character-specific lines add flavor without hiding the default scene logic?
- Do traits and character stats feel readable rather than spreadsheet-like?
- Does carrying establish the field-logistics fantasy without becoming chores?
- Do players notice how their starter tool changes the service call?
- Does the preparation choice feel like a small plan rather than a menu tax?
- Is verifying the signal path clearly different from trusting the ticket?
- Does the shop feel like a place worth returning to?
- Does the site survey feel different from install and service work?
- Is the confidence-based sales pushback option a satisfying training payoff?
- Does commissioning deliver the satisfaction of understanding an unfinished
  room without becoming a technical quiz?
- Is the craftsmanship-based punch-list option a satisfying training payoff?
- Does the warehouse run feel like a brisk change of pace rather than a detour?
- Does the Navy Yard access job feel like a real field-tech problem instead of
  just a dialogue joke?
- Does documenting a delay feel meaningfully different from keeping the ticket
  clean for management?
- Do players notice when ledger stats become active career effects?
- Are the stat effects helpful enough to matter without becoming a spreadsheet?
- Does the career clipboard make the player's current build identity clear?
- Do career goals make the next RPG targets obvious without feeling like chores?
- Do players understand that tools improve skills as well as energy/carrying
  costs?
- Do premade creator formulas make Wiley and the other profiles easier to
  understand?
- Can players build a custom technician, understand the preview, start the
  first day, and continue that saved custom career?
- Does the conditional warranty return make earlier rushed or patched choices
  feel remembered?
- Does the executive handoff make "can the client use it?" feel like a real AV
  success condition?
- Does the dispatch board make consequences and skipped/triggered work obvious?
- Do company-pressure rules help the bad shop feel intentional instead of
  random or unfair?
- Do advanced systems skills feel like a clear future path, or do they distract
  from the early field-tech loop?
- Do stay-late choices feel heavy enough now that they add burnout and reduce
  tomorrow's comfort?
- Are the AV jokes legible to newcomers and recognizable to working techs?
- Does the completion card make players curious about one more job?

Keep notes on hesitation, missed interactions, and repeated actions. Prefer
fixing unclear or tedious moments before adding systems.

## Current Fix List From Playthrough

Playtest pass: June 8, 2026. Paths checked: Alex careful first-day closeout into
service prep, and Wiley shortcut-heavy first-day closeout into a rushed service
path.

Implementation follow-up: the priority items from this pass were addressed in
the next targeted polish pass. Keep this list as regression guidance for future
playtests.

### Priority Fixes

1. **Fixed - End-of-shift action labels still expose exact reputation math.**
   The preview language now says "management may notice" and "the crew
   remember the help," but the buttons still say things like `+1 coworker rep`
   and `-1 management rep`. Keep exact energy/burnout costs, but soften the
   reputation language on the buttons to match the uncertainty rule.

2. **Fixed - Service-call strained verification can create callback debt without enough
   result clarity.**
   In the careful Alex path, verifying the signal path under strain still led to
   callback debt, but the result reads mostly as "Verified under strain" and a
   light client note. The result should make the uncertainty visible after the
   click: the tech tried the right process, but weak notes or strained install
   left return-trip risk.

3. **Fixed - Shortcut consequences exist, but the board should connect them more
   clearly.**
   Wiley's shortcut path correctly stacked callback debt and return-trip risk.
   The next job/clipboard flow should make that feel remembered rather than
   hidden in ledger math. Add a small "because of your choices" line to the
   dispatch board or shop objective when callback debt is open.

4. **Fixed - Career clipboard is useful but too dense for a first read.**
   The clipboard currently shows skills, build identity, company context,
   milestone preview, goals, active effects, and the full ledger in one long
   modal. Add a compact top summary for active consequences first, then let the
   detailed ledger stay lower in the modal.

5. **Fixed - Negative goal progress reads awkwardly.**
   A shortcut-heavy Wiley path can show `Earn Crew Trust: -1/2`. The negative
   coworker reputation is valid, but goal progress should probably display as
   `0/2` with a note that crew trust is currently damaged, instead of making the
   progress meter look broken.

6. **Fixed - "Locked next work" can imply the wrong next job.**
   The service dispatch board still shows Burlington County as locked future
   work even though the next actual playable job is University City. Either show
   the real next job preview, rename this area to "Later work," or make the
   locked list reflect the actual unlock chain.

### Secondary Tuning Notes

- **Addressed:** At high energy, end-of-shift choices often all preview full next-morning
  energy, so the tradeoff has to live almost entirely in burnout and pressure
  text. Consider adding a short note when recovery is capped: "you would waste
  some recovery at full energy, but burnout/pressure still changes."
- **Addressed:** Dispatch board stakes still use the phrase "callback debt" before a few
  choices. This is probably acceptable as a risk concept, but future wording
  should prefer "return-trip risk" when we want the outcome to feel less
  deterministic.
- **Addressed:** Result screens can show exact consequences after the click, but they should
  explain why the outcome happened. This matters most when the player chose the
  careful path and still got a strained or partial result.

### Early-Flow Regression Pass

Playtest pass: June 13, 2026. Path checked: tidy first-day closeout into Josh's
intro, normal rest, rushed Conshohocken service, callback note, Josh labeler,
Josh service debrief, field-training choice, fast-travel label follow-up, and
return-to-shop closeout.

- **Fixed:** A rushed service return opened the end-of-shift modal while the
  shop objective pointed straight to Josh's callback. The shift modal now calls
  out the waiting callback note, the objective tells the player to close the
  shift first, and Josh's interaction explains that the callback is on his
  bench after closeout.
- **Verified:** After the shift closes, the callback, labeler gift, service
  debrief, training gate, follow-up job, regional-map fast travel, and
  repeat-route return all advance in order.

### Mid-Board Regression Pass

Playtest pass: June 13, 2026. Path checked: Conshohocken follow-up complete into
University City survey, South Philadelphia commissioning, second field-training
choice, Wayne-area warehouse run, and Navy Yard access-plus-rack-update job.

- **Verified:** Survey, commissioning, warehouse, and Navy Yard dispatch
  previews all appear in order, and their return exits route through the
  end-of-shift closeout.
- **Verified:** Commissioning can unlock a second field-training focus before
  the warehouse run, and the dispatch board respects that gate.
- **Verified:** The Navy Yard job now reads as access friction plus a real rack
  task: resolve access, enter the telecom room, patch/verify the rack update,
  then close out the access and rack notes.

### Late-Board Regression Pass

Playtest pass: June 13, 2026. Paths checked: Navy Yard complete with unresolved
callback pressure into warranty return, executive handoff, systems service,
Cherry Hill toll, and completion snapshot; plus the clean-ledger branch that
skips warranty and goes straight to handoff.

- **Fixed:** A systems quick reboot created fresh callback pressure after the
  handoff path had already started, and the shop objective pointed back to the
  warranty return while the board still offered Cherry Hill. Late systems
  callback pressure now stays visible on the travel board and final summary
  without stealing the current board sequence.
- **Verified:** Pre-handoff callback pressure still triggers the warranty
  return, and resolving it advances cleanly to executive handoff.
- **Verified:** The completion snapshot now includes active consequences, so an
  unresolved late callback is visible before the player leaves the current
  board.

## Current Content Experiment

The **University City Site Survey** is the third dispatch. It tests a different
job family without needing a deeper simulation.

Keep it compact:

1. Pick one morning preparation choice at the shop.
2. Arrive at a campus lobby and inspect the elevator opening.
3. Compare the elevator, hallway turn, and intended display size.
4. Choose whether to document the constraint, call sales for clarification, or
   trust the quoted plan.
5. Return with a short result that affects client, coworker, or management
   reputation.

The survey rewards observation and calm pushback. It deliberately avoids a
measurement minigame, a new inventory screen, another Josh arc, or a large map.

## Current Commissioning Experiment

The **South Philadelphia Commissioning** dispatch tests incomplete-site
troubleshooting. The room is marked ready, but a silent speaker, loose
termination, and mirrored drawing disagree. The loose termination now branches
into a field-task choice after inspection. Try at least two approaches:
re-land it fast to create concrete return-trip risk, or use a cleaner
re-termination/documentation path to protect client trust and the callback
ledger. Josh's labeler should show up as a stronger tool-specific option if the
player earned it earlier.

## Current Warehouse Experiment

The **Warehouse Run** tests shop exploration and van organization as a short
change of pace. It reuses the Wayne-area shop map, asks the player to search three
existing hotspots, and ends with one stockroom-cleanup decision.

## Current Access Experiment

The **Navy Yard Secure Access** dispatch tests whether access friction can lead
into a real field task instead of stopping at the security desk. It uses one
preparation choice, three onsite access checks, a telecom-room rack update, and
a closeout decision between honest documentation, confident pushback, or
absorbing the delay to keep the ticket clean.

## Current Consequence Experiment

The ledger now has a few direct gameplay effects:

- Two documented access issues activate a documentation habit that lowers future
  report and access-delay paperwork costs.
- Two careful finishes activate a careful-work rhythm that lowers future repair
  and punch-list costs.
- Unresolved callbacks add a small drag to later access checks.
- Closing a shift restores energy overnight, with burnout reducing ordinary
  recovery. Staying late or helping Josh creates a stronger fatigue tradeoff:
  useful next-shift or coworker benefits, but more energy loss and burnout
  before the next job unlocks.

These effects should make choices feel remembered while staying small enough for
the prototype.

## Current Return-Trip Experiment

The **Warranty Return** dispatch appears only when callbacks exceed resolved
callbacks after the Navy Yard work. It asks the player to inspect the client
complaint, previous ticket history, and actual fault, then choose between a real
fix that resolves callback debt or a quick bandage that keeps management happy.

This is the first prototype test of previous outcomes changing which quests
appear at all.

## Current Handoff Experiment

The **Executive Handoff** dispatch tests a non-technical success condition. The
system works, but the client needs the daily meeting path explained in human
language. The player can run a patient walkthrough, use confidence to rewrite a
cheat sheet, or do a fast demo that keeps management happy and leaves a training
gap.

## Current Board Clarity Experiment

The dispatch board now explains each available job with a reusable consequence
stack:

1. **Why this is on the board:** the story and career reason this job appeared.
2. **Job family and core skills:** the RPG loop being tested.
3. **Company pressure:** the employer incentives shaping the bad choice.
4. **Current build:** the active technician's strongest relevant skill, weak
   spot, and trait/tool edges such as documentation support, pressure choices,
   or parts-organizer availability.
5. **Route memory:** whether this route is new, familiar, or fast-travel ready.
6. **Stakes and active consequences:** callback pressure, shift prep, prep
   choice, and why the board may force, skip, or reorder work.
7. **Later work:** locked work that keeps the roadmap visible without implying
   it is the immediate next job.

This should make the prototype feel less like a fixed script and more like a
career reacting to the ledger.

### Dispatch Consequence Readability Pass

The board renderer now adds three shared rows when relevant:

- **Current build:** shows profile/creator edges for the job family, including
  strongest skill, weak relevant skill, documentation support, pressure-choice
  availability, parts-brain state, and long-carry pressure.
- **Route memory:** shows new route, driven route, known route, fast-travel
  readiness, and last route choice where available.
- **Board routing:** explains forced or skipped beats such as unresolved
  callbacks forcing warranty return before handoff, a clean callback ledger
  skipping warranty, Josh debrief unlocking the Conshohocken follow-up, or a
  coordination-cost travel beat after systems service.

Smoke coverage checked Wiley's first service board, Jordan's Conshohocken
follow-up with fast travel ready, unresolved-callback warranty routing,
clean-ledger handoff routing, and Cherry Hill travel language.

### Industry Terminology Consistency Pass

The player-facing copy now keeps **dispatch board** as the named shop-board
surface, while using sharper field terms for the actual problems: work order,
service ticket, coordination, site access, closeout, return trip, scope, route
estimate, and job.

This pass updated next-shift prep, Circuit Hut parts-organizer effects, secure
access notes, systems-service prep, travel-cost choices, and service-call setup.
No save schema changed; mid-playthrough saves keep the same flags and job keys.

### Job-Authoring Queue Pass

The next compact work order started data-first instead of scene-first:
**Burlington County Retrofit Walkdown**. At this pass it stayed locked, but the
current-board summary could preview it through the same dispatch-board renderer
used by playable jobs.

The preview shows its Site Survey family, mapped Burlington County route, current
build fit, stakes, task cards, and consequence hooks. This should answer whether
the job sounds expandable before adding a new room, route launch, or walkdown
scene.

Next playtest question: does a locked planned-work preview make players curious,
or does it feel like too much roadmap text inside the game?

### Playable Walkdown Pass

The **Burlington County Retrofit Walkdown** is now a playable site-survey job
after the Cherry Hill coordination-cost travel beat. The job asks the player to
choose a prep step, travel to the retrofit site, check ceiling access, trace the
existing pathway, document the above-ceiling conflict, and decide whether the
closeout records blockers, pushes a field change, or accepts the pathway as
usable.

The result writes saved flags for the later retrofit install preview:
`retrofitInstallProtected`, `retrofitInstallRisk`, and
`retrofitScopeChangeLogged`. Mid-playthrough saves should migrate safely through
save version 20, old completed jobs keep their progress awards, and resumed
Burlington saves should route back to the closeout prompt when all walkdown
checks are complete.

Playtest question: does a compact walkdown feel like useful work before an
install, or does the player need more visible connection between the scope note
and the locked retrofit install?

### Future Install Consequence Pass

The locked **Burlington County Retrofit Install** preview now reads the saved
walkdown result instead of staying generic. Its planned-work data has branches
for pending walkdown, protected pathway, partial warning, and inherited pathway
risk.

This pass adds `retrofitInstallBranch` and `retrofitInstallPartialWarning`
normalization in save version 21. Older Burlington saves should infer the branch
from `retrofitWalkdownApproach`, `retrofitWalkdownChecksStrained`,
`retrofitInstallProtected`, and `retrofitInstallRisk`.

Playtest question: when the player opens the career snapshot after Burlington,
does the locked install clearly explain what the walkdown changed, or does the
branch language need a more dramatic payoff before the install becomes playable?

### Playable Retrofit Install Pass

The **Burlington County Retrofit Install** now follows the walkdown as a
playable install beat. The player reviews the inherited walkdown branch, loads
for known conditions, returns to the Burlington site, completes one pathway
install check, and chooses between record/as-built closeout notes or a quick
install note.

This pass adds `retrofitInstallChecks` and save version 22. Existing
mid-playthrough saves after the walkdown should advance to the install board
instead of the final career snapshot, while saves inside the install should
resume to the closeout choice after the pathway check is complete.

Playtest question: does the two-step Burlington arc feel like consequence and
payoff, or does it need a shop debrief / recovery beat before the final career
snapshot?

### Post-Install Pacing Pass

The Burlington arc now takes the slower answer: after the retrofit install
returns through the normal end-of-shift closeout, the final career snapshot
waits for a one-time Josh debrief at the shop. The debrief summarizes the
inherited walkdown branch, install closeout, return-trip risk, recovered energy,
and burnout before offering the career snapshot.

This pass also split the Burlington return portal so the walkdown exit hides
once the install starts, and the install exit requires `retrofitInstallComplete`
before returning to Radnor Rack & Wire.

Playtest question: does the Josh debrief feel like a satisfying breath after
the two-step Burlington job, or does it feel like an unnecessary gate before the
career snapshot?

### Burlington Branch Playtest Pass

Seeded branch checks covered protected pathway, partial warning repaired by
record/as-built notes, and inherited pathway risk left loose by a quick install
note. Each branch used the actual install closeout, returned through the
Burlington install portal, closed the shift, opened the Josh debrief, and then
opened the final career snapshot.

Verified results:

- Protected pathway: record closeout clears the install and the snapshot shows
  record/as-built pathway notes.
- Partial warning: clean record closeout resolves the partial warning and keeps
  return-trip risk cleared.
- Inherited pathway risk: quick closeout keeps the risk visible in the debrief,
  active consequences, and final snapshot.

Save continuity note: this pass bumps the internal save version to 23. Older
saves that already viewed the final career snapshot infer
`retrofitInstallDebriefed`; saves before the snapshot still route to Josh first.

Next playtest question: does an ordinary unseeded run from Cherry Hill through
both Burlington beats still feel like a coherent final arc, or does the added
debrief make the late board feel too stop-start?

### Late-Board Manual Playthrough Pass

Browser automation ran the board forward from the existing service-complete
debug helper through Conshohocken follow-up, University City survey, South
Philadelphia commissioning, warehouse run, Navy Yard secure access, executive
handoff, King of Prussia systems service, Cherry Hill toll, Burlington
walkdown, Burlington install, Josh debrief, and final career snapshot.

Result: the Cherry Hill-to-Burlington pacing held together. The final debrief
read as a useful breath before the snapshot, the objective advanced to
"Current dispatch board complete," and no browser errors appeared.

Current roadmap state: the incremental roadmap is complete. Pick the next
playability question before adding another content beat.

### Loop Consolidation Regression Pass

Pass date: June 15, 2026.

Goal: stabilize the playable RPG loop instead of adding another dispatch.

Verified:

- Clean title-screen start, five premade technicians, custom technician start,
  and custom save payload.
- Alex, Casey, Wiley, Jordan, and Morgan start with the expected tools and first
  objective.
- Wiley's Circuit Hut organizer appears only for Wiley, activates once per job,
  and cannot be reused in the same job.
- Fresh-shop flow through supervisor, staged cargo, van menu, cargo review,
  regional map, route choice, travel confirmation, Center City route history,
  and save/continue.
- Regional map displays known destinations, active route, repeat/fast-travel
  routes, completed history, locked candidates, route cost/risk, driven-before
  state, fast-travel state, and lock reasons.
- Fast travel stays hidden before unlock, then appears for the known
  Conshohocken repeat route only when the current board route and start area
  allow it.
- Dispatch-board previews from service through Burlington install render the
  strengthened job card rows.
- Garage/lobby and Burlington walkdown/install return portals route correctly
  and do not trap the player.
- Save/continue preserves route history, systems checks, retrofit install flags,
  end-shift state, and return-trip risk summaries.

### Route Data And Smoke QA Pass

Pass date: June 15, 2026.

Goal: keep the playable loop stable while moving route/job surfaces closer to a
data-backed RPG structure.

Changed:

- Route job card metadata now lives in content data keyed by route ID, with app
  helpers only resolving stateful variants such as the Conshohocken follow-up
  and Burlington install.
- Dispatch tool expectations now live in content data with route-specific
  add-ons.
- Retrofit walkdown and retrofit install checks now use the shared field-task
  resolver, joining secure access and systems service as reusable task/check
  examples.
- Added `scripts/qa-smoke.js` for a fast browser smoke pass over roster/custom
  start, van/map route cards, fast-travel gating, route job metadata,
  walkdown task-check state, and save/continue continuity.

Verified: `node --check` passed for `app.js`, `data.js`, and the smoke script.
The smoke script passed in Chrome with the bundled Codex Playwright runtime.

### Field-Task Data Pass

Pass date: June 15, 2026.

Goal: make current field work easier to inspect and extend without adding
another dispatch.

Changed:

- Secure-access rack tasks, systems service checks, retrofit walkdown checks,
  and the Burlington install task now carry structured task metadata.
- The shared field-task resolver now records compact result data in save flags,
  including task type, skill, difficulty, context, energy cost, tier, success
  state, and risk flag.
- Dispatch previews can show actual field-task cards, including base energy,
  skill/difficulty, helpful tools, and named risks.
- Field-task modals now show structured result rows for task type, skill check,
  energy spent, relevant tools, and tracked risk.

Verified: syntax checks passed for `app.js`, `data.js`, and
`scripts/qa-smoke.js`. The smoke script passed, and a focused Chrome check
confirmed secure-access and systems field-task previews/results save and render.

### Consequence Ledger Pass

Pass date: June 15, 2026.

Goal: make closeout debt readable as the RPG consequence layer.

Changed:

- Added a reusable consequence ledger that gathers unresolved callback pressure,
  named open return-trip risks, and resolved return-trip risk history.
- Systems quick-reboot closeout now records a named systems return-trip risk
  instead of only incrementing callback debt.
- Warranty root-cause cleanup can move a matching return-trip risk into resolved
  history.
- Secure access, commissioning, systems service, Burlington walkdown, and
  Burlington install result modals now show closeout consequence cards with
  cause, future effect, and open/resolved/inherited status.
- Career clipboard and current-board summary now include the consequence ledger
  alongside active consequences.

Verified: syntax checks and the smoke script passed. The smoke script now
asserts systems quick-reboot risk creation, career clipboard ledger visibility,
and warranty cleanup resolved-risk history.

### Loop Guidance And Transition Pass

Pass date: June 15, 2026.

Goal: make it easier for a player to understand where they are in the playable
loop and what action advances the workday.

Changed:

- Added reusable workday guidance that labels the current work step, next
  action, and interface to check.
- The Current Step panel now includes work-step guidance while the scene header
  keeps the shorter objective.
- The van menu, regional map, and dispatch-board previews now show the current
  workday guidance block.
- Portal transitions now show from/to/status details, and locked transitions
  open a readable blocker modal instead of only logging a message.
- The early garage/client-entrance interaction now explains when it is locked by
  undelivered equipment and when it is ready to enter the client lobby.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
workday guidance in van/map surfaces, locked/ready transition cards, nearby-card
transition status, and the current-step work label.

### Dispatch Board State Consolidation Pass

Pass date: June 15, 2026.

Goal: answer what remains after the named roadmap completed, then keep moving
on the biggest non-content hardcoding risk.

What is left now:

- Keep broadening reusable task/check structure to older bespoke checks when a
  job is touched.
- Keep dispatch, route, consequence, and closeout data easy to inspect from the
  player-facing board.
- Keep smoke coverage close to the full RPG loop, especially board gates,
  blockers, and save/continue after late-game flags.
- Avoid new dispatches, manual driving, or engine migration until the menu/card
  loop is boringly reliable.

Changed:

- Added a centralized dispatch-board state helper for current board item,
  blocked board item, in-progress item, route ID, HUD title/status, and preview
  action.
- `getCurrentDispatchRouteId()` now reads from that board state instead of a
  separate route ladder.
- The dispatch-board preview action now routes through the active board entry
  and reports blocked reasons from the same data.
- The HUD dispatch title, summary, and status now read from board state, so the
  shop surface points at the next playable step instead of stale completed work.
- Dispatch job cards now include a compact Board state row that says whether the
  item is active or blocked, whether it has a drive route, and why it is on the
  board.

Verified: syntax checks passed for `app.js`, `data.js`, and
`scripts/qa-smoke.js`. The smoke script passed and now asserts service-board
selection, Josh-blocked follow-up state, no-route Cherry Hill board behavior,
Burlington install route reuse, and HUD/title/objective alignment.

### Commissioning Field-Task Choice Pass

Pass date: June 15, 2026.

Goal: continue the remaining hardening lane by moving an older bespoke field
choice closer to the shared task/check model.

Changed:

- South Philadelphia termination choices now live in
  `content.commissioningDispatch.terminationTasks` with type, skill, difficulty,
  energy, tools, context, success/strained text, and named risk metadata.
- Shared field-task result recording now supports both ordinary skill checks and
  choice-style field tasks that may not roll a skill.
- The commissioning dispatch preview now shows termination field-task choices
  before accepting the job.
- Resolving the termination task records a `fieldTaskResults` entry, so
  save/continue and future closeout surfaces can inspect the task result without
  re-parsing bespoke flags.
- Career clipboard and final snapshot now include a compact field-task history
  sourced from those reusable result entries.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
commissioning field-task preview text, data-backed task type/skill, energy
change, structured result rows, and save/continue preservation of the
commissioning field-task result. It also checks that the career clipboard shows
the saved field-task history.

### Callback And Handoff Task Consolidation Pass

Pass date: June 15, 2026.

Goal: keep broadening reusable task/check structure across existing jobs without
adding a new dispatch.

Changed:

- Warranty return checks now carry structured task metadata for callback
  documentation, closeout history, and root-cause troubleshooting.
- Executive handoff checks now carry structured task metadata for control-panel
  labels, daily user path, and client need.
- Both jobs now preview those checks as field tasks on their dispatch cards.
- Both inspection flows now use `resolveFieldTaskCheck()` and show
  `getFieldTaskResultMarkup()`, so their outcomes write to `fieldTaskResults`
  and appear in field-task history.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
callback and handoff field-task preview text, data-backed task type/skill,
energy changes, saved field-task results, and structured result rows.

### Survey Task Consolidation Pass

Pass date: June 15, 2026.

Goal: keep consolidating older bespoke checks into reusable field-task patterns
without changing the playable job sequence.

Changed:

- University City survey inspections now carry structured task metadata for
  access survey and wall-fit checks.
- The survey dispatch preview now shows its inspection checks as field tasks.
- Survey inspections now resolve through `resolveFieldTaskCheck()`, show
  `getFieldTaskResultMarkup()`, and write reusable `fieldTaskResults` entries.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
survey field-task preview text, data-backed task type/skill, energy change,
saved field-task result data, and structured result rows.

### Warehouse Task Consolidation Pass

Pass date: June 15, 2026.

Goal: keep shop-based work on the same task/check path as field sites.

Changed:

- Warehouse search locations now carry structured task metadata for stockroom,
  van-inventory, and returns-pile searches.
- The warehouse dispatch preview now shows its search checks as field tasks.
- Warehouse search interactions now resolve through `resolveFieldTaskCheck()`,
  show `getFieldTaskResultMarkup()`, and write reusable `fieldTaskResults`
  entries.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
warehouse field-task preview text, data-backed task type/skill, energy change,
saved field-task result data, and structured result rows.

### Commissioning Inspection Consolidation Pass

Pass date: June 15, 2026.

Goal: finish moving the South Philadelphia commissioning job toward one reusable
task/check pattern, not just the termination choice.

Changed:

- Commissioning inspection checks now carry structured task metadata for audio
  verification, termination inspection, and documentation review.
- The commissioning dispatch preview now shows both inspection checks and the
  later termination task choices as field tasks.
- Commissioning inspections now resolve through `resolveFieldTaskCheck()`, show
  `getFieldTaskResultMarkup()`, and write reusable `fieldTaskResults` entries.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
commissioning inspection preview text, data-backed task type/skill, energy
change, saved field-task result data, and structured result rows.

### Secure Access Check Consolidation Pass

Pass date: June 15, 2026.

Goal: make the first half of Navy Yard as inspectable as the rack update.

Changed:

- Security gate, building-number, and escort checks now carry structured
  field-task metadata.
- The Navy Yard dispatch preview now shows access checks and rack tasks together
  as field-task cards.
- Access checks now resolve through `resolveFieldTaskCheck()`, show
  `getFieldTaskResultMarkup()`, and write reusable `fieldTaskResults` entries.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
secure-access preview text, data-backed task type/skill, energy change, saved
field-task result data, and structured result rows.

### Service Call Task Consolidation Pass

Pass date: June 15, 2026.

Goal: make the first post-tutorial service call expose its RPG tasks before the
player drives to Conshohocken.

Changed:

- The Conshohocken service dispatch now has task cards and field-task previews
  for signal-path verification and replacement installation.
- Signal-path verification now resolves through `resolveFieldTaskCheck()`,
  shows structured result rows, and writes a `service-signal-path` result.
- Replacement display/hardware installs now resolve through the same helper
  while preserving existing `serviceDelivered` and `serviceInstalled` progress.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
service preview text, service signal-path results, service install results,
energy changes, saved field-task result data, and structured result rows.

### Tutorial Assembly Consolidation Pass

Pass date: June 15, 2026.

Goal: make the first field-work install beat use the same task/check structure
as later dispatches.

Changed:

- Tutorial cart components now carry structured field-task metadata.
- Cart assembly installs now resolve through `resolveFieldTaskCheck()` while
  preserving the existing `assembled` progress array.
- Non-branching assembly steps now show structured result rows so the player can
  see skill, energy, tool, and risk consequences immediately.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
cart assembly progress, data-backed task type/skill, energy change, saved
field-task result data, and structured result rows.

### Player-Facing Language Cleanup Pass

Pass date: June 15, 2026.

Goal: keep save-compatible internal prototype IDs while removing player-facing
phrasing that sounds like a build limitation.

Changed:

- Planned-work fallback copy now says the job is planned for a future dispatch
  board slot.
- Locked planned-work previews now say the work order can be inspected but is
  not on today's drive list.

Verified: syntax checks and the smoke script passed.

### Field Task History Readability Pass

Pass date: June 15, 2026.

Goal: make the career clipboard field-task history explain what the task result
means to the player.

Changed:

- `fieldTaskResults` now save readable risk labels, outcome text, and task tool
  context when a field task resolves.
- The field-task history ledger now displays readable risk and outcome language
  while keeping old save entries compatible through fallbacks.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
saved readable risk/outcome text and career-clipboard display for commissioning
field-task history.

### Travel Result Readability Pass

Pass date: June 15, 2026.

Goal: make route choices leave a saved, player-readable result on the regional
map instead of only a rolling log line.

Changed:

- `travelRoute()` now records a compact latest travel result per route plus a
  short rolling travel-result log.
- Route cards now show the latest travel mode, energy/cash/burnout deltas,
  arrival clock, and drive count.

Verified: syntax checks and the smoke script passed. Smoke coverage now drives
the Center City loading-zone choice, checks the saved travel result, and asserts
that the regional map route card shows the result.

### Field Task Result Wording Pass

Pass date: June 15, 2026.

Goal: keep the field-task result modal readable as player consequence language.

Changed:

- Field-task result rows now say `Risk tracked` instead of `Risk flag`.
- The no-risk fallback now reads `No named risk`.

Verified: syntax checks and the smoke script passed. Smoke coverage now expects
the updated result-row label across tutorial, service, secure access, survey,
callback, handoff, warehouse, retrofit, and commissioning tasks.

### Workday Loop Path Pass

Pass date: June 16, 2026.

Goal: help the van/map/board layer read like one coherent RPG workday loop.

Changed:

- Current-work guidance now includes the full workday path:
  Shop -> Van / Dispatch Board -> Regional Map / Route -> Travel Choice -> Job
  Site -> Field Tasks -> Closeout -> Return / End Shift -> Next Job.
- The current step is bracketed so the player can place the next action inside
  the larger loop.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
that the van and regional-map surfaces show the workday path.

### Return Marker Flow Pass

Pass date: June 16, 2026.

Goal: make closeout feel less like a modal script and more like leaving a place.

Changed:

- Closeout buttons that use `returnToShopViaCurrentExit()` now leave the player
  onsite when a ready return portal exists.
- The player gets a short prompt telling them to walk to the marked return
  point.
- Return portals render as a wider `RETURN` marker instead of the small generic
  portal dot.

Verified: syntax checks and the smoke script passed. Smoke coverage now asserts
that service closeout leaves the player in the service office, renders a
readable RETURN marker, and still opens the mapped shop-return transition when
the portal is used.

### Consequence Pressure Roadmap Pass

Pass date: June 16, 2026.

Goal: make future small passes aim at RPG consequence pressure rather than more
scripted content.

Roadmap direction:

- Treat fatigue, burnout, cash, carry load, prep, confidence, and unresolved
  risk as field condition.
- Make condition affect walks, route choices, field checks, closeout choices,
  and end-shift recovery one helper at a time.
- Borrow The Long Dark's feeling of readable pressure and costly tradeoffs, but
  keep the fantasy grounded in AV workdays instead of survival meters.
- Prefer one visible pressure hook in an existing loop over another dispatch.

### Condition Movement Pressure Pass

Pass date: June 16, 2026.

Goal: make condition affect the walk-around layer without adding a new system,
route simulator, or survival meter.

What changed:

- Carrying gear, low energy, zero-energy exhaustion, high burnout, and
  bad-knees loaded carries can reduce walk speed.
- The speed penalty is clamped so the player is slowed, not trapped.
- The carry card and workday guidance show the active condition pressure
  and walk-speed readout.
- Smoke QA checks base speed, carrying pressure, exhaustion pressure,
  bad-knees loaded-walk pressure, and visible HUD guidance.

Question for the next playtest: does the slowdown make field condition feel
consequential, or does it need to be limited to larger rooms and carry-heavy
beats?

### Condition Skill-Check Pressure Pass

Pass date: June 16, 2026.

Goal: make stats affect field outcomes through shared RPG math instead of
through more scripted one-off branches.

What changed:

- Low-but-not-zero energy can apply `condition -1` to skill checks.
- High burnout can apply another `condition -1`, capped at `condition -2`.
- Zero-energy crashes still use the separate exhaustion penalty.
- Skill-check labels, field-task result rows, saved field-task history, active
  effects, and the career clipboard show the condition pressure.
- Smoke QA checks the score drop, label, result markup, saved history, ledger,
  and clipboard readout.

Question for the next playtest: do players notice that low energy and burnout
now make checks worse, and does the label give enough warning before they make
a risky choice?

### Action Pressure Preview Pass

Pass date: June 16, 2026.

Goal: make the RPG consequence layer visible before a player commits to an
action, not only after the result modal explains what happened.

What changed:

- Added shared action-pressure helpers for energy cost, field condition,
  movement/carry pressure, tool fit, skill fit, callback debt, and return-trip
  risk.
- Choice panels now include active "Pressure on this action" when current state
  matters.
- Field-task preview cards can show pressure before accepting or starting work.
- Key nearby task objects in the shop, garage, service call, warehouse searches,
  and cart assembly now preview pressure in the nearby card.
- Smoke QA checks the helper, choice markup, field-task preview markup, nearby
  card copy, and nearby-card highlight state.

Question for the next playtest: does pre-click pressure make actions feel like
RPG commitments, or does any surface feel too wordy during ordinary walking?

### Spatial Marker Affordance Pass

Pass date: June 16, 2026.

Goal: make the top-down interaction layer more readable without rebuilding maps
or adding manual movement systems.

What changed:

- Generic interaction dots now render as rectangular marker tags.
- Contacts, work objects, vehicle access, building transitions, and return exits
  show as named NPC labels such as `SUP` or `JOSH`, task-specific labels such
  as `PICKUP`, `CHECK`, and `BOARD`, plus `VAN`, `DOOR`, and `RETURN`.
- Markers offset away from labeled props when the hotspot sits inside a visible
  object label.
- The nearby card and interact button repeat the same marker label, so the
  screen tells the player what kind of thing they are approaching.
- Smoke QA checks contact, task, van, door, return, and prop-label overlap
  behavior.

Question for the next playtest: do the marker tags make walking and exits more
obvious, or should task markers become more specific in a later pass?

### Task State Presentation Pass

Pass date: June 17, 2026.

Goal: make task objects feel less scripted by showing whether an interaction is
available, blocked, already resolved, or carrying risk before the player presses
the button.

What changed:

- Added reusable task-state helpers that resolve READY, LOCKED, IN PROGRESS,
  COMPLETED, STRAINED, and RISK INHERITED from existing field-task results,
  completion arrays, and portal readiness.
- Nearby cards now include task state for mapped objects and exits.
- Interaction markers expose task state in their dataset and use subtle locked,
  completed, strained, and in-progress styling.
- Dispatch field-task cards show task state alongside tool, skill, energy, and
  pressure preview text.
- Smoke QA checks ready shop work, locked and ready systems checks, strained
  task-card history, vehicle/door/return marker state, and existing pressure
  copy.

Question for the next playtest: does visible task state make walking up to work
objects feel more like choosing an RPG action, and are any state labels too
noisy during ordinary movement?

### Commissioning Hotspot Review Pass

Pass date: June 18, 2026.

Goal: keep reducing one-off modal-chain feeling by letting a resolved field
task remain inspectable at the object that caused it.

What changed:

- The South Philadelphia credenza termination hotspot now shows READY before
  the loose-line choice and COMPLETED after the selected task resolves.
- Re-interacting with the completed termination hotspot opens a field-task
  review with the saved task result, outcome, and return-trip risk status.
- The workday guidance interface hint no longer treats "training room" as a career
  training prompt.
- Smoke QA now checks the ready/completed hotspot state, the saved-result review
  modal, and the corrected workday guidance.

Question for the next playtest: does being able to walk back to a resolved task
make the room feel more like a place with state instead of a modal sequence?

## Current RPG Skeleton Experiment

The career clipboard now exposes three pieces of RPG structure that future
content should build on:

1. **Build identity:** the player's strongest skill branches, reputation lean,
   work style, and callback debt.
2. **Career goals:** visible tracks for rank, crew trust, careful finishes,
   documentation habits, tool ownership, and field-task choices.
3. **Tool skill bonuses:** content-defined bonuses that make tools part of task
   outcomes, not just energy discounts.
4. **Company context:** the current employer's culture, dysfunction, and
   reputation pressure.
5. **Job families:** each dispatch board can show the RPG loop and core skills
   for the kind of work being offered.
6. **Trait context bonuses:** character traits can add small bonuses to named
   task contexts without hardcoding every trait in the engine.

Playtest whether these read like useful goals. If players ignore them, the next
pass should improve how jobs reference goals and skill branches before adding a
larger skill tree.

## Current Replay Experiment

The **Alex** profile is the balanced commercial helper and keeps the internal
`prototype-tech` ID for save compatibility.

The **Casey** profile starts with a tool bag, slightly more energy, stronger
documentation habits, and weaker confidence. It tests whether starting stats,
tools, and careful-work traits create a meaningfully different replay without
changing the job sequence.

The **Wiley** profile starts as a residential install tech with stronger
hands-on craft, lower commercial confidence, and a Circuit Hut parts organizer.
His first-pass experiment is small: he can choose to search the organizer once
per job for a testing aid, and he gets an early tempting workaround option
that saves time while creating callback debt.

The **Jordan** profile tests a helpdesk/service path: strong troubleshooting,
clean notes, and a "Knows A Guy" prep option.

The **Morgan** profile tests a live-events/client-pressure path: strong
communication, steady hands, and earlier pressure-choice access.

The current character-support pass keeps profiles data-driven where possible:
character-specific lines live in `characterLines`, optional `characterStats` and
`traits` can gate small choices, `traitContextBonuses` maps traits to task
contexts, and quick-workaround choices can record return-trip risk flags for
future callbacks.

### Character Replay Verification Pass

Wiley and Jordan were replayed against the expanded board to check whether
non-Alex builds still create intentional differences after the newer service,
survey, commissioning, warehouse, secure-access, warranty, handoff, systems, and
travel beats.

**Wiley replay result:** his build still reads as fast, practical field work.
He starts with the Circuit Hut organizer, can use it once for the service
dispatch after the required Josh intro, and the early adapter workaround records
callback/return-trip pressure. His install and practical troubleshooting checks
stay strong, including secure-access rack work and commissioning termination,
while survey documentation, handoff documentation, networking, and calm
pushback remain weak. He does not see the survey/access/travel pressure
shortcuts at low confidence, which keeps the residential-to-commercial learning
curve visible.

**Jordan replay result:** his build still reads as a process-minded service
tech. "Knows A Guy" opens the site-contact service prep, and By The Book plus
Notebook Habit lower survey, access, and handoff documentation costs. His
service diagnosis, survey documentation, secure-access pressure, systems
networking, and handoff documentation checks read cleanly. His physical install
checks still strain, especially commissioning termination and the access rack
task, so the profile does not become a universal best answer.

**Resume check:** an older post-first-job save with `finished` set and no
`metJosh` flag resumes into Josh's required introduction before the board,
personal kit, vehicle, map, or break-area routes can skip ahead.

## Current Character Creation Experiment

The first character-creation release is interactive. The selection screen shows
each premade profile's formula and a custom-creator card. The creator lets the
player choose a name, background, work style, two traits, two primary skills,
and two secondary skills, then previews the resulting stats, starting kit,
tradeoffs, and skill values before starting.

### Custom Creator Save/Resume Verification Pass

Two custom builds were replayed through save/resume states to prove custom
technicians behave like real careers instead of temporary previews.

**Tool-heavy retrofit build:** Residential Installer + Parts Brain + Tool Debt
and Bad Knees, with install/troubleshooting as primary skills and
fieldcraft/documentation as secondary skills. This verified the custom builder
sanitizes names, carries the tool bag, Circuit Hut organizer, drill, cash
penalty, `circuitHutPartsBrain`, and `badKnees` into the career state, and
keeps the combined tool-bag/bad-knees carry math stable. A mid-shift save in
the client room resumed into the required finish-choice modal with the custom
technician, custom tools, and current job state intact.

**Process-heavy helpdesk build:** Helpdesk Convert + By The Book + Notebook
Habit + Knows A Guy, with troubleshooting/documentation as primary skills and
networking/client communication as secondary skills. This verified the save
summary uses the custom name, post-first-job saves restore the custom build,
the Josh intro still gates the next board route, Knows A Guy opens the service
contact prep, documentation traits reduce survey costs, pressure choices unlock
from the built skill profile, and systems-networking checks remain strong.

The implementation was hardened so invalid creator IDs are rejected by
validation and direct builder calls sanitize custom names the same way the form
path does.

Playtest whether the preview is enough to make the first-day differences clear.
If the choices still feel abstract, the next pass should add more explicit
first-job consequence text to the preview.

### Creator Readability Pass

Premade profile cards and the custom creator preview now share the same
generated early-readout surface:

- **Shop start:** starting tools and any custom cash modifier.
- **Early unlocks:** parts-brain use, workaround choices, pressure choices,
  site-contact prep, and documentation support.
- **First job feel:** tool-bag pickup help, drill assembly reduction, hand-truck
  carry capacity, bad-knees carry pressure, install strength, and careful-work
  support.
- **Watch-outs:** weak paperwork, commercial process, pressure conversations,
  physical install, systems service, or stamina.

The smoke pass checked Alex, Wiley, Jordan, and a custom build combining
Residential Installer, Parts Brain, Tool Debt, and Bad Knees. Wiley now previews
the organizer, workaround, and locked early pressure conversations; Jordan
previews site-contact prep, documentation support, and fragile physical install;
the custom retrofit build previews its derived drill, cash penalty, long-carry
pressure, and parts organizer before the player starts the career.

## Next Build Prep

Do not build all of these at once. Pick one small pass, play it, then commit.

### Built Slice: Systems-Flavored Service Job

Playability question: can the new advanced skills matter in one readable job
without adding a programmer minigame or a generic quest engine?

Candidate shape:

```txt
Working title: King of Prussia Room Offline
Job family: service
Company: Radnor Rack & Wire
Map/scene: client conference room or simplified telecom closet
Why it is on the board: client says the room is offline; the service ticket says "probably reboot it."
Core skills: troubleshooting, networking, controlSystems, documentation
Prep choice: review network notes, ask Josh what changed, or leave immediately
Three things to inspect or do: check panel status, verify device/network path, compare room note to actual rack
Final choice: document the network/control mismatch, quick reboot and close ticket, or call out the scope miss
Good outcome: client/coworker trust, useful notes, possible management friction
Fast/bad-company outcome: management likes clean ticket, callback or return-trip risk remains
What remembers it: callback ledger, documentation habit, future systems-training value
```

Scope guardrail: one prep choice, two or three checks, one final result modal.
No new map system, no real IP addressing puzzle, no company-specific engine.

Initial implementation: **King of Prussia Room Offline** now appears after the
executive handoff and before the current-board summary.

Next playtest question: does the systems job feel like a field service call with
systems flavor, or does it feel too abstract compared with install/service work?

First tuning pass: make the closeout pressure visible before the click without
turning the choice into an answer key. Energy and cash costs can be exact, but
future outcomes should be phrased as risks and tendencies: callback risk,
management friction, coworker cleanup, or client trust.

Tuning pass: June 10, 2026. The systems prep effects now match the button text:
reviewing notes helps the network and rack-note checks, while asking Josh helps
the touch-panel/control read. Result screens for the systems job and Cherry Hill
travel job now report relationship outcomes, return-trip risk, and career record
language instead of exact reputation math. A quick simulation pass confirmed that
Jordan reads as the strongest service/systems profile, Casey benefits from notes,
and Alex/Wiley/Morgan still feel meaningfully out of depth unless they pick
systems training.

Routing fix: the Cherry Hill travel-cost job now stays available after the
systems service even if a quick reboot creates fresh callback debt. The dispatch
board still surfaces that unresolved callback pressure, but the current slice no
longer dead-ends before the travel-cost experiment or completion snapshot.

Feedback to collect next: does the player understand that a strained systems
check can make the careful closeout less valuable without making the careful
choice feel like a trap?

Follow-up tuning pass: June 11, 2026. A systems result now includes a
`Diagnostic quality` row, and the scope-miss relationship summary changes when
the checks were strained. The intent is to make the reduced upside visible
without telling the player that documenting was a mistake.

### Second Choice: End-Of-Shift Balance Playtest

Playability question: are clock-out, prep, help-Josh, and recovery-day choices
now meaningfully different?

What to watch:

- Does staying late feel useful but painful?
- Does helping Josh feel like relationship investment rather than free rep?
- Does recovery day feel like a legitimate answer when burnout stacks?
- Are the labels clear enough before the player clicks?

Only tune numbers after one short playthrough from low-energy state and one from
near-full-energy state.

First tuning pass: show a next-morning preview for every end-of-shift option.
This keeps the existing balance but makes the real tradeoff visible: energy,
burnout, relationship/reputation change, and the benefit of staying late or
taking recovery.

Balance check: June 10, 2026. Simulated near-full energy, mid-energy with
burnout, and low-energy with high burnout. Initial numbers made one-off
stay-late choices readable, but repeated stay-late choices were still too easy
to absorb from full energy because the recovery floor was higher than the
stay-late cost. Staying late now costs more energy, stayed-late overnight
recovery has a lower floor than ordinary clock-out recovery, and consecutive
late nights cap next-morning energy. The first late night caps tomorrow at 80
energy, the second at 70, the third at 60, and the cap keeps tightening until
the player clocks out normally or takes a recovery day.

Feedback to collect next: do higher stay-late costs make the choice feel heavy
without making Josh help or next-day prep feel like fake options?

Follow-up simulation: repeated stay-late choices plus moderate or heavy daily
work now run the player down over several shifts. Stay-late prep by itself goes
100 -> 80 -> 70 -> 60 -> 44 -> 28 -> 16 over repeated nights, and then enters a
low-energy crash loop if the player refuses to rest. Help-Josh nights follow the
same cap path but have a slightly softer energy cost. A 20-energy workday plus
stay-late prep reaches a crash around day 4, and repeated 75- or 90-energy
workdays also collapse even if the player clocks out, because energy costs that
overrun zero become exhaustion debt. Every 10 unpaid energy converts into 1
burnout. This is not a fail state; it is a "borrow from tomorrow" rule so the
player can finish a bad day while making repeated overwork materially worse.

Implementation note: the next-morning preview now uses the same recovery math as
the actual shift closeout. Staying late applies the new burnout before recovery,
so the preview no longer overstates tomorrow's energy.

Zero-energy follow-up: hitting zero is now a risk/reward state instead of only a
low number. The player can keep working, but field judgment gets worse: skill
checks can show an exhaustion penalty, every 8 unpaid energy creates an
exhaustion incident, and ordinary overnight recovery is capped after a crash.
For a 100-energy tech, the first crash caps ordinary recovery at 60 energy, and
each incident tightens that cap by 8. Incidents rotate through management
friction, return-trip risk, and coworker handoff damage. Recovery day clears the
pressure at a management cost.

Design references: Stardew Valley and related life-sim stamina systems are good
models for making daily limits readable, while Darkest Dungeon-style stress and
Slay the Spire-style pressure are useful references for visible accumulated
risk. The AV Tech version should not copy their exact pass-out, hospital,
stress-affliction, or damage rules. It should feel like field work: tired
decisions create thin notes, callbacks, reputation friction, and a worse start
tomorrow.

### Third Choice: Travel-Cost Micro-Job

Playability question: can the game show the real cost of poor coordination
with one travel decision instead of a route simulator?

Candidate shape: a Cherry Hill return or toll/parking decision that tests cash,
energy, management pressure, and documentation. Keep it as a single board
beat unless the existing service loop needs a lighter change of pace.

Initial implementation: **Cherry Hill Return Toll** now appears after the
systems service job. It is a board-only micro-job with one final choice:
document the toll, push coordination to own it, or eat the cost to keep management
happy.

Next playtest question: does the one-choice travel job feel like real
coordination friction, or does it feel too small after a full systems service
job?

Outcome check: June 10, 2026. Receipt and pushback preserve cash while costing
energy and management friction; absorbing the toll saves energy but lowers net
cash and records unreimbursed travel. No number change yet. The micro-job now
also remains available after systems-created callback debt, so this experiment
can still be tested after a quick-reboot systems closeout.

## Energy Balance Notes

Responsible choices should usually cost enough energy to make the shortcut
tempting. Good habits, prep, and tools can reduce friction, but they should not
erase it completely on choices that involve extra documentation, cleanup,
client coaching, or careful closeout.

Cutting corners should often be the faster, lower-energy option in the moment.
The balance target is that the player keeps asking: do I protect myself right
now, or spend energy to reduce callback risk, angry clients, coworker rework,
and later performance pressure?

Current tuning pass: raised the felt cost of warehouse label cleanup, access and
survey reporting, client handoff support, and commissioning closeout. Watch for
whether these choices feel meaningfully right-but-tiring without making careful
play feel punished.

Choice-language pass: major choices should show what the character can know in
the moment. Immediate costs such as energy, cash, time, and burnout can be
specific. Downstream consequences should stay uncertain: "may create management
friction," "lowers return-trip risk," "protects the next tech," or "keeps the
bad process invisible." Avoid showing exact reputation or callback math before
the player commits.

## QA Cleanup Notes

Latest cleanup pass: audited completed job sites for out-of-order hotspots.
Commissioning, warranty return, executive handoff, and systems service now
expose only the ready RETURN marker after closeout, while stale closeout calls
open an already-complete review instead of spending resources again. University
City also drops completed inspection hotspots after the filed-survey review.
Smoke QA now covers those completed-room guards and verifies the current
dispatch key advances to systems, travel, and Burlington work instead of being
held by older completed flags.

Follow-up hardening: the same single-use guard now covers first-day finish,
service result, Conshohocken follow-up, warehouse, secure access, travel cost,
Burlington walkdown, and Burlington install closeouts. Smoke QA snapshots flags,
stats, energy, burnout, cash, and XP before stale closeout calls and verifies
the calls only open an already-complete review.

Current-step briefing pass: the persistent Current Step panel now uses the same
state-derived briefing as the van and regional map. It shows work step, next
action, where to look, active/locked route state, fast-travel/history status,
open callback or return-trip debt, and condition pressure when active. Smoke QA
now checks that clean, locked, fast-travel, callback, and return-risk states stay
visible from the player HUD.

Shift-result delta pass: end-shift choices now land in a result modal that shows
only the tracked career values that changed, plus the next step. This makes
clock out, stay-late prep, help-Josh, and recovery-day choices feel like RPG
consequences instead of silent stat edits, while leaving the underlying balance
math unchanged. Reuse the delta helper on job closeouts only when touching those
flows for other fixes.

First-job closeout delta pass: the Two Quick Carts result screen now shows the
same changed-state summary after the cable closeout choice. Wiley's workaround
path is the smoke-tested risky case: cash, XP, reputation, callback debt, and
return-trip risk all appear in the player-facing result without expanding the
job or changing the reward math.

Route/job card tool-plan pass: regional-map route cards now draw from the same
job metadata and tool-plan data as dispatch cards. Players can inspect route
status, destination/region, family, purpose, required and recommended tools with
owned/missing prep status, risk tags, unlocks, rewards, fast-travel state, and
open callback/return-trip context. Burlington's install card now names the saved
walkdown branch so the two-step consequence chain is visible before travel.

Map transition card pass: the regional map now separates active job routes,
launchable routes, unlocked fast-travel routes, completed history, and locked
future candidates. It also shows current-area transition cards from the portal
data, including origin, destination, status, requirement, travel or return
effect, and work step, so locked entrances and return exits are readable before
the player clicks them.

Return portal and route prep integration pass: completed-job review modals now
close back to the room instead of offering a second modal return path. The
RETURN marker performs the shop trip. Van and regional-map drive actions now
open a compact route prep card from route job metadata and dispatch tool plans
before travel, showing required prep, recommended prep, route status, travel
risk, fast-travel state, and consequence pressure.

Current-step transition awareness pass: the current-step panel now lists visible
area transitions from portal data, including locked requirements and ready
destinations. Burlington route cards and route prep also show saved walkdown
result and install branch rows so the retrofit chain reads as one consequence,
not two unrelated jobs.

Consequence route pressure pass: callback debt and open return-trip risks now
map back onto affected routes. The regional map groups pressured routes, route
cards and route prep show mapped consequence pressure, and the van can open a
small consequence review listing affected routes.

Dispatch route prep handoff pass: route-backed dispatch-board actions now open
the reusable route prep card before continuing into existing prep or travel
flows. Job cards, van/map actions, required and recommended prep, consequence
pressure, and route launch now use the same player-facing prep surface.

Route launch clarity pass: route prep cards now include a next-step row that
names the next handoff before the player commits. The card can explain
route-choice prompts, job prep steps, fast-travel summaries, Burlington package
review, or the normal route summary from the same launch-preview helper.

Bloat audit pass: the live career snapshot no longer shows planned-work preview
buttons or playtest-question prompts, and dispatch cards no longer carry
authoring-style future-job text by default. Keep the test questions in docs and
keep the game screens focused on current work, consequences, recovery, and the
next shop step.

Save-flag intent cleanup pass: `prototypeSummaryViewed` remains the saved flag
for existing careers, but new writes now go through career snapshot helper
functions. This keeps compatibility while making future code read in player/game
terms instead of old prototype scaffolding terms.

Static asset bootstrap cleanup pass: `index.html` no longer uses
`document.write()` for cache-busting CSS or script loading. A small DOM-created
loader keeps the static GitHub Pages setup, preserves `data.js` before `app.js`
ordering, and avoids deprecated parser-writing behavior.

Dispatch action cleanup pass: route-backed dispatch previews now use one shared
route/prep action helper and the same "Review Route & Prep" button. The player
still lands on the same prep card, but the board surface is less bespoke.

Current-step language cleanup pass: the Current Step panel no longer says
"Interface:" in the "Where to look" row, and the garage/lobby travel stage now
reads "Route / Building Entry." Player guidance should sound like practical
work direction, not implementation language.

Route launch flow consolidation pass: route prep handoff text and the actual
drive button now use the same `getRouteLaunchFlow()` resolver. Smoke coverage
checks service prep, service travel, Burlington package review, and Burlington
install travel previews so future route additions are less fragile.

Route-card next-step pass: regional route cards and the Current Step route brief
now reuse the route prep travel-handoff preview. Map, van, board, and prep
surfaces should all explain the next route action in the same player-facing
language.

Job-site departure consequence pass: closeout choices now save a small
before/after and consequence summary. The mapped RETURN marker uses it to show
"Before You Leave," "What Changed," current closeout effect, risk carried back,
and the next shop step before the player returns.

First variable gameplay slice: the Conshohocken service job now rolls saved room
conditions instead of playing as the same fixed checklist every career. Prep and
client context can reveal conditions, known conditions can help service checks,
and unresolved room pressure creates named Conshohocken return-trip risk for the
Josh/callback follow-up to resolve.

## RPG Gameplay Proof Phase

The next phase should prove that one existing job can feel like a real RPG
situation before the project adds more map or dispatch breadth. Conshohocken
service is the proof case because it already has the right ingredients:

1. Saved room conditions create a different job texture per career.
2. Prep and client context reveal or reduce pressure before the player commits.
3. Field tasks use skill, tools, energy, burnout, and known room pressure.
4. Quick choices can save energy while risking immediate site incidents.
5. Recovery choices can change the room before closeout.
6. Closeout records what was controlled, ignored, or inherited.
7. Return-trip pressure maps back onto the route and Josh/callback follow-up.

Next passes should spread this pattern carefully:

- Extract only small reusable pieces after the service job proves them twice.
- Prefer one visible mid-job choice over a new dispatch.
- Make odds, condition pressure, and likely consequences readable before the
  player commits, then show exact changes afterward.
- Apply the next pressure pattern to an existing job such as first-day carts,
  commissioning, or Burlington only when it teaches a reusable lesson.
- Keep randomness saved and explainable. A room can be uncertain; the UI should
  never feel arbitrary.

Job-pressure helper pass: seeded condition rolls, readable chance labels,
immediate incident rolls, and stable incident IDs now live in a small reusable
system. Conshohocken still owns its room-specific choices and closeout, but the
uncertainty tools are ready for the next existing-job proof.

First-day pressure teaching pass: the Two Quick Carts tutorial now rolls one
small cart-room pressure after the supervisor leaves. The player can spend
energy to control it, try a faster fix with visible incident odds, or leave it
for closeout. Careful closeout can catch unresolved pressure; rushed closeout
can turn it into named Center City return-trip risk. This keeps the tutorial
friendly while teaching the core RPG idea earlier: field pressure changes task
costs, room choices, result text, and future consequence.

Pressure-response consolidation pass: shared pressure response bookkeeping now
lives in `job-pressure-system.js`. Conshohocken service and the first-day cart
job still own their scene-specific copy and saved consequence state, but energy,
reputation, stat, burnout, incident-flag, and incident-roll handling now use the
same reusable path.

Consequence review audit pass: the van/map consequence review now opens after a
saved job-site closeout even when the player controlled the risk and left no
open debt. The review shows the last closeout, what changed, the saved
consequence record, active debt if any, and mapped route pressure. This keeps
"good" RPG outcomes visible instead of only showing the bad ledger entries.

Recent closeout history pass: job-site closeouts now keep a small rolling
history instead of replacing the previous result outright. Consequence review
still gives the newest closeout full detail, then shows earlier closeouts as
compact saved consequence records. This moves the workday closer to an RPG log:
choices remain visible after the next job starts, without adding new dispatches.

Route closeout-memory pass: route cards and route prep now show recent saved
closeout history for the route they belong to. This keeps documented or
controlled outcomes visible on job-facing surfaces without turning them into
active callback pressure.

Job-card route memory pass: dispatch job cards can now show the same recent
route closeout memory as map/prep cards. The source-to-route match is derived
from route job metadata and dispatch titles, so future jobs can reuse the
pattern without another hand-built lookup.

Current-step closeout memory pass: the always-visible current step panel now
shows the latest saved closeout when there is no open callback or return-trip
debt. Controlled/documented outcomes stay visible without forcing the player to
open the map, job card, or consequence review.

Workday rhythm briefing pass: the current-step panel now includes a compact
Workday row with day phase, shift number, energy, burnout, and active daily
pressure such as next-shift prep, low energy, high burnout, or zero-energy
pressure. This keeps the Stardew-style day loop visible while the prototype
still uses cards and compact top-down rooms.

Workday memory pass: shift closeout now stores the latest few shift results in
save-migrated history. The shift result modal and current-step Workday row name
the last closeout choice, so staying late, helping Josh, clocking out, or taking
recovery carries into the next morning as visible RPG state instead of only a
one-time modal result. Save version 24 keeps older careers compatible by
defaulting missing shift history to an empty list.

Condition-aware prep pass: route prep, dispatch job cards, and active regional
route cards now show today's field condition before the player drives. Clean
state says the route is ready; low energy, high burnout, zero-energy pressure,
carry drag, and next-shift prep show as practical route/job risk.

Actionable route-prep recovery pass: when a pressured route prep card opens at
the shop, the player can take a 15-minute break or open break-area recovery
options before driving. The prep card reopens with updated energy, clock, and
condition pressure, making recovery a visible choice instead of hidden sidebar
math.

Route-choice condition pressure pass: explicit route choices now preview and
apply field condition pressure. Leaving with low energy or high burnout can add
travel energy/burnout deltas, and the saved travel result keeps the condition
detail visible on later route cards.

Current-step priority pass: the right sidebar now puts the next task first and
styles it as the primary card. This is especially for the second morning, where
the player should see "check in with Josh" before scanning workday, route, or
consequence details.

Josh after-hours safeguard pass: Help-Josh choices remain unavailable before
the player meets Josh and during the same shift as his intro. On later shifts,
routine help can rotate between stable shop tasks, while unresolved
Conshohocken callback pressure turns the end-shift option into a
callback-specific after-hours cleanup choice. That gives the player a same-day
way to spend energy and relationship time resolving the pressure instead of
only waiting for the next morning.

Josh help memory pass: after-hours help now writes a small coworker-help
history, and the career clipboard names the latest task plus whether callback
pressure was cleaned up. This keeps the relationship consequence visible after
the shift result modal closes without adding another job or a separate
relationship screen.

Josh crew-support consequence pass: helping Josh now grants one short-lived
crew-support edge. The next eligible service, callback, handoff, or systems
documentation/troubleshooting check gets a visible Josh +1, then the support is
consumed. This is the smallest proof that relationship work can affect field
work without adding a relationship minigame or another dispatch.

Task modifier consequence pass: field-task checks now record reusable modifiers
instead of hiding support and pressure inside one-off math. Route prep, route
cards, dispatch cards, action pressure, skill results, and field-task history
can all explain why today is different: Josh support, next-shift prep, field
condition, zero-energy pressure, callback debt, prep context, or Conshohocken
room pressure. The next non-service proof case should reuse this same layer
before adding new content.

QA endgame pass: the testing/tooling work is intentionally capped for now. The
repo now has `scripts/qa-all.js` for local static/unit/smoke verification,
`scripts/qa-all.js --fast` for CI, unit/contract coverage for data-backed RPG
systems, and browser smoke coverage for the main player path. This is enough
guardrail for the current static prototype. Do not keep adding QA infrastructure
as a standalone activity unless a repeated regression, architecture change, or
new reusable gameplay system needs a focused guard.

Next gameplay roadmap handoff: resume with consequence-driven play, not test
infrastructure. The most useful next pass is to apply the task modifier layer to
one non-service proof case, preferably University City survey or Burlington
retrofit install, then make the consequence review easier to filter by active,
resolved, and inherited pressure. Recovery choices should become more tactical
only after those consequence cards are readable. The current ordered plan lives
in `docs/GAMEPLAY_ROADMAP.md`.

Burlington install modifier proof pass: the retrofit install now reads the saved
walkdown branch through reusable task modifiers. Protected pathway notes help
the install, partial notes surface as a warning, and accepted pathway risk makes
the pathway task harder and more effortful. The job card, route prep "why today
is different" row, task result, and field-task ledger all explain the same
source, so the second half of the Burlington chain feels caused by the first.

Gameplay roadmap slice closeout: the current consequence-play slice is complete
after green QA. The prototype now has service and non-service task modifiers,
prior-choice pressure that changes later work, consequence review filters,
route-prep recovery pressure, and van/map/job cards that explain active work
without adding new jobs. The next step should be a fresh planning decision,
not automatic continuation of this slice.

Widescreen UI readability pass: the game shell now makes better use of desktop
width. Wider screens show the full 960px map view, larger side panels, and wider
modal cards. Modal list rows become two-column information rows, task/action
cards can flow into responsive grids, and desktop side panels scroll internally
instead of making the whole app feel like a tall document.

Important-text emphasis pass: route prep, regional map, dispatch job cards, and
action-pressure modals now use shared emphasis classes for next action,
pressure/risk, locked, prep, and route rows. The scene objective also reads as
an active prompt instead of muted helper text. Clean-state rows such as no open
callback risk stay quiet so the player is not trained to ignore the highlight.

Conshohocken room-agency pass: the current objective now selects one explicit
primary interaction and the matching marker gets a stronger outline. The
service room changes its next physical target as the player checks in,
diagnoses, picks up gear, installs, handles immediate pressure, closes out with
the client, and walks to RETURN. Installing the final part no longer opens the
closeout modal automatically, including after save/continue. Incident recovery
choices are single-use, so carrying pressure into closeout cannot be repeated
for extra stats.

Conshohocken findings pass: after identifying the failed display, the player is
no longer forced to choose verify or trust immediately. They can return to the
room, ask the client for a symptom timeline, trace the inline coupler path, or
inspect replacement gear in different orders. The objective explicitly allows
another finding or a return to CHOOSE, completed markers remember inspected
sources, and only related findings expose related room conditions. This step
does not yet add new repair methods or a service timer.

## Prototype Guardrail

Favor one readable choice with a visible consequence over a new subsystem.
The prototype needs a satisfying rhythm more than it needs breadth.
