import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const outputRoot = new URL("../dist/", import.meta.url);
const pilotPath = "writing/fragments/fragments-4-the-fire/index.html";

async function requireOutput(relativePath) {
  const path = new URL(relativePath, outputRoot);
  await access(path);
  return readFile(path, "utf8");
}

const [homepageHtml, writingIndexHtml, fragmentsIndexHtml, essaysIndexHtml] = await Promise.all([
  requireOutput("index.html"),
  requireOutput("writing/index.html"),
  requireOutput("writing/fragments/index.html"),
  requireOutput("writing/essays/index.html"),
  requireOutput("projects/selftrainer/index.html"),
  requireOutput("projects/fitpulse/index.html"),
]);

const pilotHtml = await requireOutput(pilotPath);
const canonicalUrl = "https://garrytipler.com/writing/fragments/fragments-4-the-fire/";

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
assert.match(
  fragmentsIndexHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/fragments\/"/,
);
assert.match(fragmentsIndexHtml, /Fragments #4/);
assert.match(
  essaysIndexHtml,
  /<link rel="canonical" href="https:\/\/garrytipler\.com\/writing\/essays\/"/,
);
assert.match(essaysIndexHtml, /Essays will appear here as verified pieces are migrated/);

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

console.log("Verified Writing Library indexes, homepage links, existing routes, and pilot metadata.");
