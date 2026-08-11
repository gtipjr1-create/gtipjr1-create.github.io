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
