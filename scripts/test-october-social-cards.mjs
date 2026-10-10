import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const script = new URL("./prepare-october-social-cards.mjs", import.meta.url);
const existingCard = new URL("../assets/social/october-2026/a-thought.png", import.meta.url);
const before = createHash("sha256").update(await readFile(existingCard)).digest("hex");

function run(args) {
  return spawnSync(process.execPath, [fileURLToPath(script), ...args], {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    encoding: "utf8",
  });
}

const overwrite = run(["--export", "a-thought"]);
assert.notEqual(overwrite.status, 0);
assert.match(overwrite.stderr, /Refusing to overwrite existing social card/);
assert.equal(createHash("sha256").update(await readFile(existingCard)).digest("hex"), before);

const unknown = run(["--export", "no-such-october-entry"]);
assert.notEqual(unknown.status, 0);
assert.match(unknown.stderr, /No published October entry/);

const missing = run(["--export"]);
assert.notEqual(missing.status, 0);
assert.match(missing.stderr, /--export requires one published October slug/);

console.log("October social-card export guards passed.");
