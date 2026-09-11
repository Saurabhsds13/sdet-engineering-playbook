import { test } from "node:test";
import assert from "node:assert/strict";

import Fuse from "fuse.js";
import { buildIndex } from "../scripts/build-search-index.js";

// Mirrors the Fuse configuration used by src/js/search.js so this test proves
// the generated index is actually searchable with real queries.
const FUSE_OPTIONS = {
  threshold: 0.35,
  ignoreLocation: true,
  keys: [
    { name: "title", weight: 3 },
    { name: "category", weight: 1 },
    { name: "tags", weight: 2 },
    { name: "headings", weight: 1.5 },
    { name: "keywords", weight: 1.5 },
    { name: "excerpt", weight: 0.5 }
  ]
};

test("search finds the explicit waits article by title", async () => {
  const docs = await buildIndex();
  const fuse = new Fuse(docs, FUSE_OPTIONS);
  const results = fuse.search("explicit waits");
  assert.ok(results.length > 0, "got results");
  assert.equal(results[0].item.slug, "explicit-waits");
});

test("search finds content by tag/topic", async () => {
  const docs = await buildIndex();
  const fuse = new Fuse(docs, FUSE_OPTIONS);
  const results = fuse.search("hallucination");
  assert.ok(results.some((r) => r.item.category === "ai-testing"));
});

test("search finds a framework concept by heading text", async () => {
  const docs = await buildIndex();
  const fuse = new Fuse(docs, FUSE_OPTIONS);
  const results = fuse.search("ThreadLocal");
  assert.ok(results.length > 0);
  assert.ok(
    results.some((r) => r.item.slug.includes("threadlocal")),
    "a threadlocal article surfaces"
  );
});

test("nonsense query returns nothing meaningful", async () => {
  const docs = await buildIndex();
  const fuse = new Fuse(docs, FUSE_OPTIONS);
  const results = fuse.search("zzxqywvunlikelyterm");
  assert.equal(results.length, 0);
});
