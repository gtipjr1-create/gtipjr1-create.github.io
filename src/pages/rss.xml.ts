import type { APIRoute } from "astro";
import {
  getEffectivePublicationDate,
  getPublishedWritingEntries,
  getWritingPath,
  sortWritingByPublicationDate,
} from "../lib/writing";
import { escapeXml, requireCanonicalSite, toCanonicalUrl } from "../lib/site-output";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const canonicalSite = requireCanonicalSite(site);
  const entries = sortWritingByPublicationDate(await getPublishedWritingEntries());
  const feedUrl = toCanonicalUrl("/rss.xml", canonicalSite);
  const writingUrl = toCanonicalUrl("/writing/", canonicalSite);
  const lastBuildDate = entries[0]
    ? getEffectivePublicationDate(entries[0].data).toUTCString()
    : new Date("1970-01-01T00:00:00.000Z").toUTCString();
  const items = entries.map((entry) => {
    const url = toCanonicalUrl(getWritingPath(entry.data), canonicalSite);
    const publicationDate = getEffectivePublicationDate(entry.data).toUTCString();
    const categories = [entry.data.category, ...entry.data.tags]
      .map((category) => `      <category>${escapeXml(category)}</category>`)
      .join("\n");

    return [
      "    <item>",
      `      <title>${escapeXml(entry.data.title)}</title>`,
      `      <link>${escapeXml(url)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
      `      <description>${escapeXml(entry.data.summary)}</description>`,
      `      <pubDate>${publicationDate}</pubDate>`,
      categories,
      "    </item>",
    ].join("\n");
  });
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    "    <title>Garry Tipler — Writing</title>",
    `    <link>${escapeXml(writingUrl)}</link>`,
    "    <description>Essays and fragments on discipline, structure, execution, recovery, and the long rebuild.</description>",
    "    <language>en-us</language>",
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
