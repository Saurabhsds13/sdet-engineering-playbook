import { test } from "node:test";
import assert from "node:assert/strict";

import {
  slugify,
  escapeHtml,
  stripHtml,
  readingTime,
  excerpt
} from "../src/lib/helpers.js";

test("slugify lowercases and kebab-cases", () => {
  assert.equal(slugify("Explicit Waits in Selenium"), "explicit-waits-in-selenium");
  assert.equal(slugify("  Trim  Me  "), "trim-me");
  assert.equal(slugify("C++ & Java!"), "c-java");
});

test("slugify strips leading/trailing separators", () => {
  assert.equal(slugify("--hello--"), "hello");
  assert.equal(slugify("...dots..."), "dots");
});

test("escapeHtml escapes all dangerous characters", () => {
  assert.equal(
    escapeHtml(`<script>"'&`),
    "&lt;script&gt;&quot;&#39;&amp;"
  );
});

test("stripHtml removes tags and pre blocks", () => {
  const html = "<p>Hello <b>world</b></p><pre>code here</pre>";
  const out = stripHtml(html);
  assert.match(out, /Hello world/);
  assert.doesNotMatch(out, /code here/); // pre content dropped
});

test("readingTime returns at least 1 minute", () => {
  assert.equal(readingTime("a few words"), 1);
});

test("readingTime scales with word count (~220 wpm)", () => {
  const words = Array(660).fill("word").join(" "); // ~3 minutes
  assert.equal(readingTime(words), 3);
});

test("excerpt truncates with an ellipsis and does not exceed limit+1", () => {
  const long = Array(100).fill("word").join(" ");
  const out = excerpt(long, 40);
  assert.ok(out.length <= 41, `excerpt length ${out.length}`);
  assert.ok(out.endsWith("\u2026"));
});

test("excerpt leaves short text unchanged", () => {
  assert.equal(excerpt("short text", 160), "short text");
});
