# Visual Asset Pipeline — Character, Shop and GLB Qualification

**Research:** 11/22/2026. **Status:** Authoring and acceptance specification for M2, **not** evidence that these production assets exist.  
**Prerequisites:** M1 `game3d/` browser build. See [3D Foundation Assessment](3D_FOUNDATION_ASSESSMENT.md) and [Production Roadmap](PRODUCTION_ROADMAP.md).

## Direction and asset selection order

The product needs a believable **adult commercial AV installation technician** in a believable **small AV integration shop**, in normal third-person gameplay. We should spend effort on a small coherent kit rather than a large assortment of unmatched or procedural assets.

**Asset priority:** (1) character anatomy/face/clothes/hair/boots, (2) reusable rig and locomotion/idle/carry/interact motion, (3) scale-correct furnished shop, (4) recognizable AV-specific props, (5) materials/lighting/audio finish, (6) optimization. Optimize iteratively rather than waiting for all content, but do not ship a caricature merely because it is fast.

**First qualification package:** One technician, neutral/idle, walk, turn, one-hand interaction, two-hand carrying, sturdy work boots; one workbench, metal shelf, laptop/dispatch area, AV rack, video cart, boxes, cable spool, display and believable Van #3 loading interface. This is the minimum coherent set to review from the follow camera.

A procedural asset generator is useful for *dimensionally consistent* racks, equipment boxes and carts, but not a substitute for a proven human character/animation pipeline. A generated **2D concept image** does not become a game-ready 3D model.

## Candidate sources and rights

| Resource | Intended trial | What the source actually establishes | Qualification |
| --- | --- | --- | --- |
| [Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) | Humanoid auto-rig and common idle/walk clips | Adobe says characters/animations can be used royalty-free in commercial video games, free with Adobe ID. Humanoid rigs require a neutral pose and clean centered geometry. | Adobe's FAQ alone does **not** establish that independent character clothing or source files can be copied to a public GitHub repo; review additional terms before redistributing editable raw animation/character source. Test imported GLB and full carry pose. |
| [MakeHuman/MPFB](https://static.makehumancommunity.org/mpfb/docs/exporting/index.html) | Natural-proportioned game humanoid and editable clothing | Existing feasibility assessment identifies game-rig/export documentation and a licensing distinction between core data and third-party clothes | Verify actual obtainable assets, license of **each** clothing/hair item, export/retarget and mobile-web triangle budget. Source catalog availability is not assumed. |
| [Poly Haven assets and license](https://polyhaven.com/license) | HDRI and PBR materials, workshop fixtures | Poly Haven expressly marks its downloadable HDRIs/textures/models CC0 and allows commercial redistribution | Inspect exact item/texture quality and simplify for runtime. Site logos/screenshots are not themselves automatically CC0. |
| [Khronos glTF sample models](https://github.com/KhronosGroup/glTF-Sample-Assets) | Browser import regression fixtures | Reference cases for spec and rendering correctness, **not** a license grant for every model on the internet | Check per-model license before redistribution and choose an appropriately sized subset. |
| [glTF-Transform](https://gltf-transform.dev/cli) | Repeatable inspection, deduplication and compression | Tool supports inspect/validate/optimize, Meshopt, Draco and KTX2/WebP conversions | Check processed character animations, interactive mesh hierarchy and compression decoder support in Babylon and all target browsers. |
| [glTF Validator](https://github.com/KhronosGroup/glTF-Validator) | Automated structural checks on GLB/GLTF | Open-source Khronos validator checks file/schema/indices/accessors and emits machine-readable reports | Failing errors block import; warnings reviewed, not automatically waived. Rendered appearance still needs manual acceptance. |

No specific source model or paid kit has been licensed and accepted by this document. Do not infer "free to use in a game" means "all editable source may be redistributed publicly" for proprietary marketplaces.

## Suggested authoring/import contract

1. **Keep editable source separate from runtime assets.** `art/source/` for owned/redistributable Blender inputs, `game3d/public/assets/` for approved optimized runtime GLBs/textures/sound. For assets whose rights prohibit source redistribution, document a reproducible acquisition/export recipe without committing restricted source. Never rely on a remote CDN or third-party authentication at runtime.
2. **Use real-world units deliberately.** Define one gameplay world-unit = one meter as a project convention; declare player height, camera distance, door clearance, cart width, shelf height and reach radius in a single configurable scale sheet. Actual measurements must be validated in the engine; do not confuse Blender units, GLB scale and Babylon transform/axis adaptation.
3. **Keep a stable, discoverable hierarchy.** Named rig root, animation groups, visible mesh root, optional carry-hand attachment nodes and separate collision/interaction anchors. Do not persist mesh indices or derive gameplay action IDs from asset names. Preserve pivots/transform nodes needed by interactions.
4. **Export animation intentionally.** Current Blender glTF documentation says object transforms, skeletal pose bones and shape keys export; material, light and arbitrary physics animation do not. Actions need correct export mode/active or stashed/NLA status. Check every requested clip is actually present in output. [Blender glTF docs](https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html).
5. **Validate before optimizing.** Run Khronos glTF Validator and `gltf-transform inspect` on the original export. Record meshes/materials/textures/animations/file sizes. Correct missing bind data, bad normals, axis, non-uniform scale or absent animation before introducing compression.
6. **Optimize copies, never overwrite sole source.** First test a simple `gltf-transform optimize` copy and **compare** fidelity/import. Meshopt/Draco may require decoders and can alter load behavior. Automatic flatten/join/prune can affect node names and interaction targets; avoid or configure on assets with semantic attachments. Use KTX2 compressed textures when measured GPU memory/upload gains justify extra tooling/decoders. Lowering transfer size does not always lower VRAM. [Official CLI](https://gltf-transform.dev/cli).
7. **Test in Babylon at the intended camera.** Load with `@babylonjs/loaders`, list actual animation groups, transition idle/walk/carry, stop and restart, clip at door/van, show hands interacting with props, check foot-ground alignment and collisions. Run after production optimization as well, not just in Blender. [Babylon character animation](https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter).
8. **Measure real budget.** Log transfer size, decompression/loading delays, GPU memory proxy if obtainable, draw calls, frame-time p50/p95/p99, shader stalls and first-interactive time; declare browser/GPU/viewport/device. Establish acceptable thresholds from an actual shop scene on owner-selected baseline hardware before enforcing numeric CI limits. 60 FPS is an aspirational target, **not an observed property**.
9. **Publish license evidence.** Every asset must have creator/source URL, downloaded version/date, license URL/text or receipt, modification status, and whether public redistribution of *runtime file* and *editable source* is permitted. Store in a machine-readable manifest once a real asset is selected.
10. **Review the actual feel.** Take one browser screenshot from normal follow-camera position, one close-up and a 15–30 second walking/carrying clip. A still picture cannot establish rig quality or movement. Check visual cohesion and readable interactive props under normal gameplay lighting.

## Proposed minimal manifest schema (illustrative only)

Do **not** mark fictional entries as acquired. These are suggested fields for actual `assets.manifest.json` records:

- `id`: stable project asset identifier; independent of filenames/mesh hierarchy.
- `kind`: `human`, `animation`, `prop`, `environment`, `texture`, `audio`.
- `sourceUrl`, `creator`, `acquiredOn`, `sourceVersion`.
- `licenseName`, `licenseUrl`, `redistributableRuntime`, `redistributableEditableSource`, `attributionRequired`, `evidencePath`.
- `originalSourcePath` (where allowed), `runtimePath`, `sourceChecksum`, `runtimeChecksum`, `blenderVersion`, `exportOptions`, `optimizationCommand`.
- `unitsPerMeter`, `boundsMeters`, `rigId`, `animationNames`, `semanticNodes`, `textureDimensions`.
- `validatedGlTF`, `importSmokeTest`, `artReview`, `knownIssues`.

Separate **asset acquisition** from **asset acceptance** in status fields. A working GLB import does not mean the character or workplace meets the game's art direction.

## Suggested two-trial decision gate

Before producing many assets, run exactly two bounded proofs:

**Trial A — human pipeline:** Take one legally usable natural human model, get four clips (idle, walk, carry, interact) into an optimized GLB, play them in the production Babylon app with movement/camera, review hands/feet and inspect exported file sizes, rights and normal-camera appearance. If unsuccessful, change the character sourcing/retargeting workflow; do **not** expand jobs.

**Trial B — shop environment:** Import one coherent workbench/shelf set, one licensed material/HDRI, one recognizable AV rack/cart. Check scene scale and lighting, pick/collision anchors, transfer/cold load and normal-camera readability. If assets look incongruent or material cost is high, revise the kit before producing a whole city.

These trials can happen alongside M1 engineering work; M2 remains **not complete** until both actual playable-art reviews pass. The owner must explicitly accept real in-browser motion and environment presentation.

## Safety of visual automation

Screenshots are evidence of **what rendered**, not proof of **aesthetic acceptability**. Playwright pixel snapshots can vary with browser, OS, GPU and software rendering; use stable CI baselines for regressions but retain manual art review. [Playwright visual comparison guidance](https://playwright.dev/docs/test-snapshots).

Do not import copyrighted manufacturer model labels, customer floor plans, branding or sensitive onsite photographs into the public game without rights. Fictional AV objects should be recognizable by function, not by unauthorized logos.

## Primary sources checked

- https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html
- https://polyhaven.com/license
- https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html
- https://github.com/KhronosGroup/glTF-Validator
- https://gltf-transform.dev/cli
- https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter
- https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene/

**Next action:** With the M1 game scaffold working, have the implementation agent make a **single imported rigged character** visible under normal play, record the exact asset source/rights and prove animation clips before spending effort on a whole job or sprawling map.
