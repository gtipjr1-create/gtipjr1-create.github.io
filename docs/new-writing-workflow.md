# New writing workflow

**Effective:** October 1, 2026.
**Applies to:** every new piece written after the Medium migration, starting with the 31-day writing challenge.

From October 1, GarryTipler.com is the first place new writing is published. Medium receives a syndicated copy afterwards, pointing back to the site. The historical migration record stays in `docs/writing-migration.md`; this document covers only new, site-first writing.

## The rule in one line

Write → drop the manuscript → review draft → approve → publish on GarryTipler.com → verify live → share to Medium with the site as canonical → record the Medium link.

## 1. Dropping a new piece

Either paste the piece into the session, or save it as a plain Markdown file in:

```text
.migration-output/inbox/<YYYY-MM-DD>-<working-title>.md
```

`.migration-output/` is already ignored by Git, so unreviewed manuscripts are never committed or published by accident.

Supply with each piece:

| Item | Required | Notes |
| --- | --- | --- |
| Prose | Yes | Exactly as it should read. The site preserves your wording; only Markdown structure (headings, lists, emphasis, links, images) is touched. |
| Title | Yes | As it should appear. |
| Type | Yes | `essay` or `fragment` (`letter` is supported but unused so far). |
| Fragment number | Fragments only | Next unused number. Gaps are allowed; duplicates are rejected. |
| Subtitle / summary | Yes | One sentence. If none is supplied, a proposal is drafted for your approval. It is never invented silently. |
| Go-live date | Yes | The calendar day, in your time zone (Pacific), that the piece should appear. |
| Challenge day | Challenge pieces | The day number within the October Writing Challenge. Record it separately as series metadata; preserve the author's supplied title (see section 7). |
| Images | Optional | The image file itself, plus alt text, and a caption or credit if wanted. |
| Links | Optional | Any outbound links exactly as intended. |

## 2. Processing into a review draft

1. **Check identity.** Confirm the slug is new. Published slugs are permanent, and `npm.cmd run validate:writing` rejects a duplicate `type:slug` or Fragment number.
2. **Write the metadata record** as a JSON file beside the manuscript in `.migration-output/inbox/`:
   - `title`, `slug`, `type`, `summary`, `category`, `tags`, and `fragmentNumber` (Fragments only).
   - `sourceEvidence`: `"Author-supplied manuscript <filename>, received <YYYY-MM-DD>"`.
   - **Do not** set `originalPublishedDate` or `mediumUrl`. A site-first piece has no earlier publication. Setting `originalPublishedDate` would make the site claim Medium came first.
3. **Generate the draft** with the existing tool. It always writes `status: "draft"`, stays outside `src/content`, and refuses to overwrite anything:

   ```powershell
   npm.cmd run migrate:writing -- --source .migration-output\inbox\<file>.md --metadata .migration-output\inbox\<file>.json --output .migration-output\new\<slug>\index.md
   ```

4. **Images:** save them under `assets/writing/<essays|fragments>/<slug>/` and reference them with root-relative paths. The validator fails on a missing file.
5. **Author review.** Show the draft and its metadata. Nothing moves forward until the author approves the prose, title, slug, summary, category, tags, and any image text.

## 3. Publishing on GarryTipler.com

Only after explicit approval:

1. Move the draft to `src/content/writing/<essays|fragments>/<slug>/index.md`.
2. Set `publishedDate` to the approved go-live date and `status: "published"`. Leave `originalPublishedDate` unset.
3. Validate:

   ```powershell
   npm.cmd run test:writing-tools
   npm.cmd run validate
   git diff --check
   ```

4. Inspect the built output for the new route, its canonical URL (`https://garrytipler.com/writing/<collection>/<slug>/`), the collection index, **Recent writing** on `/writing/`, the archive, the top RSS item, and the sitemap.

   Expected counts. As of September 29, 2026, with 51 published pieces:
   - **56 pages from Astro**: 51 articles plus 5 index pages (`/writing/`, Fragments, Essays, Archive, Start Here). `robots.txt`, `rss.xml`, and `sitemap.xml` are built as well but are not counted as pages.
   - **59 HTML files in `dist/`**: those 56, plus the homepage and the two project pages, which are hand-written HTML copied in unchanged after the Astro build.
   - **59 sitemap entries** and **51 RSS items**.

   Each new published piece adds exactly one to every count. Drafts add nothing.
5. For pieces with images or unusual formatting, review the article at 1440px and 390px.
6. Commit as `feat: publish <title>` and push to `main`, but only with the author's go-ahead for that piece or batch.
7. Confirm the GitHub Pages run succeeded and the live URL returns 200 with the correct canonical link.

## 4. Sharing to Medium

Only after the site article is live and verified:

1. Bring the piece to Medium with its **Import a story** tool, using the live GarryTipler.com URL. That tool sets the canonical link to the original. If the story is pasted instead, set the canonical link to the GarryTipler.com URL in the story's advanced settings before publishing. Submit challenge pieces to *Tenacious Individual Performance* where appropriate.
2. After publishing on Medium, confirm the Medium story's canonical link points to the GarryTipler.com URL.
3. Send the Medium story URL back. The site entry gains `mediumUrl`, which renders **"Also available on Medium"** under the article. Because `originalPublishedDate` is unset, the "Originally published on Medium" wording cannot appear. Commit as `chore: link Medium copy for <slug>`.

Medium steps are the author's own actions. Sessions working in this repository do not change Medium settings.

## 5. What updates automatically, and what does not

Automatic on publish:

- the article page, reading time, JSON-LD, and Open Graph metadata
- the Essays or Fragments index
- Recent writing on `/writing/` (latest six by date)
- the archive
- RSS and the sitemap
- previous/next navigation

Manual, and only when the author asks:

- **Homepage featured card** (`src/pages/index.astro`, `featuredSlug`). The large card stays curated (currently The Fire). The two side cards update automatically to the newest published pieces on each build.
- **Start Here** order (`startHereOrder`) and `featured`.
- **Related writing** and connections. These are always explicit and never inferred from tags.
- **`updatedDate`.** Set it only when a published piece's prose is later changed.

## 6. Daily cadence for the 31-day challenge

- One piece per day means one small publish commit per day. Publishing several days in one batch is fine if they are drafted ahead of time. Each piece keeps its own go-live date.
- `publishedDate` is the Pacific calendar day the piece went live, even if the push happens late in the evening.
- Pieces sharing a date are ordered by slug, so give each day its own date.
- If a day is missed, publish it when ready under its own date. Never back-date a piece to fill a gap.

## 7. October Writing Challenge decisions

Approved by the author on September 29, 2026:

1. **Title.** Preserve the author's supplied title. The October collection request supersedes the earlier no-Day-prefix decision: the initial scaffold is titled **Day 1 — Back to Writing**. The December 2025 titles stay unchanged.
2. **Series designation.** Set `series: "october-2026"` and `seriesDay: N` (1–31) in each essay's frontmatter. The article masthead displays **OCTOBER WRITING CHALLENGE · 01 / 31** independently of the title. Duplicate day numbers are rejected, including drafts.
3. **Slug.** Derived from the actual title in lowercase kebab-case, proposed per piece and approved at review. It does not use the `day-N-` prefix of the December series.
4. **Type.** `essay`.
5. **Category and tags.** Use the existing taxonomy. Add a new category or tag only if one becomes genuinely necessary, and only with explicit approval.
   - categories: `Discipline`, `Recovery`
   - tags: `discipline`, `personal-development`, `self-improvement`, `mindset`, `fitness`, `lifestyle`
6. **Canonical and Medium.** GarryTipler.com publishes first and stays canonical. Medium follows through **Import a story**, submitted to *Tenacious Individual Performance* where appropriate.
7. **Homepage.** The large featured card stays curated. The two side cards already update automatically with the newest published pieces; this collection does not change that behavior.

## Outside this workflow

These need their own approval and are not part of publishing a piece:

- **Start Here.** Approved on September 29, 2026 as a five-piece sequence (`startHereOrder` 1–5). Adding a challenge piece to it is an explicit editorial decision.
- **Additional series.** New route and layout work beyond the approved October collection.

## October collection publishing

The collection is `/writing/october-2026/`, linked from `/writing/`. Content remains in `src/content/writing/essays/<slug>/index.md`; series metadata gives it the permanent public route `/writing/october-2026/<slug>/`. No duplicate essay URL is generated. Published entries also appear in Essays, Recent writing, Archive, RSS, sitemap, and the existing automatic homepage side cards.

Day 1, `back-to-writing/index.md`, contains the author's approved manuscript and subtitle, dated October 1, 2026, under the existing Discipline category. It replaces the initial scaffold in place. Blank summary/category are allowed only for October drafts; publication requires these fields and non-empty prose. No draft URL or list entry is generated.

For each subsequent day, add one Markdown essay using the same fields and a new slug/day number. Supply the approved subtitle, existing category/tags, prose, and actual go-live date; omit `originalPublishedDate` and add `mediumUrl` only after syndication. Review before changing `status` to `published`, then run `npm.cmd run test:writing-tools` and `npm.cmd run validate`. Entries sort by `seriesDay`; previous/next links stay within published October entries and skip unpublished days. The collection return link and article metadata update automatically. No future-day placeholders are needed.

### October social preview cards

Each published October entry uses `/assets/social/october-2026/<slug>.png` for Open Graph and Twitter. These images are metadata-only: do not set `heroImage` merely to assign a social card or insert the card into the manuscript. Existing editorial hero photos remain in the article and Article JSON-LD. Other writing keeps its existing hero/fallback behavior.

Before validating a new publication:

1. Run `node scripts/prepare-october-social-cards.mjs --serve`. It reads the validated published October metadata and prepares HTML previews from `scripts/templates/october-social-card.html`, under the untracked `artifacts/october-social-cards/` directory. It serves only those previews at `http://127.0.0.1:4322/<slug>/`.
2. Open the new entry's preview at **1200 × 630**. Check that Playfair Display, Hanken Grotesk, and Space Mono have loaded and that the complete title, day number, and author fit without clipping.
3. Run `node scripts/prepare-october-social-cards.mjs --export <slug>`. The script uses installed Chrome or Edge to render that same HTML preview, saves `assets/social/october-2026/<slug>.png`, verifies its 1200 × 630 PNG dimensions, and refuses to overwrite an existing card. Set `OCTOBER_CARD_BROWSER` to an executable path if the browser is installed elsewhere. The author does not need to supply a PNG. The existing `--encode` mode remains available for older browser exports that need PNG conversion.
4. Run the existing writing-tool tests and `npm.cmd run validate`. Build verification rejects a missing card, invalid PNG dimensions, incorrect metadata, or a card inserted as an article image. Commit the PNG with the daily publication.

The template uses the existing cream, candlelit black, honey-gold, and font choices. Generation is a publication-time browser export; the production build needs no new package or browser runtime. After deployment, verify the live PNG and metadata before importing the article into Medium again. Previously imported Medium drafts may retain their old selected image.

The October landing page and series navigation are now implemented under the owner's collection request. Publishing, committing, pushing, and Medium changes still need their separate authorization.

A custom 404 page (`src/pages/404.astro`, noindex, excluded from the sitemap) was added on September 29, 2026. It needs no per-piece maintenance.
