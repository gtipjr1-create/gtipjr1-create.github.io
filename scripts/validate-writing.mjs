import { pathToFileURL } from "node:url";
import { validateWritingRepository } from "./writing-content.mjs";

export async function runWritingValidation(root = process.cwd()) {
  const entries = await validateWritingRepository({ root });
  const published = entries.filter((entry) => entry.status === "published").length;
  const drafts = entries.length - published;
  console.log(`Validated ${entries.length} writing entries (${published} published, ${drafts} draft).`);
  return entries;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runWritingValidation().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
