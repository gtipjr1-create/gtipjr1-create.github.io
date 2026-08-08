import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { collectionByType, validateWritingRepository } from "./writing-content.mjs";

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
const canonicalUrl = "https://garrytipler.com/writing/fragments/fragments-4-the-fire/";

const writingEntries = await validateWritingRepository({ root: projectRoot });
const draftEntries = writingEntries.filter((entry) => entry.status === "draft");
const publishedEntries = writingEntries.filter((entry) => entry.status === "published");
const discoveryOutput = [
  writingIndexHtml,
  fragmentsIndexHtml,
  essaysIndexHtml,
  archiveHtml,
  startHereHtml,
  sitemapXml,
  rssXml,
].join("\n");
for (const draft of draftEntries) {
  const draftRoute = `writing/${collectionByType[draft.data.type]}/${draft.data.slug}/`;
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
  const route = `writing/${collectionByType[entry.data.type]}/${entry.data.slug}/`;
  const canonical = `https://garrytipler.com/${route}`;
  const articleHtml = await requireOutput(`${route}index.html`);
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
assert.match(fragmentsIndexHtml, /Fragments #4/);
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
assert.match(pilotHtml, /property="article:published_time" content="2026-08-06"/);
assert.match(pilotHtml, />1 min read</);
assert.match(pilotHtml, /Also available on Medium\./);
assert.doesNotMatch(pilotHtml, /Originally published on Medium on/);
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
assert.match(rssXml, /<pubDate>Thu, 06 Aug 2026 00:00:00 GMT<\/pubDate>/);
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
assert.equal(jsonLd.datePublished, "2026-08-06");
assert.equal(jsonLd.headline, "Fragments #4 — The Fire");

console.log(
  "Verified Writing Library routes, archive, Start Here, sitemap, RSS, robots, and pilot metadata.",
);
