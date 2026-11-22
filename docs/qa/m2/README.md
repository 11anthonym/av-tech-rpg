# M2 / P0.4-A — character and first shop art

Issue: [#3](https://github.com/11anthonym/av-tech-rpg/issues/3).
Branch `codex/m2-character-shop-spike` starts at M1
`a32f209c327d6c6d6b382c2492798fb58ab21deb` and targets
`codex/m1-production-3d-client`. PR #2 remains unmerged. No deployment or
deployment-policy changes are part of this work.

## Implemented

The existing Babylon client loads Rocketbox Andre, converted by Avatar Studio
and adapted reproducibly into a 1.78m clothed adult technician. Five skinned
meshes share 80 joints. Face, skin, clothing folds and shoes use actual textured
geometry. The collision capsule remains independent and hidden. Missing rig or
clips produce a recoverable error; there is no visible proxy substitution.

Native Idle/Walk crossfade over roughly 0.25s. World speed is 1.4m/s; cadence
uses actual collision-resolved travel and source stride length. Horizontal root
travel is removed. Heading changes are bounded to 8rad/s. Blocked movement
blends to idle; pause and hidden tabs suspend animation. Movement turns use
smooth heading and the walk clip, not a separately sourced turn-in-place clip.

Original PBR shop art includes the service bench with receiver, laptop and
patch lead; 19-inch racks with rails/ports/status indicators; staging shelves
and taped cartons; dispatch counter; concrete, masonry and industrial fittings;
and Van #3 with shaped cab/body, glazing, tyres/hubs, bumpers, door hardware,
labels and loading-lane markings. Geometry is baked by material. M1 collision
envelopes and bench action remain; the rear racks gain one broad collider.
No tool, carry, loading, driving or career gameplay is added.

## Rights and reproduction

The shipping [asset notice](../../../game3d/public/assets/ASSET_LICENSES.md)
links exact grants, sources, attribution and full license copies.
[Character build](character-build.json) and [lighting build](lighting-build.json)
pin original/runtime hashes and record transformations.

| Asset | Original bytes | Runtime bytes |
| --- | ---: | ---: |
| Andre GLB | 12,701,036 | 1,493,336 |
| Studio Small 09 HDR | 1,615,248 | 66,132, prefiltered `.env` |
| Engineering toolcase | 768 | unchanged |

The human embeds 11 1K WebP images (quality 90), reduced from 11 2K source maps.
Their RGBA8-with-mips estimate drops from 235 MiB to 58.7 MiB; this estimates
texture storage, not measured GPU allocation or total process memory.
Source validation had 22 warnings for missing
tangents and non-root skinned nodes; processed validation has **zero errors and
zero warnings**. MikkTSpace needed normal-orthogonal tangent fallbacks at two
degenerate vertices. No runtime decoder download is needed.

From `game3d`, install with `pnpm install --frozen-lockfile`. Rebuild character:
`node scripts/prepare-technician.mjs [optional-original-glb]`; the source SHA-256
is checked first. To rebuild lighting, start `pnpm dev`, then run
`node scripts/bake-lighting.mjs` in another terminal. A lighting rebake may
differ between graphics implementations; record/review its new hash. Normal
installs/builds neither fetch nor regenerate art.

## Verification and visual acceptance

The eight existing domain tests and production Firefox keyboard/mouse flow
passed during integration. The two added artifact/validation checks pass.
Final full-suite results, browser screenshots, footage and measurements are
recorded below after capture. Tests do not establish owner visual acceptance.

## Known limits

- Source Idle/Walk are genuine; carrying, tool interaction and turn-in-place
  clips are absent. Workbench inspection still uses the M1 UI action.
- Footwear is ordinary dark source shoes, not modeled safety boots or certified
  PPE. Uniform branding, tool belt, grasping hands and facial animation are absent.
- No foot IK, stair/slope solver or hand collision exists. This is a flat-floor
  qualification. Tight pivots can slide feet; arms can intersect equipment at
  the fixed capsule boundary. Clip coverage and owner motion review remain open.
- Shop kit is generic procedural art. The van is an exterior with opaque
  glazing, a broad collider and closed doors; cargo interior, suspension,
  steering and loading animation are absent. The roof is open for camera
  visibility. Surface maps are modest procedural textures, not scan assets.
- Camera obstruction remains M1's single ray. Sphere sweeping and automatic
  human fade are unqualified; van/shelving corners need owner review.
- Automated software WebGL is functional evidence, not real-GPU FPS acceptance.
  Hosted load timing, Safari, mobile/touch and integrated-GPU performance remain
  unqualified. M2 awaits owner review of the moving character and furnished shop.

Next smallest art task: review this browser scene, then source/author matching
work boots and in-place turning before carry/interact clips. Keep M3 deferred.
