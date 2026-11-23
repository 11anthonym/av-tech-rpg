# M2 camera/control follow-up

Parent: M2 PR #4 at `372cd28`; branch `codex/m2-camera-performance`.
M1 and M2 are still unmerged. This is a separate control/feel follow-up, not
M3 gameplay or an assertion that the complete M2 art gate is accepted.

The follow camera now sweeps a conservative 18cm volume against authored solid
boxes, retracts immediately, and damps its return into open space. The volume
protects near-plane corners missed by a centre ray. Very close views fade the
human instead of showing the inside of the head. FOV increases from .85 to .95
radians to leave more room for the technician under the HUD.

Pause/settings now offers High (100%, 2048 shadow map), Balanced (85%, 1024)
and Low (65%, 512 with unfiltered shadows). Models and textures remain the same.
Preferences and camera sensitivity persist in `av-tech-rpg-3d-settings-v1`,
separate from both career keys. Invalid/denied settings recover safely, and
invalid stored bytes are retained. Diagnostics report actual buffer dimensions.
These pixel/shadow budgets are not a measured real-device FPS guarantee.

Executed locally: strict typecheck, both production builds, **15 Node tests**,
and **2 focused Firefox browser tests** passed. The latter used normal input to
walk to Van #3, collide with it, orbit toward/away from the bodywork, verify
near-avatar hiding/recovery, then change/reload all graphics presets and resize.
The full browser suite is delegated to the stacked PR's clean-checkout CI.

Limits: box expansion is conservative at corners; camera obstacles remain
static authored broad colliders. Ramps/stairs, native carry/tool clips, work
boots and real-GPU qualification remain open. No new assets/licenses or
deployment settings changed.
