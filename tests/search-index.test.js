import { test } from "node:test";
import assert from "node:assert/strict";

import { buildIndex } from "../scripts/build-search-index.js";
import { VALID_CATEGORIES } from "../src/lib/categories.js";

test("buildIndex produces a non-empty, well-shaped index", async () => {
  const docs = await buildIndex();
  assert.ok(Array.isArray(docs));
  assert.ok(docs.length > 20, `expected many docs, got ${docs.length}`);

  for (const doc of docs) {
    assert.ok(doc.title, "every doc has a title");
    assert.ok(doc.url, "every doc has a url");
    assert.ok(doc.category, "every doc has a category");
    assert.ok(VALID_CATEGORIES.includes(doc.category), `valid category: ${doc.category}`);
    assert.ok(Array.isArray(doc.tags), "tags is an array");
    assert.ok(Array.isArray(doc.headings), "headings is an array");
    assert.equal(typeof doc.excerpt, "string", "excerpt is a string");
  }
});

test("article URLs follow the /category/slug/ pattern", async () => {
  const docs = await buildIndex();
  const articleDocs = docs.filter((d) => d.category !== "interview" || d.url.startsWith("/interview/practice"));
  const article = docs.find((d) => d.slug === "explicit-waits");
  assert.ok(article, "explicit-waits article is indexed");
  assert.equal(article.url, "/selenium/explicit-waits/");
  assert.ok(article.headings.length > 0, "article has extracted headings");
});

test("index includes interview questions as searchable docs", async () => {
  const docs = await buildIndex();
  const interview = docs.filter((d) => d.url === "/interview/practice/");
  assert.ok(interview.length > 0, "interview questions are indexed");
});
