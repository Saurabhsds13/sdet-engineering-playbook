import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { MOCK_TRACKS, buildMockPlan, scoreMock, shuffle } from "../src/js/mock-plan.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const loadQuestions = async () =>
  JSON.parse(await readFile(join(ROOT, "data/interview-questions.json"), "utf8"));

// Deterministic RNG so plans are reproducible in tests.
function seeded(seed = 42) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

test("service track fills every stage with the configured count from real data", async () => {
  const qs = await loadQuestions();
  const plan = buildMockPlan(qs, "service", seeded());
  const expected = MOCK_TRACKS.service.stages.reduce((n, s) => n + s.count, 0);
  assert.equal(plan.length, expected);
  for (const stage of MOCK_TRACKS.service.stages) {
    const got = plan.filter((p) => p.stage === stage.key).length;
    assert.equal(got, stage.count, `stage ${stage.key}`);
  }
});

test("product track fills every stage with the configured count from real data", async () => {
  const qs = await loadQuestions();
  const plan = buildMockPlan(qs, "product", seeded(7));
  for (const stage of MOCK_TRACKS.product.stages) {
    const got = plan.filter((p) => p.stage === stage.key).length;
    assert.equal(got, stage.count, `stage ${stage.key}`);
  }
});

test("stages appear in interview order and questions never repeat", async () => {
  const qs = await loadQuestions();
  const plan = buildMockPlan(qs, "service", seeded(3));
  const order = MOCK_TRACKS.service.stages.map((s) => s.key);
  const seen = plan.map((p) => order.indexOf(p.stage));
  assert.deepEqual(seen, [...seen].sort((a, b) => a - b), "stages are ordered");
  const ids = plan.map((p) => p.question.id);
  assert.equal(new Set(ids).size, ids.length, "no duplicate questions");
});

test("stage pools route questions correctly", async () => {
  const qs = await loadQuestions();
  const plan = buildMockPlan(qs, "product", seeded(11));
  for (const p of plan) {
    if (p.stage === "coding") assert.match(p.question.id, /-code-/);
    if (p.stage === "design") assert.match(p.question.id, /^iv-prod-design-/);
    if (p.stage === "resume") assert.match(p.question.id, /^iv-(resume|proj)-/);
    if (p.stage === "core") assert.doesNotMatch(p.question.id, /-code-/);
  }
});

test("small pools yield fewer questions instead of failing", () => {
  const qs = [{ id: "iv-resume-x", category: "interview" }];
  const plan = buildMockPlan(qs, "service", seeded());
  assert.equal(plan.length, 1);
  assert.equal(plan[0].stage, "resume");
});

test("unknown track throws", () => {
  assert.throws(() => buildMockPlan([], "nope"), /Unknown mock track/);
});

test("scoreMock weights nailed=1, partial=0.5, missed=0 and lists non-nailed", () => {
  const plan = [
    { stage: "a", stageLabel: "A", question: { id: "q1" } },
    { stage: "a", stageLabel: "A", question: { id: "q2" } },
    { stage: "b", stageLabel: "B", question: { id: "q3" } },
    { stage: "b", stageLabel: "B", question: { id: "q4" } }
  ];
  const r = scoreMock(plan, { q1: "nailed", q2: "partial", q3: "missed" }); // q4 unrated
  assert.equal(r.points, 1.5);
  assert.equal(r.percent, 38); // 1.5 / 4
  assert.equal(r.byStage.a.points, 1.5);
  assert.equal(r.byStage.b.points, 0);
  assert.deepEqual(r.missed.map((q) => q.id), ["q2", "q3", "q4"]);
});

test("shuffle keeps every element exactly once", () => {
  const input = [1, 2, 3, 4, 5, 6];
  const out = shuffle(input, seeded(5));
  assert.deepEqual([...out].sort(), [...input].sort());
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6], "input not mutated");
});
