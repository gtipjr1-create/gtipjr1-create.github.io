import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importMediumExport } from "./medium-export.mjs";

function storedZip(entries) {
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;
  for (const [name, value] of Object.entries(entries)) {
    const nameBuffer = Buffer.from(name, "utf8");
    const contents = Buffer.from(value, "utf8");
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt32LE(0, 14);
    local.writeUInt32LE(contents.length, 18);
    local.writeUInt32LE(contents.length, 22);
    local.writeUInt16LE(nameBuffer.length, 26);
    localParts.push(local, nameBuffer, contents);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt32LE(0, 16);
    central.writeUInt32LE(contents.length, 20);
    central.writeUInt32LE(contents.length, 24);
    central.writeUInt16LE(nameBuffer.length, 28);
    central.writeUInt32LE(localOffset, 42);
    centralParts.push(central, nameBuffer);
    localOffset += local.length + nameBuffer.length + contents.length;
  }
  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(entries).length, 8);
  end.writeUInt16LE(Object.keys(entries).length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function postHtml({ title, subtitle, body, id, timestamp = "2026-01-03T04:05:06.000Z", draft = false, image = false }) {
  const canonical = `https://medium.com/@Garry_Tipler/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${id}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body><article class="h-entry"><header><h1 class="p-name">${title}</h1></header>${subtitle ? `<section data-field="subtitle" class="p-summary">${subtitle}</section>` : ""}<section data-field="body" class="e-content"><section><div><h2>${title}</h2>${image ? `<figure><img data-image-id="fixture.jpg" src="https://cdn-images.medium.com/fixture.jpg"><figcaption>Exact caption.</figcaption></figure>` : ""}${subtitle ? `<p>${subtitle}</p>` : ""}${body}</div></section></section><footer>${draft ? `<p><a href="https://medium.com/p/${id}">View original.</a></p>` : `<p>By <a class="p-author h-card" href="https://medium.com/@Garry_Tipler">Garry Tipler</a> on <a href="https://medium.com/p/${id}"><time class="dt-published" datetime="${timestamp}">January 3, 2026</time></a>.</p><p><a class="p-canonical" href="${canonical}">Canonical link</a></p>`}</footer></article></body></html>`;
}

async function put(root, relativePath, contents) {
  const path = join(root, relativePath);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, contents);
}

const root = await mkdtemp(join(tmpdir(), "garry-medium-export-"));
try {
  await put(
    root,
    "src/content/writing/essays/already-here/index.md",
    `---\ntitle: "Already Here"\nslug: "already-here"\ntype: "essay"\nsummary: "Existing fixture."\ncategory: "Practice"\ntags: []\npublishedDate: "2026-01-04"\nmediumUrl: "https://medium.com/@Garry_Tipler/already-here-eeeeeeeeeeee"\nstatus: "published"\nrelated: []\nconnections: []\n---\n\nExisting prose.\n`,
  );

  const entries = {
    "README.html": "<html><body>Fixture export.</body></html>",
    "bookmarks/bookmarks-0001.html": "<html><body>Private non-post record.</body></html>",
    "posts/2026-01-03_A-careful-story?-111111111111.html": postHtml({
      title: "A Careful Story?",
      subtitle: "An exact exported subtitle.",
      id: "111111111111",
      image: true,
      body: `<p>Café &amp; resolve remain exact.</p><blockquote><p>Quoted truth.</p></blockquote><ul><li>First item</li><li>Second item</li></ul>`,
    }),
    "posts/2026-01-02_Fragments--1---Begin-222222222222.html": postHtml({
      title: "Fragments #1 — Begin",
      subtitle: "A field note.",
      id: "222222222222",
      body: "<p>First paragraph — unchanged.</p><p>Fragments continue.</p>",
    }),
    "posts/2026-01-01_Thank-you-333333333333.html": postHtml({
      title: "Thank you",
      id: "333333333333",
      body: "<p>Thank you.</p>",
    }),
    "posts/draft_Private-draft-444444444444.html": postHtml({
      title: "Private draft",
      subtitle: "Must stay excluded.",
      id: "444444444444",
      draft: true,
      body: "<p>Draft prose.</p>",
    }),
    "posts/2026-01-05_Same-title-555555555555.html": postHtml({
      title: "Same title",
      subtitle: "One.",
      id: "555555555555",
      body: "<p>First collision.</p>",
    }),
    "posts/2026-01-06_Same-title-666666666666.html": postHtml({
      title: "Same title",
      subtitle: "Two.",
      id: "666666666666",
      body: "<p>Second collision.</p>",
    }),
    "posts/2026-01-07_Already-here-eeeeeeeeeeee.html": postHtml({
      title: "Already Here",
      subtitle: "Existing.",
      id: "eeeeeeeeeeee",
      body: "<p>Already migrated prose.</p>",
    }),
  };
  const zipPath = join(root, "medium-export-fixture.zip");
  await writeFile(zipPath, storedZip(entries));

  const first = await importMediumExport({ inputPath: zipPath, root, outputRoot: ".migration-output", write: false });
  const second = await importMediumExport({ inputPath: zipPath, root, outputRoot: ".migration-output", write: false });
  assert.deepEqual(first, second, "inspection must be deterministic");
  assert.deepEqual(first.counts, { total: 7, readyForReview: 2, blocked: 3, alreadyMigrated: 1, skipped: 1 });
  assert.equal(first.inventory.bookmarks, 1);
  assert.deepEqual(first.excludedAccountGroups, ["bookmarks"]);

  const essay = first.records.find((record) => record.mediumId === "111111111111");
  assert.equal(essay.sourcePath, "posts/2026-01-03_A-careful-story?-111111111111.html", "original ZIP entry names must remain exact");
  assert.equal(essay.originalPublishedDate, "2026-01-03");
  assert.equal(essay.assetCount, 1);
  assert.equal(essay.importStatus, "ready for review");
  assert.equal(first.records.find((record) => record.mediumId === "333333333333").importStatus, "blocked");
  assert.equal(first.records.find((record) => record.mediumId === "444444444444").importStatus, "skipped");
  assert.equal(first.records.find((record) => record.mediumId === "eeeeeeeeeeee").importStatus, "already migrated");
  assert.ok(first.records.filter((record) => ["555555555555", "666666666666"].includes(record.mediumId)).every((record) => record.importStatus === "blocked"));

  const written = await importMediumExport({ inputPath: zipPath, root, outputRoot: ".migration-output", write: true });
  assert.deepEqual(written, first);
  const review = await readFile(join(root, ".migration-output/essays/a-careful-story/index.md"), "utf8");
  assert.match(review, /status: "draft"/);
  assert.doesNotMatch(review, /publishedDate:/);
  assert.match(review, /originalPublishedDate: "2026-01-03"/);
  assert.match(review, /Café & resolve remain exact\./);
  assert.match(review, /> Quoted truth\./);
  assert.match(review, /- First item/);
  assert.match(review, /Remote Medium image fixture\.jpg/);
  assert.doesNotMatch(review, /^## A Careful Story\?/m, "duplicate exported title must be structurally removed");
  assert.doesNotMatch(review, /^An exact exported subtitle\.$/m, "duplicate exported subtitle must be structurally removed");
  const source = await readFile(join(root, ".migration-output/essays/a-careful-story/source.html"), "utf8");
  assert.equal(source, entries["posts/2026-01-03_A-careful-story?-111111111111.html"], "source HTML must be preserved exactly");
  const manifest = JSON.parse(await readFile(join(root, ".migration-output/medium-export-manifest.json"), "utf8"));
  assert.equal(manifest.records.find((record) => record.mediumId === "111111111111").sourcePath, essay.sourcePath);

  await assert.rejects(
    importMediumExport({ inputPath: zipPath, root, outputRoot: ".migration-output", write: true }),
    /Refusing to overwrite existing review output/,
  );
  await assert.rejects(
    importMediumExport({ inputPath: zipPath, root, outputRoot: "src/content/reviews", write: false }),
    /cannot be written inside src\/content/,
  );

  console.log("Medium export importer tests passed with disposable ZIP-stream fixtures.");
} finally {
  await rm(root, { recursive: true, force: true });
}
