# Next Session — Session 5: Migration Tooling

**Planned continuation:** Friday, August 7, 2026
**Current production head:** `d54ec13` — `Add Session 4 archive and discovery`
**Scope:** Migration tooling only. Do not begin bulk migration automatically.

## Current position

Sessions 2–4 are approved, committed, deployed, and verified on GarryTipler.com.

The repository now has:

- Astro 7 static output and GitHub Pages workflow deployment from generated `dist/`.
- A validated Markdown Writing content collection.
- Writing, Fragments, Essays, Archive, and Start Here pages.
- Reusable article/index layouts.
- Previous/next navigation.
- Explicit related-writing and project/book/guide connection support.
- Self-canonical SEO metadata and Article JSON-LD.
- Generated sitemap, RSS, and robots.txt.
- One real published pilot: Fragment #4 — The Fire.

Read `SESSION.md` for the full implementation record before changing code.

## Session 5 objective

Create a repeatable, safe workflow for turning verified source material—especially Medium exports or deliberately copied source—into repository-ready Markdown without weakening the permanent content contract.

The tooling should reduce mechanical work while keeping editorial and historical decisions explicit. It must not invent dates, rewrite prose, auto-create relationships, or publish content without review.

## Locked contracts

- The repository remains the source of truth.
- Markdown remains the default authoring format.
- Existing Medium posts remain online.
- GarryTipler.com remains self-canonical.
- Slugs are explicit, immutable publication identifiers.
- `originalPublishedDate` is recorded only when an exact date is verified.
- If an exact historical date cannot be verified, leave `originalPublishedDate` unset and document the gap.
- Never convert relative dates such as “17 hours ago” into historical truth.
- `publishedDate` means the date the GarryTipler.com copy goes live.
- Migrated prose must remain exact except for formatting required by Markdown.
- Drafts must remain absent from routes, indexes, archive, Start Here, sitemap, RSS, and discovery.
- Related-writing identifiers remain explicit and authoritative.
- Do not infer relationships from overlapping tags.
- Do not add a CMS, database, MDX, React runtime, or full-text search.
- Do not redesign existing pages.
- Do not begin Session 6 or unrelated work.
- Do not commit or push unless explicitly instructed.

## In scope

Implement the smallest durable migration toolkit that may include:

1. **A canonical writing template**
   - Valid frontmatter fields.
   - Clear required/optional annotations.
   - Separate examples for Fragment and Essay where useful.
   - No placeholder value that could be mistaken for verified metadata.

2. **A migration checklist**
   - Source verification.
   - Exact-title and prose-preservation checks.
   - Historical-date evidence.
   - Slug selection and immutability warning.
   - Image and attribution checks.
   - Local build, route, metadata, and visual review.

3. **A validation command or script**
   - Required metadata.
   - Exact dates.
   - Duplicate `type + slug`.
   - Duplicate Fragment number.
   - Duplicate Start Here order.
   - Missing/self/draft related-writing references.
   - Draft exclusion.
   - Clear, actionable failure output.

4. **A repeatable conversion path**
   - Prefer a Medium export or user-supplied source file over live scraping.
   - Accept copied HTML/Markdown only through an explicit input path.
   - Normalize structural formatting without rewriting prose.
   - Produce a reviewable Markdown draft rather than publishing directly.
   - Use dry-run behavior where practical.

5. **Asset conventions**
   - Define where migrated article images live.
   - Preserve alt text, captions, and credits when verified.
   - Detect missing referenced assets before publication.

6. **Documentation**
   - Exact commands.
   - Input and output expectations.
   - Manual-review boundaries.
   - Failure recovery.

## Out of scope

- Bulk migration of the writing library.
- Silent or automatic publication.
- Guessing original publication dates.
- Rewriting or “improving” migrated prose.
- Automated semantic tagging or related-work inference.
- Archive, Start Here, or index redesign.
- Search or tag-filter UI.
- CMS or database work.
- Homepage redesign.

## Decisions to make before implementation

Inspect available source material and choose the narrowest supported input:

1. Medium export files, if available.
2. Authoritative local source files.
3. Deliberately copied Medium HTML or Markdown.
4. Manual Markdown entry using the canonical template.

Do not make a live Medium scraper a required publishing dependency. If more than one input format is justified, normalize them into one intermediate record before generating Markdown.

Also confirm:

- Whether migrated images will be article-local or stored under a shared writing asset directory.
- Whether the first tooling trial uses a disposable fixture or one explicitly approved real essay.
- How source evidence for exact historical dates will be recorded in the migration checklist without exposing private material publicly.

## Recommended work order

1. Re-read `AGENTS.md`, `NEXT_SESSION.md`, and `SESSION.md`.
2. Inspect the current schema, validation, loader, and pilot Markdown.
3. Inspect the available Medium/export/source format before choosing tooling.
4. Write the migration input/output contract.
5. Add the template and checklist.
6. Implement the smallest conversion/validation command.
7. Exercise it with disposable fixtures.
8. Confirm generated Markdown passes the existing collection contract.
9. Remove all fixtures and run the clean final validation.
10. Stop before bulk migration and report results.

## Acceptance criteria

- `npm run validate` passes on the clean repository.
- A representative input can produce reviewable Markdown deterministically.
- Prose is preserved exactly.
- Unverified historical dates remain unset rather than inferred.
- Invalid required metadata fails clearly.
- Duplicate slugs, Fragment numbers, and Start Here orders fail clearly.
- Broken, self-referencing, or draft-target related identifiers fail clearly.
- Draft output does not enter any public route or generated discovery output.
- Generated files follow the existing content and route conventions.
- The workflow cannot overwrite an existing published slug without an explicit, visible failure.
- Migration documentation is sufficient to repeat the process later.
- `git diff --check` passes.
- No temporary fixtures remain.
- No commit or push occurs without explicit approval.

## Useful commands

```powershell
npm.cmd run dev
npm.cmd run validate
git diff --check
git status --short
```

Astro telemetry may need to be disabled in restricted local environments:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm.cmd run validate
```

## Friday stopping point

Stop after the migration toolkit, documentation, fixtures, and validation are complete. Report the exact files changed, supported inputs, commands, validation evidence, limitations, unresolved source questions, Git status, and recommended first migration batch. Do not start bulk migration automatically.
