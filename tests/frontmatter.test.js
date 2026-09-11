import { test } from "node:test";
import assert from "node:assert/strict";

import { parseFrontMatter } from "../scripts/build-search-index.js";

test("parses scalar front matter fields", () => {
  const raw = `---
title: Explicit Waits
slug: explicit-waits
category: selenium
difficulty: intermediate
status: published
---
Body content here.`;
  const { data, body } = parseFrontMatter(raw);
  assert.equal(data.title, "Explicit Waits");
  assert.equal(data.slug, "explicit-waits");
  assert.equal(data.category, "selenium");
  assert.equal(data.difficulty, "intermediate");
  assert.equal(data.status, "published");
  assert.match(body, /Body content here/);
});

test("parses simple list values (tags)", () => {
  const raw = `---
title: X
tags:
  - selenium
  - waits
  - synchronization
---
body`;
  const { data } = parseFrontMatter(raw);
  assert.deepEqual(data.tags, ["selenium", "waits", "synchronization"]);
});

test("parses list-of-objects (related links)", () => {
  const raw = `---
title: X
related:
  - title: Selenium Exceptions
    url: /selenium/selenium-exceptions/
  - title: Locators
    url: /selenium/locators/
---
body`;
  const { data } = parseFrontMatter(raw);
  assert.equal(data.related.length, 2);
  assert.equal(data.related[0].title, "Selenium Exceptions");
  assert.equal(data.related[0].url, "/selenium/selenium-exceptions/");
  assert.equal(data.related[1].url, "/selenium/locators/");
});

test("strips surrounding quotes from values", () => {
  const raw = `---
title: "Quoted Title"
slug: 'quoted-slug'
---
body`;
  const { data } = parseFrontMatter(raw);
  assert.equal(data.title, "Quoted Title");
  assert.equal(data.slug, "quoted-slug");
});

test("returns raw body when no front matter present", () => {
  const raw = "no front matter here";
  const { data, body } = parseFrontMatter(raw);
  assert.deepEqual(data, {});
  assert.equal(body, raw);
});
