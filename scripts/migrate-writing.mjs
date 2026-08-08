import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { dump } from "js-yaml";
import {
  collectionByType,
  isExactDate,
  validateWritingRepository,
  validateWritingData,
  writingTypes,
} from "./writing-content.mjs";

const inputOnlyFields = new Set(["sourceEvidence", "originalPublishedDateEvidence"]);
const allowedFields = new Set([
  "title",
  "slug",
  "type",
  "summary",
  "category",
  "tags",
  "originalPublishedDate",
  "fragmentNumber",
  "mediumUrl",
  "related",
  "connections",
  "heroImage",
  ...inputOnlyFields,
]);

function isInside(parent, candidate) {
  const child = relative(parent, candidate);
  return child === "" || (!child.startsWith(`..${sep}`) && child !== "..");
}

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const name = args[index];
    if (!["--source", "--metadata", "--output"].includes(name)) {
      throw new Error(`Unknown argument "${name}".`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${name} requires a path.`);
    options[name.slice(2)] = value;
    index += 1;
  }
  if (!options.source || !options.metadata) {
    throw new Error(
      "Usage: npm run migrate:writing -- --source <source.md> --metadata <metadata.json> [--output <draft.md>]",
    );
  }
  return options;
}

function prepareMetadata(metadata) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Metadata input must contain one JSON object.");
  }
  const unknown = Object.keys(metadata).filter((field) => !allowedFields.has(field));
  if (unknown.length > 0) {
    throw new Error(`Unknown metadata field(s): ${unknown.join(", ")}. Fix possible typos explicitly.`);
  }
  if (typeof metadata.sourceEvidence !== "string" || metadata.sourceEvidence.trim() === "") {
    throw new Error("sourceEvidence is required and must identify the authoritative source used.");
  }
  if (metadata.originalPublishedDate !== undefined) {
    if (!isExactDate(metadata.originalPublishedDate)) {
      throw new Error("originalPublishedDate must be a verified exact YYYY-MM-DD date.");
    }
    if (
      typeof metadata.originalPublishedDateEvidence !== "string" ||
      metadata.originalPublishedDateEvidence.trim() === ""
    ) {
      throw new Error(
        "originalPublishedDateEvidence is required when originalPublishedDate is supplied; it is not emitted publicly.",
      );
    }
  }

  const output = {
    title: metadata.title,
    slug: metadata.slug,
    type: metadata.type,
    summary: metadata.summary,
    category: metadata.category,
    tags: metadata.tags ?? [],
    ...(metadata.originalPublishedDate
      ? { originalPublishedDate: metadata.originalPublishedDate }
      : {}),
    ...(metadata.fragmentNumber !== undefined
      ? { fragmentNumber: metadata.fragmentNumber }
      : {}),
    featured: false,
    ...(metadata.mediumUrl ? { mediumUrl: metadata.mediumUrl } : {}),
    status: "draft",
    related: metadata.related ?? [],
    connections: metadata.connections ?? [],
    ...(metadata.heroImage ? { heroImage: metadata.heroImage } : {}),
  };
  const errors = validateWritingData(output, "migration metadata");
  if (errors.length > 0) throw new Error(errors.join("\n"));
  return output;
}

export async function generateWritingDraft({ sourcePath, metadataPath, outputPath, root = process.cwd() }) {
  const projectRoot = resolve(root);
  const absoluteSource = resolve(projectRoot, sourcePath);
  const sourceExtension = extname(absoluteSource).toLowerCase();
  if (![".md", ".markdown"].includes(sourceExtension)) {
    throw new Error("The supported source input is explicit Markdown (.md or .markdown) only.");
  }

  const source = await readFile(absoluteSource, "utf8");
  if (/^---\r?\n/.test(source)) {
    throw new Error("Source Markdown must contain prose only; place metadata in the JSON input.");
  }
  const metadata = prepareMetadata(JSON.parse(await readFile(resolve(projectRoot, metadataPath), "utf8")));
  if (!writingTypes.includes(metadata.type)) throw new Error(`Unsupported writing type "${metadata.type}".`);

  const existingEntries = await validateWritingRepository({ root: projectRoot });
  const key = `${metadata.type}:${metadata.slug}`;
  const existingEntry = existingEntries.find(
    (entry) => `${entry.data.type}:${entry.data.slug}` === key,
  );
  if (existingEntry) {
    throw new Error(`Refusing migration: writing slug already exists at ${existingEntry.id}.`);
  }
  for (const relatedKey of metadata.related) {
    if (relatedKey === key) {
      throw new Error(`Migration metadata cannot relate "${key}" to itself.`);
    }
    if (!existingEntries.some((entry) => `${entry.data.type}:${entry.data.slug}` === relatedKey)) {
      throw new Error(`Migration metadata references missing related writing "${relatedKey}".`);
    }
  }

  const collection = collectionByType[metadata.type];
  const publishedTarget = resolve(
    projectRoot,
    "src/content/writing",
    collection,
    metadata.slug,
    "index.md",
  );
  try {
    await access(publishedTarget);
    throw new Error(
      `Refusing migration: writing slug already exists at ${relative(projectRoot, publishedTarget)}.`,
    );
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const absoluteOutput = resolve(
    projectRoot,
    outputPath ?? `.migration-output/${collection}/${metadata.slug}/index.md`,
  );
  const contentRoot = resolve(projectRoot, "src/content/writing");
  if (isInside(contentRoot, absoluteOutput)) {
    throw new Error("Migration output cannot be written inside src/content; review and publish manually.");
  }
  try {
    await access(absoluteOutput);
    throw new Error(`Refusing to overwrite existing draft output: ${relative(projectRoot, absoluteOutput)}.`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const frontmatter = dump(metadata, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: true,
  });
  const generated = `---\n${frontmatter}---\n\n${source}`;
  await mkdir(dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, generated, "utf8");

  return { outputPath: absoluteOutput, metadata, source, generated };
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = await generateWritingDraft({
    sourcePath: options.source,
    metadataPath: options.metadata,
    outputPath: options.output,
  });
  console.log(`Created review draft: ${relative(process.cwd(), result.outputPath)}`);
  console.log("Status is draft. No repository content or public route was created.");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Writing migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}
