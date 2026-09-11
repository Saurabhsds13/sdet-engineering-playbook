import { test } from "node:test";
import assert from "node:assert/strict";

import { validateArticle } from "../scripts/validate-content.js";

test("a well-formed article produces no errors", () => {
  const errs = validateArticle({
    data: {
      title: "Explicit Waits",
      slug: "explicit-waits",
      category: "selenium",
      difficulty: "intermediate",
      status: "published"
    },
    body: "## Heading\n\nSome text.\n\n```java\ncode\n```\n"
  });
  assert.deepEqual(errs, []);
});

test("catches missing required fields", () => {
  const errs = validateArticle({ data: {}, body: "x" });
  assert.ok(errs.some((e) => e.includes("title")));
  assert.ok(errs.some((e) => e.includes("slug")));
  assert.ok(errs.some((e) => e.includes("category")));
});

test("catches an invalid category", () => {
  const errs = validateArticle({
    data: { title: "T", slug: "t", category: "not-a-category" },
    body: "x"
  });
  assert.ok(errs.some((e) => e.includes("invalid category")));
});

test("catches an invalid difficulty", () => {
  const errs = validateArticle({
    data: { title: "T", slug: "t", category: "java", difficulty: "wizard" },
    body: "x"
  });
  assert.ok(errs.some((e) => e.includes("invalid difficulty")));
});

test("catches a non-kebab-case slug", () => {
  const errs = validateArticle({
    data: { title: "T", slug: "Not_Kebab Case", category: "java" },
    body: "x"
  });
  assert.ok(errs.some((e) => e.includes("kebab-case")));
});

test("catches unbalanced code fences", () => {
  const errs = validateArticle({
    data: { title: "T", slug: "t", category: "java" },
    body: "```java\ncode without closing fence"
  });
  assert.ok(errs.some((e) => e.includes("code fences")));
});
