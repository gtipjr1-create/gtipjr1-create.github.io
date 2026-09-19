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
| #6 | Fragments #6 — Ordering Effort | `3a9207b6326f` | `2026-03-24T04:31:01.256Z` | Established; reviewed repository draft |
| #7 | Fragments #7 — From Thought to Structure | `bf876e2dcbed` | `2026-03-31T04:49:59.008Z` | Author-approved reviewed repository draft |
| #8 | There is a point where effort stops feeling like effort. | `9a7ae823bdf4` | `2026-04-21T02:26:05.128Z` | Author-approved Fragment number |
| #9 | Pride Is a Trap | `cfad708fd606` | `2026-04-27T23:36:11.189Z` | Author-approved Fragment number |
| #10 | Evidence | `35305e3dda5e` | `2026-05-05T06:57:08.415Z` | Author-approved Fragment number |
| #11 | Stewardship | `fb3e11bd3307` | `2026-05-12T02:13:05.728Z` | Author-approved Fragment number |
| #12 | I Am Not Behind | `52e78d543e3f` | `2026-05-19T05:10:28.217Z` | Author-approved Fragment number |
| #13 | I Am Learning to Live Again | `e928236b05e7` | `2026-06-02T07:01:21.868Z` | Author-approved Fragment number |
| #14 | Good Morning, Giant | `1ccc5f50d63b` | `2026-06-16T02:29:50.611Z` | Author-approved Fragment number |
| #15 | The Quiet Return | `53804a0f815b` | `2026-06-30T04:34:11.957Z` | Author-approved Fragment number |
| #16 | I’m Doing Alright | `c21346d405f0` | `2026-07-07T02:18:11.089Z` | Author-approved Fragment number |
| #17 | Restraint | `3aa53729ddf0` | `2026-07-16T02:56:32.117Z` | Author-approved Fragment number |
| #18 | From Thought to Form | `67d0dec5c6f7` | `2026-03-17T03:42:10.864Z` | Recovered, previously unnumbered Fragment; non-chronological placement approved |

The two skipped Medium drafts titled `Pride isn’t always a good thing.` are superseded source versions of Fragment #9, `Pride Is a Trap`. Retain both records and their distinct archive identities as source evidence; do not delete, migrate, publish, or count them as additional Fragments:

- Medium ID `564cb01905e8`; source `posts/draft_Pride-isn-t-always-a-good-thing--564cb01905e8.html`; source SHA-256 `007701cebab6d87872c1b84440cd5602c2ea98d6b0ad7392afd2b425ed97bf88`.
- Medium ID `95effaa9a36c`; source `posts/draft_Pride-isn-t-always-a-good-thing--95effaa9a36c.html`; source SHA-256 `935e6efe2e3f62fdb7cea591c6ad09ee026c7702f0e0ab6698b65a6ee2f512be`.

For Fragment #5, retain the exact export timestamp `2026-03-10T03:01:17.830Z` as migration evidence. The author approved `2026-03-09` as the historical calendar date based on the live Medium page showing March 9 and the timestamp's Los Angeles conversion to March 9 at 8:01:17 p.m. PDT. The preserved source archive and `source.html` remain unchanged.

The author approved Fragment #5 — Refinement for GarryTipler.com publication on September 13, 2026. Its repository entry preserves `originalPublishedDate: 2026-03-09`, records `publishedDate: 2026-09-13`, and omits the remote Medium image by author approval. This publication does not authorize work on Fragment #6 or any later ledger entry.

For Fragment #6, retain the exact export timestamp `2026-03-24T04:31:01.256Z` as migration evidence. The author approved `2026-03-24` as the public historical calendar date because it is the date Medium presented, while the exact UTC timestamp remains preserved for provenance. The reviewed repository draft omits the remote Medium image and Medium-only book CTA by author approval, retains `Fragments continue.`, and remains unpublished. This draft does not authorize publication, changes to Medium, or work on Fragment #7.

For Fragment #7, retain the exact export timestamp `2026-03-31T04:49:59.008Z` as migration evidence. The author approved `2026-03-31` as the public historical calendar date because it is the date Medium presented, while the exact UTC timestamp remains preserved for provenance. The approved Fragment ledger overrides the importer's earlier Essay proposal. The reviewed repository draft preserves the subtitle and prose exactly, including `Structure is what preserves it.`, omits the unresolved remote Medium image, retains `Fragments continue.`, and remains unpublished. This draft does not authorize publication, changes to Medium, or work on Fragment #8.

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
