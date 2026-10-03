import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { validateWritingRepository } from "./writing-content.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = new URL("../artifacts/october-social-cards/", import.meta.url);
const template = await readFile(new URL("./templates/october-social-card.html", import.meta.url), "utf8");
const entries = (await validateWritingRepository({ root }))
  .filter((entry) => entry.status === "published" && entry.data.series === "october-2026")
  .sort((left, right) => left.data.seriesDay - right.data.seriesDay);
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const previews = new Map();
await mkdir(output, { recursive: true });

for (const { data } of entries) {
  const html = template.replace(/\{\{(title|day)\}\}/g, (_, field) => field === "title"
    ? escapeHtml(data.title)
    : String(data.seriesDay).padStart(2, "0"));
  previews.set(`/${data.slug}/`, html);
  await writeFile(new URL(`${data.slug}.html`, output), html);
  console.log(`${data.title}: export 1200 × 630 PNG to assets/social/october-2026/${data.slug}.png`);
}

// Browser screenshot APIs may return JPEG bytes regardless of the filename.
// Use Astro's existing image encoder only during the publication/export step.
if (process.argv.includes("--encode")) {
  const { default: sharp } = await import("sharp");
  for (const { data } of entries) {
    const path = new URL(`../assets/social/october-2026/${data.slug}.png`, import.meta.url);
    const bytes = await readFile(path);
    const image = sharp(bytes);
    const { width, height } = await image.metadata();
    if (width !== 1200 || height !== 630) throw new Error(`${data.slug}: export must be 1200 × 630.`);
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
      await writeFile(path, await image.png().toBuffer());
      console.log(`Encoded PNG: ${data.slug}`);
    }
  }
}

if (process.argv.includes("--serve")) {
  createServer((request, response) => {
    const html = previews.get(request.url);
    response.writeHead(html ? 200 : 404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(html ?? "Preview not found.");
  }).listen(4322, "127.0.0.1", () => {
    console.log("Preview server: http://127.0.0.1:4322/<slug>/ (Ctrl+C to stop)");
  });
}
