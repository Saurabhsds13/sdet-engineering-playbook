import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { validate } from "../scripts/validate-content.js";
import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES
} from "../src/lib/categories.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

test("real content passes validation with zero errors", async () => {
  const { errors, articleCount } = await validate();
  assert.equal(errors.length, 0, `errors:\n${errors.join("\n")}`);
  assert.ok(articleCount >= 20, `expected 20+ articles, got ${articleCount}`);
});

test("quizzes.json is internally consistent", async () => {
  const quizzes = JSON.parse(await readFile(join(ROOT, "data/quizzes.json"), "utf8"));
  const ids = new Set();
  for (const q of quizzes) {
    assert.ok(q.id && !ids.has(q.id), `unique id: ${q.id}`);
    ids.add(q.id);
    assert.ok(VALID_CATEGORIES.includes(q.category), `valid category: ${q.category}`);
    assert.ok(Array.isArray(q.options) && q.options.length >= 2);
    assert.ok(
      Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length,
      `answer index in range for ${q.id}`
    );
    assert.ok(q.explanation, `explanation present for ${q.id}`);
  }
});

test("interview-questions.json is internally consistent", async () => {
  const iv = JSON.parse(
    await readFile(join(ROOT, "data/interview-questions.json"), "utf8")
  );
  const ids = new Set();
  for (const q of iv) {
    assert.ok(q.id && !ids.has(q.id), `unique id: ${q.id}`);
    ids.add(q.id);
    assert.ok(VALID_CATEGORIES.includes(q.category), `valid category: ${q.category}`);
    assert.ok(q.question, `question present for ${q.id}`);
    assert.ok(q.short, `short answer present for ${q.id}`);
  }
});

test("roadmap.json has ten ordered phases", async () => {
  const roadmap = JSON.parse(await readFile(join(ROOT, "data/roadmap.json"), "utf8"));
  assert.equal(roadmap.phases.length, 10);
  roadmap.phases.forEach((p, i) => {
    assert.equal(p.phase, i + 1, "phases are sequentially numbered");
    assert.ok(p.title && p.summary, "phase has title and summary");
    assert.ok(Array.isArray(p.links), "phase has links array");
  });
});

test("every article difficulty is a valid value", async () => {
  // Indirectly exercised by validate(), but assert the enum has no drift.
  assert.deepEqual(VALID_DIFFICULTIES, ["beginner", "intermediate", "advanced"]);
});
