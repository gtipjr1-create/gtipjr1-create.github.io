import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { writingRoute, validateWritingRepository } from "./writing-content.mjs";

const outputRoot = new URL("../dist/", import.meta.url);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const pilotPath = "writing/fragments/fragments-4-the-fire/index.html";

async function requireOutput(relativePath) {
  const path = new URL(relativePath, outputRoot);
  await access(path);
  return readFile(path, "utf8");
}

const [
  homepageHtml,
  writingIndexHtml,
  fragmentsIndexHtml,
  essaysIndexHtml,
  archiveHtml,
  startHereHtml,
  sitemapXml,
  rssXml,
  robotsTxt,
] = await Promise.all([
  requireOutput("index.html"),
  requireOutput("writing/index.html"),
  requireOutput("writing/fragments/index.html"),
  requireOutput("writing/essays/index.html"),
  requireOutput("writing/archive/index.html"),
  requireOutput("writing/start-here/index.html"),
  requireOutput("sitemap.xml"),
  requireOutput("rss.xml"),
  requireOutput("robots.txt"),
  requireOutput("projects/selftrainer/index.html"),
  requireOutput("projects/fitpulse/index.html"),
]);

const pilotHtml = await requireOutput(pilotPath);
const octoberHtml = await requireOutput("writing/october-2026/index.html");
assert.match(octoberHtml, /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/october-2026\/"/);
assert.match(writingIndexHtml, /href="\/writing\/october-2026\/"/);
assert.ok(sitemapXml.includes("<loc>https://garrytipler.com/writing/october-2026/</loc>"));
const canonicalUrl = "https://garrytipler.com/writing/fragments/fragments-4-the-fire/";

const writingEntries = await validateWritingRepository({ root: projectRoot });
const draftEntries = writingEntries.filter((entry) => entry.status === "draft");
const publishedEntries = writingEntries.filter((entry) => entry.status === "published");
const discoveryOutput = [
  octoberHtml,
  writingIndexHtml,
  fragmentsIndexHtml,
  essaysIndexHtml,
  archiveHtml,
  startHereHtml,
  sitemapXml,
  rssXml,
].join("\n");
for (const draft of draftEntries) {
  const draftRoute = writingRoute(draft.data);
  await assert.rejects(
    access(new URL(`${draftRoute}index.html`, outputRoot)),
    (error) => error.code === "ENOENT",
    `Draft "${draft.data.type}:${draft.data.slug}" must not generate a public route.`,
  );
  assert.doesNotMatch(
    discoveryOutput,
    new RegExp(`/${draftRoute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
    `Draft "${draft.data.type}:${draft.data.slug}" must not enter discovery output.`,
  );
}

for (const entry of publishedEntries) {
  const route = writingRoute(entry.data);
  const canonical = `https://garrytipler.com/${route}`;
  const articleHtml = await requireOutput(`${route}index.html`);
  if (entry.data.series) {
    assert.ok(octoberHtml.includes(`href="/${route}"`));
    assert.ok(articleHtml.includes(`OCTOBER WRITING CHALLENGE · ${String(entry.data.seriesDay).padStart(2, "0")} / 31`));
    assert.ok(articleHtml.includes('href="/writing/october-2026/">Return to October: 31 Days of Writing'));
    const socialImagePath = `assets/social/october-2026/${entry.data.slug}.png`;
    const socialImageUrl = `https://garrytipler.com/${socialImagePath}`;
    const socialImage = await readFile(new URL(socialImagePath, outputRoot));
    assert.equal(socialImage.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${entry.id}: social card must be a PNG.`);
    assert.equal(socialImage.readUInt32BE(16), 1200, `${entry.id}: social card width must be 1200.`);
    assert.equal(socialImage.readUInt32BE(20), 630, `${entry.id}: social card height must be 630.`);
    assert.ok(articleHtml.includes(`<meta property="og:image" content="${socialImageUrl}">`));
    assert.ok(articleHtml.includes(`<meta name="twitter:image" content="${socialImageUrl}">`));
    assert.ok(articleHtml.includes('<meta property="og:image:type" content="image/png">'));
    assert.ok(articleHtml.includes('<meta property="og:image:width" content="1200">'));
    assert.ok(articleHtml.includes('<meta property="og:image:height" content="630">'));
    const socialImageAlt = `${entry.data.title} — October Writing Challenge · ${String(entry.data.seriesDay).padStart(2, "0")} / 31 — Garry Tipler`
      .replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
    assert.ok(articleHtml.includes(`<meta property="og:image:alt" content="${socialImageAlt}">`));
    assert.ok(articleHtml.includes(`<meta name="twitter:image:alt" content="${socialImageAlt}">`));
    assert.ok(!articleHtml.includes(`<img src="/${socialImagePath}"`), "October social cards must remain metadata-only.");
    const sequence = publishedEntries.filter((candidate) => candidate.data.series === entry.data.series)
      .sort((left, right) => left.data.seriesDay - right.data.seriesDay);
    const position = sequence.indexOf(entry);
    for (const [direction, neighbor] of [["previous", sequence[position - 1]], ["next", sequence[position + 1]]]) {
      if (neighbor) assert.ok(articleHtml.includes(`class="sequence-link sequence-${direction}" href="/${writingRoute(neighbor.data)}"`));
      else assert.ok(!articleHtml.includes(`class="sequence-link sequence-${direction}"`));
    }
  }
  assert.match(
    articleHtml,
    new RegExp(`<link rel="canonical" href="${canonical}"`),
    `Published writing "${entry.data.type}:${entry.data.slug}" must generate its canonical route.`,
  );
  assert.ok(
    sitemapXml.includes(`<loc>${canonical}</loc>`),
    `Sitemap must contain published writing "${entry.data.type}:${entry.data.slug}".`,
  );
  assert.ok(
    rssXml.includes(`<link>${canonical}</link>`),
    `RSS must contain published writing "${entry.data.type}:${entry.data.slug}".`,
  );

  if (entry.data.heroImage) {
    const heroImageUrl = `https://garrytipler.com${entry.data.heroImage.src}`;
    if (!entry.data.series) {
      assert.ok(
        articleHtml.includes(`<meta property="og:image" content="${heroImageUrl}">`),
        `Published writing "${entry.data.type}:${entry.data.slug}" must use its hero for Open Graph.`,
      );
      assert.ok(
        articleHtml.includes(`<meta name="twitter:image" content="${heroImageUrl}">`),
        `Published writing "${entry.data.type}:${entry.data.slug}" must use its hero for Twitter.`,
      );
    }
    assert.ok(
      articleHtml.includes(`<figure class="article-hero"><img src="${entry.data.heroImage.src}"`),
      `Published writing "${entry.data.type}:${entry.data.slug}" must render its hero.`,
    );

    const articleJsonLdMatch = articleHtml.match(
      /<script[^>]*id="article-jsonld"[^>]*>([\s\S]*?)<\/script>/,
    );
    assert.ok(articleJsonLdMatch, `Published writing "${entry.id}" must include Article JSON-LD.`);
    assert.equal(
      JSON.parse(articleJsonLdMatch[1]).image,
      heroImageUrl,
      `Published writing "${entry.data.type}:${entry.data.slug}" must expose its hero in JSON-LD.`,
    );
  }
}

const publishedFragments = publishedEntries
  .filter((entry) => entry.data.type === "fragment")
  .sort((left, right) => left.data.fragmentNumber - right.data.fragmentNumber);
let previousFragmentIndexPosition = -1;
for (const [index, entry] of publishedFragments.entries()) {
  // The index shows titles without the "Fragments #N — " prefix; the № mark carries the number.
  const indexTitle = entry.data.title.replace(/^Fragments #\d+\s+—\s+/, "");
  const titleMarker = `<span class="writing-list-title">${indexTitle}</span>`;
  const indexPosition = fragmentsIndexHtml.indexOf(titleMarker);
  assert.ok(indexPosition >= 0, `Fragments index must contain "${entry.data.title}".`);
  assert.ok(
    indexPosition > previousFragmentIndexPosition,
    "Fragments index must order Fragment numbers from lowest to highest.",
  );
  previousFragmentIndexPosition = indexPosition;

  const route = `writing/fragments/${entry.data.slug}/`;
  const articleHtml = await requireOutput(`${route}index.html`);
  const previous = publishedFragments[index - 1];
  const next = publishedFragments[index + 1];

  if (previous) {
    assert.ok(
      articleHtml.includes(
        `class="sequence-link sequence-previous" href="/writing/fragments/${previous.data.slug}/"`,
      ),
      `Fragment ${entry.data.fragmentNumber} must link back to Fragment ${previous.data.fragmentNumber}.`,
    );
  } else {
    assert.doesNotMatch(articleHtml, /class="sequence-link sequence-previous"/);
  }

  if (next) {
    assert.ok(
      articleHtml.includes(
        `class="sequence-link sequence-next" href="/writing/fragments/${next.data.slug}/"`,
      ),
      `Fragment ${entry.data.fragmentNumber} must link forward to Fragment ${next.data.fragmentNumber}.`,
    );
  } else {
    assert.doesNotMatch(articleHtml, /class="sequence-link sequence-next"/);
  }
}

assert.match(
  homepageHtml,
  /href="\/writing\/fragments\/fragments-4-the-fire\/"/,
  "Homepage pilot teaser must link to the GarryTipler.com article route.",
);
assert.match(
  homepageHtml,
  /href="\/writing\/">\s*Explore the writing library/,
  "Homepage writing section must link to the Writing Library.",
);
assert.match(
  writingIndexHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/"/,
);
assert.match(writingIndexHtml, /href="\/writing\/fragments\/"/);
assert.match(writingIndexHtml, /href="\/writing\/essays\/"/);
assert.match(writingIndexHtml, /href="\/writing\/archive\/"/);
assert.match(writingIndexHtml, /href="\/writing\/start-here\/"/);
assert.match(writingIndexHtml, /type="application\/rss\+xml"/);
assert.match(
  fragmentsIndexHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/fragments\/"/,
);
assert.match(fragmentsIndexHtml, /href="\/writing\/fragments\/fragments-4-the-fire\/"/);
assert.match(
  essaysIndexHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/essays\/"/,
);
assert.match(essaysIndexHtml, /id="essays-heading">Essay index<\/h2>/);
assert.match(
  archiveHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/archive\/"/,
);
const publishedCountsByYear = new Map();
for (const entry of publishedEntries) {
  const effectiveDate = entry.data.originalPublishedDate ?? entry.data.publishedDate;
  assert.ok(effectiveDate, `Published writing "${entry.id}" must have an effective date.`);
  const year = effectiveDate.slice(0, 4);
  publishedCountsByYear.set(year, (publishedCountsByYear.get(year) ?? 0) + 1);
}
for (const [year, count] of publishedCountsByYear) {
  assert.match(archiveHtml, new RegExp(`id="archive-${year}"`));
  assert.match(archiveHtml, new RegExp(`>${count} ${count === 1 ? "piece" : "pieces"}<`));
}
assert.match(archiveHtml, /Fragments #4/);
assert.match(
  startHereHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/start-here\/"/,
);
assert.match(startHereHtml, /Curated sequence/);
assert.match(startHereHtml, /Fragments #4/);

assert.match(pilotHtml, new RegExp(`<link rel="canonical" href="${canonicalUrl}"`));
assert.match(pilotHtml, /property="og:type" content="article"/);
assert.match(pilotHtml, /property="article:published_time" content="2026-03-02"/);
assert.match(pilotHtml, />1 min read</);
assert.match(pilotHtml, /Originally published on Medium on March 2, 2026\./);
assert.match(
  pilotHtml,
  /https:\/\/medium\.com\/@Garry_Tipler\/fragments-4-the-fire-7301b68ca8b1/,
);
assert.match(pilotHtml, /href="\/writing\/fragments\/"/);
assert.match(pilotHtml, /href="\/writing\/">Return to Writing/);
assert.doesNotMatch(
  pilotHtml,
  /class="article-discovery"/,
  "Articles without explicit related or connection metadata must not render empty discovery sections.",
);

const sitemapLocations = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (match) => match[1],
);
assert.ok(sitemapLocations.length > 0, "Sitemap must contain canonical URLs.");
for (const location of sitemapLocations) {
  assert.match(location, /^https:\/\/garrytipler\.com\//);
}
for (const requiredUrl of [
  "https://garrytipler.com/",
  "https://garrytipler.com/projects/selftrainer/",
  "https://garrytipler.com/projects/fitpulse/",
  "https://garrytipler.com/writing/",
  "https://garrytipler.com/writing/archive/",
  "https://garrytipler.com/writing/start-here/",
  canonicalUrl,
]) {
  assert.ok(sitemapLocations.includes(requiredUrl), `Sitemap is missing ${requiredUrl}.`);
}
assert.doesNotMatch(sitemapXml, /medium\.com/i);

assert.match(rssXml, /<title>Fragments #4 — The Fire<\/title>/);
assert.match(rssXml, new RegExp(`<link>${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</link>`));
assert.match(rssXml, /<pubDate>Mon, 02 Mar 2026 00:00:00 GMT<\/pubDate>/);
assert.match(rssXml, /<atom:link href="https:\/\/garrytipler\.com\/rss\.xml"/);
assert.doesNotMatch(rssXml, /medium\.com/i);

assert.match(robotsTxt, /^User-agent: \*$/m);
assert.match(robotsTxt, /^Allow: \/$/m);
assert.match(robotsTxt, /^Sitemap: https:\/\/garrytipler\.com\/sitemap\.xml$/m);

const jsonLdMatch = pilotHtml.match(
  /<script[^>]*id="article-jsonld"[^>]*>([\s\S]*?)<\/script>/,
);
assert.ok(jsonLdMatch, "Pilot must include Article JSON-LD.");

const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.equal(jsonLd["@type"], "Article");
assert.equal(jsonLd.url, canonicalUrl);
assert.equal(jsonLd.mainEntityOfPage, canonicalUrl);
assert.equal(jsonLd.datePublished, "2026-03-02");
assert.equal(jsonLd.headline, "Fragments #4 — The Fire");

// GitHub Pages serves dist/404.html for unknown paths, so every URL in it must be root-relative.
const notFoundHtml = await requireOutput("404.html");
assert.match(notFoundHtml, /<meta name="robots" content="noindex"/);
assert.doesNotMatch(notFoundHtml, /rel="canonical"/, "The 404 page must not declare a canonical URL.");
assert.doesNotMatch(notFoundHtml, /aria-current="page"/, "The 404 page must not mark a nav section current.");
assert.doesNotMatch(notFoundHtml, /(?:href|src)="(?!\/|https?:|#)/, "The 404 page must use root-relative URLs.");
assert.ok(!sitemapXml.includes("404"), "The sitemap must not list the 404 page.");

console.log(
  "Verified Writing Library routes, archive, Start Here, sitemap, RSS, robots, pilot metadata, and 404 page.",
);
