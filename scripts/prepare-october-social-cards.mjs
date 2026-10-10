import { spawnSync } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve, sep } from "node:path";
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

const exportIndex = process.argv.indexOf("--export");
const exportSlug = exportIndex === -1 ? null : process.argv[exportIndex + 1];
if (exportIndex !== -1 && (!exportSlug || exportSlug.startsWith("--"))) {
  throw new Error("--export requires one published October slug.");
}
const exportEntry = exportSlug && entries.find(({ data }) => data.slug === exportSlug);
if (exportSlug && !exportEntry) throw new Error(`No published October entry has slug "${exportSlug}".`);

async function findBrowser() {
  const candidates = process.env.OCTOBER_CARD_BROWSER
    ? [process.env.OCTOBER_CARD_BROWSER]
    : process.platform === "win32"
      ? [
          join(process.env.ProgramFiles ?? "C:\\Program Files", "Google/Chrome/Application/chrome.exe"),
          join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"),
        ]
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium"];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  throw new Error("Chrome or Edge is required to export an October social card. Set OCTOBER_CARD_BROWSER to its executable path.");
}

for (const { data } of entries) {
  const html = template.replace(/\{\{(title|day)\}\}/g, (_, field) => field === "title"
    ? escapeHtml(data.title)
    : String(data.seriesDay).padStart(2, "0"));
  previews.set(`/${data.slug}/`, html);
  await writeFile(new URL(`${data.slug}.html`, output), html);
  console.log(`${data.title}: export 1200 × 630 PNG to assets/social/october-2026/${data.slug}.png`);
}

if (exportEntry) {
  const { slug } = exportEntry.data;
  const target = new URL(`../assets/social/october-2026/${slug}.png`, import.meta.url);
  try {
    await access(target);
    throw new Error(`Refusing to overwrite existing social card for "${slug}".`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const temporaryRoot = resolve(root, ".migration-output");
  await mkdir(temporaryRoot, { recursive: true });
  const profile = await mkdtemp(join(temporaryRoot, "card-export-"));
  if (!resolve(profile).startsWith(`${temporaryRoot}${sep}`)) throw new Error("Unsafe temporary browser profile path.");
  try {
    const screenshot = join(profile, "card.png");
    const preview = new URL(`${slug}.html`, output);
    const browser = await findBrowser();
    const result = spawnSync(browser, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--window-size=1200,630",
      "--virtual-time-budget=10000",
      `--user-data-dir=${profile}`,
      `--screenshot=${screenshot}`,
      preview.href,
    ], { encoding: "utf8", timeout: 30000, windowsHide: true });
    if (result.error || result.status !== 0) {
      throw new Error(`Browser export failed: ${result.error?.message ?? result.stderr?.trim() ?? result.status}`);
    }
    const bytes = await readFile(screenshot);
    const { default: sharp } = await import("sharp");
    const { format, width, height } = await sharp(bytes).metadata();
    if (format !== "png" || width !== 1200 || height !== 630) {
      throw new Error(`${slug}: browser export must be a 1200 × 630 PNG.`);
    }
    await writeFile(target, bytes, { flag: "wx" });
    console.log(`Exported social card: assets/social/october-2026/${slug}.png`);
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
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
