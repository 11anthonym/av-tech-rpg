# Gameplay Roadmap

This roadmap picks up after the QA/tooling closeout. The goal is to make the
current prototype feel more like the documented AV Tech RPG, not to add a big
batch of new jobs.

## Target Feel

Each gameplay pass should move the prototype toward the North Star:

- **Stardew-style workday rhythm:** the day, fatigue, recovery, tools,
  relationships, and growth should matter across shifts.
- **Pokemon-style compact navigation:** small areas, exits, route cards, and
  map nodes should make place and movement readable.
- **Old-GTA-style vehicle/world layer:** Van #3 should feel like the work
  object that connects shop, loadout, route, and return.
- **Elder Scrolls-style build identity:** skills, tools, traits, and training
  should open different choices and change checks.
- **The Long Dark-style pressure:** condition, prep, fatigue, cash, carried
  gear, and unresolved risk should change how ordinary actions feel.

The current priority is consequence-driven play. A player should feel:

```txt
I chose this because it helped now, but it changed the next task.
```

## Guardrails

- Do not add broad new content until one existing job proves the next system.
- Do not add manual driving yet.
- Do not migrate engines or add a build step.
- Do not make every choice reveal exact math before the click.
- Do not turn recovery, inventory, or relationships into separate complex
  minigames yet.
- Do keep using `node scripts/qa-all.js` as a guardrail after gameplay changes.

## Phase 1: University City Survey Consequence Proof

**Why this is next:** Conshohocken proved service pressure. University City is
the best non-service proof case because it is already about scope, access,
documentation, and future install risk. It can show that the reusable modifier
layer works beyond a service call.

**Player fantasy:** walk a site, notice the quote is thin, decide whether to
protect the future crew or keep the current ticket clean.

**Changes to make:**

- Apply task modifiers to one or two University City survey checks.
- Let fatigue, prep, documentation habits, or Josh support affect a survey
  check through the same modifier preview/result path.
- Make one survey choice create immediate friction, not only future risk.
  Example: pushing back protects the future install but annoys management now.
- Make one shortcut tempting in the moment but visibly worse later.
  Example: trusting the quote saves effort now but inherits access pressure.
- Show "why today is different" on the job card, route prep, task preview, and
  result history when survey pressure is active.
- Keep all existing University City closeout choices single-use after the job
  is complete.

**Acceptance:**

- The survey job feels different from service work.
- At least one survey task uses reusable modifiers.
- At least one choice changes the current job state immediately.
- At least one choice changes future route/job/consequence text.
- The consequence is visible outside the result modal.
- No new region, job, or character is added.

**Progress note:** The first proof pass is implemented. University City survey
prep and inspection order now feed task modifiers, wall-first inspection changes
the current objective and saved task result, and trusting the quote records
University City access pressure on the shared consequence/route surfaces. The
remaining Phase 1 tuning question is playfeel: whether those choices are obvious
enough in a normal playthrough without over-explaining the math.

## Phase 2: Consequence Review Filters

**Why this is next:** callback and return-trip debt are core to the AV Tech RPG
identity, but the player needs to inspect them without reading a wall of text.

**Changes to make:**

- Add a compact consequence review mode with:
  - Active today
  - Resolved
  - Inherited
- Show cause, affected route/job, and current status in plain language.
- Keep the latest closeout easy to find.
- Reuse existing consequence ledger entries rather than creating a second
  consequence system.

**Acceptance:**

- A player can answer "what pressure am I carrying right now?"
- A player can tell what they resolved versus inherited.
- Route/job cards and the career clipboard still agree.

**Progress note:** The first review-filter pass is implemented. The consequence
review and career clipboard now summarize existing ledger and closeout records
as Active today, Resolved, and Inherited without creating a second consequence
system. The remaining Phase 2 tuning question is whether the grouped review is
short enough to scan during normal van/map use.

## Phase 3: Recovery And Prep Become Tactical

**Why this is next:** the day rhythm should feel closer to Stardew and The Long
Dark. Recovery should not just refill a meter; it should change today's risk.

**Changes to make:**

- Show which active pressures a recovery or prep option can improve.
- Let a short break, recovery day, lunch, coffee, or prep choice affect one
  visible modifier or condition state.
- Keep pre-choice copy qualitative. Reveal exact results afterward.
- Avoid a complex inventory/recovery screen.

**Acceptance:**

- The player understands why taking a break or preparing changes the next task.
- Low energy, burnout, and zero-energy pressure have readable consequences.
- Recovery choices do not become free optimal clicks.

**Progress note:** Implemented for this slice. Route prep, dispatch cards, and
regional route cards surface daily condition pressure; pressured route prep can
offer a short break or break-area recovery before driving; and route choices can
carry condition pressure into saved route results. Pre-choice copy stays
qualitative, while result/ledger surfaces preserve the actual outcome.

## Phase 4: Burlington Retrofit As The Two-Step Consequence Model

**Why this is next:** Burlington already has the right shape for future larger
jobs: walkdown choice, saved branch, install consequence, closeout record.

**Changes to make:**

- Make the walkdown-to-install chain easier to read before the install starts.
- Apply the modifier layer to one install check.
- Make inherited pathway risk affect an install task or closeout choice.
- Make resolved versus inherited install risk obvious in the consequence
  review.

**Acceptance:**

- The player can explain how the walkdown changed the install.
- The install does not feel like a detached second scene.
- Future multi-step jobs have a model to copy.

**Progress note:** Implemented for this slice. The saved walkdown branch now
feeds Burlington install task modifiers: protected notes help the pathway
install, partial notes warn the crew, and accepted pathway risk makes the task
harder and more effortful. Dispatch cards, route prep, task results, and the
field-task ledger all read from the same modifier data, so the install is the
payoff or cost of the earlier walkdown instead of a detached second scene.

## Phase 5: Spatial Workday Polish

**Why this is later:** exits and portals already exist. They should be polished
after the consequence cards and task decisions are readable.

**Changes to make:**

- Improve return markers and door/elevator readability where playtests still
  hesitate.
- Keep completed job sites explorable without allowing repeated rewards or
  repeated closeout choices.
- Make walking to the exit feel like the natural end of the job, not a modal
  shortcut.
- Keep map cards and van route prep as the main travel interface.

**Acceptance:**

- The player knows where to go after closeout.
- The player cannot farm completed clients/tasks.
- The shop, van, route, site, exit, and end-shift rhythm feels connected.

**Progress note:** Enough for this roadmap slice. Return markers and portal
closeout reviews have been tightened in earlier stabilization passes, completed
closeouts have single-use guards, and van/map route prep remains the main travel
surface. Deeper spatial work should be reassessed separately instead of folded
into this consequence-proof roadmap.

## Done For This Roadmap Slice

This roadmap is not complete when every phase is implemented. It is complete
when the current prototype proves the feel:

- One service job and one non-service job both use reusable modifier pressure.
- A prior choice changes a later task in a visible way.
- Consequence review distinguishes active, resolved, and inherited pressure.
- Recovery/prep choices can change today's risk.
- The van/map/job card surfaces explain current work without adding content
  sprawl.

**Completion note:** This slice is complete once the Burlington modifier pass
and smoke QA are green. The prototype now has service and non-service modifier
proofs, visible prior-choice consequences, consequence review filters,
tactical prep/recovery pressure, and route/job surfaces that explain current
work without adding content sprawl.

After that, reassess whether the next investment should be richer spatial
navigation, another proof-case job, or a small engine/map-authoring spike.

## Fresh Lane: Conshohocken Room Agency

**Proof question:** Can one existing job room feel like a small RPG space instead
of a sequence of modal prompts?

**Completion note:** Implemented. Explicit interaction priorities now connect the
current objective to one highlighted physical object. The Conshohocken room
guides the player through client check-in, diagnosis, replacement pickup,
installation, optional pressure handling, incident recovery, client closeout,
and the return portal. The final install returns control to the room instead of
opening closeout automatically, and incident recovery decisions are single-use.
Pre-action pressure remains qualitative; exact results remain in result and
ledger surfaces.

This is the pattern to reuse when another existing job room needs spatial depth:
first clarify which object matters, then let room state and consequences change
that object. Do not add another dispatch to prove the same point.

## Completed Implementation Lane: Conshohocken Diagnostic Agency

The completed finite lane is tracked in
[`DIAGNOSTIC_AGENCY_TRACKER.md`](DIAGNOSTIC_AGENCY_TRACKER.md). Work through its
six numbered steps in order. Step 1 establishes findings and save safety; later
steps connect those findings to investigation order, repair approaches, time
pressure, verification, and adaptive closeout. Do not begin another roadmap
lane until Step 6 closes this proof case.

**Current status:** Steps 1 through 6 are complete. The service room supports an
optional findings phase, universal and build-specific repair methods, and a
saved appointment-pressure path driven by the visible workday clock. Careful
investigation can squeeze the client handoff, rushed work can create a
recoverable problem in the room, and negotiation can buy time. After install,
the player must choose how to test the repaired room; weak verification can be
recovered, documented, or knowingly inherited.

Step 6 proved three distinct replays on the same dispatch:

- Jordan used signal-path evidence and coupler isolation to reach a confirmed,
  controlled closeout.
- Wiley used replacement evidence and staged hardware work, recovered a visible
  mount incident, and reached a quick test that held.
- Morgan used client evidence and a negotiated verification window, then
  documented a failed final test and retained return-trip pressure.

Investigation, repair, incident, and closeout checkpoints all survive
save/continue, and completed closeout cannot repeat rewards. This lane is
closed. The next planning pass must reassess the whole playable day before
selectively applying the shared pattern to University City or another existing
job.

## Whole-Workday Reassessment

**Audit completed:** July 24, 2026.

The current build already proves reusable pressure inside service, survey, and
retrofit work. Applying another modifier to University City would deepen a
system that is already represented. The larger remaining RPG gap is schedule
agency: the dispatch board contains many assignments, but it normally selects
the first available one and gives the player no meaningful say in job order.

The next finite lane is tracked in
[`WORKDAY_AGENCY_TRACKER.md`](WORKDAY_AGENCY_TRACKER.md).

The proof case uses existing early-career content. After the Conshohocken
service debrief, the player should choose between the small label follow-up and
moving directly to the University City survey. Taking the follow-up spends a
workday for its existing pay, route mastery, and documentation outcome. Taking
the survey keeps the main board moving and lets coordination reassign the side
job. Neither choice is the hidden correct answer.

This is deliberately smaller than a freely reorderable quest board. It tests
whether one visible workday plan can make the career feel less predetermined
while keeping the current static-browser architecture and progression safe.

**Current status:** Steps 1 through 3 are complete. The save-safe board contract
now drives a player-facing choice between the existing follow-up and University
City survey. Both jobs show qualitative opportunity costs with equal-weight
actions, the plan survives save/continue, and switching closes when travel
begins. The objective, Van #3, regional map, route prep, launch guard, and fast
travel now agree on the selected work while keeping the other job visible as
available. Step 4, recording the optional follow-up outcome or reassignment as
a readable workday consequence, is the next implementation checkpoint.

## Prototype Exit Gate: Ready For Real-Game Preproduction

Finishing another content beat is not the exit condition. This browser build is
ready to hand off into real-game preproduction when all of these are true:

- The five-step workday-agency lane is complete and both job-order paths replay
  cleanly with at least two technician builds.
- A fresh player can follow shop, board, van, route, site, closeout, return, and
  recovery without developer explanation.
- At least one optional job has a visible opportunity cost, a saved outcome,
  and coherent later progression whether it is taken or reassigned.
- Skills, tools, condition, route history, and consequences each change at
  least one existing decision without exposing all hidden math.
- Save migration and full static, unit, and browser QA pass at the lane's final
  checkpoint.
- Architecture, save ownership, content-authoring boundaries, and known browser
  limitations are documented well enough to estimate a production vertical
  slice without reverse-engineering the prototype.

After this gate, freeze broad prototype content and write a separate production
technical plan. That plan can compare an engine and map-authoring workflow
against the current static architecture using one small vertical-slice spike.
Do not migrate the prototype itself merely because the agency lane is complete.
