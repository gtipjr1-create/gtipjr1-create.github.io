import type { APIRoute } from "astro";
import { getPublishedWritingEntries, getWritingPath } from "../lib/writing";
import { escapeXml, requireCanonicalSite, toCanonicalUrl } from "../lib/site-output";

export const prerender = true;

const staticPaths = [
  "/",
  "/projects/selftrainer/",
  "/projects/fitpulse/",
  "/writing/",
  "/writing/fragments/",
  "/writing/essays/",
  "/writing/archive/",
  "/writing/start-here/",
];

export const GET: APIRoute = async ({ site }) => {
  const canonicalSite = requireCanonicalSite(site);
  const entries = await getPublishedWritingEntries();
  const urls = new Set([
    ...staticPaths.map((path) => toCanonicalUrl(path, canonicalSite)),
    ...entries.map((entry) => toCanonicalUrl(getWritingPath(entry.data), canonicalSite)),
  ]);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
