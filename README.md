# AV Tech RPG

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

The current browser prototype includes technician selection, a walkable Broomall
shop, van loading, a scripted Center City East trip, garage unloading, client
check-in, the two-cart tutorial, fatigue, a starter tool reward, and a
post-tutorial shop hub for recovery and personal-tool purchases.

## Design Notes

The current vertical slice is scoped in
[docs/VERTICAL_SLICE.md](docs/VERTICAL_SLICE.md).

Instructions for extending the data-driven prototype live in
[docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md).

## Development

Start with a top-down 2D browser prototype using simple placeholder art. Keep AV
details legible and funny rather than building a technical simulator.

Run the current prototype from the repository root:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173). Use `WASD` or the
arrow keys to walk and `E`, `Space`, or the on-screen button to interact.

The prototype autosaves the active career in the browser's local storage. Use
`Continue Career` on the title screen to restore progress or `Clear Saved
Career` to remove the local save.
