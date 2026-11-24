# Runtime asset rights

## technician.glb — Andre / work tee derivative

Source: [Avatar Studio](https://github.com/memoriesrohit/avatar-studio), revision
`2fd9ec82fbe1613d40ae38aadcca3f410725f740`, `models/andre_casual.glb`.
Its [third-party notice](https://github.com/memoriesrohit/avatar-studio/blob/2fd9ec82fbe1613d40ae38aadcca3f410725f740/THIRD_PARTY_NOTICES.md)
explicitly covers the models **and native Rocketbox animations** under the
[Microsoft Rocketbox MIT license](https://github.com/microsoft/Microsoft-Rocketbox/blob/master/LICENSE.md),
copyright Microsoft Corporation 2020. MIT permits modification and public
redistribution, including browser delivery, with the copyright/license notice.
Avatar Studio's code is MIT, copyright Rohit Biradar 2026; that notice is also
included for completeness. No studio application code or Mixamo library clips
are included. Inherited `mixamorig:` joint names do not represent a separate
animation acquisition.

Full notices: [Rocketbox](licenses/ROCKETBOX.md),
[Avatar Studio](licenses/AVATAR_STUDIO.txt).

Modifications: select tee/trousers/shoes; tint clothing; remove unused garments,
morphs and clips; keep Idle/Walk; remove horizontal Walk hip travel; flatten
identity skinned-mesh parenting; resample/deduplicate; resize embedded WebP maps
from 2K to 1K at quality 90; generate MikkTSpace
tangents. Two degenerate tangent vectors receive normal-orthogonal fallbacks.
Face, body proportions, skin, rig and gait remain derived source work.
The reproducible conversion and original/runtime hashes are recorded in
`game3d/scripts/prepare-technician.mjs` and `docs/qa/m2/character-build.json`.
The original is fetched on demand, avoiding a duplicate raw asset in Git.

## shop-lighting.env — Studio Small 09

Source: [Studio Small 09](https://polyhaven.com/a/studio_small_09),
Sergej Majboroda / Poly Haven. The 1K HDR becomes a 64px prefiltered Babylon
environment with embedded RGBD PNG mip levels. Poly Haven grants
[CC0](https://polyhaven.com/license), expressly allowing redistribution and
commercial use. Full [CC0 1.0 legal text](licenses/CC0-1.0.txt) is included.
Hashes: `docs/qa/m2/lighting-build.json`. Reproduction:
`game3d/scripts/bake-lighting.mjs` (Firefox WebGL build tool).
The game loads only the local prefiltered file, without runtime HDR processing.

## Original shop art and M1 fixture

`game3d/src/render/shop-art.ts` generates original parameterized geometry,
signage and seeded canvas surface maps for the bench, rack units, shelves,
cartons, dispatch counter, fixtures and Van #3. No vendor logos, paid packs,
image-generation service or third-party shop meshes/textures are included.
These additions do not grant a blanket license to the existing project;
the third-party asset grants above remain applicable.

M3 also reuses the same licensed human for the supervisor (shared materials and
textures, separately cloned skeleton). Labelled cargo packaging, open rear-door
lining and the two-bone carry hold solver are original project code. The hold
pose is layered onto native Idle/Walk; no native carry/pickup/tool clip is claimed.
`engineering-toolcase.glb` is the original M1 engineering import fixture,
retained on the bench and in its load-failure test, not sourced production kit.

Rights verified 2026-11-22. These notices ship with both build variants.
M4-A reuses that same van geometry through `game3d/src/render/van.ts` and the
same licensed technician, supervisor and lighting. Garage, security lobby and
client-room furniture/signage in `game3d/src/render/field-art.ts` are original
repository-authored geometry and text. No new external art, texture, animation
or license grant was added. Existing third-party notices remain applicable.
M4-B's switchable cart frames, mounted displays, cable dressing and carried
component packaging in `src/render/workday-view.ts` are original geometry;
they introduce no external models, images, animation clips or new licenses.
No external model, texture or decoder request occurs during normal gameplay.
Development dependency licenses reside in their packages; glTF Transform and
MikkTSpace run only during conversion.
