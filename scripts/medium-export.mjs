import { createHash } from "node:crypto";
import { access, mkdir, open, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { inflateRawSync } from "node:zlib";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { dump } from "js-yaml";
import { collectionByType, validateWritingRepository } from "./writing-content.mjs";

const zipEndSignature = 0x06054b50;
const zipCentralSignature = 0x02014b50;
const zipLocalSignature = 0x04034b50;
const fragmentTitlePattern = /^Fragments?\s*#(\d+)\b/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const excludedArchiveGroups = new Set([
  "blocks",
  "bookmarks",
  "claps",
  "highlights",
  "interests",
  "lists",
  "notes",
  "profile",
  "pubs-following",
  "sessions",
  "topics-following",
  "twitter",
  "users-following",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeArchivePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isInside(parent, candidate) {
  const child = relative(parent, candidate);
  return child === "" || (child !== ".." && !child.startsWith(`..${sep}`));
}

function decodeZipName(buffer, flags) {
  if ((flags & 0x800) !== 0) return buffer.toString("utf8");
  if (buffer.every((byte) => byte < 0x80)) return buffer.toString("ascii");
  throw new Error("ZIP entry names must be UTF-8 when they contain non-ASCII bytes.");
}

function findZipEnd(buffer) {
  const minimum = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimum; offset -= 1) {
    if (buffer.readUInt32LE(offset) === zipEndSignature) return offset;
  }
  throw new Error("Input is not a supported ZIP archive: end-of-directory record is missing.");
}

export function readZipEntries(buffer) {
  const endOffset = findZipEnd(buffer);
  const diskNumber = buffer.readUInt16LE(endOffset + 4);
  const centralDisk = buffer.readUInt16LE(endOffset + 6);
  const diskEntries = buffer.readUInt16LE(endOffset + 8);
  const totalEntries = buffer.readUInt16LE(endOffset + 10);
  const centralSize = buffer.readUInt32LE(endOffset + 12);
  const centralOffset = buffer.readUInt32LE(endOffset + 16);
  if (diskNumber !== 0 || centralDisk !== 0 || diskEntries !== totalEntries) {
    throw new Error("Multi-disk ZIP archives are not supported.");
  }
  if (totalEntries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
    throw new Error("ZIP64 archives are not supported.");
  }
  if (centralOffset + centralSize > endOffset) {
    throw new Error("ZIP central directory points outside the archive.");
  }

  const entries = [];
  let offset = centralOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(offset) !== zipCentralSignature) {
      throw new Error(`Invalid ZIP central-directory entry at index ${index}.`);
    }
    const flags = buffer.readUInt16LE(offset + 8);
    const compression = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const nameStart = offset + 46;
    const name = normalizeArchivePath(
      decodeZipName(buffer.subarray(nameStart, nameStart + nameLength), flags),
    );
    if (name.startsWith("/") || name.split("/").includes("..")) {
      throw new Error(`Unsafe ZIP entry path: ${name}`);
    }
    if (buffer.readUInt32LE(localOffset) !== zipLocalSignature) {
      throw new Error(`Invalid ZIP local header for ${name}.`);
    }
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    if (dataStart + compressedSize > buffer.length) {
      throw new Error(`ZIP entry data points outside the archive: ${name}.`);
    }
    entries.push({
      name,
      directory: name.endsWith("/"),
      read() {
        if ((flags & 0x1) !== 0) throw new Error(`Encrypted ZIP entry is not supported: ${name}`);
        if (![0, 8].includes(compression)) {
          throw new Error(`Unsupported ZIP compression method ${compression} for ${name}.`);
        }
        const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
        const contents = compression === 0 ? Buffer.from(compressed) : inflateRawSync(compressed);
        if (contents.length !== uncompressedSize) {
          throw new Error(`Uncompressed size mismatch for ZIP entry ${name}.`);
        }
        return contents;
      },
    });
    offset = nameStart + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function listDirectoryFiles(root, directory = root) {
  const items = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const item of items) {
    const path = join(directory, item.name);
    if (item.isDirectory()) files.push(...(await listDirectoryFiles(root, path)));
    if (item.isFile()) {
      files.push({
        name: normalizeArchivePath(relative(root, path)),
        directory: false,
        read: () => readFile(path),
      });
    }
  }
  return files.sort((left, right) => left.name.localeCompare(right.name));
}

export async function readMediumExport(inputPath) {
  const absoluteInput = resolve(inputPath);
  const inputStats = await stat(absoluteInput);
  if (inputStats.isDirectory()) {
    const entries = await listDirectoryFiles(absoluteInput);
    return {
      source: {
        kind: "directory",
        filename: basename(absoluteInput),
        bytes: null,
        sha256: null,
      },
      entries,
    };
  }
  if (!inputStats.isFile() || extname(absoluteInput).toLowerCase() !== ".zip") {
    throw new Error("Medium export input must be one explicit .zip file or extracted export directory.");
  }
  const archive = await readFile(absoluteInput);
  return {
    source: {
      kind: "zip",
      filename: basename(absoluteInput),
      bytes: archive.length,
      sha256: sha256(archive),
    },
    entries: readZipEntries(archive),
  };
}

function decodeHtml(value) {
  const named = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: "\u00a0", quot: '"' };
  return value.replace(/&(?:#(\d+)|#x([\da-f]+)|([a-z][\da-z]+));/gi, (entity, decimal, hexadecimal, name) => {
    if (decimal) return String.fromCodePoint(Number.parseInt(decimal, 10));
    if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
    return named[name.toLowerCase()] ?? entity;
  });
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

function parseHtml(html) {
  const root = { tag: "root", attributes: {}, children: [] };
  const stack = [root];
  const tokens = html.match(/<!--[\s\S]*?-->|<![^>]*>|<\/?[^>]+>|[^<]+/g) ?? [];
  for (const token of tokens) {
    if (token.startsWith("<!--") || /^<!/i.test(token)) continue;
    if (token.startsWith("</")) {
      const closingTag = token.match(/^<\/\s*([^\s>]+)/)?.[1]?.toLowerCase();
      const matchIndex = stack.findLastIndex((node) => node.tag === closingTag);
      if (matchIndex > 0) stack.length = matchIndex;
      continue;
    }
    if (token.startsWith("<")) {
      const match = token.match(/^<\s*([^\s/>]+)([\s\S]*?)(\/?)>$/);
      if (!match) continue;
      const tag = match[1].toLowerCase();
      const node = { tag, attributes: parseAttributes(match[2]), children: [] };
      stack.at(-1).children.push(node);
      if (match[3] !== "/" && !voidElements.has(tag)) stack.push(node);
      continue;
    }
    stack.at(-1).children.push({ tag: "#text", value: decodeHtml(token), children: [] });
  }
  return root;
}

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children ?? []) {
    const match = findNode(child, predicate);
    if (match) return match;
  }
  return undefined;
}

function findNodes(node, predicate, matches = []) {
  if (predicate(node)) matches.push(node);
  for (const child of node.children ?? []) findNodes(child, predicate, matches);
  return matches;
}

function plainText(node) {
  if (!node) return "";
  if (node.tag === "#text") return node.value;
  if (node.tag === "br") return "\n";
  return (node.children ?? []).map(plainText).join("");
}

function normalizedComparison(value) {
  return value
    .normalize("NFKC")
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, " ")
    .replace(/[‐‑‒–—―]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function escapeMarkdownText(value) {
  return value.replace(/([\\*_[\]])/g, "\\$1");
}

function wrapInline(contents, marker) {
  const match = contents.match(/^(\s*)([\s\S]*?\S)(\s*)$/);
  if (!match) return contents;
  return `${match[1]}${marker}${match[2]}${marker}${match[3]}`;
}

function escapeParagraphPrefix(value) {
  return value.replace(/^(\d+)\.(?=\s)/, "$1\\.");
}

function renderInline(node) {
  if (node.tag === "#text") return escapeMarkdownText(node.value);
  const contents = (node.children ?? []).map(renderInline).join("");
  if (node.tag === "br") return "  \n";
  if (node.tag === "strong" || node.tag === "b") return wrapInline(contents, "**");
  if (node.tag === "em" || node.tag === "i") return wrapInline(contents, "*");
  if (node.tag === "a" && node.attributes.href) return `[${contents}](${node.attributes.href})`;
  return contents;
}

function renderList(node, ordered) {
  const items = (node.children ?? []).filter((child) => child.tag === "li");
  return items
    .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${renderInline(item).trim()}`)
    .join("\n");
}

function renderFigure(node) {
  const image = findNode(node, (candidate) => candidate.tag === "img");
  if (!image?.attributes.src) return "";
  const captionNode = findNode(node, (candidate) => candidate.tag === "figcaption");
  const caption = plainText(captionNode).trim();
  const imageId = image.attributes["data-image-id"] ?? "unknown-medium-image";
  const lines = [`![EDITORIAL ALT TEXT REQUIRED](${image.attributes.src})`];
  if (caption) lines.push(`*${escapeMarkdownText(caption)}*`);
  lines.push(`<!-- Remote Medium image ${imageId}; verify and copy locally before publication. -->`);
  return lines.join("\n\n");
}

function renderBlocks(node) {
  const blocks = [];
  for (const child of node.children ?? []) {
    if (child.tag === "#text") continue;
    if (["section", "div", "article"].includes(child.tag)) {
      blocks.push(...renderBlocks(child));
      continue;
    }
    if (/^h[2-4]$/.test(child.tag)) {
      blocks.push({ kind: "heading", text: plainText(child).trim(), markdown: `${"#".repeat(Number(child.tag[1]))} ${renderInline(child).trim()}` });
      continue;
    }
    if (child.tag === "p") {
      const text = plainText(child).trim();
      blocks.push({ kind: text ? "paragraph" : "empty", text, markdown: escapeParagraphPrefix(renderInline(child).trim()) });
      continue;
    }
    if (child.tag === "figure") {
      blocks.push({ kind: "figure", text: "", markdown: renderFigure(child) });
      continue;
    }
    if (child.tag === "blockquote") {
      const nestedQuote = renderBlocks(child)
        .map((block) => block.markdown)
        .filter(Boolean)
        .join("\n\n");
      const quote = nestedQuote || renderInline(child).trim();
      blocks.push({ kind: "blockquote", text: plainText(child).trim(), markdown: quote.split("\n").map((line) => `> ${line}`).join("\n") });
      continue;
    }
    if (child.tag === "ul" || child.tag === "ol") {
      blocks.push({ kind: "list", text: plainText(child).trim(), markdown: renderList(child, child.tag === "ol") });
      continue;
    }
    if (child.tag === "hr") {
      blocks.push({ kind: "separator", text: "", markdown: "---" });
      continue;
    }
    blocks.push(...renderBlocks(child));
  }
  return blocks;
}

function stripExportDuplicates(blocks, title, subtitle) {
  const kept = [...blocks];
  const firstContent = kept.findIndex((block) => !["empty", "separator"].includes(block.kind));
  if (firstContent >= 0 && normalizedComparison(kept[firstContent].text) === normalizedComparison(title)) {
    kept.splice(firstContent, 1);
  }
  if (subtitle) {
    const subtitleIndex = kept.findIndex(
      (block) => block.kind === "paragraph" && normalizedComparison(block.text) === normalizedComparison(subtitle),
    );
    if (subtitleIndex >= 0) kept.splice(subtitleIndex, 1);
  }
  while (kept[0]?.kind === "empty" || kept[0]?.kind === "separator") kept.shift();
  while (kept.at(-1)?.kind === "empty" || kept.at(-1)?.kind === "separator") kept.pop();
  return kept;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function mediumIdFrom(sourcePath, canonicalUrl, html) {
  for (const value of [canonicalUrl, sourcePath, html]) {
    const matches = [...value.matchAll(/(?:\/p\/|-)([a-f0-9]{12})(?:\b|(?=[./]))/gi)];
    if (matches.length > 0) return matches.at(-1)[1].toLowerCase();
  }
  return null;
}

function proposedSlugFor(title, canonicalUrl, mediumId) {
  if (canonicalUrl) {
    try {
      let segment = decodeURIComponent(new URL(canonicalUrl).pathname.split("/").filter(Boolean).at(-1) ?? "");
      if (mediumId) segment = segment.replace(new RegExp(`-${mediumId}$`, "i"), "");
      const slug = slugify(segment);
      if (slugPattern.test(slug)) return slug;
    } catch {
      // The invalid URL is reported separately and the title remains a deterministic fallback.
    }
  }
  return slugify(title);
}

function exactDateFromTimestamp(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value ?? "")) return null;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : value.slice(0, 10);
}

export function parseMediumPost(sourcePath, contents) {
  const html = contents.toString("utf8");
  const document = parseHtml(html);
  const titleNode = findNode(document, (node) => node.tag === "h1" && node.attributes.class?.split(/\s+/).includes("p-name"));
  const subtitleNode = findNode(document, (node) => node.tag === "section" && node.attributes["data-field"] === "subtitle");
  const bodyNode = findNode(document, (node) => node.tag === "section" && node.attributes["data-field"] === "body");
  const timeNode = findNode(document, (node) => node.tag === "time" && node.attributes.class?.split(/\s+/).includes("dt-published"));
  const canonicalNode = findNode(document, (node) => node.tag === "a" && node.attributes.class?.split(/\s+/).includes("p-canonical"));
  const authorNode = findNode(document, (node) => node.tag === "a" && node.attributes.class?.split(/\s+/).includes("p-author"));
  const title = plainText(titleNode).trim();
  const subtitle = plainText(subtitleNode).trim() || null;
  const publishedAtUtc = timeNode?.attributes.datetime ?? null;
  const mediumUrl = canonicalNode?.attributes.href ?? null;
  const mediumId = mediumIdFrom(sourcePath, mediumUrl ?? "", html);
  const rawBlocks = bodyNode ? renderBlocks(bodyNode) : [];
  const blocks = stripExportDuplicates(rawBlocks, title, subtitle);
  const markdown = `${blocks.map((block) => block.markdown).filter(Boolean).join("\n\n").trim()}\n`;
  const prose = blocks.map((block) => block.text).filter(Boolean).join(" ");
  const wordCount = [...prose.matchAll(/[\p{L}\p{N}][\p{L}\p{N}’'-]*/gu)].length;
  const images = bodyNode
    ? findNodes(bodyNode, (node) => node.tag === "img" && Boolean(node.attributes.src)).map((node) => ({
        mediumImageId: node.attributes["data-image-id"] ?? null,
        src: node.attributes.src,
      }))
    : [];
  const fragmentMatch = normalizedComparison(title).match(fragmentTitlePattern);
  const proposedType = fragmentMatch ? "fragment" : "essay";
  const fragmentNumber = fragmentMatch ? Number.parseInt(fragmentMatch[1], 10) : null;
  const proposedSlug = proposedSlugFor(title, mediumUrl, mediumId);
  const draft = basename(sourcePath).startsWith("draft_") || !publishedAtUtc || !mediumUrl;
  const hasStoryStructure = Boolean(subtitle) || wordCount >= 100 || images.length > 0 || blocks.some((block) => ["heading", "blockquote", "list"].includes(block.kind));
  const responseAmbiguous = !draft && proposedType !== "fragment" && !hasStoryStructure;
  const warnings = [];
  if (!title) warnings.push("Exported title is missing.");
  if (!bodyNode || !markdown.trim()) warnings.push("Exported body is missing or empty.");
  if (!publishedAtUtc && !draft) warnings.push("Exact publication timestamp is missing.");
  if (!exactDateFromTimestamp(publishedAtUtc) && !draft) warnings.push("Publication timestamp is not a supported exact UTC value.");
  if (!mediumUrl && !draft) warnings.push("Canonical Medium URL is missing.");
  if (!mediumId) warnings.push("Medium post ID could not be identified.");
  if (!slugPattern.test(proposedSlug)) warnings.push("A valid proposed slug could not be derived.");
  if (responseAmbiguous) warnings.push("Medium supplies no response flag; this short unnumbered record lacks reliable story structure and requires editorial classification.");
  if (images.length > 0) warnings.push(`${images.length} remote Medium image reference(s) have no local export asset and require manual asset review.`);
  return {
    sourcePath,
    sourceSha256: sha256(contents),
    mediumId,
    title,
    subtitle,
    author: plainText(authorNode).trim() || null,
    sourceStatus: draft ? "draft" : "published",
    publishedAtUtc,
    originalPublishedDate: exactDateFromTimestamp(publishedAtUtc),
    mediumUrl,
    proposedType,
    proposedSlug,
    fragmentNumber,
    wordCount,
    assetCount: images.length,
    unresolvedAssetReferences: images,
    markdown,
    sourceHtml: html,
    responseAmbiguous,
    warnings,
  };
}

function archiveInventory(entries) {
  const counts = new Map();
  for (const entry of entries.filter((candidate) => !candidate.directory)) {
    const group = entry.name.split("/")[0];
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function repositoryMediumId(entry) {
  return entry.data.mediumUrl?.match(/([a-f0-9]{12})(?:\/?(?:[?#].*)?)$/i)?.[1]?.toLowerCase() ?? null;
}

function metadataRequiredFor(post) {
  const fields = ["type", "slug", "summary", "category", "tags", "historical calendar date"];
  if (post.assetCount > 0) fields.push("image assets and alt text");
  return fields;
}

function reviewFrontmatter(post) {
  return {
    title: post.title,
    slug: post.proposedSlug,
    type: post.proposedType,
    summary: post.subtitle ?? "EDITORIAL SUMMARY REQUIRED",
    category: "EDITORIAL CATEGORY REQUIRED",
    tags: [],
    ...(post.originalPublishedDate ? { originalPublishedDate: post.originalPublishedDate } : {}),
    ...(post.fragmentNumber ? { fragmentNumber: post.fragmentNumber } : {}),
    featured: false,
    ...(post.mediumUrl ? { mediumUrl: post.mediumUrl } : {}),
    status: "draft",
    related: [],
    connections: [],
  };
}

function reviewMarkdown(post) {
  const frontmatter = dump(reviewFrontmatter(post), {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: true,
  });
  return `---\n${frontmatter}---\n\n${post.markdown}`;
}

function reviewNotes(record) {
  const lines = [
    `# Review: ${record.title}`,
    "",
    `- Source archive entry: \`${record.sourcePath}\``,
    `- Medium post ID: \`${record.mediumId}\``,
    `- Source SHA-256: \`${record.sourceSha256}\``,
    `- Exported UTC timestamp: ${record.publishedAtUtc ?? "missing"}`,
    `- Proposed original date: ${record.originalPublishedDate ?? "unset"}`,
    `- Medium URL: ${record.mediumUrl ?? "missing"}`,
    `- Required editorial decisions: ${record.metadataRequired.join(", ")}`,
    "",
    "This is a review-only draft. Do not move it into `src/content` until the prose, metadata, images, and historical date have been approved.",
  ];
  if (record.warnings.length > 0) {
    lines.push("", "## Warnings", "", ...record.warnings.map((warning) => `- ${warning}`));
  }
  return `${lines.join("\n")}\n`;
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function publicRecord(post) {
  const { markdown, sourceHtml, responseAmbiguous, ...record } = post;
  return record;
}

function renderManifestMarkdown(manifest) {
  const lines = [
    "# Medium export review manifest",
    "",
    `- Source: \`${manifest.source.filename}\` (${manifest.source.kind})`,
    `- SHA-256: \`${manifest.source.sha256 ?? "not available for directory input"}\``,
    `- Post records: ${manifest.counts.total}`,
    `- Ready for review: ${manifest.counts.readyForReview}`,
    `- Blocked: ${manifest.counts.blocked}`,
    `- Already migrated: ${manifest.counts.alreadyMigrated}`,
    `- Skipped: ${manifest.counts.skipped}`,
    "",
    "Only `posts/` records were read as content candidates. Other account-data groups were inventoried by path and excluded.",
    "",
    "| Status | Source archive entry | Medium ID | Title | Proposed identity | Original date | Assets | Remaining decisions |",
    "| --- | --- | --- | --- | --- | --- | ---: | --- |",
  ];
  const cell = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  for (const record of manifest.records) {
    lines.push(`| ${cell(record.importStatus)} | \`${cell(record.sourcePath)}\` | \`${cell(record.mediumId ?? "missing")}\` | ${cell(record.title)} | \`${cell(`${record.proposedType}:${record.proposedSlug}`)}\` | ${cell(record.originalPublishedDate ?? "missing")} | ${record.assetCount} | ${cell(record.metadataRequired.join(", "))} |`);
  }
  return `${lines.join("\n")}\n`;
}

async function writeExclusive(path, contents) {
  await mkdir(resolve(path, ".."), { recursive: true });
  const handle = await open(path, "wx");
  try {
    await handle.writeFile(contents);
  } finally {
    await handle.close();
  }
}

export async function importMediumExport({ inputPath, outputRoot = ".migration-output", root = process.cwd(), write = false } = {}) {
  if (!inputPath) throw new Error("An explicit Medium export ZIP or directory path is required.");
  const projectRoot = resolve(root);
  const absoluteOutputRoot = resolve(projectRoot, outputRoot);
  const contentRoot = resolve(projectRoot, "src/content");
  if (isInside(contentRoot, absoluteOutputRoot)) {
    throw new Error("Medium review output cannot be written inside src/content.");
  }
  const { source, entries } = await readMediumExport(resolve(projectRoot, inputPath));
  const inventory = archiveInventory(entries);
  const postEntries = entries
    .filter((entry) => !entry.directory && /^posts\/[^/]+\.html$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  if (postEntries.length === 0) throw new Error("The export contains no supported posts/*.html records.");
  const posts = await Promise.all(
    postEntries.map(async (entry) => parseMediumPost(entry.name, await entry.read())),
  );
  const repositoryEntries = await validateWritingRepository({ root: projectRoot });
  const existingSlugs = new Map(repositoryEntries.map((entry) => [entry.data.slug, entry]));
  const existingMediumIds = new Map(
    repositoryEntries
      .map((entry) => [repositoryMediumId(entry), entry])
      .filter(([mediumId]) => mediumId),
  );
  const proposedCounts = new Map();
  for (const post of posts.filter((candidate) => candidate.sourceStatus === "published")) {
    const key = `${post.proposedType}:${post.proposedSlug}`;
    proposedCounts.set(key, (proposedCounts.get(key) ?? 0) + 1);
  }

  const records = [];
  const packages = [];
  for (const post of posts) {
    const record = { ...publicRecord(post), metadataRequired: metadataRequiredFor(post), importStatus: "ready for review", outputPath: null };
    const existing = existingMediumIds.get(post.mediumId) ?? existingSlugs.get(post.proposedSlug);
    const key = `${post.proposedType}:${post.proposedSlug}`;
    if (post.sourceStatus === "draft") {
      record.importStatus = "skipped";
      record.warnings.push("Export draft was excluded from review-package generation.");
    } else if (existing) {
      record.importStatus = "already migrated";
      record.warnings.push(`Repository content already represents this Medium ID or slug at ${existing.id}.`);
    } else if (proposedCounts.get(key) > 1) {
      record.importStatus = "blocked";
      record.warnings.push(`Proposed identifier ${key} collides with another published export record.`);
    } else if (post.responseAmbiguous || post.warnings.some((warning) => /missing|could not|not a supported/.test(warning))) {
      record.importStatus = "blocked";
    } else {
      const collection = collectionByType[post.proposedType];
      record.outputPath = normalizeArchivePath(join(outputRoot, collection, post.proposedSlug));
      packages.push({ post, record, directory: resolve(absoluteOutputRoot, collection, post.proposedSlug) });
    }
    records.push(record);
  }

  if (write) {
    const manifestJsonPath = resolve(absoluteOutputRoot, "medium-export-manifest.json");
    const manifestMarkdownPath = resolve(absoluteOutputRoot, "medium-export-manifest.md");
    const paths = [manifestJsonPath, manifestMarkdownPath];
    for (const item of packages) {
      paths.push(resolve(item.directory, "index.md"), resolve(item.directory, "source.html"), resolve(item.directory, "source.json"), resolve(item.directory, "REVIEW.md"));
    }
    const collisions = [];
    for (const path of paths) if (await pathExists(path)) collisions.push(relative(projectRoot, path));
    if (collisions.length > 0) {
      throw new Error(`Refusing to overwrite existing review output:\n- ${collisions.join("\n- ")}`);
    }
  }

  const counts = {
    total: records.length,
    readyForReview: records.filter((record) => record.importStatus === "ready for review").length,
    blocked: records.filter((record) => record.importStatus === "blocked").length,
    alreadyMigrated: records.filter((record) => record.importStatus === "already migrated").length,
    skipped: records.filter((record) => record.importStatus === "skipped").length,
  };
  const manifest = {
    schemaVersion: 1,
    source,
    inventory,
    excludedAccountGroups: Object.keys(inventory).filter((group) => excludedArchiveGroups.has(group)),
    counts,
    records,
  };

  if (write) {
    for (const item of packages) {
      await writeExclusive(resolve(item.directory, "index.md"), reviewMarkdown(item.post));
      await writeExclusive(resolve(item.directory, "source.html"), item.post.sourceHtml);
      await writeExclusive(resolve(item.directory, "source.json"), `${JSON.stringify(publicRecord(item.post), null, 2)}\n`);
      await writeExclusive(resolve(item.directory, "REVIEW.md"), reviewNotes(item.record));
    }
    await writeExclusive(resolve(absoluteOutputRoot, "medium-export-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeExclusive(resolve(absoluteOutputRoot, "medium-export-manifest.md"), renderManifestMarkdown(manifest));
  }
  return manifest;
}
