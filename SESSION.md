# GarryTipler.com Writing Library — Project Record

**Record date:** August 6, 2026
**Production branch:** `main`
**Production head:** `d54ec13` — `Add Session 4 archive and discovery`
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

The current published content inventory contains one real piece:

```text
src/content/writing/fragments/fragments-4-the-fire/index.md
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

Verified live after Session 4:

- `https://garrytipler.com/`
- `https://garrytipler.com/projects/selftrainer/`
- `https://garrytipler.com/projects/fitpulse/`
- `https://garrytipler.com/writing/`
- `https://garrytipler.com/writing/fragments/`
- `https://garrytipler.com/writing/essays/`
- `https://garrytipler.com/writing/archive/`
- `https://garrytipler.com/writing/start-here/`
- `https://garrytipler.com/writing/fragments/fragments-4-the-fire/`
- `https://garrytipler.com/sitemap.xml`
- `https://garrytipler.com/rss.xml`
- `https://garrytipler.com/robots.txt`

## Intentionally deferred

- Bulk writing migration.
- Session 5 migration tooling.
- Full-text search.
- Tag-filter UI until content volume justifies it.
- Automatic related-work inference.
- CMS or database adoption.
- MDX expansion.
- Homepage redesign.

## Next phase

Session 5 will build repeatable migration tooling, templates, checklists, and validation support. It will stop before bulk migration unless that work is explicitly authorized.

See `NEXT_SESSION.md` for the Friday handoff and acceptance criteria.

## Repository status at this record

The application worktree was clean after Session 4. Two pre-existing untracked editor workspace files remain intentionally untouched:

```text
GarryTipler-Site.code-workspace
projects/selftrainer/GarryTipler-Site.code-workspace
```

`NEXT_SESSION.md` and `SESSION.md` are documentation created after the Session 4 production commit and are not committed unless separately authorized.
