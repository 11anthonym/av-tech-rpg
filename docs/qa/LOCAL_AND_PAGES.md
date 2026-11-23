# Local setup and GitHub Pages delivery

Priority order: reproducible local setup, live GitHub Pages, then M4 gameplay.

## Reproducible setup

The root README is the command reference. Node 24.22.3 and pnpm 11.25.0 are
pinned. `pnpm bootstrap` installs `game3d/pnpm-lock.yaml` with `--frozen-lockfile`;
the root lockfile has an empty importer, while all real dependencies remain in
the existing 3D lockfile. `pnpm build` runs
strict TypeScript, builds Vite and stages the allowlisted combined site in
`.pages/`. `pnpm preview` uses the existing Node HTTP server, with both real
Pages paths. No installed project dependencies, compiler output, browser profile
or asset regeneration is part of a clone. Git and Node/npm are prerequisites.

The first install needs the public npm registry. Playing the built site needs
only its own origin: JS/CSS, GLB rig, embedded WebP maps/animations and environment
lighting are local. No audio clips currently ship; audio playback is not claimed.
No Python, Codex runtime path, API key, account or external art service is needed.
The optional art-regeneration tools are not part of installation or playback.

`scripts/tests/local-preview.test.mjs` starts the actual preview from an unrelated
working directory and verifies both applications and every shipped file over
HTTP. The combined browser test creates an actual Alex career using the 2D UI,
blocks every external origin, walks/interacts/reloads in 3D, then continues that
same 2D career and checks its saved bytes. Existing tests cover animation,
camera/collision and the full M3 preparation flow. CI also installs, tests,
builds and checks the HTTP preview on fresh Windows/macOS/Linux runners with
no restored dependency cache. Hardware performance and Safari are separate gates.

Executed results and the exact source commit are recorded in the delivery PR's
checks and report. A passing install/HTTP check is not called a gameplay test;
a passing local game is not called a public deployment.

## Live repository preflight and approval

Preflight found main at `1973ece`, M1 #2, M2 #4, camera/settings #5 and M3 #6
all open, with passing QA. The newer main commits are roadmap-only and merge
cleanly. No other gameplay PR supersedes the stack. Main itself has no branch
protection requirement, but the owner's earlier explicit **do not merge**
instruction and conditional M1 review still require authorization. Do not
change permissions or use an administrator bypass to resolve this.

Pages already uses Actions and the `github-pages` environment permits main only.
M1 includes the combined build/test/deploy workflow; it does not need M2 or M3
to publish the engineering client. The unmerged M2/M3 features cannot appear
at the public URL merely because their PR checks pass.

## Exact owner clicks if the agent has not been authorized to merge

1. Open [M1 PR #2](https://github.com/11anthonym/av-tech-rpg/pull/2). Confirm its
   checks are green. At **Merge pull request**, choose **Create a merge commit**
   from the dropdown, then **Confirm merge**. Keep the branch for the stack.
2. Open [Actions — Deploy GitHub Pages](https://github.com/11anthonym/av-tech-rpg/actions/workflows/deploy-pages.yml).
   Open the newest **main** run and wait for **build** and **deploy** to pass.
   This publishes M1 without waiting for unfinished later milestones.
3. Open [M2 PR #4](https://github.com/11anthonym/av-tech-rpg/pull/4). Click
   **Edit** next to the title, change **base** to **main**, and confirm
   **Change base**. Wait for its checks to pass, review its remaining art limits,
   then merge using **Create a merge commit**. Keep its branch.
4. Repeat the base-to-main/check/review/merge sequence for
   [camera PR #5](https://github.com/11anthonym/av-tech-rpg/pull/5), then
   [M3 PR #6](https://github.com/11anthonym/av-tech-rpg/pull/6), then the
   `codex/local-pages-readiness` setup PR. Merge commits preserve the parent
   ancestry and prevent earlier work from being reintroduced as duplicate diffs.
   If GitHub shows a required approval or a failing check, satisfy it normally.
5. Wait for the final **Deploy GitHub Pages** run. Record its URL and main SHA;
   verify the live sites below. Do not treat the Actions artifact as hosted proof.

No manual copying/uploading is required. Approved main merges trigger legacy
contracts, 3D domain/type/build checks, Chromium production-browser checks,
combined staging, and deployment. PR QA adds Firefox/portable and OS setup checks.

## Public acceptance after deployment

Check [2D](https://11anthonym.github.io/av-tech-rpg/) and
[3D](https://11anthonym.github.io/av-tech-rpg/3d/) over HTTP, then use an actual
browser. From the reviewed checkout, point existing normal-input tests at Pages:

```sh
# PowerShell: $env:PLAYWRIGHT_BASE_URL='https://11anthonym.github.io/av-tech-rpg/3d/'
# macOS/Linux: export PLAYWRIGHT_BASE_URL=https://11anthonym.github.io/av-tech-rpg/3d/
pnpm --dir game3d exec playwright test e2e/foundation.spec.ts --project=chromium --grep "normal keyboard/mouse"
# After M2/M3 are published:
pnpm --dir game3d exec playwright test e2e/combined-site.spec.ts e2e/character.spec.ts e2e/shop-prep.spec.ts --project=chromium
```

These use isolated test profiles, never the owner's saved career. Preserve a
real pre-deployment 2D checkpoint for before/after comparison; confirm Continue
Career, save bytes, real rig/lighting requests, animation, movement, orbit,
workbench, cargo and reload, with no unexpected console/network errors. Record
the deployed SHA from Actions and the read-only `?debug=1` build identifier,
test results and screenshots. Existing personal browser saves are not visible
to CI; unchanged origin/key/code and tested checkpoint preservation are the
evidence, not a claim to have inspected the owner's private profile.

## Rollback

Use **Revert** on the faulty merged PR to open a new rollback PR; review/test and
merge it normally so the same Pages pipeline deploys the revert. Do not rewrite
main or manually replace website files. For a whole-stack rollback, reverse
dependency order; do not revert M1 beneath still-active dependent milestones.
Retain all 2D/3D localStorage bytes. An old client may not understand new 3D v2
progress, but its independent v1 key cannot overwrite it. Keep the original 2D
URL and `av-tech-rpg-save-v1` throughout.
