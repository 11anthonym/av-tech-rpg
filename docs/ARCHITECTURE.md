# Static Browser Architecture

AV Tech RPG stays a no-build static browser game for this phase. The code is
split by ownership, but it is still loaded as ordered classic browser scripts
from `index.html`.

## Runtime Layout

- `src/content/data.js` owns content data: technicians, tools, vehicles, world
  definitions, scenes, routes, job metadata, and dispatch text.
- `src/core/app.js` owns shared runtime state, DOM element references, startup
  orchestration, rendering, and the remaining job-specific scene flow.
- `src/core/bootstrap.js` starts the game after every runtime script has loaded.
- `src/systems/*-system.js` files own focused systems such as routes, portals,
  saves, vehicles, objectives, job cards, conditions, consequences, daily
  shifts, the shop hub, and field tasks.
- `scripts/` contains developer QA scripts and is not loaded by the game.

## Current Loading Choice

Native ES modules are the eventual direction for clearer imports and exports.
They are not the right migration for this pass because one project goal is still
that `index.html` can be opened directly for ordinary playtesting. MDN notes
that browser modules need module script loading and that local `file://` module
testing can hit CORS restrictions, while GitHub Pages works well for hosted
modules.

Until the project intentionally drops direct-file playtesting or adds a local
server requirement, the safer structure is:

1. Keep runtime scripts in `src/`.
2. Keep each system file focused on one gameplay surface.
3. Keep top-level startup in `src/core/bootstrap.js` only.
4. Keep load order explicit in `index.html`.
5. Keep `scripts/qa-static-scripts.js` enforcing that all listed runtime files
   exist, parse, and live in the expected folders.

This follows the practical parts of browser guidance without introducing a
build step, external dependency, or engine migration.

## Organization Rules

- Add content data to `src/content/data.js` first.
- Add behavior to the nearest existing `src/systems/*-system.js` file.
- Add a new system file only when it owns a real reusable gameplay surface.
- Avoid putting new runtime scripts in the repository root.
- Avoid adding top-level startup side effects to system files; define helpers
  there and let `src/core/bootstrap.js` start the app.
- Run `node scripts/qa-static-scripts.js` and `node scripts/qa-smoke.js` after
  script organization changes.

## Research Notes

- MDN describes modules as the browser-native way to split larger JavaScript
  programs, but also notes local `file://` testing caveats for modules:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- MDN's script loading guidance says ordered classic scripts should use explicit
  ordering when dependencies matter:
  https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script
- web.dev's JavaScript performance guidance supports splitting larger codebases
  so page-load and parse costs can be reasoned about:
  https://web.dev/learn/performance/code-split-javascript
