# AV Tech RPG — production 3D client

The M1 engineering foundation now has an M2 art trial: a realistic clothed,
rigged human with native idle/walk clips and a furnished PBR AV shop/Van #3.
Third-person input, camera, the workbench interaction and isolated 3D saves
remain. The hidden capsule owns collision; the visible human is an independent
adapter. M2 visual quality remains awaiting human review.

M3 adds the first playable preparation loop: talk to the supervisor at dispatch,
pick up one staged group, carry it to Van #3's open rear, and load all three.
The starter Alex profile already owns a screwdriver. Carrying costs 2 energy per
pickup and uses the prototype's 7/8 movement ratio. The objective, hand capacity,
cargo count and kit stay visible. See [M3 evidence](../docs/qa/m3/README.md).

See [M2 evidence and limitations](../docs/qa/m2/README.md) and the shipping
[asset rights/provenance](public/assets/ASSET_LICENSES.md). Committed assets are
self-contained; normal installation/build does not download or regenerate art.

## Setup and commands

Use Node **24.x** and **pnpm 11.25.0**. All direct package versions and the pnpm
lockfile are committed. If needed, install that pnpm version with your Node
installation's package manager, for example `npm install --global pnpm@11.25.0`.
Run from `game3d/`:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:5173/av-tech-rpg/3d/`. Use WASD/arrows to walk, drag on
the scene to orbit, wheel to zoom, and E or the prompt button to inspect/review
the workbench. Pause/settings suspends movement and camera controls. Diagnostics
are off by default; enable them in settings or append `?debug=1`.

| Command | Purpose |
| --- | --- |
| `pnpm typecheck` | Strict TypeScript checks, including tests/config |
| `pnpm test` | Domain/save contracts plus asset hashes, rig inventory and glTF validation |
| `pnpm build` | Typecheck and produce the static `dist/` client |
| `pnpm build:portable` | Produce `dist-portable/` with root `/` asset URLs for independent hosting |
| `pnpm preview` | Serve that production build at `http://127.0.0.1:4173/av-tech-rpg/3d/` |
| `pnpm exec playwright install chromium firefox` | Install local test browsers and recording support |
| `pnpm test:browser` | Test the staged production artifact in Chromium and Firefox |
| `pnpm check` | Unit tests, production build, browser tests |

Browser tests need both builds. They stage the combined site and start/stop
their own server at port 4174, under the real `/av-tech-rpg/3d/` prefix, plus
a root-build server at port 4175. A separate
run can target `--project=chromium` or `--project=firefox`. Playwright's matching
browsers are the default; `CHROME_EXECUTABLE_PATH` optionally selects an installed
Chrome. CI installs Playwright's browsers. Software-GPU results are functional evidence, not player
performance measurements. Safari, mobile and controller support are not claimed.

Linux Firefox uses a virtual display for WebGL: run the suite with
`xvfb-run --auto-servernum pnpm test:browser` after installing Playwright's Linux
dependencies. CI provides that display and Mesa software rendering.

`PLAYWRIGHT_BASE_URL` can point repository-path checks at a deployed client;
`PLAYWRIGHT_PORTABLE_URL` selects an independent root preview. Browser artifact
paths are under `test-results/` and `playwright-report/`; CI preserves
screenshots, failure traces and reports. `RECORD_VIDEO=1` enables motion capture;
it is opt-in because software-GPU recording can add substantial overhead.

For the combined local Pages preview, run from the repository root after building:

```powershell
node scripts/build-pages.mjs
node scripts/serve-pages.mjs --port 4174
```

This serves both the unchanged legacy game at `/av-tech-rpg/` and the new client
at `/av-tech-rpg/3d/`. The Vite-only preview does not serve the legacy root.

## Ownership and migration boundary

| Directory/module | Responsibility |
| --- | --- |
| `src/app.ts`, `src/main.ts` | Startup, lifetime, domain/UI/render coordination, error and context handling |
| `src/domain/` | Pure session transitions and structured action outcomes; repeat actions become reviews |
| `src/content/` | Small typed bridge to stable legacy IDs and action definitions |
| `src/world/` | Authored metric scene recipe, spawn validation, interaction anchors/priority/ray visibility |
| `src/render/` | Engine/scene, area views and owned GLB containers |
| `src/player/` | Input ownership, fixed-step flat-plane controller, follow/orbit/obstruction camera, replaceable visual adapter |
| `src/ui/` | DOM HUD, accessible controls, pause/results, optional diagnostics and error recovery |
| `src/persistence/` | Version-2 shop saves, read-only v1 migration, preferences and storage-failure handling |
| `public/assets/` | Licensed human, prefiltered lighting, engineering fixture and shipping rights notices |

The view never awards progress. It maps an authored anchor to a stable action
ID; the domain resolves that action and returns an event. The application owns
the session, passes changes to UI and saves them. There is no complete career
port, hidden runtime model API or dependency on the old shared globals.

Collision is independent of visible geometry. `TechnicianVisual` is the seam
for the human model and animation adapter. `loadModel` owns GLB container
creation/disposal. The loader registers glTF 2 and the human's embedded WebP
extension. No external decoder or model CDN is needed. The supervisor clones
the same source rig with shared textures. The carry hold is original procedural
two-bone posing layered over native Idle/Walk, not a native carry clip.

Movement runs in fixed 1/60-second steps, caps catch-up after a stall and
normalizes diagonal input. It is a **flat-floor controller**, with no gravity,
stairs or jumping. The camera conservatively sweeps an 18cm volume against
authored boxes, retracts immediately, eases recovery and fades the near avatar.
The scene updates highlights/prompts at 10 Hz, while rendering and movement
remain independent of DOM refresh. Resizing, blur, form focus, pointer capture,
modal pause, HMR disposal and browser graphics-context interruption have owners.

## Save safety

M3 writes `av-tech-rpg-3d-dev-v2`. It copies supported older 3D progress from
`av-tech-rpg-3d-dev-v1` without modifying that key, so an older M2 tab cannot
overwrite M3 cargo. It never accesses the legacy career `av-tech-rpg-save-v1`.
Cargo, tools, briefing, energy, position and camera save after every action,
periodically and on page hide/blur. A stale M3 tab detects another tab's write
and refuses to replace it; reload to use newer progress. This optimistic check
is not a cross-tab transaction lock; use one active gameplay tab.

Invalid/unknown 3D saves are retained; that tab plays without writing them.
Denied storage is nonfatal. Out-of-bounds/inside-obstacle positions use the
authored shop spawn. Legacy career import is deferred to its explicit later
ticket. There is no silent import or career reset.

## Deployment and rollback

The default Pages build base is explicitly `/av-tech-rpg/3d/`. The portable
build uses `/` and is separately tested for JS/CSS/GLB resolution. Runtime assets are local
and hashed build chunks; no floating runtime CDN is needed. `build-pages.mjs`
copies an allowlist of legacy `index.html`, `styles.css` and `src/` byte-for-byte
to `.pages/`, then adds `game3d/dist/` as `3d/`. It excludes dependencies,
tooling and source maps. The browser suite checks the assembled root and subpath
and checks that a missing asset returns 404 rather than an HTML fallback.

The existing QA workflow keeps legacy static/unit QA and adds the 3D build and
browser suite. The Pages workflow builds/verifies/stages before uploading that
combined artifact. Deployment runs only on `main`; the existing `github-pages`
environment currently also permits only `main`. A development PR therefore
produces reviewable build/browser artifacts, not a live production preview.
No environment protections are relaxed and no PR is automatically merged.

After merge and a successful Pages run, the intended URL is
`https://11anthonym.github.io/av-tech-rpg/3d/`. Until a live deployment is checked,
that is an intended URL, not verified hosted acceptance. The existing career
stays at `https://11anthonym.github.io/av-tech-rpg/`.

Rollback by redeploying the prior known-good Pages artifact/commit. The build
never replaces the legacy root with Vite's entry point. New 3D saves remain in
their separate namespace if the 3D route is removed or rolled back.

## Qualification and next task

See [M1 evidence and remaining gates](../docs/qa/M1_PRODUCTION_3D.md) for executed
checks and current deployment status. The [production roadmap](../docs/PRODUCTION_ROADMAP.md)
remains authoritative.

M2's first implementation is tracked in [Issue #3](https://github.com/11anthonym/av-tech-rpg/issues/3).
Native Idle/Walk and the procedural carry hold are integrated. Native pickup,
place, tool and turn-in-place clips, work boots, slope/stair qualification and
real-GPU acceptance remain open. M3 ends at a loaded, ready van. Next is M4:
route, garage/lobby access, two-cart assembly, closeout choice and return/recovery.
