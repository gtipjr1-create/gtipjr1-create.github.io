# GarryTipler.com Writing Library — Project Record

**Record date:** August 8, 2026
**Production branch:** `main`
**Production head:** `553f052` — `feat: reshape homepage hierarchy and flow`
**Canonical domain:** `https://garrytipler.com/`

## Purpose

GarryTipler.com is being established as the authoritative home for Garry Tipler’s writing while existing Medium posts remain online.

The permanent Writing Library is designed to be:

- Durable and static-first.
- Scalable to hundreds of pieces.
- Repository-managed without a CMS or database.
- Easy to validate and deploy.
- Self-canonical on GarryTipler.com.
- Consistent with the restrained black-and-gold editorial design.
- Safe for historical migration without guessed metadata.

## Approved architecture

### Runtime and deployment

- Astro `7.2.0`.
- Static output only.
- Markdown content collections.
- No React runtime, CMS, database, or MDX requirement.
- Existing static homepage and project pages are preserved through Astro’s build passthrough.
- Production output is generated in `dist/`.
- GitHub Pages deploys only the generated `dist/` artifact.
- Node 24 and `npm ci` are used in the Pages workflow.
- `npm run validate` builds the site and verifies generated output.

### Content source

Writing lives under:

```text
src/content/writing/
  fragments/
  essays/
  letters/
```

The current published content inventory contains two real pieces:

```text
src/content/writing/fragments/fragments-4-the-fire/index.md
src/content/writing/essays/discipline-should-not-cost-me-my-heart/index.md
```

### Public route structure

```text
/
/projects/selftrainer/
/projects/fitpulse/

/writing/
/writing/fragments/
/writing/fragments/[slug]/
/writing/essays/
/writing/essays/[slug]/
/writing/archive/
/writing/start-here/

/sitemap.xml
/rss.xml
/robots.txt
```

The generic article route also supports future Letters without requiring manually constructed pages.

## Content model

Supported frontmatter includes:

- `title`
- `slug`
- `type`: `fragment`, `essay`, or `letter`
- `summary`
- `category`
- `tags`
- `publishedDate`
- `originalPublishedDate`
- `updatedDate`
- `fragmentNumber`
- `featured`
- `startHereOrder`
- `mediumUrl`
- `status`: `draft` or `published`
- `related`: explicit `type:slug` identifiers
- `connections`: project, book, or guide links
- `heroImage`: source, alt text, caption, and credit

### Date semantics

- `originalPublishedDate` is the verified historical publication date.
- `publishedDate` is the date the GarryTipler.com copy goes live.
- Historical display, ordering, archive grouping, and RSS use:

```text
originalPublishedDate ?? publishedDate
```

- Historical dates must be exact `YYYY-MM-DD` values.
- Historical dates are never inferred from relative timestamps.
- `originalPublishedDate` may remain unset when the exact date cannot be verified.

The exact original publication date for Fragment #4 — The Fire remains unresolved. It is intentionally unset. The site displays the verified GarryTipler.com publication date and uses non-historical Medium attribution.

### Identifier and validation rules

- Slugs are explicit immutable publication identifiers.
- `type + slug` combinations must be unique.
- Fragment numbers may have gaps but cannot duplicate.
- Start Here order values must be unique.
- Published entries require `publishedDate`.
- Fragments require a positive `fragmentNumber`.
- Non-Fragments cannot define a Fragment number.
- Original dates cannot be later than site publication dates.
- Updated dates cannot precede site publication dates.
- Related identifiers must exist and be unique.
- A piece cannot relate to itself.
- Published writing cannot expose a draft related piece.
- Relationships are never inferred from shared tags.
- Drafts are excluded from all public outputs.

## Session history

### Session 1 — Architecture audit and contract

The repository was audited before implementation. The approved contract established:

- Astro static output.
- Markdown as the default format.
- Repository-owned content.
- Explicit metadata and immutable slugs.
- Reusable article rendering.
- Generated indexes and archive.
- Self-canonical URLs.
- Historical-date fail-closed behavior.
- No CMS without repository evidence.
- Phased implementation before migration.

No construction was performed during the architecture audit.

### Session 2 — Content foundation

**Commit:** `411b8f0` — `Add Session 2 writing content foundation`

Implemented:

- Astro package manifest and lockfile.
- Static build configuration.
- GitHub Pages artifact workflow.
- Writing content collection and strict schema.
- Cross-entry validation.
- Markdown loading and static article routes.
- Shared base and article layouts.
- Automatic reading-time calculation.
- Self-canonical article SEO metadata.
- Article JSON-LD.
- Conditional Medium attribution.
- Fragment #4 — The Fire as the real pilot.
- Build-output validation for old and new routes.
- Desktop and mobile article review.

The pilot prose was preserved without editorial rewriting.

### GitHub Pages publishing-source correction

After Session 2 initially deployed, the article returned a 404 even though the generated artifact contained it.

Cause:

- The new Astro workflow deployed `dist/` successfully.
- The repository was still configured for legacy branch publishing.
- GitHub’s legacy `pages-build-deployment` ran afterward and replaced the generated artifact with the branch-root site.

Correction:

- GitHub Pages `build_type` was changed from `legacy` to `workflow`.
- The approved Astro deployment was rerun.
- The article returned HTTP 200.

GitHub Pages must remain configured to publish from GitHub Actions. Re-enabling legacy branch deployment would recreate the deployment race.

### Session 3 — Writing experience

**Commit:** `3a60d9f` — `Add Session 3 writing library experience`

Implemented:

- Writing Library landing page.
- Generated Fragments numbered index.
- Generated Essays index and empty migration state.
- Reusable writing-list and index layouts.
- Metadata-driven collection counts.
- Recent-writing output.
- Collection-aware article breadcrumbs.
- Fragment-number-aware previous/next navigation.
- Homepage links into the on-site Writing Library.
- Consistent automatic reading time on the homepage pilot teaser.
- Desktop and true 390px mobile review.

Previous/next behavior was verified with temporary neighboring Fragment fixtures and rebuilt cleanly afterward.

### Session 4 — Archive and discovery

**Commit:** `d54ec13` — `Add Session 4 archive and discovery`

Implemented:

- Year-grouped Writing Archive.
- Curated Start Here page controlled by `startHereOrder`.
- Archive and Start Here entry points on `/writing/`.
- Explicit related-writing resolution and conditional article UI.
- Conditional project/book/guide connection UI.
- Generated canonical sitemap.
- Generated RSS feed using effective publication dates.
- Generated robots.txt pointing to the sitemap.
- RSS auto-discovery metadata.
- Permanent validation of discovery outputs and protected routes.
- Desktop and true 390px mobile review.

Temporary fixture validation confirmed:

- Missing related identifiers fail clearly.
- Self-references fail clearly.
- Drafts remain absent even when they carry discovery metadata.
- Start Here ordering is metadata-driven and deterministic.
- Archive years derive from effective original publication dates.
- RSS ordering and dates use effective original publication dates.
- Related-writing and project/guide connections render only when metadata exists.

All temporary fixtures were removed before the production commit.

### Session 5 — Migration tooling

**Commit:** `ce3d295` — `Add Session 5 migration tooling`

Implemented:

- Root repository working instructions in `AGENTS.md`.
- Canonical Fragment and Essay templates.
- A documented Markdown-plus-JSON migration contract.
- A deterministic review-draft generator that always emits drafts outside `src/content`.
- Required private source-evidence notes and exact-date evidence enforcement.
- Collision refusal for existing repository identifiers and review outputs.
- Repository validation for metadata, exact dates, file locations, duplicate identifiers, Fragment numbers, Start Here order, relationships, and missing assets.
- Disposable fixture tests for deterministic prose preservation and failure behavior.
- Generated-output verification that drafts do not create routes or discovery entries.
- Shared article asset convention under `assets/writing/<collection>/<slug>/`.

The supported input remained deliberately narrow because no representative Medium export was available: explicit Markdown prose plus JSON metadata. HTML, ZIP, live scraping, and bulk publication were intentionally deferred.

Validation completed with disposable fixtures, a temporary in-collection draft exclusion build, clean final validation, and `git diff --check`.

### Session 6 — First controlled migration

**Commit:** `acceb91` — `Publish Discipline Should Not Cost Me My Heart`

Completed the first real Essay migration from user-supplied Medium source material:

- Preserved the supplied prose without editorial rewriting.
- Removed only identified Medium interface artifacts.
- Recorded the verified original date `2026-07-27` from the supplied byline and screenshot.
- Published the GarryTipler.com copy on `2026-08-07`.
- Used the explicit immutable slug `discipline-should-not-cost-me-my-heart`.
- Preserved the Medium URL as attribution rather than canonical destination.
- Stored the verified lead image under the article-specific writing asset path.
- Added descriptive alt text and rendered the lead image as the first Markdown element.
- Added the Essay to Writing, Essays, Archive, sitemap, and RSS while intentionally leaving it out of Start Here.
- Replaced the archive verifier's hard-coded one-piece assumption with metadata-derived yearly counts.
- Added permanent route, canonical, sitemap, and RSS checks for every published writing entry.

The local build produced seven pages. GitHub Pages deployment completed successfully, and the public Essay route and image both returned HTTP 200 with correct canonical metadata and Medium attribution.

### Session 6 follow-up — Article hero and social metadata

**Commit:** `5675401` — `Add article hero social metadata`

Implemented:

- Article hero images render from the existing `heroImage` content contract.
- Article-specific hero images populate Open Graph and Twitter metadata.
- Article JSON-LD includes the canonical hero-image URL when present.
- Generated-output verification protects hero rendering and social metadata for published writing.

### Session 6 follow-up — Homepage hierarchy and flow

**Commit:** `553f052` — `feat: reshape homepage hierarchy and flow`

Implemented the approved restrained homepage refinement without changing routes, dependencies, project pages, or the writing architecture:

- Added a compact GT navigation with direct paths to Writing, Projects, and the free guide.
- Reframed the hero around exploration rather than an immediate purchase.
- Consolidated the homepage into five clearer stages: books, proof, writing, continuation, and principles.
- Added one approved SelfTrainer screenshot as compact product evidence.
- Promoted the self-hosted Essay and Fragment in the Writing section.
- Combined the free guide and newsletter into one continuation surface.
- Moved social links into the footer and corrected the mobile Kindle price layout.

`npm.cmd run validate` and `git diff --check` passed. The generated homepage and screenshot asset were inspected in `dist/`. The page was visually reviewed at `1440 × 1000` and `390 × 844`, then the deployed homepage was verified live with the new navigation, hero action, and proof image present.

## Current discovery behavior

### Writing landing page

Provides:

- Fragments and Essays collections.
- Start Here and Archive discovery paths.
- Recent published writing.
- Metadata-driven collection counts.

### Archive

- Groups only published writing.
- Uses effective publication year.
- Orders years newest first.
- Orders entries within each year by effective publication date.
- Generates counts from content.

### Start Here

- Includes only published entries with `startHereOrder`.
- Orders only by metadata.
- Rejects duplicate order values.
- Currently begins with Fragment #4 — The Fire at order `1`.

### Related work and connections

- `related` uses explicit `type:slug` identifiers.
- Missing, self-referencing, and draft-target relationships fail validation.
- Tag overlap does not create relationships.
- Related and connection sections are absent when metadata is empty.

### Sitemap, RSS, and robots

- Sitemap contains canonical GarryTipler.com URLs only.
- RSS contains published writing only.
- RSS publication dates use effective publication dates.
- RSS contains summaries and categories/tags, not Medium URLs.
- robots.txt permits crawling and advertises the canonical sitemap.

## SEO and canonical behavior

- `Astro.site` is locked to `https://garrytipler.com`.
- Every Astro page emits a GarryTipler.com canonical URL.
- Article pages emit Open Graph and Twitter metadata.
- Article pages emit Article JSON-LD.
- Sitemap and RSS generation fail if the canonical site origin changes.
- Medium remains attribution/source context, never the canonical destination.

## Build and validation

Primary command:

```powershell
npm.cmd run validate
```

This runs:

```text
node scripts/validate-writing.mjs
astro build
node scripts/verify-build.mjs
```

The verifier protects:

- Homepage.
- SelfTrainer.
- FitPulse.
- Writing landing page.
- Fragments index.
- Essays index.
- Archive.
- Start Here.
- Pilot article and canonical metadata.
- Every published writing route, canonical URL, sitemap entry, and RSS entry.
- Draft route and discovery exclusion.
- Metadata-derived archive year counts.
- Sitemap.
- RSS.
- robots.txt.

Additional review commands:

```powershell
git diff --check
git status --short
```

In restricted environments:

```powershell
$env:ASTRO_TELEMETRY_DISABLED='1'
npm.cmd run validate
```

## Publishing workflow

1. Change content or implementation locally.
2. Run `npm run validate`.
3. Review affected desktop and 390px mobile pages when presentation changes.
4. Run `git diff --check`.
5. Review the exact staged files.
6. Commit and push only with explicit approval.
7. The GitHub Actions workflow installs with `npm ci` and Node 24.
8. The workflow uploads only `dist/`.
9. GitHub Pages publishes the generated artifact.
10. Verify public URLs after deployment.

## Current production routes

The homepage was verified live after commit `553f052`. The remaining routes were verified live after Session 6 and remain protected by the repository build verifier:

- `https://garrytipler.com/`
- `https://garrytipler.com/projects/selftrainer/`
- `https://garrytipler.com/projects/fitpulse/`
- `https://garrytipler.com/writing/`
- `https://garrytipler.com/writing/fragments/`
- `https://garrytipler.com/writing/essays/`
- `https://garrytipler.com/writing/archive/`
- `https://garrytipler.com/writing/start-here/`
- `https://garrytipler.com/writing/fragments/fragments-4-the-fire/`
- `https://garrytipler.com/writing/essays/discipline-should-not-cost-me-my-heart/`
- `https://garrytipler.com/sitemap.xml`
- `https://garrytipler.com/rss.xml`
- `https://garrytipler.com/robots.txt`

## Intentionally deferred

- Medium export inspection until the requested account-data ZIP arrives.
- Batch-to-review import tooling until the real export format is inspected.
- Bulk writing publication.
- Full-text search.
- Tag-filter UI until content volume justifies it.
- Automatic related-work inference.
- CMS or database adoption.
- MDX expansion.
- Further homepage redesign while the Medium import session is active.

## Next phase

Session 7 will inspect the untouched Medium account export and extend the migration toolkit with a safe batch-to-review importer and manifest. It will stop before bulk publication.

See `NEXT_SESSION.md` for the active importer handoff and acceptance criteria.

## Repository status at this record

Production branch `main` and `origin/main` are aligned at `553f052`. The homepage implementation is committed, pushed, deployed, and live-verified.

This handoff updates `SESSION.md` and `NEXT_SESSION.md` without committing or pushing them. It also leaves a mobile-only footer adjustment in `index.html` that prevents the copyright line from wrapping on the user’s physical phone. The adjustment passed `npm.cmd run validate`, `git diff --check`, and a `390 × 844` local browser check showing a single 305px-wide line with no horizontal overflow. It is not committed, pushed, or deployed.

The local `artifacts/` directory contains untracked homepage-review screenshots and was intentionally excluded from the homepage commit. The next session must inspect and preserve this state rather than assuming a clean worktree.

The Medium account-data export was requested on August 7, 2026 and had not arrived when this record was updated on August 8. The raw ZIP must remain private and untracked when it arrives.
