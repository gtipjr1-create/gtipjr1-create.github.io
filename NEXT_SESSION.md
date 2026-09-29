# Next Session — Site redesign shipped; day series migration still paused after Days 1–5

**Stop point:** On September 28, 2026 the whole site was redesigned and shipped with the author's approval: the homepage, both project pages, and every writing page. The writing migration remains paused where it was. Do not resume it until the author asks. The author is also correcting historical dates while finishing the Medium migration; do not "fix" dates on your own.

## Repository and publication state

- Branch: `main`. Latest commit: `5987948`, "Writing: the Writing Chambers — candlelit library and articles with a paper reading mode", pushed to `origin/main`.
- Redesign commits, oldest first: `01e93c1` (homepage), `f49fdb0` (no-op upload), `3b9ee12` (hero photo moved into `assets/about/`), `bd4da61` (book straight on), `355ebd2` (project pages), `5987948` (Writing Chambers). Details are in `SESSION.md`, Session 8.
- Every redesign push passed `npm run validate` in GitHub Actions and deployed (latest run `36533046461`). Live pages were confirmed after each deploy.
- The last content commit is still `8bc96d6` (`feat: publish day series essays 1-5`).
- Published writing: Fragments #1–#19 and six Essays (the earlier Essay plus Days 1–5). Medium canonical settings are unchanged.
- The author's local machine previously held unrelated untracked `.claude/` and `artifacts/` directories. Preserve both if present. Do not stage the ignored Medium ZIP, source packages, or `.migration-output`.

## Locked design decisions (see `docs/design-system.md`)

- **Homepage and project pages: "Field Manual".**
  - Palette: `#0b0b0c`, text `#eceae3`, gold `#cba35c`. Fonts: Fraunces 300/400, Hanken Grotesk, JetBrains Mono.
  - Glass nav, numbered gold kickers, and motion only under `prefers-reduced-motion: no-preference`.
- **Homepage specifics.**
  - The hero photo is `assets/about/garry-tipler-hero.webp`.
  - Device frames are approved on the homepage showcase only.
  - The "Featured" label on the writing card is intentional.
  - The Kit form, download reveal, weeks counter, and analytics must keep working.
- **Project pages.**
  - Screenshots stay plain evidence; no device frames.
  - `selftrainer.css` and `fitpulse.css` are identical copies at their passthrough paths.
- **Writing pages: "The Writing Chambers".**
  - Warmer candlelit palette (`#0c0a07`), candle glow and embers, archway entrance, arched collection doors, numbered ledger lists, and a 700px reading column.
  - A reader-controlled Paper mode on articles (`:root[data-reading="paper"]`, stored as `localStorage` `gt-reading-mode`).
- **Build verifier.** The markup `scripts/verify-build.mjs` asserts is listed at the end of `docs/design-system.md`. Keep it byte-compatible.

## Known risks and open evidence

- Some sandboxes cannot run `npm ci` (a registry policy 403 on `zwitch` occurred in the design session). When that happens, the GitHub Actions run is the authoritative build check. Say so plainly rather than claiming a local build.
- Not visually previewed before shipping: the Archive and Start Here pages in the Writing Chambers style. Review them at 1440px and 390px on the next presentation-related task.
- Date presentation is mid-correction by the author. Example: the homepage shows Fragments #4 as "Aug 6, 2026" (its site `publishedDate`), while the article shows March 2, 2026 (`originalPublishedDate`).
- The homepage's writing cards and field-log numbers are hand-maintained HTML. Sessions count and "Now building" need manual updates.

## Completed Days 1–5 (unchanged)

- Source: the saved August 10, 2026 Medium export packages under `.migration-output/essays/`. Stable IDs, historical dates, slugs, and approved formatting decisions are in `docs/writing-migration.md`.
- Original Medium dates from the owner-facing Published Stories list are December 5–9, 2025. GarryTipler.com `publishedDate` is September 28, 2026 for all five.
- Day 1's long opening is normal paragraph text by the author's request. Days 1 and 4 omit duplicated export page-title headings. The remaining prose matches the saved Markdown source. None of these five stories has a body image or outbound prose link.

## Single next slice when the author resumes migration

Review Days 6–10 as a private batch, using their existing `.migration-output/essays/day-*` source packages and the live Medium stories. The owner-facing Published Stories dates are December 10–14, 2025, respectively. Prepare reviewable drafts only after comparing prose and structure with the source. Do not publish until the author reviews and approves them.

- Days 6 and 7: the generated Markdown contains duplicated page-title headings. Check their live formatting before removing those duplicates.
- Day 9: one portrait lead image, a lit sculpture in front of the San Francisco Ferry Building at night, appears on Medium.
  - The export references a remote image but provides no local asset or alt text. Bring the image into a local site asset and review its alt text.
  - The story also ends with a YouTube URL.
- Day 10: the generated Markdown has bullet-like artifacts and a YouTube URL. Compare the live story before cleaning structure, and preserve the author's words.
- No final type, slug, summary, category, tags, image metadata, or formatting changes are approved for Days 6–10. Treat importer values as proposals.
- New articles automatically take the Writing Chambers design. Check one representative Day article in both candlelit and paper modes when the batch is reviewed.

**Non-goals:**
- Do not change Medium canonical settings, publish Days 6–30, or modify existing articles.
- Do not alter routes, schema, dependencies, or deployment.
- Do not redesign any page beyond `docs/design-system.md` without the author's approval.
- Preserve the unrelated untracked directories.
