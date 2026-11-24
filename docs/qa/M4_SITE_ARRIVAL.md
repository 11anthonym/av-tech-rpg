# M4-A: Center City arrival

This is a working vertical slice of M4, ending at installation preparation.
It does **not** complete M4, award wages/XP or implement cart assembly, installation
pressure, closeout or next-shift callbacks. Those are the next slice. The full
milestone still needs at least three consequential decision points; this slice
contains one route decision with three alternatives.

## Play

Run the unchanged root commands `pnpm bootstrap`, `pnpm build`, `pnpm preview`.
Open `/av-tech-rpg/3d/`. Brief with the supervisor, prepare all three equipment
groups and load the rear of Van #3. Approach its driver door and press E. Choose
a route, brief in the garage, then unload and physically deliver each group to
the client entrance. Enter the lobby, get a security badge, take the elevator
and review the two-cart assignment. E handles contextual interactions; Escape
can cancel the route menu before departure. Each new room and carried group
survives reload.

## Domain and persistence

- Canonical `centerCityTutorial`, route choice, area, portal and equipment IDs
  come from the original 2D content. Tests execute the original content to check
  route labels, costs, arrival times and incident probability.
- Reliable garage: 8:03, no route energy/burnout. Loading-zone gamble: 7:58,
  two energy, with the existing 35% chance of another two energy/one burnout.
  Circle for curb space: 8:11, one burnout. Alternatives show their costs before
  selection. A random seed is saved before choosing; reload cannot reroll a
  selected outcome. Arrival time, energy and burnout persist through later
  access interactions. Unlike fixed 2D checkpoint timestamps, the 3D clock
  retains the route's time difference through subsequent work.
- Garage receipt is $18 pending reimbursement, matching the 2D arrival text;
  it is not silently deducted from cash or treated as a wage payment.
- Unloading costs three energy/six minutes; delivery costs four/six minutes,
  per group. Check-in costs two/thirteen minutes; elevator takes fourteen.
  Default route reaches installation preparation at 9:06 with 71 energy.
  Carry capacity remains one, with three distinct conserved groups.
- New `av-tech-rpg-3d-dev-v3` validates location, cargo conservation, route
  outcome, derived clock and access flags. v1/v2 migrate without overwriting
  old keys. The original `av-tech-rpg-save-v1` schema and bytes are unchanged.
  Old clients cannot resume new field progress; rollback leaves v3 retained
  while the old client uses its original namespace.
- Menus and scene changes use one guarded reducer transaction. New location
  and safe spawn are saved together before asynchronous scene preparation.
  Repeated check-in, delivery and briefing cannot duplicate costs or rewards.

## Rendering and verification

Rooms are compact authored collision spaces. The same loaded human rig, NPC,
environment lighting and cargo objects remain across portals. Van geometry is
reused from M2; new field furniture is original repository-authored geometry,
with shared PBR materials and static geometry baked by material. No external
assets, services or new licenses were introduced. Low/Medium/High settings
remain shared across rooms. Physical GPU performance remains unqualified;
software browser timings are functional-test observations only.

`game3d/tests/travel.test.ts` checks route alternatives/incident seeds, gates,
repeat prevention, cargo conservation, deterministic reload, invalid saves and
v2 migration. `game3d/e2e/site-arrival.spec.ts` plays from a new career using
keyboard/mouse only, including three delivery trips and several reloads. Its
new longer workday budget does not alter M3's existing 240-second replay limit.
Actual run results and evidence are recorded below after execution.

Initial Windows production-browser candidate: Firefox 159 passed the complete
normal-input arrival replay (11.4 minutes including recording teardown).
The recorded [garage-to-client clip](evidence/m4-arrival/garage-to-client.webm)
is actual gameplay from that run. The debug overlay visible after reload was
subsequently hidden in evidence captures, and the staging sign was moved above
head height after reviewing the screenshot. This footage is not a performance
benchmark or evidence of completed cart installation.

All 32 3D unit/domain checks pass locally; original static and unit QA each
pass 43 checks. Final production builds, browser matrix and portable HTTP
verification are reported in the PR with their exact run links. Superseded CI
runs that were cancelled are not counted as passing runs.
