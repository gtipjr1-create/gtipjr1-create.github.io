const canonicalOrigin = "https://garrytipler.com";

export function requireCanonicalSite(site: URL | undefined): URL {
  if (!site || site.origin !== canonicalOrigin) {
    throw new Error(`Astro site must remain self-canonical at ${canonicalOrigin}.`);
  }

  return site;
}

export function toCanonicalUrl(path: string, site: URL): string {
  return new URL(path, site).toString();
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
