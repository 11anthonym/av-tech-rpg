# Hosting, Deployment and Playable Reference Research

**Research date:** 11/21/2026  
**Status:** Production decision support, not an assertion that a new host is connected or deployed  
**Applies to:** [Production Roadmap](PRODUCTION_ROADMAP.md), especially M1/P0.1 and M6

## Studio recommendation

The existing 2D GitHub Pages game is working. **Keep its link untouched.** For the new static Babylon.js/Vite 3D client, make **Cloudflare Workers Static Assets** the first alternate-host proof, with **Cloudflare Pages** as the simpler Git-integrated option and **GitHub Pages** as a valid fallback. Evaluate the delivered 3D build on a real public preview URL rather than choosing a platform based on marketing or an agent's preference.

Cloudflare's current overview directs new projects toward Workers, while still supporting Pages. Both Cloudflare static offerings can deliver JS/HTML/CSS/GLB files globally; neither changes Babylon's GPU render performance or eliminates the need to optimize 3D asset download size. Both Workers Static Assets and Pages publish static asset requests without per-request charges; Worker script invocations have separate limits. Do **not** introduce a Worker script, server or database for the existing offline/single-player game unless a player requirement demonstrably needs it.

**Practical default:** Build one portable Vite `dist/` artifact first; keep hosting-specific configuration minimal and outside gameplay code. Test the same artifact on the first available independent preview host. If Cloudflare account or Git integration is not connected, do not pretend it is—report the exact dependency and use GitHub Pages preview/deployment if available. Do not block the 3D application foundation indefinitely on third-party account setup.

## Platform comparison (official sources, verified 11/21)

| Option | Benefits for AV Tech RPG | Constraints / decision |
| --- | --- | --- |
| **Current GitHub Pages** | Already deployed from GitHub Actions; no new account; reliable fallback and zero migration while the game is in development. | Published site <=1 GB, recommended source repo <=1 GB, soft bandwidth 100 GB/month; project paths are rooted under `/av-tech-rpg/`. Appropriate for current 2D or small 3D; watch growing GLB/texture bundles. |
| **Cloudflare Workers Static Assets** | Cloudflare's recommended direction for new static applications; Workers Builds connects to GitHub, offers branch previews and serves versioned assets; static requests free/unlimited. Future API possible without redesigning hosting, but unnecessary now. | 25 MiB max individual static file and 20k files on free; requires Cloudflare account/auth/config; avoid inadvertently routing all assets through billable Worker script. |
| **Cloudflare Pages** | Simple GitHub integration, PR preview URLs, static CDN, easy rollback; static requests free/unlimited. Strong candidate if Workers adds avoidable complexity. | 25 MiB per asset, 20k files on free, 500 monthly builds on free; account/link authorization. Existing Git-integrated Pages project cannot be switched to Direct Upload in place. |
| **Vercel** | Easy Vite build/preview and frontend developer experience. | Hobby is for personal, non-commercial use; resource/fair-use ceilings. Not materially better for a self-contained static game unless previews are otherwise blocked. |
| **Netlify** | Git previews and static-site workflow. | New free plan uses 300 monthly credits and usage-based bandwidth/deployment accounting. Compare current plan before promising free hosting for a heavy 3D asset workload. |
| **itch.io HTML5** | Game discovery, playable demo page, fullscreen embed and asset hosting; good later **distribution channel**, not a replacement for continuous developer preview hosting. | ZIP delivery, up to 1,000 extracted files and 500 MB uncompressed total, 200 MB single file; browser game packaged as a release, not automatically a Git PR preview. |

### Primary references

- GitHub Pages limits: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- Cloudflare Pages overview (new-project Workers guidance): https://developers.cloudflare.com/pages/
- Workers static assets and limits: https://developers.cloudflare.com/workers/static-assets/ and https://developers.cloudflare.com/workers/platform/limits/
- Workers Git builds and previews: https://developers.cloudflare.com/workers/ci-cd/builds/ and https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/
- Cloudflare Pages Git integration and previews: https://developers.cloudflare.com/pages/configuration/git-integration/ and https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Cloudflare Pages quotas and static pricing: https://developers.cloudflare.com/pages/platform/limits/ and https://developers.cloudflare.com/pages/functions/pricing/
- Vercel Hobby restrictions: https://vercel.com/docs/plans/hobby
- Netlify free credits: https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- itch.io HTML5 upload rules: https://itch.io/docs/creators/html5

## Product-critical hosting details

1. **Save continuity is origin-scoped.** `localStorage` on `11anthonym.github.io` is not directly readable by the game on `*.pages.dev`, `*.workers.dev`, an itch.io iframe origin or a new custom domain. The existing 2D key `av-tech-rpg-save-v1` stays intact. Keep 3D development saves isolated. Before hosting migration or launch, design an explicit export/import pathway and verify round trips, schema migration, error handling and duplicate-reward protection. A new hostname must never imply existing players' saves transferred.
2. **Support multiple base URLs.** The Vite build should work at `/av-tech-rpg/3d/` on GitHub Pages and at `/` on an independent Cloudflare preview/domain. Test HTML, script, CSS, texture, GLB, animation, font and audio URLs. Do not hard-code a single origin or assume SPA fallback makes missing assets load.
3. **Cache immutable bundles appropriately.** Content-hashed assets can be cached long-term; HTML and manifest versioning should permit release updates. Validate cache behavior after changes to GLBs and textures. Avoid uncontrolled cache-busting of every large asset on each visit.
4. **Track player-facing costs.** Report total compressed/uncompressed transfer, largest asset, cold/warm load, failures, first-interactive time and real desktop frame-time percentiles. CDN speed does **not** rescue an oversized texture budget or poor animation performance.
5. **Keep PR preview separate from production.** Branch or PR builds must have a link showing the exact commit/build ID, be testable without modifying the 2D root game, and never auto-promote unapproved art or code. Preview URLs may use different origins and therefore isolated test saves.
6. **No expensive infrastructure by accident.** No database, real-time backend, Cloudflare R2, paid tier, custom domain or analytics collection in M1 unless the user explicitly approves cost, permissions or account connection. Larger future files may warrant asset-bucket hosting, but not as a response to unmeasured estimates.
7. **Do not claim configured infrastructure.** The implementation agent may prepare manifests, deployment workflow and instructions in GitHub; a live Cloudflare URL requires an actual connected Cloudflare account and deployment evidence.

## Community evidence and agent workflow ideas

These are **individual user experiences**, not controlled benchmarks or endorsed rankings:

- [r/codex: quickest cloud/GitHub preview](https://www.reddit.com/r/codex/comments/1oqwn24/quickest_way_to_get_preview_of_web_app_when_using/) describes Git-connected Cloudflare Pages producing PR test links. This matches official Cloudflare preview documentation; use it as a candidate for fast playtest feedback.
- [r/codex: bounded game work](https://www.reddit.com/r/codex/comments/1sutzyl/game_development/) argues for one mechanic or bug at a time, actual runtime checks and human judgement of feel/animation. Fits our milestone gates.
- [r/codex: iterative 3D WebGPU experiment](https://www.reddit.com/r/codex/comments/1uo8lhm/i_tested_how_far_codex_could_go_with_a_codeonly/) recommends a runnable vertical slice and specific visual criticism rather than vague instructions. Do not infer that procedural art alone satisfies our realistic character/shop criteria.
- [r/ClaudeCode: cozy 3D game workflow](https://www.reddit.com/r/ClaudeCode/comments/1xhqpnl/i_built_a_cozy_game_where_your_claude_code_tokens/) reports better coherence from assembled asset kits, upfront performance rules and human visual review; warns against unbounded screenshot loops. Treat this as an account to test, not a required plugin/engine.
- [r/ClaudeCode: long-form game production](https://www.reddit.com/r/ClaudeCode/comments/1qknr1v/what_i_learned_building_a_full_game_with_claude/) emphasizes small, independently playable projects, aligned with M1 -> M4.
- [r/CloudFlare: Cloudflare vs Pages](https://www.reddit.com/r/CloudFlare/comments/1jj6lex/is_there_any_benefit_to_hosting_on_cloudflare/) includes mixed anecdotes about relative speed and TLS; do **not** promote anecdotal latency/SSL statements to guaranteed outcomes.

**Agent guidance derived from this evidence:** keep each PR small; always provide browser preview, exact runtime/build logs, reproducible acceptance checks and concise footage when visuals change; pair automation with manual play; accept clean production assets only after normal-camera inspection. Do not install community MCP tools or external agents merely because a Reddit post mentions them.

## Playable inspiration from the linked GitHub collection

Reference: https://github.com/fengyiqicoder/awesome-fable-5.2

This is a **curated showcase of live AI-built browser games/3D experiences**, not a deployer, asset marketplace, game engine evaluation or proof of sustainable production quality. Its entries and link counts change frequently. Examine only a small number of playable examples and, when available, their actual sources:

- **Saltline** — inspect moment-to-moment input, UI feedback and loading. Its claimed creation time and cost are creator/showcase claims, not our production estimates.
- **CROSSTOWN** — inspect compact traversable urban environment and feedback affordances, **not** a directive to build an open-world Philadelphia.
- **Robotics Lab / PC Build Lab** — evaluate object manipulation, legible inspection and task feedback; adaptable concepts for AV racks/carts.
- **Source-available demos** — prefer projects with code, asset provenance and independently playable links when taking engineering lessons.

For each example record: URL, test date, what is truly playable, browser/load observations, what specific idea could transfer, and what is merely visual spectacle. Do not copy proprietary assets, code, branding or prompts without license review. Do not change from Babylon solely because an impressive demo uses Three.js.

## M1 hosting proof / acceptance addendum

The first 3D client does **not** need a host migration to count as a sound architecture. Before closing M1, capture a brief **deployment decision record** with:

- Same `game3d/` build deployed on a stable, independent preview route (Cloudflare Workers Static Assets preferred, Pages if simpler, or GitHub Pages fallback); identify host and actual URL, and whether it was tested from an ordinary browser.
- Clean checkout -> pinned dependencies -> typecheck/tests -> build -> preview workflow. At least one automated smoke test uses built/static preview, not the Vite dev server alone.
- Correct asset resolution at root and repository subpath (where supported), with meaningful error for missing/unsupported WebGL2.
- Measurement of cold-load transfer/asset sizes and a simple table of limits/costs/preview behavior compared to GitHub Pages. Record unknowns, not guesses.
- Documented 2D preservation and localStorage origin caveat.
- Recommendation to use **one** 3D production host at a time. Keep GitHub Pages 2D fallback until M6 cutover. No duplicate production infrastructure for appearances.

**Decision gate:** If Cloudflare requires manual account permission or is inaccessible from the agent environment, do not stall development or fabricate a deployment. Implement the portable configuration and GitHub Pages fallback, clearly mark Cloudflare unverified, and record exact owner action necessary. The studio will choose the default host after tested results and asset sizes justify it.
