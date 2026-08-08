# Workday Agency Tracker

This tracker follows the completed Conshohocken diagnostic-agency lane. It uses
existing jobs to add one small career-level decision without adding a dispatch,
region, character, engine, build step, or manual driving.

## Proof Question

Can the player choose what kind of workday to have, understand the opportunity
cost, and see the shop, board, van, map, route, shift result, and next morning
agree with that choice?

The proof case is the first morning after the Conshohocken service debrief:

- Take the optional Conshohocken label follow-up for extra pay, route mastery,
  and a chance to leave better service notes.
- Move directly to the University City survey and let coordination reassign the
  small follow-up.

This turns an existing mandatory repeat-route demonstration into a real side
job decision near the beginning of the playable career.

## Whole-Workday Reassessment

### What Already Works

- The first day establishes walking, carrying, Van #3, portals, a job room,
  closeout, return travel, and end-of-shift recovery.
- Conshohocken now supports investigation order, build-specific methods,
  appointment pressure, immediate incidents, verification, and adaptive
  closeout.
- University City and Burlington prove that an earlier choice can change later
  task pressure.
- Shift choices can change next-morning energy, burnout, preparation, Josh
  support, callback status, and workday memory.
- Route cards, job cards, objectives, portals, and consequence review share
  reusable state instead of relying only on flavor text.

### What Still Feels Scripted

- The dispatch board contains a long sequence of mostly mandatory beats and
  `getCurrentDispatchBoardEntry()` selects the first available item.
- The player can choose how to solve work, but almost never which work to do
  next.
- The Conshohocken label follow-up was built to prove repeat routes and fast
  travel, yet it currently blocks University City and behaves like mandatory
  main progression.
- Several very short jobs consume a full shift through the same return and
  end-shift cadence, which makes the career feel like a list of assignments
  rather than a schedule the player inhabits.
- Adding another deep job room would improve a scene without addressing this
  career-level linearity.

### Current Board Read

| Beat | Current strength | Main remaining issue |
| --- | --- | --- |
| Two Quick Carts | Strong spatial tutorial | Intentionally guided |
| Conshohocken service | Strong room agency and consequence | Good proof case; stop expanding it |
| Conshohocken follow-up | Repeat-route and fast-travel proof | Useful side work is mandatory |
| University City survey | Inspection order and access consequence | Currently waits on optional-looking work |
| Commissioning | Distinct technical closeout choices | Still one required board item |
| Warehouse run | Walkable change of pace | Functions as another mandatory gate |
| Secure access | Route, access, task, and closeout pressure | Sequential inside the larger board |
| Warranty return | Resolves earned callback pressure | Conditional but forced when present |
| Executive handoff | Social and documentation identity | No schedule-order choice |
| Systems service | Build-specific systems pressure | Primarily modal and mandatory |
| Cherry Hill toll | Cash and travel consequence | A small beat still consumes a full shift |
| Burlington walkdown/install | Strong two-stage consequence | Late enough that many players may not reach it |
| Career snapshot | Clear stopping point | Summarizes a mostly predetermined job order |

## Step 1: Board Choice Contract And Save Safety

**Status:** Complete July 26, 2026.

- Add a small main-versus-optional classification to dispatch-board entries.
- Add helpers that return every currently available board item.
- Add a save-backed selected board item with defensive migration.
- Keep existing careers on the same active job unless the new choice window is
  genuinely available.
- Preserve one clear current objective when only one job is available.

**Acceptance:** Old saves still load, one-job states behave as before, and the
post-service morning can represent two available jobs without silently choosing
one for the player.

**Result:** Dispatch entries now expose a normalized main or optional board
role. Reusable helpers return every available item, validate a save-backed
planned dispatch, and preserve the existing one-job fallback. A future
multi-job state without a valid plan returns no current dispatch instead of
silently choosing the first item. Save version 29 defensively clears missing,
stale, or invalid planned dispatch IDs.

## Step 2: Dispatch Board Selection

**Status:** Complete August 8, 2026.

- Let the dispatch board show both the optional follow-up and University City.
- Explain the immediate opportunity cost in qualitative player-facing language.
- Let the player select, review, and switch the planned job until travel starts.
- Keep choice buttons visually equal.
- Do not expose exact hidden math before selection.

**Acceptance:** The player can deliberately plan either job and can explain why
the other option still matters.

**Result:** The first post-service planning window now presents the existing
Conshohocken follow-up and University City survey together. Both cards identify
their board role, route, purpose, and qualitative opportunity cost. Choice
buttons have equal visual weight, the selected plan survives save/continue, and
the player can switch until either route begins. Once travel starts, the other
job can no longer replace work already underway. The unused follow-up leaves
the available board when University City begins; Step 4 still owns the explicit
reassignment record and shift-result explanation.

## Step 3: Van, Map, And Objective Agreement

**Status:** Not started.

- Make Van #3 show the selected job as the active route.
- Make the regional map distinguish the selected route from the other available
  work.
- Make the current objective direct the player to choose work before driving.
- Keep route prep, cargo, travel choice, and fast travel tied to the selected
  board item.
- Prevent a stale selection from launching a locked, completed, or reassigned
  job.

**Acceptance:** Board selection, van route, regional map, route prep, and
objective all name the same planned work before departure and after save/load.

## Step 4: Optional Follow-Up Consequence

**Status:** Not started.

- Completing the follow-up retains its current pay, XP, route-memory, and
  documentation tradeoff.
- Starting University City first explicitly reassigns the small follow-up.
- Record the reassignment once as a readable workday decision, not callback
  debt or a moral failure.
- Make the shift result and next-morning board explain what was gained or given
  up.
- Do not let the skipped follow-up block later main progression or reappear as
  broken content.

**Acceptance:** Taking the side job costs a workday but provides its existing
rewards; moving on preserves momentum but closes that opportunity. Both paths
remain valid.

## Step 5: Replay Proof And Lane Closeout

**Status:** Not started.

- Replay both paths with at least two technician builds.
- Save/continue before selection, after selection, after route launch, and
  after shift closeout.
- Confirm callback pressure and Josh introduction gates still work.
- Confirm fast travel only appears when route history allows it.
- Run the full static, unit, and browser QA suite.

**Acceptance:** Two careers can leave the service debrief with different workday
plans, different route histories and rewards, and coherent later progression
without adding content.

## Work Log

### July 26, 2026 - Step 1 Complete

- Classified the existing Conshohocken follow-up as optional while preserving
  main as the safe default role for current and older board definitions.
- Added available-work and planned-work helpers without activating the
  two-choice morning early.
- Added save migration and round-trip coverage for valid, missing, and stale
  planned dispatch IDs.
- Added contract and browser coverage proving that current one-job states remain
  unchanged and future multi-job states require an explicit plan.
- Passed 43 static script checks, 28 unit and contract checks, and the browser
  smoke suite.
- Next checkpoint: Step 2, Dispatch Board Selection.

### August 8, 2026 - Step 2 Complete

- Opened the existing University City survey beside the optional Conshohocken
  follow-up after a clean service debrief.
- Added a reusable workday-planning modal with role, route, purpose, and
  qualitative opportunity-cost copy for each available job.
- Kept both decision buttons neutral and made the current plan readable without
  presenting either job as the preferred answer.
- Added objective and HUD states that call for a dispatch choice when no plan is
  selected.
- Preserved plan switching before departure, save/continue persistence, and a
  hard lock against switching to the unused job after travel starts.
- Added focused unit and browser coverage for the complete selection flow.
- Passed 43 static script checks, 29 unit and contract checks, and the browser
  smoke suite.
- Next checkpoint: Step 3, Van, Map, And Objective Agreement.

## Stop Rules

- Do not add another dispatch to prove schedule agency.
- Do not make the whole dispatch board freely reorderable in this lane.
- Do not add a calendar, quest log, deadline simulator, or relationship system.
- Do not convert optional work into hidden punishment.
- Do not begin Step 2 until the selection and migration contract in Step 1 is
  green.
- Stop after Step 5 and reassess whether this single choice materially improves
  the early career rhythm.
