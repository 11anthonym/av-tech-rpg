# Published 3D acceptance

Every approved merge to main retains the existing build and Pages deployment.
A subsequent, read-only Chromium job loads the actual public 3D URL and requires
the running application's build ID to match that merge's commit.

The check exercises real character/lighting assets, all graphics presets,
walking and Shift speed, walking animation, orbit/zoom, and save/reload. It
retains a screenshot, observations JSON and gameplay video in the
`public-3d-browser-evidence` Actions artifact. This checks the published site;
the existing predeployment gameplay replays remain separate.

Optional manual run after installing the pinned repository dependencies:

```powershell
pnpm --dir game3d exec playwright install chromium
pnpm test:public
```

Set `EXPECTED_BUILD` to a commit to check a specific revision. CI always sets
this value. `PLAYWRIGHT_PUBLIC_SITE` derives `/3d/` from the actual deployment
output; `PLAYWRIGHT_PUBLIC_URL` can override the complete 3D URL for testing.

A successful publish followed by failed verification leaves the workflow red
and retains evidence. It does not automatically roll back or change Pages
permissions. Software-rendered acceptance does not qualify physical-GPU speed.
