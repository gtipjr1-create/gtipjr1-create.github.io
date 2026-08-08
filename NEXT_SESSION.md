# Next Session — Session 7: Medium Export Importer

**Planned continuation:** Begin when the untouched Medium account-data ZIP arrives.

**Current production head:** `553f052` — `feat: reshape homepage hierarchy and flow`

**Scope:** Inspect the real Medium export and build a safe batch-to-review workflow. Do not bulk publish.

## Current position

Sessions 5–6 and the approved homepage refinement are complete, committed, deployed, and verified on GarryTipler.com.

The repository now has:

- A deterministic Markdown-plus-JSON draft generator.
- Permanent writing validation for metadata, dates, collisions, relationships, draft exclusion, and assets.
- Canonical Fragment and Essay templates.
- A documented manual-review and publication workflow.
- Dynamic generated-output checks for every published writing route, sitemap entry, RSS entry, and archive-year count.
- Two verified live pieces:
  - Fragment #4 — The Fire.
  - Discipline Should Not Cost Me My Heart.
- One completed real migration proving exact prose preservation, historical-date evidence, image handling, publication, deployment, and live verification.
- Article hero images now drive on-page presentation, Open Graph, Twitter, and Article JSON-LD metadata when supplied.
- The restrained homepage refinement is live with clearer navigation, stronger hierarchy, compact SelfTrainer evidence, promoted self-hosted writing, and consolidated continuation surfaces.

The user requested a Medium account-data export on Friday, August 7. It had not arrived when this handoff was updated on Saturday, August 8. Do not design or start the importer before the untouched ZIP is present; use that archive as the authoritative format sample.

The homepage implementation commit is synchronized with `origin/main`, but this handoff leaves `index.html`, `SESSION.md`, and `NEXT_SESSION.md` modified and `artifacts/` untracked. The `index.html` change is a validated mobile-only footer adjustment that keeps the copyright line from wrapping on the user’s physical phone; it is not committed, pushed, or deployed. The screenshots in `artifacts/` are homepage-review output, not Medium export input. Preserve them unless the user explicitly decides otherwise.

Read `AGENTS.md`, `SESSION.md`, and `docs/writing-migration.md` before changing code.

## Session 7 objective

Extend the migration toolkit so one untouched Medium export can produce a deterministic review queue for many authored stories without manual article-by-article copying.

The importer should remove mechanical extraction work while keeping every publication decision explicit. It must generate review drafts and a manifest, not public content.

## Locked contracts

- Treat the export as private input. Never commit the ZIP or unrelated account data.
- Inspect the actual archive before designing or changing the importer.
- Use exported source material instead of live scraping.
- The repository remains the source of truth after review and publication.
- Markdown remains the default authoring format.
- Existing Medium posts remain online.
- GarryTipler.com remains self-canonical.
- Slugs are explicit and immutable after publication.
- Never infer an exact historical date from a relative label.
- Never rewrite or “improve” exported prose.
- Never infer related writing from tags or text similarity.
- Every generated item must remain `status: "draft"` with no `publishedDate`.
- Existing repository slugs must fail visibly or be reported as already migrated; never overwrite them.
- Do not add a CMS, database, MDX, React runtime, live scraper, search UI, or redesign.
- Do not commit or push unless explicitly instructed.

## First actions

1. Inspect the inherited worktree and preserve the uncommitted handoff docs and untracked homepage-review artifacts.
2. Confirm the untouched Medium ZIP is present before beginning importer work.
3. Record the ZIP filename, size, and SHA-256 hash without printing private contents broadly.
4. Ensure the raw export and extraction directory are ignored by Git before unpacking.
5. Inventory only the archive structure needed to identify authored posts, metadata, and assets.
6. Determine whether the export contains drafts, responses, bookmarks, profile data, or other private records that must be excluded.
7. Inspect one Essay and one Fragment-like entry before generalizing parsing rules.

## In scope

### Export inspection

- Identify story files, asset directories, filenames, encodings, and internal references.
- Determine which fields reliably provide title, subtitle, canonical Medium URL, exact publication date, tags, and publication status.
- Establish how authored stories differ from drafts, responses, and non-story account data.
- Document any missing or ambiguous fields rather than guessing.

### Safe batch importer

- Accept one explicit ZIP or extracted-export path.
- Default to dry-run or review-only behavior.
- Normalize supported stories into the existing Markdown-plus-metadata contract.
- Reuse the current single-item generator where practical.
- Preserve prose and structural elements deterministically.
- Copy verified local export images into article-specific review asset directories.
- Produce `.migration-output/<collection>/<slug>/` review packages.
- Refuse output collisions and existing repository identifiers.

### Review manifest

Produce a concise machine-readable and human-readable manifest showing, for every candidate:

- Source filename or export identifier.
- Exact title.
- Proposed type and slug.
- Verified original date or an explicit missing-date warning.
- Medium URL when present.
- Asset count and unresolved asset references.
- Metadata still requiring editorial approval.
- Import status: ready for review, skipped, already migrated, or blocked.

### Validation

- Exercise the importer with disposable copies of representative export entries.
- Prove deterministic output and source-prose preservation.
- Prove existing published slugs are not overwritten.
- Prove export drafts and non-story account data cannot become public content.
- Remove temporary fixtures and run the clean final validation.

## Out of scope

- Publishing the generated review queue automatically.
- Migrating every generated draft into `src/content` during the same session.
- Updating Medium canonical settings.
- Guessing categories, tags, relationships, dates, captions, credits, or alt text.
- Downloading remote images when the export does not contain a verified local asset without an explicit decision.
- Editing prose.
- Page redesign, homepage changes, search, tag filters, CMS, or database work.

## Acceptance criteria

- The raw export and extracted private data remain untracked and ignored.
- The supported export structure is documented from observed evidence.
- One command can inspect or import the explicit export path.
- Multiple representative stories produce deterministic review packages.
- Exported prose remains exact except for documented Markdown structure normalization.
- Exact dates come only from reliable export metadata.
- Ambiguous or absent dates remain unset and appear in the manifest.
- Images are copied only from verified export assets and missing references fail or warn clearly.
- Existing published pieces are reported without overwrite.
- Generated entries remain drafts outside `src/content`.
- `npm.cmd run test:writing-tools` passes.
- `npm.cmd run validate` passes on the clean repository.
- `git diff --check` passes.
- No disposable fixtures remain.
- No commit or push occurs without explicit approval.

## Useful commands

```powershell
git status --short
Get-FileHash -Algorithm SHA256 <export.zip>
npm.cmd run test:writing-tools
npm.cmd run validate
git diff --check
```

Astro telemetry may need to be disabled in restricted environments:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm.cmd run validate
```

## Session stopping point

Stop after the export format, importer, manifest, documentation, representative fixtures, and clean validation are complete. Report supported and unsupported export records, output counts, warnings, unresolved metadata decisions, files changed, validation evidence, and the recommended first review batch. Do not bulk publish automatically.
