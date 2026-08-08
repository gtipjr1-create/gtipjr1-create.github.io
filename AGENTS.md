# AGENTS.md — GarryTipler-Site

## Purpose

This repository is Garry Tipler's public home for writing and selected project proof. Treat it as a restrained editorial site, not a marketing playground or a general experimentation repo.

The goal is durable, honest work: preserve the site's voice, make the smallest justified change, validate what actually changed, and leave a clear handoff for the next session.

## Instruction order

When instructions differ, follow this order:

1. The user's latest explicit request.
2. This root `AGENTS.md`.
3. The current task or session handoff in `NEXT_SESSION.md`.
4. Relevant project documentation and nearby code comments.
5. Existing implementation and test behavior.

Do not treat an old handoff as unquestionable truth. Confirm it against the current branch, working tree, and code before acting. If two authoritative instructions materially conflict, stop and explain the conflict instead of guessing.

## Start every session with evidence

Before editing:

1. Read `AGENTS.md` and `NEXT_SESSION.md` completely.
2. Read `package.json`, `astro.config.mjs`, `src/content.config.ts`, and only the nearby files needed for the task.
3. Inspect `git status --short`, the current branch, and recent relevant history.
4. State the task in one sentence, including explicit non-goals when the boundary matters.
5. Confirm the current implementation before proposing a replacement.

For a narrow request, keep discovery narrow. Do not turn a bounded change into a repository-wide audit unless the user asks for one or direct evidence shows the wider surface is required.

## Product and editorial principles

- The site should feel calm, deliberate, personal, and proven.
- Favor clarity, restraint, confidence, and strong hierarchy over novelty or visual density.
- Preserve the black-and-gold editorial direction:
  - background: `#0b0b0c`
  - primary text: `#eceae3`
  - accent: `#cba35c`
- Preserve the established typography unless a task explicitly changes it:
  - Fraunces for editorial headings
  - Hanken Grotesk for body text
  - JetBrains Mono for metadata and utility text
- Keep long-form reading width near the established 700–720px range.
- Use the GT mark as a restrained anchor, not decoration repeated throughout the page.
- Project pages are evidence, not sales funnels. Avoid inflated claims, urgency language, pricing, availability, or signup calls to action unless the user supplies and approves them.
- Never invent biography, dates, product capabilities, metrics, testimonials, availability, or project status. Use repository evidence or user-supplied facts.
- Preserve the author's wording when migrating writing. Mechanical cleanup must not silently rewrite the voice.

## Architecture contract

The approved architecture is intentionally simple:

- Astro with static output
- repository-owned Markdown content
- YAML frontmatter validated through Astro content collections
- plain CSS and server-rendered/static templates
- GitHub Pages deployment of `dist/`
- `CNAME` ownership for `garrytipler.com`

Do not introduce any of the following without explicit approval:

- a CMS or database
- React, Vue, or another client runtime
- MDX as the default content format
- client-side routing
- full-text search
- a custom content generator when Astro collections already cover the need
- a dependency, build-tool, or deployment change for convenience alone
- broad shared-style refactors while completing a page-specific task

Prefer existing components, layouts, schemas, and CSS patterns. A new abstraction must remove demonstrated duplication or enforce a real contract; anticipated reuse is not enough.

## Public route contract

Preserve existing public URLs and trailing-slash behavior.

Core routes include:

- `/`
- `/projects/selftrainer/`
- `/projects/fitpulse/`
- `/writing/`
- `/writing/fragments/`
- `/writing/essays/`
- `/writing/archive/`
- `/writing/start-here/`

Do not restore OPP to the public project surface unless the user explicitly reverses that decision. Do not rename, flatten, or redirect established routes without a specific migration plan and approval.

When route or metadata work changes, verify the canonical URL, sitemap, RSS, internal links, and generated output together. A page existing in development is not enough if its production URL contract is wrong.

## Writing and migration contract

Writing is first-party content owned by GarryTipler.com.

- GarryTipler.com article URLs are self-canonical.
- Medium copies are syndicated copies; update their canonical destination only after the GarryTipler.com article is live and verified.
- Slugs are explicit and immutable after publication unless the user approves a redirect plan.
- `category` is singular and must satisfy the content schema.
- `tags` come from the controlled vocabulary already established in the repository.
- Fragment-number gaps are allowed; duplicate Fragment numbers and duplicate slugs are not.
- Draft content must not leak into production indexes, sitemap, or RSS.
- Local image paths, alt text, captions, and outbound links must remain valid.

For migration work:

1. Use a supplied Markdown/source file and explicit metadata record.
2. Validate one representative article before generalizing tooling.
3. Produce a reviewable draft before publishing.
4. Migrate in small batches.
5. Validate duplicate slugs, Fragment numbers, metadata, images, and links.
6. Build and visually inspect the affected article and collection surfaces.
7. Confirm sitemap and RSS output after each batch.

Do not bulk scrape Medium, bulk migrate the archive, publish drafts, or alter Medium canonical settings unless that exact action is authorized.

## Project-page boundaries

- SelfTrainer and FitPulse are the current public project case studies.
- Keep descriptions evidence-led and consistent with the supplied screenshots and current product state.
- Preserve existing project CSS unless the task explicitly includes it.
- FitPulse should remain concise proof, not conventional SaaS marketing.
- Use approved screenshots as plain, restrained evidence; do not add fake browser chrome, device frames, or decorative mockups by default.
- Do not redesign global navigation or shared project architecture to solve a local content problem.

## Working method

Classify the request before acting:

- **Audit or review:** inspect and report; do not implement unrequested fixes.
- **Plan or architecture:** resolve contracts, risks, and sequence before editing.
- **Build or fix:** implement the narrowest complete slice and validate it.
- **Content migration:** preserve source fidelity and follow the migration contract.
- **Copy edit:** change only the approved copy surface; do not smuggle in design or architecture work.

While working:

- Use minimal diffs and preserve stable behavior.
- Treat existing user changes as intentional unless proven otherwise.
- Never discard or overwrite a dirty worktree to make the task easier.
- Avoid unrelated cleanup, reformatting, renaming, dependency churn, and speculative abstractions.
- Follow existing formatting and component conventions.
- Keep accessibility intact: semantic structure, keyboard use, visible focus, useful alt text, sufficient contrast, and reduced-motion behavior.
- If a defect suggests a wider issue, first prove the shared cause. Report adjacent speculation separately rather than expanding scope automatically.
- Do not commit, push, open a PR, publish, or modify external services unless the user explicitly authorizes that step.

## Validation contract

Inspect the scripts declared in `package.json` and use the repository's own commands. Do not invent a passing command or report a check you did not run.

For code, layout, routing, schema, or content changes, the default minimum is:

1. Run the relevant focused check, if one exists.
2. Run `npm run build`.
3. Run the repository verification script exposed by `package.json`; if it is not exposed there, inspect `scripts/verify-build.mjs` before invoking it directly.
4. Inspect the generated routes or output affected by the change.
5. Visually check changed UI at representative desktop and narrow-mobile widths.

Also verify, when relevant:

- frontmatter/schema failures are caught
- duplicate slugs and Fragment numbers are rejected
- draft exclusion works
- canonical URLs use the production domain and correct trailing slash
- sitemap, RSS, and robots output remain coherent
- images and internal links resolve from the built site
- existing project routes still build

Never claim “fully verified,” “responsive,” “accessible,” “device-tested,” or “production-ready” without naming the evidence. If a check could not run, state exactly what remains unverified and why.

## Session documents

`NEXT_SESSION.md` is an active handoff, not permanent product documentation. Keep it concise and factual when the task or user asks for a handoff.

A useful handoff records:

- the exact completed scope
- current branch, commit, and working-tree state
- files changed
- validations run and their results
- decisions now locked
- known risks or unresolved evidence
- the single recommended next slice
- explicit non-goals for that next slice

Preserve the repository's existing convention for `SESSION.md` after reading it. Do not rewrite session documents merely to restate information already clear from Git history.

## Stop conditions

Pause and ask for direction when:

- the requested change contradicts a locked architecture or route contract
- source content or approved metadata is missing
- a public claim cannot be supported
- completing the task requires a new dependency, deployment change, destructive operation, redirect strategy, or external publication
- unrelated user changes overlap the files that must be edited
- validation reveals a broader failure that materially changes the agreed scope

Do not fill uncertainty with assumptions. Show the evidence, identify the decision required, and keep the question narrow.

## Completion report

Lead with the outcome. Then report only what helps the user verify and continue:

1. What changed and why.
2. Exact files changed.
3. Validation performed and results.
4. Important surfaces intentionally left untouched.
5. Remaining risk, uncertainty, or the next justified step.
6. Commit/push/PR status, if relevant.

Keep the report proportionate to the work. No victory language, fabricated certainty, or invitation to expand scope after a completed slice.
