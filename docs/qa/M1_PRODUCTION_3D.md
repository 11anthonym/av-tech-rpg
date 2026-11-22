# M1 / P0.1 production 3D client evidence

Implementation branch: `codex/m1-production-3d-client`, based on `487ad23`.
This record distinguishes the implemented engineering client from the later
realistic human/shop visual gate. No M2 art acceptance is claimed.

## Implemented behavior

- An independently installed/built `game3d/` application with pinned Babylon
  9.37.1, TypeScript 7.0.2, Vite 8.3.8 and pnpm 11.25.0 lockfile.
- A metric shop qualification scene, separate visible technician adapter and
  collision body, third-person follow/orbit/zoom with obstruction ray,
  camera-relative normalized movement and solid geometry.
- A stable workbench action with nearby/ray-visible prompt, highlighting,
  inspect/review feedback, deterministic state and duplicate-action protection.
- Lightweight HUD; diagnostics hidden by default; settings/modal focus clears
  input; blur clears held keys; resize and application lifetime have owners.
- Versioned 3D-only saves, reload restoration, safe spawn validation,
  damaged-save retention and nonfatal storage denial.
- Local production GLB loading, visible runtime/unsupported-WebGL recovery,
  and browser graphics-context interruption handling.
- A combined static Pages artifact preserving the legacy root byte-for-byte
  and adding the new build at `3d/`, plus CI/build/browser artifact collection.

## Checks and observed results

Verified implementation source: `d32054b` (plus subsequent delivery-only
documentation/artifact packaging changes). CI uses a fresh checkout and records
the PR merge-build identifier in diagnostics.

| Check | Current evidence |
| --- | --- |
| `pnpm typecheck` / production build | Passed locally |
| `pnpm test` | 8 deterministic contract tests passed locally |
| Chromium production browser suite | 6/6 passed in Linux CI, including normal keyboard/mouse replay |
| Firefox production browser suite | 6/6 passed locally and in Linux CI; Linux uses Xvfb/Mesa for WebGL |
| Independent-root build | Separate `/` build booted with its JS/CSS/GLB; 1/1 browser test passed locally and in CI |
| Clean-checkout install/build/test | Local detached `e77f48a` checkout: frozen install, 8 contracts, typecheck/build passed; latest implementation also passed fresh-checkout CI |
| Legacy full QA | Passed: 43 script checks, 43 unit/contracts, full browser smoke |
| PR CI | [Run 45048739015](https://github.com/11anthonym/av-tech-rpg/actions/runs/45048739015) passed both jobs and all 13 browser cases |
| Pages workflow dry run | [Run 45049020842](https://github.com/11anthonym/av-tech-rpg/actions/runs/45049020842): build/verification/artifact upload passed; deploy correctly skipped on the development branch |
| Hosted 3D URL | Not deployed; main-only Pages environment blocks branch publication |

Evidence: [CI Chromium scene](m1-20261122/chromium-shop.png),
[CI Firefox scene](m1-20261122/firefox-shop.png), and
[recorded Firefox engineering replay](m1-20261122/engineering-replay.webm).
The downloaded Pages tar was independently checked against the canonical Git
blob and the current live legacy HTML, including compiled subpath/GLB presence
and source-map/dependency exclusions: [artifact check](m1-20261122/pages-artifact-check.json).
The motion capture repeats the normal-input test against the production build;
it passed in 16.6 seconds. This is engineering evidence, not human art review.

The final local Firefox/root run passed all seven selected cases. Windows
Chromium software-GPU runs also encountered long recorder/context teardown
timeouts during development; they are not reported as final passing runs.
Chromium's final full qualification comes from the clean Linux CI job. Motion
recording is opt-in, and tests navigate away before finalizing the WebGL context.

The normal-input replay walks into the workbench until collision stops further
motion, inspects and reviews it with E, checks modal pause and focused settings,
orbits with a real mouse drag, moves relative to that changed camera, zooms,
resizes, reloads and checks restored state. Test code only reads diagnostics;
it does not teleport or mutate the live gameplay state.

Other browser cases cover the actual repository prefix, exact legacy HTML
bytes, the legacy title screen, diagnostics off by default, missing assets,
unknown/damaged saves, denied storage and unavailable WebGL. A separate fresh
browser context contains save fixtures. The user's normal browser saves are
never used by these tests.

During qualification, a small vertical jitter was found in a partial gravity
implementation. M1's flat-floor movement was corrected; gravity, ramps and
stairs remain a properly scoped M2 controller decision. Reload testing also
caught over-restrictive position validation, and screenshot inspection caught
an early blank frame after a premature ready signal. The delivered client
validates against authored geometry, waits for scene resources, and verifies
active geometry before reporting ready. Wall/bench resting positions have
save regression checks. No failing result is counted as a pass.

## Deployment boundary

The GitHub Pages environment was inspected through the GitHub API. Its custom
deployment policy permits only branch `main`. The implementation remains a
development PR; changing that policy or merging the PR was not done.

The proposed Pages workflow runs production checks before staging/deployment,
and refuses a non-main deployment. CI preserves the combined site artifact for
review. The public legacy root must stay available throughout.

**Hosting decision:** retain the already configured GitHub Pages fallback for
this PR. The upstream hosting research's Cloudflare Workers Static Assets / Pages
option was checked against available access: the repository has no configured
secrets, and this task environment has neither `CLOUDFLARE_API_TOKEN` nor
`CLOUDFLARE_ACCOUNT_ID`. No connected Cloudflare project/deployment was claimed.
The root-portable build is ready for an authorized independent-host trial.

To publish on the existing host, the reviewed PR must reach `main` and the
allowed Pages workflow must deploy; then rerun the browser checks at the live
URL. An independent Cloudflare preview instead requires the owner to connect
and authorize that account/project. No policy relaxation, new account, paid
service, domain, backend or automatic PR merge was introduced.

Live HTTP checks after the branch dry run returned **200** for the existing
2D root and **404** for `/3d/`, consistent with the deployment remaining blocked.

Intended route after merge/deploy: `https://11anthonym.github.io/av-tech-rpg/3d/`.
This record does not call that route live or verified. M1's hosted acceptance
gate remains open until an allowed deployment is run and checked in a browser.

### Build size observation

The verified local production build contains 141 deployable files excluding
source maps, totaling **3,041,680 bytes**. Summing per-file gzip estimates gives
**763,443 bytes**; the largest chunk is **686,593 bytes** (173,244 bytes gzipped).
These are build-size observations, not measured cold/warm hosted transfer or
load time. The original engineering GLB is 768 bytes and is not representative
of M2 human/room assets. Current files are below the 25 MiB per-file Cloudflare
limit recorded in the upstream hosting research. Hosted timing, real content
memory/transfer and real-device frame times remain unmeasured.

## Limits and next gate

Functional browser tests use software graphics in this environment; they are
not target-device FPS measurements. Safari, mobile, controller support, real
human/animation import, realistic/PBR shop art, legacy career import, full job
progression and manual driving are outside M1. Basic obstruction uses a ray;
tight corners and swept camera handling need M2 checks.

The Vite build warns about a large engine entry chunk. It is recorded technical
debt, not a failure hidden by a raised warning threshold. Initial imports are
scoped to used engine modules and the glTF 2 loader. Profile actual initial
transfer, decoder needs, asset memory and real M2 content before further
splitting or adopting compressed formats.

Next: P0.4 / M2 visual qualification through the existing visual/asset adapters.
Source one legally usable human/work-clothes/rig/animation set, dress one
realistic AV shop including Van #3, verify scale and motion in-browser, then
obtain explicit owner art/feel acceptance with screenshots/video and a declared
hardware profile. Keep M3 tool/box/van gameplay and the complete career deferred.
