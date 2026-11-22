# AV Tech RPG — Product Strategy & Production Roadmap

**Planning baseline:** 11/21/2026, `main` at `fa7a33e`  
**Status:** Production execution plan; milestones below are **planned**, not completed  
**Primary objective:** Turn the proven 2D workday RPG into a compelling, browser-playable, realistic third-person 3D game **without losing its existing gameplay identity**.

For the sourced hosting options and community reference checks, see [Hosting and Playable Reference Research](HOSTING_AND_REFERENCE_RESEARCH.md). Its deployment decision gate supplements M1/P0.1; changing hosts is not an automatic prerequisite for building the game.

This is the source of truth for **what gets built next, in what order, and what counts as done**. The [North Star](NORTH_STAR.md) defines the vision; the [3D Foundation Assessment](3D_FOUNDATION_ASSESSMENT.md) records engine feasibility, technical evidence, and asset research; the historical [Gameplay Roadmap](GAMEPLAY_ROADMAP.md) records the 2D prototype's completed experiments. Those documents remain useful but do not override this production priority order. Update this plan when a gate changes or evidence forces a different decision.

## 1. Product decision

We are making a **workplace RPG, not a wiring simulator or a generic 3D walking demo**. The player starts as an under-equipped technician at a poorly managed commercial AV integrator in a fictionalized Greater Philadelphia. They move through recognizable workspaces, prepare for jobs, troubleshoot and build systems, manage time/fatigue, learn tools, navigate coworker and client pressure, and live with decisions that can create or prevent later work.

**Locked direction:**

- **Platform:** Desktop browser first; static-hostable and accessible by URL. The existing GitHub Pages 2D game stays available during development.
- **Presentation:** Third-person following camera, camera-relative movement, natural-scale humans, believable idle/walk/carry/interact animation, furnished workplace environments, realistic/PBR materials and lighting. Fixed top-down presentation is no longer the goal.
- **Engine and pipeline:** Babylon.js + TypeScript + Vite; Blender-authored or legally sourced glTF/GLB assets; pin versions and commit a lockfile. Reopen the engine decision only against an identified, repeatable production blocker.
- **Design:** Compact authored locations connected by routes, portals and a van; no need for a continuous city. The route/dispatch layer can stay abstract while physical job spaces become 3D.
- **Scope:** Build **one excellent shop and one full workday first**, then one deeper diagnosis job. Do not port the complete career or add new dispatches as a substitute for 3D quality.
- **Continuity:** The 2D experience is the behavioral reference, not disposable scaffolding. Preserve its content IDs, consequences, save history and playable link.

## 2. The game's five pillars

1. **Competence feels good.** Inspect, reason, use appropriate tools, make repairs, verify and hand off. Players should understand *why* their action worked without needing prior AV expertise.
2. **Every shortcut has a context.** Time, energy, pay, reputation, quality, callback debt and coworker trust produce understandable tradeoffs. "Correct" decisions may be costly today; rushed decisions may look attractive but create tomorrow's problem.
3. **Work happens in places.** Walking to equipment, carrying boxes, loading Van #3, entering a building, finding the room and approaching a faulty device must matter. Avoid replacing the entire game with successive modals.
4. **People make the work memorable.** Josh, clients, dispatch, managers and coworkers bring humor, conflicting incentives and relationships. Comedy comes from recognizable workplace conditions, not punishing the player with random inconvenience.
5. **A career accumulates.** Skills, tools, cash, fatigue, reputation, training, work habits and saved consequences change subsequent opportunities. No endless content list without meaningful progression.

**Core loop:** Shop / review job -> prep and load -> route / friction -> arrive and access -> inspect / diagnose / install -> verify / document / client handoff -> return / close shift -> recover / progress -> next meaningful choice.

**First-time player contract:** Within a short onboarding, players can identify where to go, what to interact with, what is at stake and why one choice differs from another. A 3D scene with beautiful assets but no understandable work is not an accepted slice.

## 3. Starting point and known unknowns

**Already implemented in 2D:** Five premade technicians plus a creator; shop hub; tools and van; region/area/route/portal definitions; tutorial cart job; Conshohocken service diagnosis; survey, commissioning, warehouse, secure access, handoff, warranty, systems and retrofit work; fatigue/burnout; career XP, training, standing, Josh relationship, callback/return-trip risk, save migration. The existing runtime uses ordered browser scripts with shared globals. At the `fa7a33e` assessment the inventory identified 40 system files, 12 playable scene definitions, nine routes and a version-30 save payload under `av-tech-rpg-save-v1`.

**Evidence:** The 2D static, unit/contract and browser-smoke suites passed in the assessment. Babylon rendered a third-person greybox browser experiment with movement/collision, picking, GLB import and local persistence; a Godot headless feasibility experiment also passed. The current `main` commit passed its GitHub Actions QA and Pages deployment at the planning baseline.

**Not yet achieved:** A versioned production 3D client, authored shop, accepted realistic human/animations, complete 3D workday, browser/player performance profile, art/license audit, cross-browser qualification, save import bridge, or unassisted new-player proof of fun. Passing greybox tests does **not** establish these.

## 4. Scope and release slices

| Release slice | Player-visible promise | Deliberately excluded |
| --- | --- | --- |
| **3D foundation / visual qualification** | Walk a believable furnished shop as a believable technician with usable third-person controls and camera | Jobs, a whole city, full roster customization |
| **First playable workday (vertical slice)** | Prep, load the van, reach Center City East, assemble two video carts, make a tradeoff, close out, return and recover; save and resume | All existing 2D jobs, manual driving |
| **RPG depth slice** | Revisit the world for a Conshohocken diagnosis with meaningful evidence, repair approaches, time pressure and different outcomes | Adding unrelated dispatches |
| **Public alpha candidate** | Two polished jobs, visible progression, reliable saves, understandable feedback, accessible options and supported browser performance | Claims of a finished career |
| **Larger game / beta** | More authored areas, job families, relationships, company advancement and balanced recurring work, added selectively from the prototype | Multiplayer, open-world traffic, exhaustive manufacturer-accurate wiring |

**Initial target audience:** Desktop keyboard/mouse players, including AV professionals who recognize the details and non-specialists who can learn the systems. Mobile, controller support, offline installs and native executables remain later evaluations, not assumed launch commitments.

## 5. Milestone roadmap — ordered gates, not arbitrary dates

**Priority rule:** Never mark a phase complete because the code compiled or an agent reported success. Require a reproducible browser build, applicable automated tests and the specified human-visible evidence. Stages may overlap for research and asset sourcing; their acceptance gates remain sequential.

### M0 — Production kickoff and evidence baseline

**Goal:** Create an executable production plan while protecting the playable game.

- Capture the current hosted 2D career, save schema, QA commands and sample start/mid-job/end-shift checkpoints. Establish named replay fixtures for tutorial and Conshohocken.
- Inventory the content/scene/portal/route IDs needed for the first workday. Record what rules are reusable and what HTML-specific behavior must be rewritten.
- Declare a lowest-spec **test target** and supported browser matrix before claiming performance targets; do not invent observed FPS.
- Create an art brief and asset/license manifest template. Identify at least one credible human/rig/animation pipeline and one coherent commercial-workplace prop set. Evaluate license, provenance, scale and exportability before purchases.
- Keep a visible risk/decision log. Freeze unrelated 2D feature work except defects, preservation and needed parity tests.

**Exit evidence:** Baseline saves and QA reproducible; 3D project boundaries, target platforms, art brief, review rules and next build tasks documented. This roadmap closes the planning portion; implementing the client is M1.

### M1 — Real, independently deployable 3D client

**Goal:** Prove the **production toolchain**, not another throwaway engine probe.

- Add isolated `game3d/` with pinned Babylon core/loaders, TypeScript, Vite, lockfile and documented clean-checkout setup. Keep dependencies few and intentional.
- Establish clear modules: `domain/` (state, career, job rules), `content/` (IDs/contracts), `world/` (areas/anchors), `render/` (scene/assets), `player/` (input/movement/camera), `ui/` (HUD), and `persistence/` (versioned saves/import).
- Deliver `dev` / `typecheck` / `test` / `build` / `preview` scripts; lint if low-cost; repeatable browser smoke test. CI must actually build the game and detect missing assets or incorrect subpath URLs.
- Deploy **beside** the existing game, with a host-portable asset build: `/av-tech-rpg/3d/` on GitHub Pages **or** an independently verified Cloudflare preview/root URL. Follow [Hosting and Playable Reference Research](HOSTING_AND_REFERENCE_RESEARCH.md): assess Workers Static Assets first, Pages as a simpler alternative, and GitHub Pages as fallback. Do not overwrite the 2D root link, claim an unconnected host is deployed, or change production based only on anecdotal performance.
- Render an interactive third-person qualification scene. Show debug state (scene, action, build version, errors) without exposing developer UI by default.
- Build the minimal typed content bridge (technician, tool, world IDs). Do **not** mass-port the shared-global runtime.

**Gate M1:** Fresh checkout starts and builds; deployed URL loads on supported test browsers; deterministic movement/interaction smoke passes; clean browser console/network; old Pages game and 2D save unaffected. A greybox is allowed **only for this engineering gate**.

### M2 — Visual/feel qualification: one convincing human and one convincing shop

**Goal:** Establish an art-quality and moment-to-moment control bar **before** expanding game content.

- Author a compact, recognizable AV integrator shop with walls/doorways, workbench, shelving, cable spools, cartons, AV carts/racks, an office or dispatch surface, practical overhead lighting and Van #3 at a believable loading location.
- Import one naturally proportioned, clothed and rigged human technician with face, hands, hair/boots and consistent scale. Demonstrate idle, walk, turn, carry and interact clips plus convincing transitions/foot contact.
- Implement camera-relative movement, orbit/zoom, wall and van obstruction handling, walkable boundaries, nearby-object highlighting and prompt priority. Test corners, doorways, shelving, ramps/steps and modal focus.
- Build a repeatable Blender/GLB import and optimization path; record asset sources, licenses, material conventions, naming, animation skeleton, polygon/texture budgets and any rig-retarget process.
- Inspect daylight/fluorescent PBR look, readable materials, believable proportions and visible AV-specific props from the **normal follow camera**, not hero renders alone.
- Capture in-browser screenshots and short motion video in ordinary play. Profile startup, transfers, frame-time percentiles, draw calls, memory and browser/GPU information on declared hardware.
- If believable visuals cannot be achieved with the proposed low-cost asset workflow, stop and revise art sourcing or scope before porting jobs. Do not silently lower the promised visual bar to primitives.

**Gate M2:** Product/art review explicitly accepts the character, animation, shop and controls in the browser; collisions/camera do not routinely obstruct play; asset rights are documented; measured performance has a mitigation plan. **A capsule, cube, empty room, or attractive screenshot without animation does not pass.**

### M3 — Tactile shop preparation

**Goal:** Make the shop a playable workspace rather than scenery.

- Adapt the existing supervisor briefing, screwdriver, staged cart components and Van #3 loadout into spatial interactions.
- Implement one consistent pipeline: detect nearby interactable -> check distance/line of sight and task priority -> present prompt -> dispatch stable action ID -> domain state transition -> visual/UI feedback.
- Enforce carrying/cargo capacity; display carried/loaded objects; persist inventory and job-object state across save/reload; prevent repeat pickups, duplicate rewards or item loss.
- Provide clear objective cues, task review, cancel/back behavior, keyboard-focus handling and nonexpert-friendly action language.

**Gate M3:** A first-time player can physically obtain equipment, load the correct items and understand why the van is ready. Save/continue at multiple shop checkpoints reproduces the same inventory and task state without duplication.

### M4 — Complete first workday in 3D (vertical slice)

**Goal:** Prove the actual product loop end to end.

- Travel with the existing route-choice abstraction to Center City East; use compact garage, lobby/entry and cart-install room. Correct portals and return flow matter more than map size.
- Build the two mobile conferencing carts with a few legible staged actions, a workmanship/time tradeoff and a verification/closeout decision.
- Return to the shop, end the shift, apply pay/XP/energy/burnout/standing and show recovery/prep. Keep Josh and the company's dysfunction present in authored dialogue and environment cues.
- Test two differing choices, their immediately visible consequences and the next-day state. Keep the first loop short and replayable; polish pacing and cues before adding scope.
- Compare defined 3D state results with 2D reference fixtures at equivalent checkpoints. Keep exact numeric parity where rules are reused; document deliberate differences.

**Gate M4:** A fresh player can finish **shop -> van -> route -> site -> two carts -> handoff -> return -> next shift**, using ordinary input rather than injected test state. Full replay and save/reload pass. One obvious tradeoff is understood in a playtest, not just stored in flags.

### M5 — RPG depth: Conshohocken diagnostic replay

**Goal:** Show the new presentation supports **reasoning and build identity**, not only carrying and assembling.

- Port the existing Conshohocken service room before adding a new dispatch. Keep findings, optional evidence collection, build/tool-specific repair methods, appointment pressure, incidents, verification, client closeout and callback/return-trip debt.
- Tie meaningful evidence to physical AV objects, test points and job conditions. The player must be able to approach/inspect relevant gear; avoid reducing diagnosis to a menu slideshow.
- Preserve the proven replay classes: careful signal-path diagnosis, faster hardware path with recovery, and negotiated/documented unresolved risk.
- Surface why an option is available/unavailable, what changed, and how a consequence returns on a later workday. Keep hidden calculations explainable without dumping formulas.
- Reuse action IDs, domain outcomes and UI patterns established in M3/M4; stop job-specific branching from recreating shared engine code.

**Gate M5:** At least three meaningfully different saved replays, each reproducible through normal UI and checkpoint tests; outcomes affect time, skill usage, reputation or callback state and survive reload without double payouts.

### M6 — Public-alpha qualification and cutover decision

**Goal:** Decide whether the 3D game is ready to become the default link.

- Conduct observed, unassisted first-time sessions covering tutorial and one follow-up decision. Record blockers, confusion points and what players think the tradeoffs mean; test with both AV-experienced and nonexpert players.
- Rework onboarding, object readability, job pacing, status/ledger text and UI until the core loop is understandable. Keep story/tutorial copy concise and human.
- Complete supported Chrome/Edge and Firefox checks; actually test Safari before claiming support. Handle WebGL unavailable/context loss and browser resizing without corrupting saves.
- Establish measured performance targets from real shop/room content on a declared baseline device. **60 FPS desktop is an initial aspiration, not a proven result.** Set loading, transfer, frame-time and memory budgets from measurements, then enforce budgets in CI/release review where feasible.
- Add keyboard remapping or accessible alternatives, readable contrast, scalable text, caption/subtitle controls, camera sensitivity, reduced-motion setting, pause/focus correctness and sensible audio mute defaults.
- Verify asset/audio provenance and license attribution, avoid real client/company confidential material, and decide whether analytics are needed before introducing telemetry. No surprise third-party tracking.
- Run end-to-end save migrations, corrupt-save recovery and duplicate-action regression. Separate 3D development saves from the legacy key; support **explicit, tested import** from `av-tech-rpg-save-v1` before touching the 2D default.
- Prepare release notes, rollback artifact and direct access to the prior 2D version. Prefer staged rollout over an irreversible replacement.

**Gate M6:** No known critical gameplay/save blockers; required browser and visual checks accepted; accessible controls tested; measured performance acceptable or explicitly scoped; gameplay comprehensible in observed sessions; legacy saves preserved; rollback rehearsed. Only then consider replacing the default play link.

### M7 — Expand the career selectively (alpha)

**Goal:** Turn a great two-job slice into a sustainable RPG without exploding content cost.

- Prioritize **one** additional job family that proves a different mechanic (e.g. University City survey and later South Philly commissioning consequence) over a larger city.
- Develop reusable authoring for area/portal/action/task/gear definitions, a level-assembly recipe and tests for references/IDs. Expand only when the preceding content used the same pipeline successfully.
- Deepen career choices: tools and money pressure, skills/training, Josh and other coworkers, reputation with distinct constituencies, fatigue/recovery, schedule choice, persistent callback debt, and better-employer aspirations.
- Add believable ambient audio, footsteps, shop/room sound cues, tool feedback and modest music/radio flavor using original or properly licensed assets, with captions and mute options.
- Observe whether different technician builds produce different **play**, not merely different tooltips. Balance rewards and decision pressure from replay evidence.

**Gate M7:** New job/content ships through reusable systems with less bespoke code; career progression changes decisions across days; saves remain stable; fun and usability improve in real playtests.

### M8 — Beta / release candidate (future, not scheduled)

**Goal:** Expand breadth only after the pipeline, gameplay and operating quality have demonstrated repeatability.

- Choose a finite launch career arc and endpoint, rather than promising an endless RPG.
- Add remaining high-value job families and authored regions in batches. Pursue vehicle/driving gameplay only after route/friction choices are fun and a separate driving prototype proves value.
- Build coverage for long careers, content migration, edge-case progression, asset/performance regressions and full browser release packaging.
- Decide commercial distribution, itch/Steam/native wrappers, controller/mobile support, localization, licensing and support expectations from actual audience demand.
- Create a launch-quality demo and release plan after scope, staffing and throughput are known.

**Gate M8:** A coherent career arc with a beginning, escalating choices and satisfying short-term endpoint; reproducible release pipeline; documented supported platforms, content ownership, support/bug triage and rollback.

## 6. Next development queue — small agent-sized deliverables

These are the **next actionable implementation tickets** after this planning commit. Execute in order, or split a ticket to keep reviews bounded. Do not assign invented calendar dates or mark them done until evidence exists.

| Order | Ticket / intended PR | Minimum deliverable | Acceptance evidence |
| --- | --- | --- | --- |
| **P0.1** | Scaffold `game3d/` | Pinned TS/Vite/Babylon project, lockfile, documented commands, host-portable root/subpath assets, real preview deployment and [documented hosting choice](HOSTING_AND_REFERENCE_RESEARCH.md) | Clean clone -> install -> build -> hosted route; CI and smoke pass; 2D unaffected; URL and host limitations verified |
| **P0.2** | Domain/content seam and save guard | Typed IDs for first-workday content; explicit domain action/results; dev-only save namespace and read-only legacy-fixture adapter | Deterministic tests; no writing/reset of 2D save; no duplicate reward |
| **P0.3** | Controller/camera engineering scene | Delta-time movement, follow/orbit, obstruction tests, picking/prompts, focus handling and debug capture | Automated browser test plus ordinary keyboard/mouse replay; allowed greybox |
| **P0.4** | Visual qualification scene | One properly rigged clothed human with idle/walk/carry/interact plus coherent PBR AV shop and Van #3 | Screenshots/video, source/rights manifest, scale/animation check, human art acceptance |
| **P0.5** | Shop interaction loop | Supervisor, screwdriver, boxes, carry capacity, van loadout, save/resume | Fresh-player task path; state and visual inventory checks; browser regression |
| **P0.6** | First-day complete traversal | Route, garage/entry, two-cart install, verification, end shift, return/recover | End-to-end 3D browser replay and 2D checkpoint comparison |
| **P1** | Conshohocken depth and alpha gates | Evidence/repair/verification branching; UX, audio, accessibility, browser/perf/playtest qualification | Three outcome replays, human observation and release checklist |

**Agent kickoff brief for P0.1:** Implement the production `game3d/` workspace in a new bounded branch/PR. Follow this roadmap and the foundation assessment. Keep existing `index.html`, `src/`, `styles.css`, QA and save key functioning unchanged. Use pinned packages and a lockfile; ship a real host-neutral static build and independently test a separate preview route. Check Cloudflare Workers Static Assets and Pages against the repository's existing GitHub Pages fallback, using the sourced hosting research; prefer the simplest verified solution with PR preview access, rather than forcing a migration. Add smoke tests/CI for the deployed route; document run/deploy commands, asset limits, localStorage-origin save constraints and failure modes. Do **not** port all job systems or claim the 3D art gate is complete. Report changed files, commands/results, hosted proof if deployed, remaining blockers and the next smallest ticket.

## 7. Architecture and content contracts

- **Separate concerns:** Domain resolves commands and outcomes; content provides stable IDs and data; world maps IDs to spatial anchors; Babylon renders; UI presents events and controls; persistence stores versioned domain state. No mesh or modal should directly award cash, XP or reputation.
- **Keep work inspectable:** Use stable `actionId`, `areaId`, `taskId`, `routeId` and equipment IDs. A successful interaction returns a structured event/result usable by HUD, ledger, sound and tests. Repeated commands after completion must be safe.
- **Seed uncertainty:** If time/risk/skill uses randomness, inject a seed or test-controlled roll so a failed task can be replayed. Do not hide essential gameplay in engine callbacks.
- **Avoid a big-bang port:** Extract only the rules necessary for the next slice into pure TypeScript functions with contract tests. Do not mechanically load old globals into the new 3D client or rewrite the entire historical save migration at once.
- **Save safety:** The current 2D key is `av-tech-rpg-save-v1` and the payload version is 30 at baseline. Keep a separate 3D development save namespace and migration version. Treat 2D import as an explicit one-way, tested operation until parity is proven. No silent deletion or reset of existing browser saves.
- **Area authoring:** Use a compact scene recipe with spawn points, collision, interaction anchors, route/portal exits and asset IDs. Keep physical measurements consistent even if the regional map is not to scale.
- **UI:** Prefer a lightweight DOM overlay compatible with the rendering canvas, rather than immediately importing a large framework. Modals should suspend movement and avoid capturing shortcuts while a form field is focused.
- **Deployment:** 3D must build to its own versioned, cache-safe, static subpath; use relative assets correctly under GitHub Pages. Keep a known-good rollback and browser console/network error capture.

## 8. Studio production standards

### Art, animation and audiovisual pipeline

- Maintain a concise **style bible**: realistic commercial AV workplace; human proportions and clothing appropriate to an install technician; slightly lived-in, not glossy showroom; legible task props and grounded workplace humor.
- Asset acceptance requires a source/license/provenance record, editable source or reproducible import instructions, GLB scale/orientation check, PBR material check, collision/LOD plan where needed, and an in-browser appearance review.
- Use a coherent kit where possible. **AI-generated art is not accepted solely because it looks attractive in a still image**; validate geometry, consistency, rigging, rights, animation, performance and reproducibility.
- Standardize a humanoid skeleton and animation naming early. Verify footsteps, hand placement, carry pose and root motion against the actual camera.
- Add room tone and interactive audio gradually. Every important sound cue needs a visual or caption alternative. Do not use unlicensed music, sampled voices or recognizable manufacturer marks without permission.
- No paid assets, subscriptions or third-party services should be purchased without explicit owner approval.

### Gameplay, writing and UX

- Every job needs: setup -> physical goal -> evidence or constraint -> at least one meaningful choice -> feedback -> verification/closeout -> later consequence or reward.
- A specific AV detail must improve the fiction, decision or diagnosis. Do not bury casual players in arbitrary port numbers, signal standards or cable-selection trivia.
- Use short, distinctive dialogue and environmental storytelling. Keep the fictional bad integrator funny without requiring real employers, customers or confidential anecdotes.
- Teach the player through the first shift, not a long text manual. Show what is interactive and why a task is blocked.
- Do not reward unsafe field work. Separate a "quick fix" from bypassing safety practices.

### Quality, evidence and release practice

- Keep existing `node scripts/qa-all.js --fast` passing. Run full 2D browser smoke for changes touching shared content or legacy behavior.
- 3D PRs must pass typecheck/build, deterministic domain tests and browser smoke for boot, movement/interact, saving and a real player flow relevant to the change.
- For visual or spatial changes, attach in-browser screenshots and short video at the actual following-camera distance, with target browser/device noted. Review normal gameplay, not only staged beauty shots.
- For performance claims, report machine/GPU/browser, scene build, resolution, frame-time percentiles, load/transfer size and observed bottlenecks. "Runs at 60 FPS" without a test context is not evidence.
- For game-design claims, run focused manual replays and short observed first-time playtests. Tests cannot prove a joke landed, navigation was obvious or consequences felt fair.
- Each PR must include: scope and files, user-visible change, tests actually run, test outputs, screenshots/recording when relevant, known limitations, save/deployment risk, and a rollback note.
- Prefer small branches/PRs, one gameplay or technical objective at a time. Do not use passing tests to justify unbounded cleanup, new framework adoption or content sprawl.

## 9. Top risks and mitigation

| Risk | Leading sign | Containment |
| --- | --- | --- |
| Realistic art consumes the project | Greybox "done" reports, mismatched assets, no playable human animation | M2 is a hard **human + shop** visual gate before content expansion; source a coherent kit/rig and review motion |
| Big-bang 2D rewrite breaks the RPG | UI and job logic coupled, lost flags, repeated payouts | Explicit domain action contracts; M3/M4 checkpoint parity; one job at a time |
| Save loss during migration | Reusing the old storage key or silently resetting unknown data | Separate 3D namespace; explicit import and backups; corrupt-save/migration tests; delayed cutover |
| Third-person movement feels bad indoors | Camera clips shelves, stuck doors, prompts select wrong object | Test real compact shop geometry, camera obstruction and priority; qualify controller before expansion |
| Browser performance collapses with real assets | Works in a blank probe, stalls with rigs/textures/lights | Declare hardware; profile real M2 assets; optimize before adding areas |
| Too much content, too little fun | More job cards but no physical agency or replay | Freeze unrelated jobs; M4 first workday then M5 branching, observed playtests |
| Agents report progress without proof | "Passed" only means lint/build or a synthetic state injection | Require live browser replay, visible artifacts, acceptance checklist and stated untested work |
| Licensing, privacy or platform surprises | Unknown model/music rights, published confidential marks, unsupported browsers | Asset manifest, fictionalized brands, early browser matrix and release audit |
| Endless preproduction | Repeated design/research without playable artifacts | The very next coding ticket is P0.1; only reopen research for a blocked acceptance gate |

## 10. Product ownership, review cadence and decision rules

**Responsibilities are functions, not claims that a staffed studio exists:**

- **Product owner / game direction:** Protect pillars and scope; accept player-visible experience, art direction and release gates; prioritize based on evidence.
- **Implementation agent(s):** Design and ship bounded PRs; maintain tests/build/docs; report reproducible evidence and blockers; never self-approve human visual or fun gates.
- **Art/animation production:** Source, create, optimize and license coherent assets; verify playable motion and environment quality.
- **QA/playtest:** Reproduce flows, check state/save/browser regressions, observe novice play and log concrete blockers.

**At every milestone review**, record: (1) the working browser URL/build SHA; (2) what a player can actually do; (3) test and visual evidence; (4) unresolved product/technical risks; (5) the single next highest-value deliverable. When a gate fails, fix or explicitly rescope it before adding another feature. Use a short decision log at the bottom of this file or a linked issue; avoid burying material decisions in chat history.

**Prioritization:** Critical save loss, hard crashes and blocked core interactions first; then character/shop visual credibility and feel; then first-workday readability; then Conshohocken replay depth; then content expansion. Work not connected to those outcomes is deferred.

**Capacity and dates:** No schedule or budget is asserted because there is no measured production velocity or asset staffing baseline. Estimate after P0.1–P0.4 reveal real integration and art throughput. Milestones are **acceptance-based**, not promises of completion on particular dates.

## 11. Release readiness checklist

- [ ] Distinct production 3D client built and deployed beside the 2D link.
- [ ] Natural human + furnished shop visual gate passed with in-browser footage.
- [ ] Physical prep/van interactions and a complete first-day loop playable without state injection.
- [ ] At least one diagnosis job demonstrates three distinct saved decisions/outcomes.
- [ ] Stable typed domain/action contracts and reproducible gameplay tests.
- [ ] Save/resume, legacy import decision, migration and rollback verified.
- [ ] QA, browser compatibility, accessibility, license/source and measured performance gates met.
- [ ] Observed first-time playtests show the loop and tradeoffs are understandable.
- [ ] Release notes, known limitations and fallback play link published.

## 12. Decisions and changes

| Date | Decision | Rationale / trigger to revisit |
| --- | --- | --- |
| 11/21/2026 | Keep browser-first, third-person, realistic/PBR product direction | Owner-confirmed requirements in the foundation assessment; revisit only on explicit product change |
| 11/21/2026 | Choose Babylon.js + TypeScript + Vite; Blender/GLB | Browser-native capability and smaller JS migration; revisit for demonstrated authoring/performance blocker |
| 11/21/2026 | Preserve 2D career during 3D development | Avoid losing working content, hosted access or saves |
| 11/21/2026 | Evaluate Cloudflare Workers Static Assets / Pages for 3D previews, retain GitHub Pages fallback | Cloudflare supports static game asset delivery and branch previews; choice requires deployed proof, asset-size review and explicit origin-based save safety; see [hosting research](HOSTING_AND_REFERENCE_RESEARCH.md) |
| 11/21/2026 | Prioritize shop/human visual gate, first day, then Conshohocken | Proves appearance, playable workflow and RPG depth before adding breadth |
| 11/21/2026 | Treat engine probes and passing 2D QA as feasibility evidence, not 3D completion | No production 3D client, real art qualification or performance/player acceptance yet |

**Next action:** Start **P0.1** in a bounded implementation PR. Deliver the actual `game3d/` workspace and independent build/deployment proof, then proceed through the acceptance gates rather than repeating engine research.
