import type { APIRoute } from "astro";
import { requireCanonicalSite, toCanonicalUrl } from "../lib/site-output";

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const canonicalSite = requireCanonicalSite(site);
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${toCanonicalUrl("/sitemap.xml", canonicalSite)}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
