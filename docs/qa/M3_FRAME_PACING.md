# Integrated M3 timing investigation

The integrated `0a39aa0` QA run
[45118063129](https://github.com/11anthonym/av-tech-rpg/actions/runs/45118063129)
failed twice in Chromium's three-trip cargo replay. Both attempts passed the
other 26 browser cases, including the full Firefox cargo flow. The second run
is an executed failure, not an assumed successful retry.

The first trace shows continued spatial progress and all three pickups, with
two groups already loaded. It reaches the global 240-second limit during the
third trip. No single waypoint times out or inventory assertion fails. Across
that trace, movement waits consumed 116.8 seconds; key down/up calls 19.3 seconds,
modal clicks 20.3 seconds and snapshot evaluations 13.0 seconds. Screenshots
consumed 5.7 seconds, so deleting evidence would not address the main cost.
The rerun again failed at the third-trip movement call. Its logs, screenshot
and trace are retained in artifact `14873118076`; the first artifact is
`14792768570`. The undefined-debug error occurs while timeout cleanup navigates
away; it is not evidence that the original game boot failed.

Two runtime issues were addressed:

- A render interval above 100ms lost elapsed simulation time. The bounded 60Hz
  clock now preserves real movement time down to 4Hz, with at most 15 collision
  steps per frame. Longer stalls remain bounded; hiding/pausing clears backlog.
  A deterministic displacement test compares ten seconds at 60Hz and 5Hz.
- Babylon cached the collision body's absolute transform between renders.
  More substeps exposed penetration/idle-gait jitter at the bench. The controller
  now refreshes that body transform for each collision step. A real Babylon
  collision regression compares one, six and fifteen substeps per render.

Static menus render once, then stop GPU work until settings/resize/resume
invalidates the view. Native animation uses the interval between actual scene
renders, preventing pause time from advancing the gait on resume. Diagnostics
are not cloned/serialized while their panel is hidden. Tests retain all movement,
collision, animation and save assertions; paused checks observe cheap engine
ticks and additionally verify that scene rendering stops. Failure state is
captured before cleanup. The cargo test remains at 240 seconds, with no retries
or injected gameplay state.

The first candidate exposed a Chromium dialog race: the close event was queued,
so an immediate next key could arrive while input still belonged to the closed
button. Input/focus are now restored synchronously by the close button or Escape;
the queued close event also checks that no newer dialog is open. The unchanged
replays caught this regression. That failed candidate is retained as evidence,
not treated as an intermittent pass.

Repeat the focused production replay with:

```sh
pnpm build
pnpm build:portable
pnpm --dir game3d exec playwright test e2e/shop-prep.spec.ts --project=chromium --repeat-each=3
```

The QA workflow's optional `shop_stress` dispatch input runs only that stress
check on a fresh Linux runner. The PR reports actual candidate results and any
remaining failures. Passing a retry alone does not resolve an intermittent
failure. Software-rendered results remain regression evidence, not a physical
GPU performance qualification; Issue #7 remains open.
