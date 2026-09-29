# Writing polish review — September 29, 2026

## Implemented scope

- Homepage: Fragment #4's card now shows March 2, 2026, matching its original Medium date rather than its August 6 site publication date.
- Writing landing page: six recent pieces, ordered by original publication date, with a direct View all writing link to the complete archive.
- Writing CSS: current Writing nav link, breadcrumb/back links, and article reading-mode control meet the existing 44px minimum target rule. Typography, palette, reading width and motion remain unchanged.

## Date audit

All 51 entries have an explicit originalPublishedDate and separate publishedDate. The original dates match the author-approved migration calendar records; none required a frontmatter change. Original dates are consistent across generated article headers, Medium attribution, Open Graph publication metadata, Article JSON-LD, collection/archive lists and RSS. The Day series spans December 5, 2025 through January 3, 2026. Fragment #18's March 16 date and later sequence number remain intentional.

Evidence: docs/writing-migration.md, published frontmatter, and the saved owner-calendar decisions. This pass checks the recorded Medium evidence and generated presentation; it does not independently reread every owner-facing Medium record. Next-day UTC export timestamps must not override approved calendar dates. Site publication dates and existing update dates remain unchanged.

## Proposed Start Here path — not applied

The current page contains only The Fire. Keep that established opening and extend it into a compact path from a setback, through structure and patience, to a life that can be enjoyed while work continues:

| Order | Piece | Purpose |
| --- | --- | --- |
| 1 | Fragments #4 — The Fire | The existing entry point: responding to setbacks with responsibility. |
| 2 | Fragments #6 — Ordering Effort | Turning willingness into a clearer daily structure. |
| 3 | Fragments #12 — I Am Not Behind | Giving unfinished work time without accepting borrowed timelines. |
| 4 | Discipline Should Not Cost Me My Heart | Balancing structure with warmth and openness. |
| 5 | Fragments #20 — I’m Not Waiting to Arrive | Enjoying life before the work is finished. |

The five pieces total about 19 minutes by the site's reading-time estimates. No startHereOrder fields were changed. Assigning this editorial sequence is the next decision for the author.

## Boundaries and follow-up

Prose, reviewed Day titles, slugs, numbering, taxonomy, image choices, related-writing metadata, project content/CSS, signup behavior, metrics, Medium settings, dependencies, deployment and public route contracts are unchanged. Existing local book-tilt edits remain in the original checkout and are excluded from this polish diff.

The main checkout and origin/main diverge. The polish is based on origin/main at 234b243 in an attached managed worktree. The original checkout was restored after the attempted fast-forward failed; its homepage, portrait and unrelated untracked files are preserved. A recovery stash and backups under the original checkout's artifacts/polish-baseline remain available. No commit, push or publication was performed.

Automated validation: npm.cmd run test:writing-tools and npm.cmd run validate passed; 51 published entries, zero drafts. A separate one-off audit checked all original dates, article metadata, attribution, RSS and local article links/assets; the archive contains 51 pieces and Recent writing contains six. Desktop/mobile evidence and exact review limits are recorded in NEXT_SESSION.md.
