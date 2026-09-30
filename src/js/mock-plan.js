/**
 * Pure, DOM-free planning for mock interviews. Builds an ordered round of
 * questions that mirrors how real interviews flow: résumé/project first, then
 * core concepts, then scenarios/process, then coding or design.
 *
 * Kept separate from mock.js so it can be unit-tested in Node.
 */

const isCoding = (q) => q.id.includes("-code-");
const isResume = (q) => q.id.startsWith("iv-resume-") || q.id.startsWith("iv-proj-");
const isScenario = (q) =>
  q.id.startsWith("iv-svc-test-") || q.id.startsWith("iv-scenario-");
const isProcess = (q) => q.id.startsWith("iv-svc-") && !isScenario(q);
const isDesign = (q) => q.id.startsWith("iv-prod-design-");
const CORE_CATEGORIES = ["java", "selenium", "testng", "framework", "api", "sql"];
const isCore = (q) => CORE_CATEGORIES.includes(q.category) && !isCoding(q);

/** Interview tracks. Each stage draws `count` random questions from its pool. */
export const MOCK_TRACKS = {
  service: {
    label: "Service-based company",
    stages: [
      { key: "resume", label: "Résumé & project", count: 3, match: isResume },
      { key: "core", label: "Core concepts", count: 4, match: isCore },
      { key: "process", label: "QA process", count: 1, match: isProcess },
      { key: "scenario", label: "Scenario", count: 2, match: isScenario }
    ]
  },
  product: {
    label: "Product-based company",
    stages: [
      { key: "resume", label: "Résumé & project", count: 2, match: isResume },
      { key: "core", label: "Core concepts", count: 3, match: isCore },
      { key: "coding", label: "Coding", count: 3, match: isCoding },
      { key: "design", label: "Design", count: 2, match: isDesign }
    ]
  }
};

/** Fisher–Yates shuffle with an injectable RNG (deterministic in tests). */
export function shuffle(items, rng = Math.random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build an ordered mock round for a track. Never repeats a question, and
 * gracefully takes fewer than `count` if a pool is small.
 * Returns [{ stage, stageLabel, question }].
 */
export function buildMockPlan(questions, trackKey = "service", rng = Math.random) {
  const track = MOCK_TRACKS[trackKey];
  if (!track) throw new Error(`Unknown mock track: ${trackKey}`);

  const used = new Set();
  const plan = [];
  for (const stage of track.stages) {
    const pool = shuffle(
      questions.filter((q) => stage.match(q) && !used.has(q.id)),
      rng
    );
    for (const q of pool.slice(0, stage.count)) {
      used.add(q.id);
      plan.push({ stage: stage.key, stageLabel: stage.label, question: q });
    }
  }
  return plan;
}

/**
 * Summarize self-ratings. ratings: { [questionId]: "nailed" | "partial" | "missed" }.
 * Score: nailed = 1, partial = 0.5, missed = 0.
 */
export function scoreMock(plan, ratings) {
  const byStage = {};
  let points = 0;
  const missed = [];
  for (const item of plan) {
    const r = ratings[item.question.id];
    const value = r === "nailed" ? 1 : r === "partial" ? 0.5 : 0;
    points += value;
    const s = (byStage[item.stage] ||= { label: item.stageLabel, points: 0, total: 0 });
    s.points += value;
    s.total += 1;
    if (r !== "nailed") missed.push(item.question);
  }
  const percent = plan.length ? Math.round((points / plan.length) * 100) : 0;
  return { percent, points, total: plan.length, byStage, missed };
}
