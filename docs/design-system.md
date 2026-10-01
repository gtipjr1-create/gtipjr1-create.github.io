# GarryTipler.com — Design System

**Approved:** September 28, 2026, by the author, after reviewing designs on a Claude Design canvas ("GarryTipler.com Directions") and the live pages.
**Applies to:** the homepage (`src/pages/index.astro`), the project case studies (`projects/selftrainer/`, `projects/fitpulse/`), and every Astro writing page (`src/`).

The site has two rooms in one house:

- **Field Manual**: the homepage and project pages. Near-black, gold, structured, alive.
- **The Writing Chambers**: the writing library and articles. The same house, but warmer and quieter, lit by a single candle, with an optional paper reading mode.

Treat this record as the reference before changing any visual surface. Changes that break these rules need the author's approval.

---

## 1. Shared foundations

### Typography

| Role | Face | Notes |
| --- | --- | --- |
| Display and editorial headings | Fraunces | Weight 300 for large display type; 400 for card and section titles. Italic 300 is used for emphasis words, usually in gold. |
| Body and UI | Hanken Grotesk | 400/500/600. |
| Labels, metadata, kickers | JetBrains Mono | 11–12px, uppercase, letter-spacing 0.14–0.3em. |

Google Fonts request (all pages): `Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400`, `Hanken+Grotesk:wght@400;500;600`, `JetBrains+Mono:wght@400;500`.

### Recurring components

- **Glass nav bar**: GT mark + "GARRY TIPLER" (mono) · Book · Writing · Projects · a gold "Free 7-day guide" button (reads "Free guide" on phones). Frosted translucent panel with a hairline border. The current section is marked with a gold underline and `aria-current="page"`. On phones, Book hides; Writing, Projects and the guide button stay (checked to 320px wide).
- **Kicker**: numbered section label in gold mono, e.g. `01 — The doctrine`.
- **Status tag**: mono uppercase chip with a pulsing gold dot ("Native rebuild in progress", "In development").
- **Hover-lift cards**: a 1px border that turns gold, and the card lifts 6px on hover.
- **Glow**: soft radial gold light behind key sections (`rgba(var(--accent-rgb), 0.10–0.16)`, i.e. `212,171,95`).
- **Footer**: GT mark + "© 2026 Garry Tipler"; gold links on the right.

### Motion rules

- All motion lives inside `@media (prefers-reduced-motion: no-preference)` or behind a `matchMedia('(prefers-reduced-motion: reduce)')` check. Visitors with reduced motion get a complete, still page with every real value shown.
- Numbers that count up are already correct in the HTML; JavaScript animates only from 0 to that value.
- No motion slides content across the screen except short rise-in entrances (18px) and gentle floats (±12px).

### Accessibility floor

Skip link on every page; semantic headings; 44px minimum touch targets on nav and footer links; visible gold focus outline; meaningful alt text on evidence images. Decorative duplicates use `alt=""` + `aria-hidden`.

---

## 2. Field Manual (homepage and project pages)

### Tokens

| Token | Value |
| --- | --- |
| Background | `#0b0b0c` |
| Section band | `#0e0e0d` |
| Card | `#121210` / `#141412` |
| Primary text | `#eceae3` |
| Soft / dim / mute / faint text | `#d9d4cb` / `#b9b3a8` / `#a8a39a` / `#8a857c` |
| Lines | `#26241f`, `#3a372f` |
| Accent | `#d4ab5f` (hover `#e9c683`; `--accent-rgb: 212, 171, 95`) |
| Color scheme | `color-scheme: dark` on `:root` plus `<meta name="color-scheme" content="dark">` on every page |

Layout: 1280px content width with 80px gutters (40px ≤1100px, 20px ≤720px); a 12-column grid for split sections.

### Shared base (`assets/css/field-manual.css`)

The Field Manual palette tokens and every rule the homepage and project pages use identically (reset, skip link, `.wrap`, `.kicker`, nav, footer, hero grain/lines, shared keyframes) live in `assets/css/field-manual.css`. The homepage and both project pages link it **before** their own styles. Change the palette here, not per page.

### Homepage (`src/pages/index.astro`)

The homepage is an Astro page so its writing cards can be built from the Writing collection. Its hand-authored styles and scripts stay inline (`<style is:inline>`, `<script is:inline>`).

In order:

1. **Hero**: full-height, with the portrait `assets/about/garry-tipler-hero.webp` (1206×1063) bleeding off the right edge and fading into black. Film grain, faint horizontal rules and a gold glow sit on top. The headline is "Systems for *rebuilding* a life." with "rebuilding" in gold italic.
2. **Field log**: a glass panel at the bottom of the hero. Its numbers count up; a gold light sweeps its top edge; "Weeks in the system" counts forward from `data-start="2026-01-10"`. Sessions and titles are hand-updated; never estimate them.
3. **01 — About Garry**: "Behind the work." with a small square portrait (`assets/about/garry-tipler-portrait.webp`) and the author's About copy, including what T.I.P. (Tenacious Individual Performance) stands for. No button or form.
4. **02 — The doctrine**: *I Am the Proof*, with the real cover floating straight on (no tilt) above a soft shadow.
5. **Field guides**: two cards with gold italic numerals 01/02. There are no cover images until real covers exist.
6. **03 — Free · 7 days**: the Kit signup (form `9676498`) and the PDF download revealed on success. The form logic must not change.
7. **04 — The operating surface**: the FitPulse dashboard in a browser frame and SelfTrainer "Up Next" in a phone frame, over a grid backdrop. Device frames are approved on the homepage only (see AGENTS.md for project pages).
8. **05 — Field notes**: a large featured card (Fragments #4, with a faint "#4" watermark) plus the two newest published pieces, built at build time; the first is labelled "Latest". Pieces without a hero image get a text-only card. The link text "Explore the writing library" and the link to The Fire are required by `scripts/verify-build.mjs`.
9. **06 — Standing principles**: four principles; one at a time lights up in gold with a line drawing across it.
10. **Closing**: "The proof is *the work.*" and a "Start with the book" button.

The hero descriptor reads "Author · Software Builder · Founder, Tenacious Individual Performance". The JSON-LD `jobTitle` keeps "Performance Systems Builder".

### Project pages (`projects/*/index.html` + `assets/css/case-study.css`)

- Both pages load `assets/css/field-manual.css` then `assets/css/case-study.css` (the former identical `selftrainer.css`/`fitpulse.css` copies, merged October 1, 2026).
- The closing section offers "Return to garrytipler.com" and a gold "Follow the build in The Signal →" link to the homepage signup.
- Hero: breadcrumb (`← Garry Tipler / Case study / Name`), a 136px Fraunces title, a status tag, and the thesis in Fraunces italic.
  - SelfTrainer: two phone screenshots float beside the copy.
  - FitPulse: the full dashboard sits under the copy with its caption.
- Sections keep their numbered kickers and use short editorial headlines approved on the canvas, e.g. "From the next action to a record you can trust." and "What the build holds to."
- **Workflow steps light up one at a time** via CSS animation delays (`--sd`), with no JavaScript.
- **Screenshots are plain evidence**: border, radius and shadow only, with no device frames (AGENTS.md rule).
- All original copy, captions, alt text and social metadata are preserved verbatim, with two approved exceptions:
  - "This is not a visual port alone." became the headline "Not a visual port alone."
  - The redundant "Current status" label was removed.

---

## 3. The Writing Chambers (Astro: `src/`)

### Tokens (`src/styles/tokens.css`)

| Token | Candlelit (default) | Paper (reader toggle) |
| --- | --- | --- |
| `--bg` | `#0c0a07` | `#f1ebdf` |
| `--bg-card` | `#14110c` | `#e6dcc8` |
| `--ink` | `#ede4d3` | `#1b1813` |
| `--ink-soft` | `#d8cdb8` | `#2e2a22` |
| `--ink-dim` | `#b3a893` | `#4d463a` |
| `--ink-faint` | `#8c826f` | `#6b6354` |
| `--line` / `--line-2` | `#2a241a` / `#3a3124` | `#d3c7ae` / `#c4b89f` |
| `--accent` | `#d4ab5f` (via fixed `--gold`; hover `#eecb8b`) | `#7a5719` (bronze) |
| `--link` | `#dcb46b` | `#7a5719` |
| `color-scheme` | `dark` | `only light` |

Paper mode is `:root[data-reading="paper"]`. `--gold`, `--gold-hi` and `--gold-rgb` never switch, so the nav, skip link and selection stay gold in both modes. The nav bar stays dark in both modes; it is the way back to the house.

### Shared frame (`BaseLayout.astro`)

- A `.chamber-light` container holds the candle glow (flickers) and three embers (drift upward). It is clipped so phones never scroll sideways.
- Glass nav with Writing marked current, and a footer with RSS · X · Medium.

### Library pages (`WritingIndexLayout.astro`, `WritingList.astro`, `src/pages/writing/*`)

- **Entrance**: a thin gold archway line drawing, a breadcrumb, a kicker, a 152px title and an italic intro. The main library shows "N fragments · N essays" as a note.
- **Main library**: Fragments and Essays are **arched doors** ("The first chamber" / "The second chamber") with a large faint count numeral. They glow on hover.
- **Ways in**: Start Here and Archive as ruled rows with small line icons.
- **Lists**: a ledger with a gold numeral column (`№ 19` for fragments, "Essay" for essays), mono meta, a Fraunces title and the summary. Fragments, Essays and Start Here use a split layout: heading left, list right.

### Article pages (`ArticleLayout.astro`)

- **Masthead**: centered.
  - Breadcrumb (`← Fragments / Fragment 5`), and a huge faint fragment-number watermark.
  - Title: text after " — " is set in gold italic.
  - Italic summary, then a mono meta line (category · date · reading time).
- **Reading-mode toggle**: a "Read on paper" / "Read by candlelight" button.
  - The choice is stored in `localStorage` as `gt-reading-mode`.
  - An inline head script applies it before paint, so the page never flashes.
- **Reading progress**: a 2px gold line fixed at the top of the window.
- **Body**:
  - The hero sits at up to 960px wide, followed by a diamond ornament.
  - The article runs in a **700px** reading column (Fraunces 300, 22px, line-height 1.75).
  - When the article's first element is a paragraph, its first line is set in gold small caps.
  - The article ends with a diamond, then the Medium attribution.
- **Sequence**: previous/next cards, then a "Return to Writing" button.

### Markup the build verifier depends on (do not change)

- `<figure class="article-hero"><img src="…"` with no whitespace between the tags.
- `<span class="writing-list-title">{title}</span>`
- `class="sequence-link sequence-previous" href=…` and `class="sequence-link sequence-next" href=…`
- `href="/writing/">Return to Writing`
- The reading time in its own element (`>1 min read<`)
- "Originally published on Medium on {date}."
- `id="essays-heading">Essay index</h2>`, "Curated sequence", and archive counts as `>N pieces<`
