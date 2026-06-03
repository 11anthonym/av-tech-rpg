# AV Tech RPG
This is just for fun and not to be taken too seriously.

AV Tech RPG is an early-stage game concept about the strange, specific,
occasionally heroic work of an audio visual integration technician.

You take commercial, education, and government AV jobs from site survey through
commissioning. The fantasy is not just wiring equipment: it is diagnosing rooms,
managing constraints, making judgment calls, and leaving behind a system that
works when the client walks in.

## Current Status

This repository is the shared home for brainstorming and prototype development.
The initial concept notes live in [docs/GAME_CONCEPT.md](docs/GAME_CONCEPT.md).

## First Prototype Goal

Build one small playable career loop:

1. Walk around a disorganized trunkslammer shop.
2. Load a screwdriver and cart components into a limited-capacity van.
3. Travel to a client site in the greater Philadelphia area.
4. Handle one parking, access, or scheduling complication.
5. Build two mobile video conferencing carts after the promised supervisor is
   pulled away to another site.
6. Make a few approachable choices about time, fatigue, and craftsmanship.
7. Return to the shop with pay, experience, and a small amount of burnout.

The prototype should answer one question: is it funny and satisfying to survive
a badly managed AV workday while gradually becoming a more capable technician?

The current browser prototype includes a small technician selection with two
starting profiles, a walkable Broomall shop, van loading, a scripted Center City
East trip, garage unloading, client check-in, the two-cart tutorial, fatigue, a
starter tool reward, and a post-tutorial shop hub for recovery and
personal-tool purchases. A second
Conshohocken service dispatch turns a reported display issue into a replacement
job, adds a small diagnosis-versus-speed decision, and lets the player's early
tool choices reduce the work involved. Completed work now awards experience and
reputation, with an early rank-up and field-training choice available from the
walkable shop hub. Josh, the company's patient lead technician, adds an early
coworker relationship arc and a practical hand-me-down tool while management
continues to blame him for problems created by the shop's own planning. Before
the service dispatch, the player can make one lightweight preparation choice:
review the work order, pack lunch, buy coffee, ask Josh for advice, or leave
immediately. The shop clipboard records a compact career ledger. A University
City site survey then asks the player to check an elevator, hallway turn, and
classroom wall after sales measured only the dimension that made the quote look
straightforward. The player can document the access problem, use confidence
training to push back calmly, or keep management happy by leaving the problem
for install day. A South Philadelphia commissioning visit follows: the room is
closed on paper, one ceiling speaker is silent, and the closeout drawing belongs
to the mirrored room across the hall. A short Broomall warehouse run closes the
slice by sending the player through Van #3, the staging shelf, and the
mystery-return pile for a replacement power supply reportedly stored in one of
the vans. The slice ends with a snapshot of the player's progress plus locked
previews of future dispatches.

## Design Notes

The current vertical slice is scoped in
[docs/VERTICAL_SLICE.md](docs/VERTICAL_SLICE.md).

Instructions for extending the data-driven prototype live in
[docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).

The design-reference notes live in
[docs/DESIGN_REFERENCES.md](docs/DESIGN_REFERENCES.md).

The current playtest questions and deliberately small next-step roadmap live in
[docs/PROTOTYPE_PLAYTEST.md](docs/PROTOTYPE_PLAYTEST.md).

## Play Locally

No Python installation or local server is required. Download or clone the
repository, then double-click `play-av-tech-rpg.cmd` on Windows. You can also
open `index.html` directly in a modern browser on any platform.

The prototype autosaves the active career in the browser's local storage. Use
`Continue Career` on the title screen to restore progress or `Clear Saved
Career` to remove the local save. A save created from a directly opened file is
separate from a save created on a hosted website.

## Share Online

Play the hosted version at
[https://11anthonym.github.io/av-tech-rpg/](https://11anthonym.github.io/av-tech-rpg/).

The game is a static website: `index.html`, `styles.css`, `data.js`, and
`app.js`. It can be hosted without a build step on GitHub Pages, Netlify,
Cloudflare Pages, or any ordinary static web host. GitHub Pages is the simplest
repository-based option for a public play link.

## Development

Start with a top-down 2D browser prototype using simple placeholder art. Keep AV
details legible and funny rather than building a technical simulator.

Opening `index.html` directly is enough for ordinary playtesting. To serve the
prototype over HTTP during development, run this optional command from the
repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173). Use `WASD` or the
arrow keys to walk and `E`, `Space`, or the on-screen button to interact.
