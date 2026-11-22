# Browser 3D Foundation Assessment

Date: November 21, 2026. Browser baseline inspected: `c4b5652` on `main`.

## Decision

Build the next playable slice with **Babylon.js + TypeScript + Vite**, using a
third-person camera following the technician. Keep browser play a primary
delivery requirement. Use Blender and glTF/GLB for assets. The owner selected
**realistic/PBR art: natural human proportions, detailed surfaces and lighting**.
Move into 3D now; finishing the RPG design is not a prerequisite.

These target, camera and visual requirements were explicitly confirmed by the
owner during this assessment. They replace the older top-down-only direction and the
browser phase's blanket restriction on engine/build-tool changes.

This is a project-specific recommendation, not a claim that Babylon beats every
engine. It minimizes language and browser-UI migration while supplying the 3D
scene, animation, picking, collision, and asset-loading systems this repo lacks.
[Babylon's capabilities](https://www.babylonjs.com/specifications/) and
[ES-module packages](https://doc.babylonjs.com/setup/frameworkPackages/es6Support/)
support that direction. The evaluated version was 9.37.1; pin and lock the
implementation dependencies rather than loading a floating CDN version.

**Confidence:** high that this is a feasible browser foundation; moderate that
it is the most efficient production workflow until the first authored room and
animated character pass. No production-engine switch or playable-career port
was completed in this assessment. The checked-in experiments are reproducible
capability probes, separate from the current game.

## Current repository inventory

The initial checkout was clean, on `main`, with 65 tracked files. There was no
`AGENTS.md` in the repo or its inspected ancestor directories. The empty local
`.agents` and `.codex` directories supplied no additional project instructions.

| Surface | Observed state | Implication for 3D |
| --- | --- | --- |
| Runtime | 43 ordered classic browser scripts; 40 system files; about 18,352 source lines | Existing organization helps locate behavior, but shared globals are not module boundaries |
| Content | `src/content/data.js`, about 106 KB when serialized as compact JSON; all values JSON-compatible | Export IDs and definitions directly; separate spatial authoring from job data |
| Characters and equipment | 5 premade technicians, custom creator, 6 tools, 1 vehicle | Reuse definitions; build character meshes and animation separately |
| World | 11 region definitions, 12 areas, 12 2D scene definitions, 9 routes, 13 portals | Existing region/area/route IDs are valuable; region definitions do not mean 11 explorable 3D regions |
| Work | Tutorial carts, service/diagnosis, optional follow-up, survey, commissioning, warehouse, secure access, warranty, handoff, systems, toll, retrofit | Enough material for a 3D slice; more dispatch content is unnecessary before it |
| RPG | Skills/training, tools, fatigue/burnout, recovery, standing, Josh relationship, callback/return risk, saved consequences | Preserve the rules and recognizable tradeoffs while spatial presentation changes |
| Rendering | DOM/CSS decor and markers on a fixed 960 × 540 coordinate board | Replace with 3D rendering, transforms, lighting, camera, animation and collision |
| Movement | Axis-separated rectangle collision, fixed bounds, `setInterval(..., 16)`, pixels per tick | Replace with time-based movement and a proper character controller |
| Persistence | `SAVE_KEY = av-tech-rpg-save-v1`; payload version 30; localStorage migration | Key and payload version are different concepts; a 3D format needs deliberate migration |
| Toolchain | No package manifest, build, engine project, 3D assets, rigs or animation clips | The repo is a substantial gameplay prototype, not an existing 3D production project |
| Delivery | GitHub Pages uploads the repository root; CI runs fast static/unit QA | A bundled 3D client needs its own build artifact and browser CI before cutover |

The most mature gameplay proof is Conshohocken: investigation order,
build-specific repairs, appointment pressure, incident recovery, verification,
adaptive closeout and checkpoints. University City/South Philly and Burlington
prove that earlier decisions can affect later work. The optional follow-up
proves limited schedule agency. These are useful reference cases, not evidence
that balancing, tutorial comprehension or the full career are finished.

### Reuse, translate, rebuild

| Keep as source material/contracts | Extract or translate behind explicit APIs | Rebuild for 3D |
| --- | --- | --- |
| Technician/tool IDs and values; job text; world/route/portal IDs; task definitions; consequence examples | Career state; task resolution; reward/standing changes; route gates; saves; dispatch state progression | Player/camera/input; collisions; room meshes; animation; interaction anchors; lighting; audio placement; spatial HUD |

`scene-interactions-system.js` builds executable callbacks and modal copy while
mutating global state. Dispatch files often combine rules, HTML and rendering.
They are not drop-in engine-independent systems. Even with JavaScript retained,
the work is more than replacing `render-system.js` with a canvas.

Use the existing tests and saved examples as a behavioral reference. Extract
only the rules the first 3D slice needs; avoid a preliminary rewrite of all
18,000 lines.

## Engine alternatives and decision boundaries

Criteria, in order: reliable browser delivery, effort to ship and maintain a
third-person slice, reuse of this codebase, asset/level workflow, observability
and testing, then future desktop capability. This is a qualitative comparison;
there was no controlled performance benchmark across engines.

| Option | Strength for this game | Cost/risk here | Decision |
| --- | --- | --- | --- |
| **Babylon.js + TypeScript/Vite** | Browser-native JS/TS; scene/animation/picking/collision systems; existing DOM UI and rule extraction can coexist | We own gameplay architecture and level authoring integration; bundles and asset delivery require care | **Preferred under the confirmed browser/third-person requirements** |
| **Godot 4 + GDScript** | Integrated editor, scenes, character bodies, animation and reusable resources; good CLI workflow | Rewrite JS behavior; replace DOM UI; qualify WebAssembly/WebGL export and save transfer | Strong runner-up if editor productivity outweighs port cost in a one-room authoring trial |
| **Three.js + a physics/controller stack** | Flexible JavaScript renderer and a large example ecosystem | Assemble more game systems and integration choices ourselves | Choose only if a demonstrated rendering requirement or existing team expertise justifies the additional integration |
| **PlayCanvas** | Browser engine plus visual editor and asset workflow | Evaluate editor/account workflow, source ownership and plan limits against repo-based work | Best editor-oriented browser challenger; try one authored room if Babylon level iteration becomes a bottleneck |
| **Unity** | Mature editor, animation and asset ecosystem | JS/domain and UI port; browser deployment has platform-specific constraints | Revisit for a concrete asset/tool dependency that materially saves more work than it introduces |
| **Unreal** | Extensive high-end 3D tools | Poor fit for the prioritized simple browser distribution and lean current workflow | No current project requirement justifies the change |
| **Custom WebGL/WebGPU, lower-level native frameworks/ECS engines** | Maximum control | More foundational systems to build, with no demonstrated requirement | Exclude from the initial slice |

Primary references: [Babylon specifications](https://www.babylonjs.com/specifications/),
[Three.js](https://threejs.org/), [PlayCanvas manual](https://developer.playcanvas.com/user-manual/),
[PlayCanvas plans](https://playcanvas.com/plans),
[Unity Web limitations](https://docs.unity.com/en-us/engine/6000.0/manual/platform-specific/webgl/intro/technical-overview),
and [Unreal hardware guidance](https://dev.epicgames.com/documentation/en-us/unreal-engine/hardware-and-software-specifications-for-unreal-engine).
Engine choice is engineering judgment based on these capabilities and this repo.

Godot was the initial general-purpose favorite before the owner clarified the
browser priority. Its official Windows page currently offers 4.7.2 stable.
GDScript retains the web option; Godot 4 C# currently does not export to web.
Web uses Compatibility/WebGL 2 rather than Forward+/Mobile, with single-thread
export available. That makes Godot viable, but browser parity and the language
port must earn their cost. [Download](https://godotengine.org/download/windows/),
[web export constraints](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html),
[renderer choices](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html).

Do not reject Unity because of the canceled Runtime Fee. Its current official
pricing information is the source for eligibility and terms, not old controversy.
It simply has no demonstrated advantage large enough for this particular port.
[Unity pricing update](https://unity.com/products/pricing-updates).

## Confirmed 3D presentation and movement direction

**Third person following the technician** is the product requirement. Orbit and
zoom should help inspect work; camera-relative WASD should move the technician.
The character, furniture and spaces use real geometry and depth.

First person would favor close wiring work but changes the desired experience.
An overhead 3D camera would reduce some obstruction/animation work, but does not
fulfill the requested camera direction. Neither should become the default.

The foundation must include camera obstruction tests at walls, corners, the van
and narrow doorways. Following the character in an empty room is insufficient.
Keep the camera rig separate from movement and interaction selection.
[Babylon camera documentation](https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction/).

For the first flat room, engine collision is enough to prove walking. Before
expanding maps, compare it with Babylon's Havok character controller on a
doorway, ramp, step, low ceiling and moving cart. Measure additional transfer
size and startup work. Keep one movement adapter so that this choice does not
infect quest or save code. Havok was researched, **not qualified by this probe**.
[Official character controller](https://doc.babylonjs.com/features/featuresDeepDive/physics/characterController/).

## Efficient asset and authoring workflow

Choose a coherent realistic commercial-world asset set, one humanoid rig and
consistent PBR treatment. Start with a small asset set: technician, workbench,
shelf, boxes, van exterior, cart, display, rack and doorway. Make AV-specific
props modular. An imported/rigged character with idle, walk, carry and interact
clips is a better next investment than generating a city full of unrelated props.

### Required visual bar

The first accepted playable slice must contain a naturally proportioned human
technician with a face, hands, hair and appropriate work clothing/boots. Walking,
turning, carrying and interaction poses must look believable from the following
camera. A primitive character proxy does not satisfy this requirement.

The shop must read as a real AV integration workplace: constructed walls,
doorways/windows, an office area, workbenches, metal shelving, equipment cartons,
cable spools, tools, racks/carts, practical fixtures, wear and organized clutter.
Van #3 needs a recognizable vehicle model with a usable loading location.
Use correct scale, visible material differences and readable fluorescent/daylight
lighting. Avoid uniformly shiny surfaces and detail that obscures navigation.

Use a small furnished shop plus one human as the **visual qualification scene**
before producing the rest of the workday. Review browser screenshots from the
normal following camera and close views, plus motion footage. Code tests cannot
accept likeness, clothing quality, animation or whether the shop feels authentic.
The capability probe screenshot is not target art or completion evidence.

Realistic/PBR visuals are feasible within Babylon's material workflow, but this
assessment did not qualify a realistic rendered scene. Start with metallic/
roughness materials, baked static lighting where useful, a small number of
dynamic shadow lights, optimized textures and LODs. Profile the actual visual
qualification scene before scaling. Reduce invisible geometry, texture cost or
scene breadth before changing the requested art direction.
[Babylon PBR materials](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/introToPBR),
[lighting/environment support](https://doc.babylonjs.com/features/featuresDeepDive/materials/using/HDREnvironment).

Use Blender for source models, cleanup and repeatable exports. Commit generated
GLBs and their source recipe or editable source; imported game assets should
not require Blender to launch. glTF is a portable interchange format supported
by both finalists. Godot explicitly recommends it, and Babylon supplies a glTF
loader. [Godot formats](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html),
[Babylon packages](https://doc.babylonjs.com/setup/frameworkPackages/es6Support/).

Practical shortlist, to evaluate before adding files or spending money:

| Resource | Best use | Qualification needed |
| --- | --- | --- |
| [MakeHuman / MPFB](https://static.makehumancommunity.org/mpfb/docs/exporting/index.html) | First realistic human candidate: authored body proportions, clothes, game rig and PBR export | Test proxy mesh, hair/cloth, rig and Babylon GLB import; core assets are CC0, while third-party clothing has its own terms; nothing installed/imported here |
| [Mixamo](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) | Fast humanoid animation/rigging trial | Adobe documents free access and game use; verify rig retargeting, carry poses and foot sliding on our character |
| [Poly Haven workshop assets](https://polyhaven.com/models/tools-equipment/workshop-equipment) | Realistic tool chests, tools and workshop props, plus PBR surfaces/HDRIs | Assets are [CC0](https://polyhaven.com/license); inspect and optimize selected models/textures rather than importing an entire catalog |
| [Blender scripting](https://docs.blender.org/manual/en/5.4/advanced/command_line/arguments.html) | Deterministic rack/cart/cable-box variants and export automation | Use a pinned installed Blender version; test the actual output and reimport |
| A licensed realistic commercial-interior/worker pack | Alternative if it saves substantial character/clothing or environment work | Validate a sample, animation compatibility, web distribution and public-repo restrictions before purchase; no paid pack qualified |

MPFB documents a GameEngine rig/material and export-copy workflow; its core
asset license is distinct from its software license. Specific clothes still
need their own provenance review.
[Export guidance](https://static.makehumancommunity.org/mpfb/docs/exporting/index.html),
[asset/software license distinction](https://static.makehumancommunity.org/about/license.html).
This is a candidate for a small import trial, not a promise of a finished
technician from the default generator settings.
Its official site reports that the legacy community forum/asset repository was
taken offline in October 2026, while static asset packs and GitHub remain online.
Do not base the pipeline on the old dynamic asset catalog; verify the needed
clothing/hair packages can actually be obtained during the trial.
[Current service notice](https://static.makehumancommunity.org/news/2026-10-21-community-site-shut-down.html).

Quaternius, Kenney and Synty's POLYGON packs were also considered. They can be
useful in other visual directions, but their simplified/stylized look should
not define this game's production visuals. Synty's
[Office Pack](https://syntystore.com/products/polygon-office-pack), for example,
is explicitly low-poly and has no included character animations. Its numerous
props do not outweigh the mismatch to the confirmed realistic/PBR direction.
Kenney's site was blocked by robots.txt; no pack was verified.

No paid asset pack or AI asset subscription is required for the initial
blockout. Evaluate any proposed purchase by how many needed assets it replaces,
its license and editability, and a sample import/animation test.

Adopt an asset contract before producing variants: metres, consistent axes,
applied transforms, floor-level origin for furniture, named interaction/socket
anchors, simple collision proxies, and a controlled material palette. A
0.5-metre placement grid is a useful starting convention, adjustable for AV
props. Old board coordinates are layout hints, not building measurements.

Keep metadata per imported pack/asset: source URL, license/attribution, source
version, edits, export settings and intended use. For licensed third-party
assets, verify permission for raw-source publication separately from use in the
game before adding source/GLB files to a public repository. Test normals, pivots,
dimensions, materials and animation in the browser, not only in Blender.

Use AI image/3D generators only for assets that beat an existing kit or a short
modeling script after cleanup. Assess topology, UVs, rigging, style, license and
total iteration time. No generator's output or cost was validated here.

## What the Codex/Claude community research contributes

Research used targeted public searches and opened relevant discussions in
`r/codex`, `r/ClaudeAI`, `r/ClaudeCode` and `r/ClaudeGameDev`. It was not an
exhaustive scrape or a statistically representative survey. Posts and replies
are experience reports; they do not establish engine rankings, reliable token
costs or production readiness.

| Discussion | Useful technique | What to avoid inferring |
| --- | --- | --- |
| [Codex + Blender/Godot room workflow](https://www.reddit.com/r/codex/comments/1wen17e/codex_with_blender_and_godot_mcp_is_amazing/) | Reusable metric props, procedural materials and GLB exports | Its overhead camera is not our selected camera; the claimed usage savings conflict with some replies |
| [ClaudeAI discussion about weak 3D results](https://www.reddit.com/r/ClaudeAI/comments/1unr6wb/how_are_you_guys_making_actually_good_3d_games/) | Coherent assets and art direction require deliberate selection and visual review | Adding more plugins or subscriptions does not establish better game visuals |
| [ClaudeCode long-running Godot project](https://www.reddit.com/r/ClaudeCode/comments/1xrkmte/15_weeks_of_making_game_with_claude_opus_in_godot/) | In-game performance logging, scene loading discipline, and bounded visual iteration | Reported speedups/costs are not benchmarks for this project |
| [Blender-to-Godot pipeline write-up](https://www.reddit.com/r/ClaudeGameDev/comments/1xvvkrb/i_packaged_my_whole_concept_art_blender_godot/) | A shared style brief, deterministic asset scripts, screenshot tours and one-location completion before expansion | The author reports low integrated-GPU FPS; procedural generation is not automatic production quality |

The last write-up links a real [pipeline repository](https://github.com/msveshnikov/claude-game-pipeline).
Its README was inspected; its skill was not installed, followed or executed.
Borrow the reproducibility and visual checks, rather than adopting its entire
tool stack or its all-procedural level authoring model.

[Blender MCP](https://github.com/ahujasid/mcp-for-blender) and
[Godot MCP](https://github.com/Coding-Solo/godot-mcp) are optional community tools.
They were researched, not installed or audited. Begin with normal source files,
CLI scripts and Playwright. Add an editor connector only when it demonstrably
removes a recurring authoring bottleneck. Do not make runtime/build success
depend on a particular assistant, chat history or MCP server.

For efficient AI-assisted implementation, give each change a small behavior
contract, relevant source/test references, a fixed scene to inspect and an exit
condition. Capture output and inspect it after each meaningful spatial change.
Stop visual iteration against a defined art brief rather than an unbounded
critic loop. The game runs locally with no model calls in its gameplay loop.

## Proposed code and state foundation

Add an isolated `game3d/` client first. Keep the current browser build available
as the gameplay reference during migration. Suggested ownership:

```text
game3d/
  src/domain/       career, inventory, task/dispatch rules, seeded outcomes
  src/content/      ID-based job/character/tool definitions and validation
  src/world/        authored area layouts, spawn and interaction anchors
  src/render/       Babylon scene, materials, lighting, asset lifecycle
  src/player/       input, movement adapter, camera, animation
  src/ui/           DOM HUD, dialogue, job/route panels
  src/persistence/  versioned save/import adapters
  public/assets/    optimized GLBs, textures, audio, source/license manifest
```

Use pure JS/TS domain functions where practical. A task command should resolve
against career state and produce state changes/events. The UI presents the
result; scene nodes do not award money or decide reputation themselves.
Translate existing callback-based interaction actions into stable action IDs.

An interaction pipeline should select nearby candidates, apply task priority,
check distance and line of sight, present a prompt, then dispatch an action.
Completed tasks must reopen review without repeating rewards. Input focus and
modal state must pause movement and suppress camera drag; blur must clear held
keys. These are current browser behaviors/contracts worth carrying forward.

Update HUD elements from changed state instead of rebuilding them every frame.
Load one compact area at a time, dispose old resources and retain asset caches
only intentionally. Use one shared rig and instancing/material reuse where
measured. Avoid adding React, an ECS framework, a general quest editor or a
network backend until the first slice demonstrates the need.

The van initially remains logical cargo with visible carried/loaded props and
a route interface. Do not put every box into a free physics pile. Route travel
can still transition between compact 3D areas. Manual driving is a later
feature with its own controller/performance scope.

### Save continuity

Keep the existing key and version-30 migrations intact while the 3D client is
separate. Use a distinct, versioned 3D save format during development. Preserve
stable technician/tool/job/area IDs, task outcomes, flags and consequences.
Save area/spawn IDs and validated 3D transforms, not DOM pixels or mesh indices.

Before replacing the hosted career client, implement export/import for legacy
careers and test representative tutorial, service, survey and completed states.
A desktop application or a different website origin cannot automatically read
the old site's localStorage. Old 2D coordinates need explicit safe-spawn mapping.
Unknown IDs/versions need a readable error or supported migration, never a
silent career reset. Test interrupted saves, duplicate rewards and corrupt data.

Our Godot experiment also exposed numeric normalization requirements: JSON
numbers become floats there, so typed save fields need explicit validation and
conversion. Neither probe runs the complete existing save migration in a new
engine; current migration is only covered by the existing JS suite.

## Implementation sequence and exit conditions

Each step should produce something reviewable in the browser. These are ordered
deliverables, not calendar estimates or a requirement to finish the RPG first.

1. **Boot the real 3D client.** Pin Babylon core/loaders, TypeScript and Vite;
   add a lockfile, dev/build/preview commands and browser CI. Build a static
   artifact that works at the GitHub Pages repository subpath. Host it alongside
   the legacy prototype. Exit: clean checkout to local and hosted 3D client,
   with no floating CDN dependency or console/network errors.
2. **Prove and visually qualify the third-person shop.** Begin with an authored
   layout, then dress the shop with realistic/PBR assets and a naturally
   proportioned, clothed and animated human technician before acceptance.
   Include camera-relative movement, orbit/zoom, camera obstruction, doorway/ramp/step
   checks and focus/modal handling. Compare built-in vs Havok movement here.
   Exit: normal keyboard/mouse play stays controllable around shelves, the van
   and door corners; the human, animation, materials, furnishings and lighting
   meet the visual bar above in-browser. A blockout alone cannot close this step.
3. **Make shop work physical.** Reuse supervisor briefing, screwdriver, staged
   boxes, carry/capacity state and Van #3 loading. Drive prompts from task state
   and show held/loaded props. Exit: a new player can load the van through
   ordinary movement/interactions, then save/reload without duplicated items.
4. **Complete one workday in 3D.** Route-card transition to garage/lobby/job room,
   build the two carts, close out, return and recover. Reuse the existing rules;
   add no jobs. Exit: the complete tutorial loop works in the hosted 3D client,
   with task/reward/save parity at named checkpoints.
5. **Test the RPG under the new presentation.** Port Conshohocken next to prove
   evidence, different technician methods, verification and callback debt remain
   legible through spatial interactions. Exit: the existing distinct replay
   examples remain possible and save-safe, and a first-time observer understands
   where to go and why choices matter.
6. **Qualify cutover.** Asset/license review, save transfer, target-device
   performance, browser matrix and deployment rollback. Switch the default play
   link only after these pass. Keep the old prototype reachable as appropriate.

Do not port all twelve maps before Step 4. Do not build a city, manual driving,
full character customization or cable simulation to prove this foundation.

## QA performed in this assessment

| Check | Result | Boundary |
| --- | --- | --- |
| Existing static QA | PASS: 43 ordered scripts, syntax and organization guards | Checks current browser code only |
| Existing unit/contract QA | PASS: 43 checks | Includes saves, routes, board planning, tasks, standing, diagnostic evidence and consequence behavior |
| Existing browser smoke QA | PASS | Roster/custom creator, layout, route/van/map, task choices, replay/checkpoints and save/continue; many scenarios use injected state |
| Additional browser exploration | PASS | Normal keyboard movement changed x=120 to x=240; a workbench blocked x at 258; E opened supervisor dialogue; movement paused in the modal |
| Existing UI inspection | Shop screenshot inspected at 1366 × 900 | Confirms the observed 2D board; does not establish first-time comprehension |
| Babylon 9.37.1 browser probe | PASS | Real WebGL 2 rendering, content access, GLB scale, keyboard movement/collision, camera following/orbit, picking rays, resize and reload persistence |
| Babylon visual inspection | Placeholder shop screenshot inspected | A greybox capability scene; no production art, rig or animation acceptance |
| Godot 4.7.2 headless probe | PASS: 8 checks | Content JSON counts/round trip, GLB import/scale, capsule/workbench collision, blocked/clear rays, sample disk save/load |

Full existing QA initially could not find Playwright. Setting `NODE_PATH` to
the already bundled runtime resolved it; no repo dependency install or test
skip was needed. Existing browser smoke completed with zero recorded errors.

The Babylon probe uses fixed-version full UMD bundles with SHA-256 verification,
serves them locally and runs in a separate Playwright context. The complete
bundles total about 9.8 MB **uncompressed**. That is an experiment cost, not a
production load budget; ES modules and a bundler need their own size measurement.
No third-party game/asset plugins were installed.

The portable Godot archive was obtained from the official release and matched
its published SHA-512. Tested binary: `4.7.2.stable.official.ed1daf0bf`. It was
extracted under the temporary directory, not installed system-wide. Both probes
write their fixtures/results to temporary directories; they do not alter the
browser game's saves.

Browser rendering used ANGLE/SwiftShader, a software GPU. This establishes that
the test rendered and ran; it says nothing reliable about target-player FPS.
No Godot rendered view, web export or packaged build was tested. No controlled
engine performance comparison, Blender export, humanoid rig/retarget, Havok
controller, production asset kit or live hosted 3D game was qualified.

### Reproduce the probes

Run the existing full suite with Playwright resolvable, as documented in README:

```powershell
node scripts/qa-all.js
node scripts/probe-babylon.js
node scripts/probe-godot.js --godot "C:\path\to\Godot_v4.7.2-stable_win64_console.exe"
```

The Babylon probe needs network access to retrieve its two pinned JS bundles
and Playwright with a usable Chrome/Chromium executable. `NODE_PATH` can locate
an external Playwright install; `CHROME_EXECUTABLE_PATH` can select the browser.
The Godot probe requires an independently obtained 4.7.2 stable executable or
`GODOT_BIN`. These optional experiments are not added to ordinary fast CI.

Preserved browser evidence: [third-person greybox](qa/3d-feasibility-20261121/babylon-third-person.png)
and [probe result](qa/3d-feasibility-20261121/babylon-result.json).

## Remaining foundation gates

Before broader production content, prove the following on the actual built and
hosted slice, with a declared lowest-spec target machine:

- 60 FPS is the initial desktop-browser target; measure frame-time percentiles,
  startup, shader/asset stalls, memory, draw calls and transfer size. These are
  proposed goals, not measured achievements. Set final budgets after the shop
  and one client room are profiled on real hardware.
- Test Chrome/Edge and Firefox, including WebGL context loss/recovery. Establish
  Safari support expectations with actual Safari testing; do not infer it from
  Chromium. Use WebGL 2 as the initial renderer baseline; qualify WebGPU later
  if it gives a demonstrated benefit. Show a useful unsupported-device message.
- Check camera clipping, near-wall rotation, zoom, doorway transitions,
  movement at different refresh rates, diagonal speed, slopes/steps, blur and
  UI focus. Include keyboard rebinding, camera sensitivity and reduced motion.
- Import a real character and at least one real kit prop, not just the generated
  cube. Inspect silhouette, scale, normals, foot contact, carry clips and scene
  readability from the following camera.
- Test ordinary player input through the full workday, complementing injected
  state tests. Run an observed first-time playtest for navigation and the RPG
  tradeoffs. Passing scripted checks is not evidence of fun or comprehension.
- Extract only needed rules, with checkpoint comparisons for inventory,
  energy/cash/XP, route gates and idempotent rewards. Test legacy import before
  changing the main play link.
- Build/deploy from a clean checkout with self-hosted runtime assets, correct
  subpath URLs, asset caching/versioning and a rollback to the previous artifact.

If Babylon room authoring becomes the dominant cost, compare one identical room
in PlayCanvas and Godot before expanding. Preserve the GLBs, stable content IDs
and rule fixtures so that this remains a bounded decision rather than a second
full rewrite.
