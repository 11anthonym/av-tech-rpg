# RPG Expansion Skeleton

This is the lightweight contract for growing AV Tech RPG without turning the
prototype into a big engine rewrite. The goal is not to make every future job
pure data. The goal is to keep the RPG pieces consistent enough that a new job,
skill, trait, tool, or company feels like it belongs.

## Current Shape

The game now has four reusable layers:

1. **Technician identity:** premade and custom technicians define stats,
   skill baselines, traits, tools, strengths, weaknesses, and playstyle.
2. **Career progression:** XP, ranks, training choices, goals, reputation,
   ledger stats, and active career effects describe how the player is growing.
3. **Job families:** dispatches can identify whether they are install,
   service, survey, commissioning, logistics, or handoff work.
4. **Company context:** the current employer describes shop culture,
   pressure, dysfunction, and the reputation tradeoff behind bad-company humor.

Keep those four layers readable in the UI. If a mechanic is invisible, players
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

Use this checklist before implementing the job. If a proposed dispatch cannot
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
- **Memory:** What future dispatch, goal, or active career effect could remember
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
Why it is on the dispatch board: Client says audio drops after ten minutes; dispatch says "probably cable."
Core skills: troubleshooting, documentation, clientCommunication
Preparation choice: review ticket history, text someone who knows the room, or leave immediately
Three things to inspect or do: check USB path, inspect table box, ask client what "drops" means
Final choice: verify full meeting path, swap the obvious cable, or document likely DSP/control issue
Good outcome: client trust and coworker trust, more energy spent, management annoyed by scope
Fast/bad-company outcome: management likes the quick swap, callback risk remains
What changes: XP, client/coworker/management rep, callback ledger, documentedTaskRisks
What remembers it: future callback return or a documentation-habit goal
```

Then implement in this order:

1. Add or reuse a job family in `content.jobFamilies`.
2. Add the job's content block in `data.js`.
3. Add the scene layout if it needs a new walkable space.
4. Add a dispatch preview using `getDispatchBoardMarkup({ familyId })`.
5. Use `resolveSkillCheck()` for one to three meaningful task checks.
6. Save consequences with flags, stats, XP, reputation, callback debt, or
   return-trip risks.
7. Return through the existing shift closeout helpers unless the job is a short
   shop-based task.

Avoid making a job that only pays cash. A good dispatch should test at least one
RPG identity: a skill, a trait, a tool, a reputation lean, or a ledger habit.

## Incremental Roadmap

Do these in small commits. Each step should answer one playability question and
be easy to verify in the browser.

1. **Done - Job checklist pass:** Keep this document current and use it before
   adding any new dispatch.
2. **Done - Choice clarity pass:** Add short skill/reputation hints to a few
   existing choices so players understand why stats matter.
3. **Done - Company pressure pass:** Give Radnor Rack & Wire visible
   company-pressure rules, such as management favoring clean tickets while
   field-quality choices build client and coworker trust.
4. **Done - Skill identity pass:** Advanced AV areas are now visible skills:
   Commercial Process, Networking, DSP / Audio, and Control Systems.
5. **Next - Worked job pass:** Add one new dispatch using the checklist. Prefer
   one tight example over adding several job ideas at once.
6. **Later - Authoring example pass:** After the next dispatch exists, document
   it as a worked example for future contributors.
7. **Later - Save migration pass:** Add a small migration helper before
   renaming stable IDs or changing saved data shapes again.

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

Use a job family when several dispatches share the same RPG rhythm. Each family
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
- vehicle selection
- a route/toll/parking system
- multi-step save migrations
- branching employer/career acts

Right now, repeat a small pattern two or three times before abstracting it. The
prototype should stay easy to read by someone who is more interested in making a
funny AV job than designing middleware.
