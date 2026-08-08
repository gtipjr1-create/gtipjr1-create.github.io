# Writing migration workflow

The current workflow turns deliberately supplied Markdown into a reviewable repository draft. It does not scrape Medium, rewrite prose, infer metadata, publish content, or write into `src/content`.

## Supported input and output

Use two explicit input files:

1. A UTF-8 `.md` or `.markdown` file containing prose only, with no frontmatter.
2. A UTF-8 JSON metadata file containing one object.

The default output is `.migration-output/<collection>/<slug>/index.md`. That directory is ignored by Git and is outside Astro's content collection. Generation always sets `status: "draft"`, omits `publishedDate`, and refuses to overwrite either an existing review draft or an existing repository slug.

This path was proven with the first real Essay migration, “Discipline Should Not Cost Me My Heart.” The review draft preserved the supplied prose, exact historical date evidence, Medium URL, tags, and lead image before manual publication.

HTML, Medium ZIP exports, live URLs, and bulk directories are not supported by the current command. A Medium account-data export was requested on August 7, 2026 and is expected within 24 hours. Session 7 will inspect that untouched ZIP before defining or implementing batch parsing rules. Do not use a live scraper as publication evidence.

## Planned Medium export path

The export ZIP is private source input, not a repository artifact. When it arrives:

- Keep the original ZIP untouched until its filename, size, and SHA-256 hash are recorded.
- Do not commit the ZIP, extracted account data, or unrelated private records.
- Inspect the real archive structure before adding format assumptions.
- Distinguish authored published stories from drafts, responses, bookmarks, profile data, and other account records.
- Normalize supported stories into the existing Markdown-plus-metadata contract rather than creating a second publication path.
- Generate a review manifest and draft packages under `.migration-output`; never write batch output directly into `src/content`.
- Report missing dates, assets, URLs, or editorial metadata explicitly instead of guessing.
- Detect already migrated pieces and refuse to overwrite their immutable identifiers.

The planned importer will reduce mechanical extraction for the full archive, but publication will still happen in small explicitly approved batches after prose, metadata, assets, and presentation are reviewed.

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
