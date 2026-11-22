# AV Tech RPG — production 3D client

M1 is the engineering foundation for the browser game. It contains a shop
qualification scene, third-person movement/camera, one workbench interaction
and isolated 3D persistence. The capsule, room blocks and imported toolcase cube
are engineering proxies. They do not pass the realistic/PBR art gate in M2.

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
| `pnpm test` | Native Node deterministic domain, ID, movement and save contracts |
| `pnpm build` | Typecheck and produce the static `dist/` client |
| `pnpm preview` | Serve that production build at `http://127.0.0.1:4173/av-tech-rpg/3d/` |
| `pnpm exec playwright install chromium firefox` | Install local test browsers and recording support |
| `pnpm test:browser` | Test the staged production artifact in Chromium and Firefox |
| `pnpm check` | Unit tests, production build, browser tests |

Browser tests need a built `dist/`. They stage the combined site and start/stop
their own server at port 4174, under the real `/av-tech-rpg/3d/` prefix. A separate
run can target `--project=chromium` or `--project=firefox`. Playwright's matching
browsers are the default; `CHROME_EXECUTABLE_PATH` optionally selects an installed
Chrome. CI installs Playwright's browsers. Software-GPU results are functional evidence, not player
performance measurements. Safari, mobile and controller support are not claimed.

`PLAYWRIGHT_BASE_URL` can point the same checks at a deployed client after
release. Browser artifact paths are under `test-results/` and
`playwright-report/`; CI preserves screenshots, traces, videos and reports.

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
| `src/persistence/` | Validated version-1 save format, safe spawn and storage-failure handling |
| `public/assets/` | Original engineering GLB and provenance manifest; M2 production assets replace these |

The view never awards progress. It maps an authored anchor to a stable action
ID; the domain resolves that action and returns an event. The application owns
the session, passes changes to UI and saves them. There is no complete career
port, hidden runtime model API or dependency on the old shared globals.

Collision is independent of visible geometry. `TechnicianVisual` is the seam
for the future human model and animation adapter. `loadModel` owns GLB container
creation/disposal. The current loader registers glTF 2 only; accepted M2 assets
that need compressed/advanced extensions must register and self-host the
required decoders deliberately.

Movement runs in fixed 1/60-second steps, caps catch-up after a stall and
normalizes diagonal input. It is a **flat-floor controller**, with no gravity,
stairs or jumping. The camera uses an obstruction ray and a 0.25-metre margin;
a swept camera volume and tight-corner feel still need M2 qualification.
The scene updates highlights/prompts at 10 Hz, while rendering and movement
remain independent of DOM refresh. Resizing, blur, form focus, pointer capture,
modal pause, HMR disposal and browser graphics-context interruption have owners.

## Save safety

Only `av-tech-rpg-3d-dev-v1` is read/written by this client. It does not access,
clear, migrate or overwrite `av-tech-rpg-save-v1`. Typed IDs, completed action
IDs, player position and camera state are saved on interactions, periodically,
and on page hide/blur. Repeated inspection adds no duplicate completion.

Invalid/unknown 3D saves are retained; that tab plays without writing them.
Denied storage is nonfatal. Out-of-bounds/inside-obstacle positions use the
authored shop spawn. Legacy career import is deferred to its explicit later
ticket. There is no silent import or career reset.

## Deployment and rollback

Vite's base is explicitly `/av-tech-rpg/3d/`, not `/`. Runtime assets are local
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

The next art task is **P0.4 / M2: one naturally proportioned, clothed, rigged
human and a furnished realistic/PBR AV shop with Van #3**. Record asset rights,
scale/rig/clip conventions and demonstrate idle, walk, turn, carry and interact
in the browser. Review screenshots and motion from the normal following camera;
profile real assets on declared hardware. Include doorway/ramp/step and swept
camera tests. The engineering proxy is not art acceptance.
