# Next session — Site critique follow-up awaiting review

## Current state

- `main` is at `d0f2b07`, in sync with `origin/main`. The working tree holds the uncommitted critique follow-up below; untracked `.claude/` and `artifacts/` are intentionally never committed.
- The writing polish, Start Here sequence (`startHereOrder` 1–5: The Fire, Ordering Effort, I Am Not Behind, Discipline Should Not Cost Me My Heart, I'm Not Waiting to Arrive), Day-title normalization and 404 page are live (`93583f9`, `3cc0be2`). The earlier handoff's open Start Here decision is closed.
- New site-first writing follows `docs/new-writing-workflow.md`.

## Completed October 1, 2026

- `46a660a` fix: every page declares `<meta name="color-scheme" content="dark">` and `color-scheme: dark` on `:root`, so mobile auto-dark modes (Android Chrome, Samsung Internet) stop re-tinting the palette. Paper reading mode sets `color-scheme: only light`.
- Hero grain overlay reduced to `opacity: 0.04` (was 0.09 homepage, 0.08 project pages).
- Gold accent raised `#cba35c` → `#d4ab5f`; hover/link golds moved proportionally (`#e9c683` field manual hover, `#eecb8b` writing hover, `#dcb46b` writing link). Translucent golds use `--accent-rgb` (homepage/projects) or `--gold-rgb` (writing). Live status-chip border is solid gold.
- `d0f2b07` docs: `AGENTS.md` and `docs/design-system.md` record the new palette.
- Files: `index.html`, `projects/{selftrainer,fitpulse}/{index.html,*.css}` (the two project stylesheets remain identical), `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`, `src/styles/writing.css`, plus the two docs.

## Validation

- `npm run test:writing-tools` and `npm run validate` passed; `git diff --check` clean. All 60 built pages carry the color-scheme meta.
- Browser pane at 375px: homepage, SelfTrainer and The Fire (candlelit and paper, toggle round-trip) checked; no horizontal overflow. Homepage also viewed at desktop width.
- GitHub Pages run for `46a660a` succeeded; live HTML and SelfTrainer CSS confirmed serving the change.
- WCAG contrast: accent 9.2:1 on `#0b0b0c` (8.6:1 on lightest card); body text 16.3:1; dark text on gold buttons 9.2:1.
- Not verified: physical-device test. The owner reported it looks much better; whether the auto-dark mode was the specific cause on their phone is unconfirmed.

## Known leftovers (do not remove without owner approval)

- Stash `stash@{0}` "Preserve homepage before approved polish baseline update".
- Worktrees: `C:/Users/garry/.codex/worktrees/writing-polish/GarryTipler-Site` (`codex/writing-polish`, already merged into `main`); `.migration-output/day-series-preview` and `.migration-output/publish-fragment-20` (detached, git-ignored path; day-series-preview has untracked image folders).
- Hero photo keeps `filter: saturate(0.7) contrast(1.05) brightness(0.92)`; easing it is a separate design decision.

## Uncommitted: site critique follow-up (October 1, 2026, awaiting owner review)

Working tree, not committed or pushed:

- **About section + hero.** Author-supplied "Behind the work." About copy (T.I.P. = Tenacious Individual Performance) with a small portrait; hero descriptor now "Author · Software Builder · Founder, Tenacious Individual Performance". Homepage order: hero, field log, About, book, field guides, free guide, projects, writing, principles, closing; kickers renumbered 01–06.
- **Homepage moved into Astro.** `index.html` → `src/pages/index.astro` (git rename; removed from the build passthrough). The featured card stays The Fire (`featuredSlug`); the two side cards are the newest published pieces, the first labelled "Latest".
- **Shared CSS.** `assets/css/field-manual.css` holds the Field Manual tokens and 30 rules identical across homepage and projects; `assets/css/case-study.css` replaces the identical `projects/*/selftrainer.css`/`fitpulse.css` (deleted).
- **Phone nav** shows Projects; guide button reads "Free guide" below 720px (homepage, projects, writing). Project-page current link has a 44px target on phones.
- **Homepage writing guard:** with zero recent pieces the side column is omitted and the featured card spans full width (renders identically today).
- **Project closings** add "Follow the build in The Signal →" to `/#field-guide`.
- **Images:** removed three never-referenced images (`IMG_2174.jpeg`, `IMG_2175.jpeg`, `assets/selftrainer-active-session-pwa.png`). The four root `selftrainer-*.jpeg` screenshots (public April–June 2026) are kept at their original paths for backward compatibility, though no page renders them.
- **Approved copy applied:** eight SelfTrainer plain-language leads (`.section-lead` in `case-study.css`) above the unchanged evidence copy; four approved jargon swaps; 17 Fragment summaries replaced with verbatim lines from each piece (Fragments #2, #3, #14 unchanged).
- **Docs:** `docs/design-system.md`, `docs/new-writing-workflow.md` updated.
- **Validation:** `test:writing-tools` and `validate` pass; `git diff --check` clean; 60/60 pages carry color-scheme. Computed-style snapshots at 1440px and 375px: project pages 0 differences after the CSS merge; homepage differs only in the writing cards (new content). Phone nav fits with no overflow at 320, 360 and 375px.
- **Scheduled task** `field-log-session-count-reminder` reminds the owner on the 1st of each month at 9:00 to send the SelfTrainer session count. It runs only while the Claude desktop app is open; if the app is closed at 9:00 on the 1st, it runs the next time the app opens. Manage it under Scheduled in the app sidebar.

## Next slice

Commit-ready; awaiting the owner's publication authorization before commit and push.

Not yet decided: six more unreferenced images (`assets/selftrainer-history-detail-pwa.png`, `assets/selftrainer-home-up-next-pwa.jpeg`, `assets/selftrainer-profile-adherence-pwa.jpeg`, `assets/selftrainer-program-management-pwa.jpeg`, `assets/selftrainer/selftrainer-home-up-next-crop.webp`, `assets/selftrainer/selftrainer-routine-editor-pwa.jpeg`); removal needs owner approval. The stash and merged worktrees above remain cleanup candidates only with approval.

## Locked boundaries

Preserve `docs/design-system.md` (Field Manual, Writing Chambers, Paper mode, fonts, 700px reading width, reduced-motion guards). Prose, titles, slugs, Fragment numbering, categories/tags, project content, homepage metrics, signup logic, Medium settings, schema, dependencies and deployment stay unchanged unless the owner asks.
