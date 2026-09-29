# Writing migration workflow

The migration toolkit supports one-at-a-time Markdown conversion and review-only batch inspection of a Medium account-data export. It does not scrape Medium, rewrite prose, infer final editorial metadata, publish content, or write into `src/content`.

## Supported input and output

The single-item generator uses two explicit input files:

1. A UTF-8 `.md` or `.markdown` file containing prose only, with no frontmatter.
2. A UTF-8 JSON metadata file containing one object.

The default output is `.migration-output/<collection>/<slug>/index.md`. That directory is ignored by Git and is outside Astro's content collection. Generation always sets `status: "draft"`, omits `publishedDate`, and refuses to overwrite either an existing review draft or an existing repository slug.

This path was proven with the first real Essay migration, “Discipline Should Not Cost Me My Heart.” The review draft preserved the supplied prose, exact historical date evidence, Medium URL, tags, and lead image before manual publication.

The Medium importer accepts one explicit account-data ZIP or extracted export directory. It reads ZIP entries directly rather than extracting them, preserving the exact archive entry name and Medium post ID as source identity even when a filename is not valid on Windows. Its default is a dry run. `--write` creates ignored review packages and JSON/Markdown manifests under `.migration-output`; it never creates public content.

## Observed Medium export contract

The August 10, 2026 account export established this supported format:

- Story records are UTF-8 HTML files directly under `posts/`.
- Published records contain `h-entry`, `p-name`, `e-content`, an exact UTC `dt-published` timestamp, a `p-author`, and a `p-canonical` Medium URL.
- Draft filenames begin with `draft_`; observed drafts omit the publication timestamp, author, and canonical URL.
- The optional `p-summary` supplies the exported subtitle, not an approved site summary.
- Numbered Fragment titles use `Fragments #N` or `Fragment #N`; only this explicit pattern proposes `type: fragment` and a Fragment number.
- The export contains remote Medium image URLs but no local image files. Remote references remain unresolved and require explicit asset, alt-text, caption, and credit review.
- Tags, site category, related writing, connections, final slug approval, and GarryTipler.com publication dates are not supplied by the export.
- Medium does not expose a reliable response flag in these post files. Short unnumbered records without a subtitle or story structure are blocked for editorial classification rather than silently treated as Essays.
- Drafts are skipped. Bookmarks, claps, highlights, profile data, sessions, follows, interests, notes, lists, and other non-`posts/` account records are inventoried by path only and excluded from content parsing.
- Existing repository content is matched by the stable Medium post ID first and proposed slug second. It is reported as already migrated and never overwritten.

HTML-to-Markdown conversion removes only duplicated export title/subtitle blocks and normalizes structural elements such as headings, paragraphs, emphasis, links, lists, quotations, separators, figures, and captions. Each ready package retains the exact source HTML, its SHA-256 hash, original archive path, Medium ID, extracted metadata, review notes, and a draft `index.md` for source comparison.

The exact UTC timestamp is preserved in the manifest. Its `YYYY-MM-DD` prefix is proposed as `originalPublishedDate` with the timestamp as evidence; reviewers must resolve any author-timezone discrepancy before publication. The two existing pieces keep their already approved repository dates.

The export ZIP, extracted private data, `.migration-output`, and unrelated account records remain ignored and must never be committed. Publication still happens in small explicitly approved batches after prose, metadata, assets, and presentation are reviewed.

## Approved Fragment migration ledger

The author approved this Fragment-series classification and numbering ledger on September 13, 2026. It is the authoritative numbering record for the supplied Medium export. All 12 records formerly proposed as Essays are author-confirmed Fragments. The importer-generated Essay classifications for Fragments #7–#18 are superseded editorial proposals; generated packages, manifests, and source evidence remain unchanged until each piece is reviewed individually.

Established Fragment numbers #1–#6 remain unchanged. Fragments #7–#17 follow the approved sequence below. `From Thought to Form` is Fragment #18: a recovered, previously unnumbered Fragment whose exact source timestamp places it historically between Fragments #5 and #6. Its later series number is intentional; do not renumber published or established pieces and do not invent an insertion number.

The names in this ledger identify source pieces. Except for already approved published metadata, they do not approve final display-title normalization, immutable slugs, summaries, categories, tags, images, or exact historical calendar dates. Preserve each exact UTC source timestamp as evidence and resolve the author-calendar date during the individual content review.

| Number | Ledger identifier | Stable Medium ID | Exact source timestamp | Decision state |
| ---: | --- | --- | --- | --- |
| #1 | Fragments #1 — Feelings Don’t Build Futures | `85172d4a99bb` | `2026-02-09T22:14:21.202Z` | Established; unchanged |
| #2 | Fragments #2 — The Test, The Boundary, The Shift | `23df67a490b5` | `2026-02-15T20:24:31.336Z` | Established; unchanged |
| #3 | Fragments #3 — I Must Write | `cebd9516e906` | `2026-02-24T04:33:48.151Z` | Established; unchanged |
| #4 | Fragments #4 — The Fire | `7301b68ca8b1` | `2026-03-03T05:24:37.207Z` | Established; unchanged |
| #5 | Fragments #5 — Refinement | `7c0c94fad28b` | `2026-03-10T03:01:17.830Z` | Established; published on GarryTipler.com September 13, 2026 |
| #6 | Fragments #6 — Ordering Effort | `3a9207b6326f` | `2026-03-24T04:31:01.256Z` | Published September 28, 2026 |
| #7 | Fragments #7 — From Thought to Structure | `bf876e2dcbed` | `2026-03-31T04:49:59.008Z` | Published September 28, 2026 |
| #8 | Fragments #8 — There Is a Point Where Effort Stops Feeling Like Effort | `9a7ae823bdf4` | `2026-04-21T02:26:05.128Z` | Published September 28, 2026 |
| #9 | Fragments #9 — Pride Is a Trap | `cfad708fd606` | `2026-04-27T23:36:11.189Z` | Published September 28, 2026 |
| #10 | Fragments #10 — Evidence | `35305e3dda5e` | `2026-05-05T06:57:08.415Z` | Published September 28, 2026 |
| #11 | Fragments #11 — Stewardship | `fb3e11bd3307` | `2026-05-12T02:13:05.728Z` | Published September 28, 2026 |
| #12 | Fragments #12 — I Am Not Behind | `52e78d543e3f` | `2026-05-19T05:10:28.217Z` | Published September 28, 2026 |
| #13 | Fragments #13 — I Am Learning to Live Again | `e928236b05e7` | `2026-06-02T07:01:21.868Z` | Published September 28, 2026 |
| #14 | Fragments #14 — Good Morning, Giant | `1ccc5f50d63b` | `2026-06-16T02:29:50.611Z` | Published September 28, 2026 |
| #15 | Fragments #15 — The Quiet Return | `53804a0f815b` | `2026-06-30T04:34:11.957Z` | Published September 28, 2026 |
| #16 | I’m Doing Alright | `c21346d405f0` | `2026-07-07T02:18:11.089Z` | Published September 28, 2026 |
| #17 | Restraint | `3aa53729ddf0` | `2026-07-16T02:56:32.117Z` | Published September 28, 2026 |
| #18 | From Thought to Form | `67d0dec5c6f7` | `2026-03-17T03:42:10.864Z` | Published September 28, 2026; non-chronological placement approved |

The two skipped Medium drafts titled `Pride isn’t always a good thing.` are superseded source versions of Fragment #9, `Pride Is a Trap`. Retain both records and their distinct archive identities as source evidence; do not delete, migrate, publish, or count them as additional Fragments:

- Medium ID `564cb01905e8`; source `posts/draft_Pride-isn-t-always-a-good-thing--564cb01905e8.html`; source SHA-256 `007701cebab6d87872c1b84440cd5602c2ea98d6b0ad7392afd2b425ed97bf88`.
- Medium ID `95effaa9a36c`; source `posts/draft_Pride-isn-t-always-a-good-thing--95effaa9a36c.html`; source SHA-256 `935e6efe2e3f62fdb7cea591c6ad09ee026c7702f0e0ab6698b65a6ee2f512be`.

For Fragment #5, retain the exact export timestamp `2026-03-10T03:01:17.830Z` as migration evidence. The author approved `2026-03-09` as the historical calendar date based on the live Medium page showing March 9 and the timestamp's Los Angeles conversion to March 9 at 8:01:17 p.m. PDT. The preserved source archive and `source.html` remain unchanged.

The author approved Fragment #5 — Refinement for GarryTipler.com publication on September 13, 2026. Its repository entry preserves `originalPublishedDate: 2026-03-09`, records `publishedDate: 2026-09-13`, and omits the remote Medium image by author approval. This publication does not authorize work on Fragment #6 or any later ledger entry.

For Fragment #6, retain the exact export timestamp `2026-03-24T04:31:01.256Z` as migration evidence. The author approved `2026-03-24` as the public historical calendar date because it is the date Medium presented, while the exact UTC timestamp remains preserved for provenance. The reviewed repository draft omits the remote Medium image and Medium-only book CTA by author approval, retains `Fragments continue.`, and was prepared as an unpublished draft. At that stage, the draft did not authorize publication, changes to Medium, or work on Fragment #7.

For Fragment #7, retain the exact export timestamp `2026-03-31T04:49:59.008Z` as migration evidence. The author approved `2026-03-31` as the public historical calendar date because it is the date Medium presented, while the exact UTC timestamp remains preserved for provenance. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft preserves the subtitle and prose exactly, including `Structure is what preserves it.`, omits the unresolved remote Medium image, retains `Fragments continue.`, and was prepared as an unpublished draft. At that stage, the draft did not authorize publication, changes to Medium, or work on Fragment #8.

For Fragment #8, retain the exact export timestamp `2026-04-21T02:26:05.128Z` as migration evidence. The author approved `2026-04-21` as the public historical calendar date because it is the date Medium presented, while the exact UTC timestamp remains preserved for provenance. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft retains the subtitle, omits the duplicate opening title line, preserves all remaining prose exactly, and was prepared as an unpublished draft. The source has no image or Medium CTA. At that stage, the draft did not authorize publication, changes to Medium, or work on Fragment #9.

For Fragment #9, retain the exact export timestamp `2026-04-27T23:36:11.189Z` as migration evidence and use the Medium-presented date `2026-04-27` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft omits the unresolved remote image, preserves the body and separators, and retains the CuriousMind acknowledgment as plain text without its Medium profile link. The published source remains authoritative over the two superseded Pride drafts recorded above. The piece was prepared as an unpublished draft.

For Fragment #10, retain the exact export timestamp `2026-05-05T06:57:08.415Z` as migration evidence and use the Medium-presented date `2026-05-05` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft uses the source's opening line as its subtitle rather than duplicating it in the body, removes the promotional Amazon Author Page block, preserves `I AM THE PROOF` exactly, and retains the three-line closing. The piece was prepared as an unpublished draft.

For Fragment #11, retain the exact export timestamp `2026-05-12T02:13:05.728Z` as migration evidence and use the Medium-presented date `2026-05-12` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft normalizes the malformed exported title to `Fragments #11 — Stewardship`, uses the opening source line as its subtitle rather than duplicating it in the body, and preserves all remaining prose exactly. The source has no image or CTA. The piece was prepared as an unpublished draft. At that stage, these drafts did not authorize publication, changes to Medium, or work on Fragment #12.

For Fragment #12, retain the exact export timestamp `2026-05-19T05:10:28.217Z` as migration evidence and use the Medium-presented date `2026-05-19` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft preserves the distinct opening heading and all body prose exactly, normalizing only the exported nonbreaking space in `was behind`. The source subtitle `Sometimes the delay is not failure. Sometimes it is the shape of real work` remains migration metadata rather than being inserted into the body. The source has no image, link, or CTA, and the piece was prepared as an unpublished draft.

For Fragment #13, retain the exact export timestamp `2026-06-02T07:01:21.868Z` as migration evidence and use `2026-06-02` as the public historical date; the timestamp and Los Angeles calendar date agree. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft uses the `Recovery` category and preserves the complete body exactly, including the closing movement. The source subtitle `Discipline gave me structure. Now I am learning to let it give me life back.` remains migration metadata rather than being inserted into the body. The source has no image, link, or CTA, and the piece was prepared as an unpublished draft.

For Fragment #14, retain the exact export timestamp `2026-06-16T02:29:50.611Z` as migration evidence and use the Medium-presented date `2026-06-16` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft omits the duplicate body title, preserves all three `Good morning, Giant` refrains as headings, and normalizes their exported nonbreaking spaces to ordinary spaces. The source subtitle `Reflective. Honest. Strong. Grounded.` remains migration metadata rather than being inserted into the body. The source has no image, link, or CTA, and the piece was prepared as an unpublished draft.

For Fragment #15, retain the exact export timestamp `2026-06-30T04:34:11.957Z` as migration evidence and use the Medium-presented date `2026-06-30` as the public historical date. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft uses the `Recovery` category, omits the duplicate body title and subtitle, and preserves all remaining prose exactly, including the repeated doors-and-windows contrast. The source subtitle `Coming back to softness, love, openness, and simple living without losing strength.` remains migration metadata. The source has no image, link, or CTA, and the piece was prepared as an unpublished draft. At that stage, these drafts did not authorize publication, changes to Medium, or work on Fragment #16.

For Fragment #16, retain the exact export timestamp `2026-07-07T02:18:11.089Z` as migration evidence. The export footer says July 7, while the owner-facing Medium Stories list says July 6; the author approved `2026-07-06` as the historical calendar date. The reviewed repository entry uses the approved Fragment title and number, `Recovery` category, and standard tags. It omits the duplicate body title but retains the opening sentence as body prose once, followed by all remaining prose. The source has no image, link, or CTA. The author approved GarryTipler.com publication on September 28, 2026; Medium canonical settings remain unchanged.

For Fragment #17, the export timestamp is `2026-07-16T02:56:32.117Z`, while the owner-facing Medium Stories list displays July 15. The author approved `originalPublishedDate: 2026-07-15` and the reviewed title, slug, summary, category, tags, and image alt text. The saved source image is local and appears before the prose, matching its source position. The author approved GarryTipler.com publication on September 28, 2026; Medium canonical settings remain unchanged.

For Fragment #18, the export timestamp is `2026-03-17T03:42:10.864Z`, while the owner-facing Medium Stories list displays March 16. The author approved `originalPublishedDate: 2026-03-16` and the reviewed numbered title, slug, summary, category, and tags. The entry omits the duplicated body title and subtitle, preserves the remaining prose and source book link, and has no image in the source. The author approved GarryTipler.com publication on September 28, 2026; Medium canonical settings remain unchanged.

For Fragment #19, `What I Carry Forward` (Medium ID `438368cc6eab`) was published after the saved August 10 account export and is reviewed from the live Medium story. The owner-facing Published Stories list says August 10, 2026, while the story page displays August 11; the author approved the #19 classification and metadata using `originalPublishedDate: 2026-08-10`. Its 39 prose and heading blocks, with the duplicate page title omitted, produced SHA-256 `4a18308fe787c4f91cfb7f5db5760c8cd795b2c88d72911010c0e99fe27b1daa` as UTF-8 Markdown with LF line endings. The single lead image is saved locally before the prose. The author approved GarryTipler.com publication on September 28, 2026; Medium canonical settings remain unchanged.

On September 28, 2026, the author approved publication of Fragments #6–#15 as one batch. Each entry kept its reviewed historical date and gained `publishedDate: 2026-09-28` and `status: published`. Medium canonical settings were not changed.

For Fragment #20, `Fragments #20 — I’m Not Waiting to Arrive` (Medium ID `82a4ff5d19db`) was reviewed from the live Medium story. The author confirmed `originalPublishedDate: 2026-09-28` and approved the review draft and metadata on September 29, 2026. All 116 prose blocks and 26 hard line breaks remain unchanged; the UTF-8 LF source SHA-256 is `94cdf2d3ddabc850e2b0a66a96908f82e9f948abc4c2de16b137c2cbbf35d2b9`. The single lead image is saved locally, with its original caption and approved descriptive alt text. The author approved publication, commit and push. The repository entry records `publishedDate: 2026-09-29` and `status: published`; live deployment is verified separately after push. Writing-tool tests and full validation passed with 26 published entries. The article was visually reviewed at 1440px and 390px. Medium canonical settings remain unchanged.

## Historical date and image reconciliation

The author clarified that the dates in the owner-facing Medium Stories list are the original publication dates to carry onto GarryTipler.com. This later decision supersedes the historical-date choices recorded in the individual review notes above where those choices used the export's next-day UTC date. Preserve every existing `publishedDate`, which records when the site first published the article.

| Fragment | Medium Stories date | Site correction |
| ---: | --- | --- |
| #4 | 2026-03-02 | Add missing `originalPublishedDate` |
| #6 | 2026-03-23 | Replace 2026-03-24 |
| #7 | 2026-03-30 | Replace 2026-03-31 |
| #8 | 2026-04-20 | Replace 2026-04-21 |
| #10 | 2026-05-04 | Replace 2026-05-05 |
| #11 | 2026-05-11 | Replace 2026-05-12 |
| #12 | 2026-05-18 | Replace 2026-05-19 |
| #14 | 2026-06-15 | Replace 2026-06-16 |
| #15 | 2026-06-29 | Replace 2026-06-30 |

The author also requested that images from published Medium pieces come over. The four previously omitted images for Fragments #5, #6, #7, and #9 are now local site assets. Images for #5, #7, and #9 appear before the article prose; #6 remains between `Order does not reduce ambition. It strengthens it.` and `Fragments continue.` as in the source. The existing Essay image stays unchanged. The author-approved omission of the Medium-only book CTA in #6 remains in effect.

## Day series migration

The author approved the reviewed Day 1–5 Essay batch for GarryTipler.com publication on September 28, 2026. Their source records are in the ignored August 10 Medium export review packages under `.migration-output/essays/`. The owner-facing Medium Published Stories list supplies the original calendar dates below; the export's exact UTC timestamps and source SHA-256 hashes remain in each `source.json`.

| Day | Medium ID | Original Medium date | Site slug | Source formatting decision |
| ---: | --- | --- | --- | --- |
| 1 | `7df690cfe384` | 2025-12-05 | `day-1-begin` | Omit duplicated page title; present the long opening subtitle as normal prose at the author's request. |
| 2 | `0173e86abe50` | 2025-12-06 | `day-2-picking-up-where-i-left-off` | Preserve body prose. |
| 3 | `4a24aecef70f` | 2025-12-07 | `day-3-continuing-to-write` | Preserve body prose. |
| 4 | `3e275d12f0ee` | 2025-12-08 | `day-4-im-doing-it` | Omit duplicated page title; preserve remaining prose. |
| 5 | `7edc3237260a` | 2025-12-09 | `day-5-just-write` | Preserve body prose. |

The live Medium pages and export packages showed no body images or outbound prose links for Days 1–5. Medium canonical settings remain unchanged.

The author reviewed and approved the Day 6–10 Essay batch for publication on September 29, 2026. Each entry retains the reviewed title, slug and source-subtitle summary, uses the same Discipline category and tags as Days 1–5, and records `publishedDate: 2026-09-29`. Original Medium dates are December 10–14, 2025, confirmed against the owner-facing date record and live pages. Exact source timestamps and HTML hashes remain in the untouched export packages.

| Day | Medium ID | Original Medium date | Site slug | Approved formatting |
| ---: | --- | --- | --- | --- |
| 6 | `4aafc83760d6` | 2025-12-10 | `day-6-i-press-on` | Omit duplicated export title; preserve all eight prose blocks. |
| 7 | `4c142807c68d` | 2025-12-11 | `day-7-continue-to-write` | Omit duplicated export title; preserve all ten prose blocks. |
| 8 | `baa06e0fbf7a` | 2025-12-12 | `day-8-keep-at-it` | Repair an invalid Markdown emphasis boundary without changing visible text; preserve separators and bold TipTalks name. |
| 9 | `d7bc7f463fbc` | 2025-12-13 | `day-9-the-death-of-old-garry` | Save the portrait lead image locally with reviewed alt text; preserve source bullets and bold labels; retain the exact YouTube URL as a clickable link. |
| 10 | `2e48be9f62ec` | 2025-12-14 | `day-10-i-am-not-for-everyone` | Preserve source list markers and bullet-only lines; retain the exact YouTube URL as a clickable link. |

All 64 prose/list blocks matched the live source after Markdown and whitespace normalization. Private review packages and per-entry hashes are retained under `.migration-output/day-series-review-6-10/`. No prose rewriting, relationship inference or changes to existing articles were approved. Medium canonical settings remain unchanged.

The author reviewed and approved the Day 11–15 Essay batch for publication on September 29, 2026. Each entry retains its reviewed title and slug, uses the established Discipline category and tags, and records `publishedDate: 2026-09-29`. The live Medium dates below follow the author-calendar date contract; exact UTC timestamps and source hashes remain in the untouched export packages.

| Day | Medium ID | Original Medium date | Site slug | Approved formatting |
| ---: | --- | --- | --- | --- |
| 11 | `77fc75623e1a` | 2025-12-15 | `day-11-testimony` | Preserve source lists and bullet-only lines. |
| 12 | `b3232fb384a5` | 2025-12-16 | `day-12-the-test` | Preserve prose and literal bullet separators. |
| 13 | `989e229aabb1` | 2025-12-17 | `day-13-today-has-been-a-good-day` | Preserve source lists and bullet-only lines; make the exact YouTube URL clickable. |
| 14 | `0f4aa7c47d5d` | 2025-12-18 | `day-14-looking-back` | Preserve journal date, emphasis and labels; retain the source slug despite the Faith Before Evidence title. |
| 15 | `a634190dd45f` | 2025-12-19 | `day-15-everything-i-need-finds-me` | Preserve separators, prose and final emphasis; remove the stray Me prefix from the subtitle summary by explicit author instruction. |

All 90 prose/list blocks matched the live source and rendered preview after Markdown and whitespace normalization. These five source stories have no body images. Private review packages and per-entry hashes remain under `.migration-output/day-series-review-11-15/`. No inferred relationships, existing article edits or Medium canonical changes were approved.

The author reviewed and approved Days 16–20 for publication on September 29, 2026. All five retain the reviewed titles, source-subtitle summaries, explicit slugs, established Discipline category and tags, with `publishedDate: 2026-09-29`.

| Day | Medium ID | Original Medium date | Site slug |
| ---: | --- | --- | --- |
| 16 | `3752da46a194` | 2025-12-20 | `day-16-through-the-furnace` |
| 17 | `73f762c7b04e` | 2025-12-21 | `day-17-i-do-reflecting` |
| 18 | `39c702a3c850` | 2025-12-22 | `day-18-i-havent-had-a-bed-in-almost-a-year` |
| 19 | `a4ce96c64d5c` | 2025-12-23 | `day-19-i-will-not-flinch` |
| 20 | `f4bf0e359316` | 2025-12-24 | `day-20-last-christmas-i-was-in-a-shelter` |

All 93 prose blocks and every bold/italic passage match the live Medium source after formatting and whitespace normalization. Day 16 repairs an invalid Markdown emphasis boundary without changing visible prose. Original dates follow the live Medium author-calendar contract, while exact UTC timestamps and saved HTML hashes remain untouched. These five pieces have no body images or outbound prose links. Private review evidence remains under `.migration-output/day-series-review-16-20/`. No inferred relationships, existing article edits or Medium canonical changes were approved.

The author reviewed and approved Days 21–25 for publication on September 29, 2026. All five preserve the reviewed titles, source-subtitle summaries, explicit slugs, Discipline category and standard tags, and record publishedDate: 2026-09-29. Original Medium calendar dates are December 25–29, 2025, respectively; exact export timestamps and hashes remain in the private source records.

| Day | Approved slug | Stable Medium ID | Original date |
| ---: | --- | --- | --- |
| 21 | day-21-i-am-the-proof | 6f8b75e457df | 2025-12-25 |
| 22 | day-22-the-world-is-new-again | 936d1afd5a68 | 2025-12-26 |
| 23 | day-23-everything-is-coming-together | 7a19cfdfd204 | 2025-12-27 |
| 24 | day-24-february-2nd-i-declared-it | 2253e6bd52db | 2025-12-28 |
| 25 | day-25-i-choose-to-see-rejection-as-redirection | e859a8c44406 | 2025-12-29 |

All 75 prose and heading blocks and their emphasis match the live source after mechanical formatting normalization. Day 21 uses the live source title capitalization, repairs a bold-marker boundary, preserves both quotations, and retains the original portrait locally after the closing paragraph with reviewed descriptive alt text. Day 22 repairs a bold-marker boundary and preserves its exact YouTube channel link. Day 25's subsection heading level matches the live source. No prose was rewritten. The private drafts passed draft-exclusion checks; the reviewed published preview passed writing-tool tests, full validation, and desktop/390px visual inspection. Medium settings, layout, schema, dependencies, and existing articles remain unchanged.

The author approved Days 26–30 for publication on September 29, 2026. The entries retain the reviewed metadata, original Medium calendar dates December 30, 2025 through January 3, 2026, and record publishedDate: 2026-09-29. Their explicit slugs and source IDs are:

| Day | Approved slug | Stable Medium ID |
| ---: | --- | --- |
| 26 | day-26-2026-im-ready | 4c5ee1f0edfb |
| 27 | day-27-you-cant-hit-a-target-you-can-t-see | 412520cda58d |
| 28 | day-28-we-get-to-make-it-up | e9c216851ff3 |
| 29 | day-29-if-its-hard-do-it-hard | 6792ef5008f4 |
| 30 | day-30-i-am-the-proof | 32b9f1120275 |

All 119 prose and heading blocks and their emphasis match the live source after whitespace normalization. Heading levels match Medium. The author chose Day 28's current title, Day 28: January 1st, 2026. New Year’s Day., using a supplied screenshot; its duplicate opening date heading is omitted. Day 30 retains the original local lead image and caption “I AM THE PROOF”, and repairs only the invalid emphasis boundary around Dear Writer. Private drafts passed exclusion checks; writing-tool tests and full validation passed, with desktop/mobile review completed. The independent Essay Discipline Should Not Cost Me My Heart remains a separate Essay and is excluded from the 30-day title pass. Medium settings, layouts, schema, dependencies and existing article bodies remain unchanged.

All 30 Day-series pieces now have publication approval. After reviewing the complete list on September 29, 2026, the author noted that every series title already carries its day number. The earlier display-title formatting pass is canceled; retain the reviewed titles. Later on September 29, 2026, the author approved one mechanical consistency fix: every Day title now uses `Day N: ` (Days 1–13 previously read `Day N : `), and Day 30's stray space before its comma was removed (`In Fact, I Am the Proof`). Wording, capitalization, slugs, dates and series order are unchanged. Discipline Should Not Cost Me My Heart remains unchanged as a separate Essay.

## Medium export commands

Inspect an explicit ZIP without writing output:

```powershell
npm.cmd run import:medium -- --input C:\path\to\medium-export.zip
```

Create review-only packages and manifests:

```powershell
npm.cmd run import:medium -- --input C:\path\to\medium-export.zip --write
```

Use `--output <review-root>` only when a separate ignored review directory is needed. The importer refuses any output inside `src/content`, any existing package or manifest path, duplicate proposed identifiers, and repository identifier collisions. Never resolve a refusal by changing an already published slug or deleting unreviewed output casually.

## Metadata input contract

Required fields:

- `title`, `slug`, `type`, `summary`, and `category` follow the content schema.
- `sourceEvidence` identifies the authoritative source used. It is an audit note and is never emitted into public frontmatter.
- `fragmentNumber` is required only for a Fragment.

Optional emitted fields are `tags`, `originalPublishedDate`, `mediumUrl`, `related`, `connections`, and `heroImage`. Tags and relationships default to empty arrays; connections default to an empty array.

If `originalPublishedDate` is present, `originalPublishedDateEvidence` is also required. The evidence note is checked but not emitted. Keep private evidence outside the public content tree; record a concise non-sensitive description such as the export filename and verified metadata field. If the exact date is unknown, omit both fields. Relative labels such as “17 hours ago” are never acceptable evidence.

The generator rejects unknown metadata fields so a typo cannot silently discard a decision. It does not accept `publishedDate`, `updatedDate`, `featured`, `startHereOrder`, or `status`; those are repository editorial decisions made during manual review.

Example shape (the angle-bracketed instructions are deliberately invalid and must be replaced):

```json
{
  "title": "<exact source title>",
  "slug": "<approved-immutable-slug>",
  "type": "essay",
  "summary": "<editorial summary>",
  "category": "<approved category>",
  "tags": [],
  "mediumUrl": "<verified absolute URL, or omit>",
  "sourceEvidence": "<private source record description>"
}
```

## Asset convention

Store migrated article assets by article under:

```text
assets/writing/<collection>/<slug>/
```

Reference them from Markdown and `heroImage.src` with root-relative paths such as `/assets/writing/essays/example-slug/lead.jpg`. Preserve verified alt text, captions, and credits exactly. Do not invent missing attribution. `npm run validate:writing` fails when a local Markdown image or `heroImage.src` points to a missing file.

## Conversion command

From the repository root in PowerShell:

```powershell
npm.cmd run migrate:writing -- --source C:\path\to\source.md --metadata C:\path\to\metadata.json
```

To choose another review-only location outside `src/content`:

```powershell
npm.cmd run migrate:writing -- --source C:\path\to\source.md --metadata C:\path\to\metadata.json --output .migration-output\trial\index.md
```

Run the same command only after removing or renaming an earlier generated draft; overwrite behavior is intentionally unavailable. The command is deterministic for the same input and preserves the source Markdown bytes after the generated frontmatter.

## Migration checklist

Before conversion:

- Identify an authoritative export, local source, or deliberately copied Markdown file.
- Compare the title and every prose block with that source.
- Record the source evidence privately.
- Add `originalPublishedDate` only when an exact calendar date is verified; record its evidence separately.
- Choose the explicit slug carefully and check that it has never been published under another identifier.
- Verify image files, alt text, captions, credits, and usage rights.

During review:

- Diff the generated body against the source; do not improve or rewrite prose.
- Allow only structural Markdown changes needed for headings, lists, links, emphasis, quotations, and images.
- Review category and tags editorially.
- Keep `related` explicit and verify every `type:slug`; never derive it from tags.
- Keep `status: "draft"`. Do not add `publishedDate` until publication is approved.
- Use the canonical manual templates in `templates/writing/` when generation is not appropriate.

Before publication:

- Move the reviewed draft manually to `src/content/writing/<collection>/<slug>/index.md`.
- Add the approved GarryTipler.com go-live date as `publishedDate` and change `status` to `published` only when publication is authorized.
- Run `npm.cmd run test:writing-tools` and `npm.cmd run validate`.
- Inspect the article route, canonical metadata, JSON-LD, previous/next behavior, indexes, archive, Start Here, sitemap, RSS, and robots output as applicable.
- Review desktop and 390px mobile presentation when the article contains new structural formatting or images.
- Run `git diff --check` and review the exact diff. Commit and push only with explicit approval.

## Validation and recovery

`npm.cmd run validate:writing` checks required metadata, exact real dates, file location, duplicate `type:slug`, Fragment numbers, Start Here order, related-writing integrity, and missing local assets. The full `npm.cmd run validate` runs that check before the Astro build and generated-output verification.

On failure, correct the named source, metadata, relationship, path, or asset and rerun the command. A failed generator does not publish or replace anything. If a review draft is stale, inspect it, delete or archive that specific `.migration-output` entry, and regenerate. Never resolve a collision by changing an already published slug.
