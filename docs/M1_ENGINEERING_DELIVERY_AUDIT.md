# M1 Engineering Delivery Audit — Repo-Specific Corrections

**Reviewed:** 11/22/2026, 2D code/docs and deployment workflows on `main`  
**Status:** Findings and recommended engineering tasks. **No 3D production code or workflow changes made in this audit.**  
**Related:** [Production Roadmap](PRODUCTION_ROADMAP.md), [Hosting Research](HOSTING_AND_REFERENCE_RESEARCH.md), [3D Foundation Assessment](3D_FOUNDATION_ASSESSMENT.md)

## Executive decision

Do not ask the next Codex pass merely to "add Vite and deploy to /3d/." The existing Pages publisher uploads the **repository root** without a Vite build and the existing QA workflow runs **only static/unit tests**. A production 3D client needs a new build/staging boundary, real browser checks, and explicit storage isolation. These are confirmed repository-specific risks, not hypothetical engine limitations.

### Findings verified directly in the repository

| Priority | Verified current behavior | Risk when adding `game3d/` | Required change / proof |
| --- | --- | --- | --- |
| **P0** | `.github/workflows/deploy-pages.yml` checks out source, then runs `actions/upload-pages-artifact@v4` with `path: .`, with no Node install/build step | A new Vite `game3d/src` is not a runnable, compiled site. Publishing the source tree could expose unnecessary source/assets; adding a second Pages deploy that uploads only the 3D build would **replace**, not preserve, the current root 2D site | Build `game3d/dist` in CI; stage a **single** Pages site directory containing the legacy 2D runtime at root and 3D build under `3d/`; deploy that staged directory. Or use an independently hosted 3D preview and leave the existing Pages job completely untouched. Verify both URLs after deployment. |
| **P0** | `.github/workflows/qa.yml` executes only `node scripts/qa-all.js --fast` | Existing 2D browser smoke does **not** run in CI; passing CI alone cannot confirm movement, camera, interaction or even real 3D rendering | Retain fast legacy tests; add separately cached/pinned 3D `npm ci`, `typecheck`, `build`, domain tests, and actual built-app browser smoke. Require that 3D browser smoke be a **required** step where supported, not an optional success-only message. |
| **P0** | `src/core/app.js` has `SAVE_KEY="av-tech-rpg-save-v1"` and `SAVE_VERSION=30` | A new client at `/av-tech-rpg/3d/` shares the **same origin** as the 2D site, so it can read/overwrite the exact legacy key if coded carelessly; a move to Cloudflare changes origin and loses direct storage access | New `av-tech-rpg-3d-dev-v1` namespace (suggested name only); never clear/change the 2D key. Explicit export/import with version, validation, backup and user consent before migration. |
| **P0** | `src/content/data.js` assigns `window.GAME_CONTENT`; first premade technician ID is `prototype-tech` and van ID is `van3` | Treating this script as a TS/ESM module, loading it in Node without a window, or "tidying" the technician ID can break references and save continuity | Selectively extract or generate typed content snapshots with validation and explicit IDs. Keep `prototype-tech` despite its TODO until a tested migration exists. Do not transport every old global into the new client. |
| **P1** | `scripts/qa-all.js` has full browser smoke by default; `--fast` intentionally skips it | Review reports can conflate fast checks with full gameplay/browser QA | Label each run precisely; use full legacy smoke when changing shared data/legacy behavior. Human unassisted QA is a separate product gate. |
| **P1** | 3D engine probes and a 2D smoke suite exist, but no production `game3d/` workspace at baseline | Passing a feasibility probe will be mistaken for a deployable client | Require `game3d/package.json` + lockfile, clean-checkout commands, 3D prod build, hosted proof and browser console/network logs. |

**Sources inspected:** `.github/workflows/deploy-pages.yml`, `.github/workflows/qa.yml`, `scripts/qa-all.js`, `src/core/app.js`, `src/systems/save-system.js`, `src/content/data.js`, `docs/3D_FOUNDATION_ASSESSMENT.md`.

## Recommended M1 implementation sequence

**A. First PR — scaffold/build/tests:** Create `game3d/`; pin dependencies, establish TS modules, build an engineering scene. Add `npm ci`, `typecheck`, `test`, `build` and `preview` commands. Provide `game3d/README.md`. Treat current 2D code as untouched.

**B. Second contained PR — browser QA:** Use Playwright (or existing browser runner if it has strong reasons) against the **built** static app. Test boot/error state, WebGL fallback, input, camera, obstacle blocking, interaction, modal focus, resize, reload and persistence namespace. Run on Chromium first and add Firefox/WebKit as practical. Disable screenshot-driven "pass" criteria that depend on visual quality or performance. Playwright screenshot snapshots are environment-sensitive (OS/driver/fonts/GPU), so require controlled baselines and human art review instead of interpreting screenshots as fidelity proof. [Playwright visual docs](https://playwright.dev/docs/test-snapshots), [browser docs](https://playwright.dev/docs/browsers).

**C. Deployment review — choose exactly one path initially:**

1. **Independent preview hosting (least impact to legacy):** Cloudflare Workers Static Assets or Cloudflare Pages deploys only `game3d/dist` on its own origin; current GitHub Pages stays unchanged. Actual Cloudflare account/Git permissions must exist before a URL is claimed. Test root `base: '/'`.
2. **Shared GitHub Pages:** Replace `path: .` with a prepared `_site/` artifact that includes the *exact current playable 2D runtime tree* at site root and `game3d/dist` under `_site/3d/`. Build with `base: '/av-tech-rpg/3d/'`, run smoke checks against the artifact at equivalent path, then deploy the entire staged site once. Do not publish `game3d/node_modules`, source-only authoring files, raw Blender sources, or documentation unintentionally.
3. **Fallback:** If independent hosting is blocked and a safe staged Pages workflow is not ready, ship a **local, built 3D preview with verified commands** and report M1 deployment gate as **open**. Never replace the functioning root with the 3D bundle as a shortcut.

[Official upload-pages-artifact guidance](https://github.com/actions/upload-pages-artifact) recommends uploading the built static output directory; [Vite deployment guide](https://vite.dev/guide/static-deploy.html) specifies path-sensitive `base` setup.

**D. Versioned QA evidence:** For each PR, save build SHA, exact Node/package versions, test output, console/network error count, browser target, and whether the tested code matches the hosted artifact. For visual changes, take a manual normal-follow-camera walkthrough.

## Specific decisions to defer or protect

- **Collision:** The Babylon engine's basic collisions are enough for an M1 flat engineering scene. Havok should be considered only in the compact shop with moving carts, steps and ramps, after measuring transfer/runtime cost and reproducibility. Keep a controller adapter.
- **Rendering:** WebGL2 is the initial baseline. WebGPU may offer later advantages, but is not a prerequisite. Do not state Safari support from Playwright WebKit results alone; the official Playwright docs distinguish WebKit test builds from branded Safari.
- **Game frame loop:** Movement should use measured delta time with large-step clamping; do not tie movement speed to a fixed 16 ms interval. Pause/blur must clear active inputs. This is a design requirement, not a verified implemented fix.
- **Interaction ownership:** No mesh click, ray pick or UI button should modify money/XP/reputation directly. Dispatch a stable action ID to a domain reducer/handler, then display a result event. Duplicate completed actions must not duplicate rewards.
- **3D save architecture:** Position alone is insufficient: persist validated area/scene IDs, spawn anchor, facing, story/task states, completed awards, and schema version. Do not write DOM coordinates or raw mesh indices. If storage is denied, quota is exceeded or JSON is malformed, show an explicit recoverable error; do not silently reset a career. [MDN Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API), [MDN same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy), [MDN storage quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
- **Fresh experience vs prototype parity:** A short playtest must use ordinary mouse/keyboard commands from a genuinely new save. Existing smoke tests often inject saved state, so they cannot prove onboarding or pacing.
- **Stop condition:** When the independent 3D client builds and has one verifiable preview, focus next engineering effort on M2's animation/shop gate rather than reworking the deployment stack.

## M1 acceptance evidence checklist

- [ ] `game3d/` source, locked dependency tree, local dev and tested production bundle exist.
- [ ] A fresh checkout builds successfully with pinned Node/npm.
- [ ] Legacy fast QA passes; legacy full browser smoke status is stated accurately.
- [ ] 3D runtime QA exercises human input, collision, interaction, reload and console/network errors against a production build.
- [ ] **One** public 3D URL verified *or* M1 marked incomplete with exact blocker.
- [ ] If served through GitHub Pages, root 2D and `/3d/` work together; no second deployment overwrites the root.
- [ ] Neither client changes/deletes the 2D saved-game key.
- [ ] Root and nested-hosted asset URLs work, including GLB resources when added.
- [ ] No claim that a capsule/empty blockout meets M2's realistic art or M6's player-fun criteria.

## Owner-level readout

**Highest-confidence correction:** The first Codex prompt's demand for a separate `/3d/` route and a working original site needs an explicit **single-artifact staging** instruction if GitHub Pages is used. This is directly established by the current workflow. Otherwise, avoid touching Pages and use independent hosting.

**Second correction:** The existing CI success must be labeled "fast static/unit QA" rather than "all game testing." Tests covering movement and browser interaction need a separate job and real browser execution.

**No engine switch recommended.** The findings strengthen the case for a small, portable 3D build with honest proof; they do not justify another engine-selection exercise.
