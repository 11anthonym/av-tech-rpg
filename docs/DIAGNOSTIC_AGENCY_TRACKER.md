# Conshohocken Diagnostic Agency Tracker

This tracker turns the next gameplay roadmap into six finite implementation
steps. Complete and verify one step before starting the next. The proof case is
the existing Conshohocken service call; this work does not add a dispatch,
region, character, engine, build step, or manual driving.

## Proof Question

Can the player investigate a room, form a plan, take a calculated risk, react to
an immediate result, and close out a service call differently based on their
build and prior choices?

## Step 1: Evidence Contract And Save Safety

**Status:** Complete.

- Define a small set of player-facing room findings in service-dispatch data.
- Store discovered findings as idempotent save entries.
- Defensively migrate missing, duplicate, and stale finding entries.
- Add contract and migration tests.
- Do not change the playable service-room sequence yet.

**Acceptance:** Existing saves load with an empty findings list, valid findings
round-trip, repeated discovery cannot create duplicates, and full QA stays
green.

## Step 2: Evidence-Gathering Interactions

**Status:** Not started.

- Connect existing client, display, signal-path, and replacement-gear objects to
  findings.
- Let the player gather findings in more than one order.
- Make the objective describe a choice between gathering another finding and
  acting on current information.
- Keep pre-action costs and odds qualitative.

**Acceptance:** The player can leave at least one optional finding undiscovered,
and the room visibly remembers what they inspected.

## Step 3: Repair Approaches And Build Identity

**Status:** Not started.

- Add a small repair-approach set driven by current findings.
- Let tools, skills, traits, prep, or Josh support unlock distinct approaches.
- Preserve one viable basic approach for every technician.
- Record why an approach was available and what information supported it.

**Acceptance:** At least three technician builds can solve the room through
meaningfully different methods, not only different numeric bonuses.

## Step 4: Time And Immediate Pressure

**Status:** Not started.

- Give diagnostic and repair actions internal time costs.
- Let the approaching client meeting move through calm, tight, and late states.
- Make premature or risky actions capable of changing the room immediately.
- Keep incidents recoverable before closeout where appropriate.

**Acceptance:** Spending time on certainty protects technical work but can create
schedule pressure; rushing can save time but create an in-room problem.

## Step 5: Verification And Adaptive Closeout

**Status:** Not started.

- Let verification confirm a repair or expose a weak diagnosis before closeout.
- Let the player recover, document, or knowingly inherit remaining pressure.
- Make client state, findings, repair approach, and verification agree with the
  consequence ledger and return route.

**Acceptance:** Closeout summarizes the player's actual path through the room,
and no completed action or reward can be repeated.

## Step 6: Replay Proof And Roadmap Closeout

**Status:** Not started.

- Smoke test multiple saved room profiles and technician builds.
- Confirm save/continue at investigation, repair, incident, and closeout states.
- Run the full QA suite and document playtest observations.
- Decide whether the proven pattern moves next to University City.

**Acceptance:** Three replays can produce different investigation orders,
available approaches, immediate complications, and closeout states using the
same existing dispatch.

## Stop Rules

- Do not begin the next numbered step until the current step is green.
- Do not add another service subsystem when an existing task, pressure,
  consequence, objective, or interaction helper can own the behavior.
- Do not expose exact hidden odds before the player acts.
- Do not broaden QA unless the current step introduces a reusable contract or a
  regression risk.
- Stop this lane after Step 6 and reassess the whole playable day before reusing
  the pattern elsewhere.

## Work Log

- 2026-07-10: Tracker created. Step 1 added the findings data contract,
  save-version 25 migration, save-safe discovery state, and focused unit
  coverage without changing the playable service call.
