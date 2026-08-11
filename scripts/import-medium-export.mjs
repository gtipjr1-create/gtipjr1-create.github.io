import { relative } from "node:path";
import { pathToFileURL } from "node:url";
import { importMediumExport } from "./medium-export.mjs";

function parseArguments(args) {
  const options = { write: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--write") {
      options.write = true;
      continue;
    }
    if (!["--input", "--output"].includes(argument)) throw new Error(`Unknown argument "${argument}".`);
    const value = args[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`${argument} requires a path.`);
    options[argument.slice(2)] = value;
    index += 1;
  }
  if (!options.input) {
    throw new Error("Usage: npm run import:medium -- --input <export.zip|directory> [--output <review-root>] [--write]");
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const manifest = await importMediumExport({
    inputPath: options.input,
    outputRoot: options.output,
    write: options.write,
  });
  console.log(`Inspected ${manifest.counts.total} Medium post records from ${manifest.source.filename}.`);
  console.log(`Ready for review: ${manifest.counts.readyForReview}; blocked: ${manifest.counts.blocked}; already migrated: ${manifest.counts.alreadyMigrated}; skipped: ${manifest.counts.skipped}.`);
  if (options.write) {
    console.log(`Created review-only packages and manifests under ${relative(process.cwd(), options.output ?? ".migration-output")}.`);
  } else {
    console.log("Dry run only. Re-run with --write to create review packages; no content or public routes were changed.");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Medium export import failed: ${error.message}`);
    process.exitCode = 1;
  });
}
