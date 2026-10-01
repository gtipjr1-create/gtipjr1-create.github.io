# Next session — October 1 refinement closed; no slice queued

## Current state

- `main` includes release commit `845b91b` (feat: October editorial and structural refinement), deployed by GitHub Pages run `36917475839` (successful). Untracked `.claude/` and `artifacts/` are intentionally never committed.
- The writing polish, Start Here sequence (`startHereOrder` 1–5), Day-title normalization and 404 page are live (`93583f9`, `3cc0be2`).
- New site-first writing follows `docs/new-writing-workflow.md`.

## Released October 1, 2026 — CLOSED

Both releases are published and verified; do not reopen them without a new owner request.

- **Mobile palette fix** (`46a660a`, docs `d0f2b07`): dark `color-scheme` declared on every page (Paper mode `only light`), hero grain reduced to 0.04, gold accent `#d4ab5f` with proportional hover/link golds.
- **Editorial and structural refinement** (`845b91b`): About Garry section and revised hero descriptor; homepage section order 01–06; homepage moved to `src/pages/index.astro` with automatic writing side cards (The Fire stays featured via `featuredSlug`); shared `assets/css/field-manual.css` and `assets/css/case-study.css`; phone nav shows Projects; project pages end with "Follow the build in The Signal →" (`/#field-guide`); SelfTrainer plain-language leads and four jargon swaps; 17 Fragment summaries replaced with verbatim lines; three unreferenced images removed, four legacy `selftrainer-*.jpeg` URLs retained.
- **Live smoke checks all passed:** homepage and About, dynamic writing cards (The Fire, #20, #19), writing descriptions and article navigation, SelfTrainer and FitPulse pages, project CTA destinations, desktop and 375px navigation, legacy screenshot URLs, no broken assets, no console errors.

## Remaining limitations

- **Real-device smoke test outstanding.** All checks used browser emulation, not a physical phone.
- **Six unused images intentionally retained:** `assets/selftrainer-history-detail-pwa.png`, `assets/selftrainer-home-up-next-pwa.jpeg`, `assets/selftrainer-profile-adherence-pwa.jpeg`, `assets/selftrainer-program-management-pwa.jpeg`, `assets/selftrainer/selftrainer-home-up-next-crop.webp`, `assets/selftrainer/selftrainer-routine-editor-pwa.jpeg`. Remove only with owner approval.
- **Monthly reminder is app-open dependent.** Scheduled task `field-log-session-count-reminder` runs at 9:00 on the 1st of each month only while the Claude desktop app is open; otherwise it runs at next launch. It asks the owner for the SelfTrainer session count; the field log values stay hand-updated and are never estimated.

## Next slice

None queued. Wait for the owner's next request. When it arrives, follow `AGENTS.md`, `docs/design-system.md` and `docs/new-writing-workflow.md`.

Cleanup candidates, only with explicit owner approval: stash `stash@{0}` ("Preserve homepage before approved polish baseline update"); merged worktree `C:/Users/garry/.codex/worktrees/writing-polish/GarryTipler-Site`; detached worktrees under `.migration-output/`.

## Locked boundaries

Preserve `docs/design-system.md` (Field Manual, Writing Chambers, Paper mode, fonts, 700px reading width, reduced-motion guards). Prose, titles, slugs, Fragment numbering, categories/tags, project content, homepage metrics, signup logic, Medium settings, schema, dependencies and deployment stay unchanged unless the owner asks.
