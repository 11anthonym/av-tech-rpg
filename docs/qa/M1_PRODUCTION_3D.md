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

This section is updated from executed commands before final delivery.

| Check | Current evidence |
| --- | --- |
| `pnpm typecheck` / production build | Passed locally |
| `pnpm test` | 8 deterministic contract tests passed locally |
| Chromium production browser suite | 6 tests passed locally; normal keyboard/mouse flow included |
| Firefox production browser suite | Boot/subpath/legacy-link test passed; complete suite verification in progress |
| Clean-checkout install/build/test | Pending final source commit and isolated checkout |
| Legacy full QA | Pending final verification |
| PR CI | Pending push/PR |
| Hosted 3D URL | Not deployed; main-only Pages environment blocks branch publication |

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
stairs remain a properly scoped M2 controller decision. No failing result is
counted as a pass.

## Deployment boundary

The GitHub Pages environment was inspected through the GitHub API. Its custom
deployment policy permits only branch `main`. The implementation remains a
development PR; changing that policy or merging the PR was not done.

The proposed Pages workflow runs production checks before staging/deployment,
and refuses a non-main deployment. CI preserves the combined site artifact for
review. The public legacy root must stay available throughout.

Intended route after merge/deploy: `https://11anthonym.github.io/av-tech-rpg/3d/`.
This record does not call that route live or verified. M1's hosted acceptance
gate remains open until an allowed deployment is run and checked in a browser.

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
