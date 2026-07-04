# Static Browser Architecture

AV Tech RPG stays a no-build static browser game for this phase. The code is
split by ownership, but it is still loaded as ordered classic browser scripts
from `index.html`.

## Runtime Layout

- `src/content/data.js` owns content data: technicians, tools, vehicles, world
  definitions, scenes, routes, job metadata, and dispatch text.
- `src/core/app.js` is the lean shared runtime root. It owns initial state,
  shared constants, DOM element references, and tiny global utilities.
- `src/core/bootstrap.js` owns DOM event wiring and starts the game after every
  runtime script has loaded.
- `src/systems/*-system.js` files own focused systems such as routes, portals,
  saves, vehicles, objectives, job cards, conditions, consequences, daily
  shifts, the shop hub, field tasks, dispatch flows, rendering, interaction
  markers, and movement.
- `scripts/` contains developer QA scripts and is not loaded by the game.

## System Boundaries

The current split is intentionally plain browser JavaScript instead of a module
graph. Each system file exposes focused helpers into the shared runtime scope,
and `src/core/bootstrap.js` is the only file that wires events and starts the
app.

- State and shared runtime handles stay in `src/core/app.js`.
- Startup and browser event wiring stay in `src/core/bootstrap.js`.
- Technician profile selection and career start stay in `character-system.js`.
- Save migration and continue/new-career behavior stay in `save-system.js`.
- Player movement stays in `movement-system.js`.
- Scene drawing and HUD refresh stay in `render-system.js`.
- Nearby-object/portal/contact marker presentation stays in
  `interaction-ui-system.js`.
- Interaction routing stays in `scene-interactions-system.js`.
- Route, regional map, van, job-card, objective, portal, and consequence
  helpers stay in their matching system files.
- Job-pressure helpers hold small reusable pieces for seeded condition rolls,
  readable odds, immediate incident rolls, and stable incident IDs.
- Job-specific field flows stay in their dispatch system files until they share
  enough behavior to justify a deeper extraction.

This keeps the repo closer to a real game structure without forcing a build
step, bundled imports, or an engine migration.

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
   exist, parse, live in the expected folders, and keep `src/core/app.js` lean.

This follows the practical parts of browser guidance without introducing a
build step, external dependency, or engine migration.

## Organization Rules

- Add content data to `src/content/data.js` first.
- Add behavior to the nearest existing `src/systems/*-system.js` file.
- Add a new system file only when it owns a real reusable gameplay surface.
- Keep `src/core/app.js` under the static QA line budget by moving gameplay UI,
  input, routing, and dispatch behavior into systems.
- When adding a `src/systems/*-system.js` file, add it to the ordered script
  list in `index.html`. Static QA will fail if it is missing.
- Avoid putting new runtime scripts in the repository root.
- Avoid adding top-level startup side effects to system files; define helpers
  there and let `src/core/bootstrap.js` start the app.
- Run `node scripts/qa-static-scripts.js`, `node scripts/qa-unit.js`, and
  `node scripts/qa-smoke.js` after script organization changes.
- Keep unit QA focused on reusable helper behavior. Browser flow regressions
  belong in `scripts/qa-smoke.js`; content breadth belongs in playtest notes.
- `scripts/qa-unit.js` also owns fast contract checks for data-driven systems:
  roster/tool/creator data, route/job-card references, dispatch-board entries,
  portal endpoints, route lock states, field-task schemas, objective resolver
  coverage, and save serialization shape.

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
