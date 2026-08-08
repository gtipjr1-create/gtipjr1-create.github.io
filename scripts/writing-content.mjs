import { access, readFile, readdir } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { JSON_SCHEMA, load } from "js-yaml";

export const writingTypes = ["fragment", "essay", "letter"];
export const collectionByType = {
  fragment: "fragments",
  essay: "essays",
  letter: "letters",
};

const exactDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const relatedPattern = /^(fragment|essay|letter):[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isExactDate(value) {
  if (typeof value !== "string" || !exactDatePattern.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseWritingMarkdown(markdown, label) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    throw new Error(`${label}: expected YAML frontmatter delimited by --- lines.`);
  }

  let data;
  try {
    data = load(match[1], { schema: JSON_SCHEMA });
  } catch (error) {
    throw new Error(`${label}: invalid YAML frontmatter: ${error.message}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`${label}: frontmatter must be a YAML object.`);
  }

  return { data, body: markdown.slice(match[0].length) };
}

function addError(errors, label, message) {
  errors.push(`${label}: ${message}`);
}

function validateString(data, field, errors, label, { optional = false } = {}) {
  const value = data[field];
  if (value === undefined && optional) return;
  if (typeof value !== "string" || value.trim() === "") {
    addError(errors, label, `${field} must be a non-empty string.`);
  }
}

function validateUniqueStringArray(data, field, errors, label, pattern) {
  const value = data[field] ?? [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    addError(errors, label, `${field} must be an array of strings.`);
    return;
  }
  if (new Set(value).size !== value.length) {
    addError(errors, label, `${field} values must be unique.`);
  }
  if (pattern) {
    value.forEach((item) => {
      if (!pattern.test(item)) addError(errors, label, `${field} contains invalid value "${item}".`);
    });
  }
}

export function validateWritingData(data, label = "writing entry") {
  const errors = [];

  for (const field of ["title", "slug", "type", "summary", "category"]) {
    validateString(data, field, errors, label);
  }

  if (typeof data.slug === "string" && !slugPattern.test(data.slug)) {
    addError(errors, label, "slug must use lowercase kebab-case and is immutable after publication.");
  }
  if (!writingTypes.includes(data.type)) {
    addError(errors, label, `type must be one of: ${writingTypes.join(", ")}.`);
  }

  validateUniqueStringArray(data, "tags", errors, label, slugPattern);
  validateUniqueStringArray(data, "related", errors, label, relatedPattern);

  const status = data.status ?? "draft";
  if (!["draft", "published"].includes(status)) {
    addError(errors, label, 'status must be "draft" or "published".');
  }

  for (const field of ["publishedDate", "originalPublishedDate", "updatedDate"]) {
    if (data[field] !== undefined && !isExactDate(data[field])) {
      addError(errors, label, `${field} must be a real, exact date in YYYY-MM-DD format.`);
    }
  }
  if (status === "published" && data.publishedDate === undefined) {
    addError(errors, label, "published writing requires publishedDate.");
  }
  if (
    isExactDate(data.originalPublishedDate) &&
    isExactDate(data.publishedDate) &&
    data.originalPublishedDate > data.publishedDate
  ) {
    addError(errors, label, "originalPublishedDate cannot be later than publishedDate.");
  }
  if (
    isExactDate(data.updatedDate) &&
    isExactDate(data.publishedDate) &&
    data.updatedDate < data.publishedDate
  ) {
    addError(errors, label, "updatedDate cannot be earlier than publishedDate.");
  }

  if (data.type === "fragment") {
    if (!Number.isInteger(data.fragmentNumber) || data.fragmentNumber <= 0) {
      addError(errors, label, "fragments require a positive integer fragmentNumber.");
    }
  } else if (data.fragmentNumber !== undefined) {
    addError(errors, label, "only fragments may define fragmentNumber.");
  }

  for (const field of ["startHereOrder"]) {
    if (data[field] !== undefined && (!Number.isInteger(data[field]) || data[field] <= 0)) {
      addError(errors, label, `${field} must be a positive integer.`);
    }
  }
  if (data.featured !== undefined && typeof data.featured !== "boolean") {
    addError(errors, label, "featured must be true or false.");
  }
  if (data.mediumUrl !== undefined) {
    try {
      const url = new URL(data.mediumUrl);
      if (!/^https?:$/.test(url.protocol)) throw new Error();
    } catch {
      addError(errors, label, "mediumUrl must be an absolute HTTP(S) URL.");
    }
  }

  const connections = data.connections ?? [];
  if (!Array.isArray(connections)) {
    addError(errors, label, "connections must be an array.");
  } else {
    connections.forEach((connection, index) => {
      const connectionLabel = `connections[${index}]`;
      if (!connection || typeof connection !== "object" || Array.isArray(connection)) {
        addError(errors, label, `${connectionLabel} must be an object.`);
        return;
      }
      if (!["book", "project", "guide"].includes(connection.kind)) {
        addError(errors, label, `${connectionLabel}.kind must be book, project, or guide.`);
      }
      if (typeof connection.label !== "string" || connection.label.trim() === "") {
        addError(errors, label, `${connectionLabel}.label must be a non-empty string.`);
      }
      if (typeof connection.url !== "string" || connection.url.trim() === "") {
        addError(errors, label, `${connectionLabel}.url must be a non-empty string.`);
      }
    });
  }

  if (data.heroImage !== undefined) {
    if (!data.heroImage || typeof data.heroImage !== "object" || Array.isArray(data.heroImage)) {
      addError(errors, label, "heroImage must be an object.");
    } else {
      validateString(data.heroImage, "src", errors, `${label} heroImage`);
      validateString(data.heroImage, "alt", errors, `${label} heroImage`);
      validateString(data.heroImage, "caption", errors, `${label} heroImage`, { optional: true });
      validateString(data.heroImage, "credit", errors, `${label} heroImage`, { optional: true });
    }
  }

  return errors;
}

async function listMarkdownFiles(directory) {
  let items;
  try {
    items = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const item of items) {
    const itemPath = join(directory, item.name);
    if (item.isDirectory()) files.push(...(await listMarkdownFiles(itemPath)));
    if (item.isFile() && item.name.endsWith(".md")) files.push(itemPath);
  }
  return files.sort();
}

function extractAssetReferences(entry) {
  const references = [];
  const markdownImagePattern = /!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\)/g;
  for (const match of entry.body.matchAll(markdownImagePattern)) {
    references.push(match[1] ?? match[2]);
  }
  if (entry.data.heroImage?.src) references.push(entry.data.heroImage.src);
  return references;
}

function assetPathForReference(reference, entryPath, root) {
  if (/^(?:https?:|data:|#)/i.test(reference)) return undefined;
  const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
  if (cleanReference.startsWith("/")) {
    return resolve(root, `.${cleanReference.split("/").join(sep)}`);
  }
  return resolve(dirname(entryPath), cleanReference);
}

function isInside(parent, candidate) {
  const child = relative(parent, candidate);
  return child === "" || (!child.startsWith(`..${sep}`) && child !== "..");
}

export async function validateWritingRepository({ root = process.cwd() } = {}) {
  const contentRoot = resolve(root, "src/content/writing");
  const files = await listMarkdownFiles(contentRoot);
  const entries = [];
  const errors = [];

  for (const path of files) {
    const id = relative(contentRoot, path).split(sep).join("/");
    let parsed;
    try {
      parsed = parseWritingMarkdown(await readFile(path, "utf8"), id);
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    errors.push(...validateWritingData(parsed.data, id));
    const entry = { id, path, ...parsed, status: parsed.data.status ?? "draft" };
    entries.push(entry);

    if (writingTypes.includes(parsed.data.type) && typeof parsed.data.slug === "string") {
      const expected = `${collectionByType[parsed.data.type]}/${parsed.data.slug}/index.md`;
      if (id !== expected) {
        addError(errors, id, `file location must be ${expected} for this type and slug.`);
      }
    }

    for (const reference of extractAssetReferences(entry)) {
      let assetPath;
      try {
        assetPath = assetPathForReference(reference, path, root);
      } catch {
        addError(errors, id, `asset reference "${reference}" is not a valid path.`);
        continue;
      }
      if (!assetPath) continue;
      if (!isAbsolute(assetPath) || !isInside(resolve(root), assetPath)) {
        addError(errors, id, `asset reference "${reference}" resolves outside the repository.`);
        continue;
      }
      try {
        await access(assetPath);
      } catch {
        addError(errors, id, `referenced asset is missing: ${relative(root, assetPath)}.`);
      }
    }
  }

  const byKey = new Map();
  const fragmentNumbers = new Map();
  const startHereOrders = new Map();
  for (const entry of entries) {
    const key = `${entry.data.type}:${entry.data.slug}`;
    if (byKey.has(key)) {
      errors.push(`Duplicate writing key "${key}" in "${byKey.get(key).id}" and "${entry.id}".`);
    } else {
      byKey.set(key, entry);
    }
    if (entry.data.type === "fragment" && Number.isInteger(entry.data.fragmentNumber)) {
      if (fragmentNumbers.has(entry.data.fragmentNumber)) {
        errors.push(
          `Duplicate fragmentNumber ${entry.data.fragmentNumber} in "${fragmentNumbers.get(entry.data.fragmentNumber)}" and "${entry.id}".`,
        );
      } else fragmentNumbers.set(entry.data.fragmentNumber, entry.id);
    }
    if (Number.isInteger(entry.data.startHereOrder)) {
      if (startHereOrders.has(entry.data.startHereOrder)) {
        errors.push(
          `Duplicate startHereOrder ${entry.data.startHereOrder} in "${startHereOrders.get(entry.data.startHereOrder)}" and "${entry.id}".`,
        );
      } else startHereOrders.set(entry.data.startHereOrder, entry.id);
    }
  }

  for (const entry of entries) {
    const currentKey = `${entry.data.type}:${entry.data.slug}`;
    for (const relatedKey of entry.data.related ?? []) {
      if (relatedKey === currentKey) {
        errors.push(`Writing "${currentKey}" cannot relate to itself.`);
        continue;
      }
      const related = byKey.get(relatedKey);
      if (!related) {
        errors.push(`Writing "${currentKey}" references missing related writing "${relatedKey}".`);
      } else if (entry.status === "published" && related.status !== "published") {
        errors.push(`Published writing "${currentKey}" cannot expose draft related writing "${relatedKey}".`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Writing content validation failed:\n- ${errors.join("\n- ")}`);
  }

  return entries;
}
