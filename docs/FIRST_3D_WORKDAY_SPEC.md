# First 3D Workday — Playable Production Specification

**Prepared:** 11/22/2026 · **Status:** implementation/acceptance specification, not an implemented 3D scene.  
**Scope:** M1–M4; [Production Roadmap](PRODUCTION_ROADMAP.md) governs sequence, [Visual Asset Pipeline](VISUAL_ASSET_PIPELINE.md) governs art acceptance, [M1 Engineering Audit](M1_ENGINEERING_DELIVERY_AUDIT.md) governs build and deployment.

## 1. Why this exists

Do not spend months building a pretty showroom or porting 12 maps before discovering that installing and troubleshooting AV equipment is tedious in 3D. Build **one compelling playable day** that proves **place**, **work**, **choice**, and **persistent consequence**.

**Experience promise:** The player is a poorly equipped new technician at fictional Radnor Rack & Wire, gets briefed for two simple mobile video-conferencing carts, loads Company Van #3, encounters missing access arrangements in Center City East, builds Cart 1 with supervisor guidance, finishes Cart 2 alone, chooses a closeout standard, and returns to the shop with changed energy/pay/reputation and possible callback debt. The humor comes from the company’s bad planning, not arbitrary technical trivia.

**Locked product style:** Realistic human anatomy and work clothing; coherent, believable PBR industrial/commercial spaces; third-person camera; compact authored locations; little-to-no manual wiring simulation; visible task feedback. The shop needs to look finished and recognizable from normal gameplay distance before the whole career expands. A 30-second **walking and interacting** browser recording is a visual proof, but not a substitute for a playable first-day route.

## 2. Canonical 2D contracts — preserve, do not re-invent

These exact identifiers/strings exist in the prototype:

| Domain contract | Existing source / details | 3D migration treatment |
| --- | --- | --- |
| Shop | §world.areas.shop§; §sceneId: "shop"§; fictional Radnor Rack & Wire | Stable §areaId=shop§; physical shop with spatial anchors; do not reuse 2D pixel coordinates |
| Vehicle | §vehicles.van3§, cargo capacity 3 | Van #3 as a believable visible model/interaction zone; cargo slots are game rules, not physics piles |
| Starting tool | §tools.screwdriver§, some premade profiles start with it | Reuse entitlement; show in kit/equipped state without duplicating on pickup |
| Shop briefing | §flags.shopBrief§ | First interaction with supervisor unlocks staged cargo; repeated talking must not replay a one-time reward |
| Shop cargo | §tutorial.shopLoad§ = "Cart frame boxes", "Display boxes", "Accessory tote" | Three logical equipment groups with visible props and progress; preserve canonical saved names or build explicit ID adapters |
| Tutorial route | §world.routes.centerCityTutorial§ from §shop§ to §centerCityGarage§ | Reuse route-choice semantics and arrival consequences; no manual driving required |
| Arrival areas | §centerCityGarage§, §centerCityLobby§, §centerCityConferenceRoom§ | Compact garage -> check-in lobby -> room with valid portals/spawn anchors |
| Garage unload | §tutorial.garageUnload§ = same three cargo groups | Respect carrying capacity and energy. Repeated actions cannot create duplicates |
| Entry gates | §garageToLobby§ requires §flags.centerCityEquipmentDelivered§; §lobbyToConferenceRoom§ requires §flags.securityChecked§ | Show why portal is locked; verify actual movement to entrance and check-in |
| Cart installation | §cart-1-frame§, §cart-1-display§, §cart-2-frame§, §cart-2-display§ | Four stable job-object/task IDs, physically represented as relevant cart components |
| Supervisor departure | §flags.supervisorLeft§ after Cart 1's two assembly tasks complete | A short diegetic/brief interaction when Cart 2 becomes solo work; not an unexplained state flip |
| Workmanship decision | §finishChoice§: §tidy§ vs §rush§; conditional §wiley-workaround§ | At least two choices visibly change result/energy/cash/reputation/risk; third only for eligible build |
| Completion | §flags.finished§, §tutorialPaid§, §tutorialProgressAwarded§, §tutorialStatsRecorded§ | Award exactly once and persist; returning to shop and next-day state must be coherent |
| Return | §centerCityConferenceRoomToShop§ requires §flags.finished§ | Safe return area/spawn; no scene-loop or quest reset |

**Source locations:** §src/content/data.js§ (world, vehicles, tutorial and skill checks); §src/systems/scene-interactions-system.js§ (shop, garage, lobby, site interactions); §src/systems/tutorial-dispatch-system.js§ (cart installation, supervisor departure, final choice, payout); §src/systems/objective-system.js§ (prompt/objective guidance); §src/systems/save-system.js§ (legacy save migration).

**Specific choice behavior:** The existing §tidy§ closeout increases energy cost, ends later and favors client/coworker standing at some management cost. §rush§ saves energy/time but can add callback pressure. The existing prototype currently pays \$152 for tidy vs \$141 otherwise and awards 40 XP on its first completion. These are **baseline comparison fixtures**, not a demand to make numbers look permanently fixed in 3D; any deliberate rebalance must be documented and tested against the fixture. A skill/build-specific workaround is conditional, not a generic third button.

**Variable pressure:** The existing tutorial can seed an installation-pressure condition (e.g. mislabeled cable bag or wobbly caster hardware), with an immediate cost/recovery choice. Preserve the concept and reproducibility, but do not add complex simulated wires, physical-cable bending or arbitrary mini-games. The 3D player's task feedback should show the relevant component and explain the tradeoff.

## 3. The physical scene recipe

Treat this as an **art/interaction storyboard**, not architectural construction drawings. One gameplay world unit should equal one meter by convention. Blockout measurements and final floorplan are **trial values**, to be reviewed against realistic avatar/cart/van scale.

### Area A — AV shop (hero environment)

One compact, readable shop with interconnected functions:

- **Arrival/spawn and supervisor/dispatch counter:** The initial camera points toward an obvious place to get the day’s assignment. Human NPC presence or clear stand-in when testing M1; production human(s) during M2.
- **Staging bay:** Three recognizable groups of labeled boxes, one pickup at a time, near route to loading bay. Equipment boxes change visibly from staged -> carried -> loaded (not simply deleted without feedback).
- **Tool wall / workbench:** A believable array of safe tools, cable coils, rack kit, laptop/work orders, packaging and a deliberately sad shop loaner drill. Only the necessary tutorial action is mandatory; decorative props should not steal interaction focus.
- **Rack/display/cart vignette:** A grounded AV equipment showcase, in fixed plausible scale. Reused coherent material palette, legible label textures, no unauthorized manufacturer logos or confidential drawings.
- **Van #3 at loading bay:** Clear rear/side cargo interaction zone, convincing van silhouette, reachable from shop floor, collision volume and loading feedback. May be attached to shop exterior/loading alcove; a whole vehicle-interior simulation is unnecessary.
- **Future hub corners:** Josh area, break corner and training/clipboard space can be visually hinted at, but remain largely non-interactive until their systems ship.

Use visually distinct goals: supervisor near entry, staged cargo in a lit bay, van framed by bay door. Place shelves/carts so they give depth **without** causing repeated camera obstruction or long walks between required interactions. The shop is a place to work, not an obstacle course.

### Area B — Center City garage

Small van-unload pocket, supervisor briefing position, route to client entrance. A missing loading-dock arrangement and the carry-distance cost should be conveyed with environment/dialogue. The existing tutorial has \$18 garage parking pending reimbursement; retain in 3D parity or explicitly document rebalance. If the player carries nothing, the entrance remains gated until all cargo groups are delivered.

### Area C — Client lobby

A recognizable security/reception check-in and elevator portal. Keep the interaction short; the function is to make building access feel real, not to turn a two-cart job into a hallway simulator. Portal feedback must name the missing requirement.

### Area D — Client conference room

Two recognizable video carts with open frame/display states, component staging, a safe route between work surfaces, supervisor presence for Cart 1 and departure moment for Cart 2. The player performs **four** actual spatially grounded install actions. A concise field-task panel handles checks/choice consequences; no per-screw minigame.

## 4. Gameplay choreography and failure feedback

This is the **golden path**, with checkpoint testing and player-observable events.

| Step | Player action | Required observable result | Relevant state |
| --- | --- | --- | --- |
| 0 | Start/continue a technician | Understand who/where, first goal displayed | §technician§, §sceneId=shop§ |
| 1 | Approach supervisor, interact | Briefing and clear cargo objective; no duplicate on replay | §shopBrief§ |
| 2 | Pick up staged cargo | Visible carried group and capacity/energy feedback | §carry§ |
| 3 | Walk to van, interact | Cargo placed in van, visible loaded state; three unique groups | §loaded§ |
| 4 | Select Center City route | Route approach consequence, arrival and parking complication explained | §centerCityTutorial§ |
| 5 | Unload/deliver groups | Visible carrying and gradual delivery; portal unlocks only when complete | §delivered§, §centerCityEquipmentDelivered§ |
| 6 | Enter lobby, check in, take elevator | Spatially understandable access gate and scene transitions | §securityChecked§ |
| 7 | Assemble Cart 1 frame/display | Two objects change visibly; task feedback; supervisor teaches | §assembled§ |
| 8 | Supervisor leaves | Clear dialogue/event; second-cart objective now solo | §supervisorLeft§ |
| 9 | Assemble Cart 2 frame/display, handle pressure if active | Correct progress, readable condition and energy cost | §assembled§, pressure state |
| 10 | Choose careful or fast closeout | Different consequences before leaving; follow-up risk understood | §finishChoice§, §finished§ |
| 11 | Return to shop, close/recover | Pay/XP/reputation/energy/burnout surfaced; next-day state preserved | reward flags, shift history |

**No silent failures:** If action is unavailable, show why (out of reach, busy hands, wrong part, door locked, cargo incomplete, needs security check, need to verify/close out). Distinguish a command that did not execute from a command that executed with a strained skill result.

**UI contract:** Third-person movement first; contextual nearby prompt to interact; concise objective and task status; a task/brief screen when needed; a short result card, not text flooding. WASD or arrows for movement and E/Space for interaction may be inherited from 2D if conflict-free; camera mouse drag/scroll and Escape/back need clear instructions. Movement and camera controls stop when menus have focus; held keys clear on blur.

**Physicality without simulation:** A single "install frame" action can animate a tool motion, play a sound and move the cart from bare frame to installed frame. AV authenticity belongs in the object, work order, choice and result. Do not implement physics bolts, real wiring circuits, building dimensions, full procedural vehicles or every real signal standard.

## 5. Visual proof and acceptance

**Proposed look:** Grounded, slightly worn small AV integration shop: concrete/epoxy floor, off-white walls, metal shelving, black AV rack faces, high-contrast cartons, realistic displays and cable bundles, workwear fabric roughness, believable mixed warehouse daylight/fluorescent overhead lighting. Favor a short list of excellent and coherent textures/props over dozens of inconsistent details.

- **M1 permits:** geometry placeholders; accurate movement scale/collision/camera; normal-player interaction; stable app build and deployment.
- **M2 requires:** one **actually rigged, clothed, normally proportioned** human with convincing idle/walk/turn/carry/interact motion, a furnished AV shop and Van #3, working camera obstruction and reasonable loading behavior. Show ordinary gameplay with a real human, not a hero still or shader demo.
- **M3 requires:** cargo visible in hand and van; correct load/unload and save state; no duplicate pickups.
- **M4 requires:** completed first day across all four areas; rewards, return, recovery and at least two observable closeout outcomes.

For M2 compare at most **two** serious zero-cost human pipelines first: Rocketbox/Avatar Studio and Ara/MakeHuman. Apply exactly the same Babylon lighting, follow camera and movement/interaction animation test. Evaluate both quality and integration/rights work. Pick one unless both demonstrably fail. Do not build a custom facial generator or experiment with every character library.

**Art review footage:** Include 1) ordinary third-person walkthrough with shelf/door/van occlusion test, 2) close-up of hands, face and clothing, 3) idle->walk->turn->carry->interact transitions, 4) shop overview showing why this is an AV business. Attach model source/rights, actual asset sizes and device/browser alongside video.

## 6. First-workday QA contract

The implementation agent should create normal-input browser tests and **deterministic state tests**. Use synthetic state injection only for deeper branches, never as the sole proof of the first playthrough.

1. **Boot:** Built app loads with no JS exceptions, missing asset requests or perpetual loading spinner; legacy 2D root still loads.
2. **Movement/camera:** Normal keyboard/mouse path reaches supervisor, boxes and van; camera does not repeatedly clip shelves or the player; movement delta time scales sanely.
3. **Interaction:** Same nearby object chosen predictably; long-range prompts disabled; paused UI and focus do not move the player.
4. **Cargo:** Three unique groups loaded once. A fourth "pickup" cannot duplicate anything; save/reload at 0, 1, 2 and 3 groups remains consistent.
5. **Route/garage:** Route consequences applied once; three groups delivered with intended carrying capacity; garage->lobby gate and security->elevator gate validated.
6. **Assembly:** Four parts installed at valid destinations; cannot install a display on wrong cart; no repeated skill check or energy charge after completion; supervisor leaves after Cart 1 completion, not before.
7. **Closeout:** Test tidy vs rush from equivalent seeded conditions; verify pay/XP/reputation/flags, return-trip pressure and idempotence.
8. **Persistence:** Reload at mid-carry, at scene transitions, before and after supervisor departure, post-closeout and post-return. No lost tasks, spurious rewards, unsafe spawn or corruption.
9. **Visual:** Inspect actual browser gameplay on recorded target hardware; automated screenshots are regression evidence, **not** human art acceptance.
10. **New player:** At least one unassisted observation at M4 should reveal whether objectives, interactables, risk and route feedback are comprehensible without knowing the 2D UI.

Never claim that all of these have passed in the absence of a §game3d/§ implementation. The first PR need only satisfy the smaller M1 subset; full first-day completion belongs to M4.

## 7. Efficiency and stop rules

- **Concentrate assets:** One human, one shop, one van, one cart model reused twice, one garage, one lobby, one room. Reusable, detail-rich foregrounds; simplified backgrounds; no city or vehicle physics.
- **Concentrate code:** One action/interaction pipeline, one controller/camera, one area/portal adapter, one asset importer and one save adapter. Keep Babylon mesh/animation code **out** of career rules.
- **Concentrate testing:** One representative clean-run fixture, one alternate-closeout fixture, one reload/interrupted-run fixture before attempting exhaustive combinations.
- **Concentrate research:** Before adding a new engine, rendering framework, physics backend, asset library or host, show the **measured failure** or feature blocker that the change fixes. An attractive online demo is not sufficient.
- **Financial boundary:** No model purchases, subscription, cloud backend, paid APIs or new domain without explicit approval. Current AI tool usage/cost is not inferred from public demonstrations.
- **Stop planning:** Once M1 has an implementable build brief and this M2–M4 scene contract, more documents are lower value than making the first character/shop browser build. Reopen research only for a specific art, quality, save, performance or deployment failure with evidence.

## 8. Decisions needed after the first playable art build

Decide **after actual evidence**, not from the roadmap:

1. Which of the two real avatar pipelines wins visual and animation quality at acceptable license/integration cost?
2. Is Babylon’s simple movement sufficient through a real furnished shop, or does measured collision/step/ramp behavior justify Havok?
3. Is independent Cloudflare preview worthwhile over the existing Pages deploy once GLB/texture bundles are measured?
4. Does the garage/lobby/room traversal add enough game feel to justify the number of scenes, or should less-important transitions be shortened?
5. Does the first-time player understand the tradeoff between polished and rushed closeout through what they see and what later changes?

**Next useful work:** Implement the M1 §game3d/§ workspace and a **single genuine animated-human/shop qualification scene**. Do not enlarge the plan until that artifact answers these questions.
