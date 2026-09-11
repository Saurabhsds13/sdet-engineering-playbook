/**
 * Quiz engine. Renders one MCQ / true-false question at a time from
 * /quizzes.json, checks answers, and always explains *why* an answer is
 * correct. Supports topic + difficulty filtering. Intentionally not
 * gamified — no timers, streaks, or scores beyond a simple tally.
 */
import { $, withBase } from "./utils.js";

let all = [];
let pool = [];
let idx = 0;
let answered = false;
let correctCount = 0;
let attempted = 0;

const root = () => $("[data-quiz-root]");

export async function initQuiz() {
  const mount = root();
  if (!mount) return;

  try {
    const res = await fetch(withBase("/quizzes.json"));
    all = await res.json();
  } catch {
    mount.innerHTML = '<p class="empty-state">Could not load quiz questions.</p>';
    return;
  }

  buildFilters(mount);
  applyFilters();
}

function buildFilters(mount) {
  const topics = [...new Set(all.map((q) => q.category))].sort();
  const difficulties = [...new Set(all.map((q) => q.difficulty).filter(Boolean))];

  mount.insertAdjacentHTML(
    "afterbegin",
    `<div class="quiz__filters">
      <select class="filter-select" data-quiz-topic aria-label="Filter by topic">
        <option value="">All topics</option>
        ${topics.map((t) => `<option value="${t}">${label(t)}</option>`).join("")}
      </select>
      <select class="filter-select" data-quiz-difficulty aria-label="Filter by difficulty">
        <option value="">All difficulties</option>
        ${difficulties.map((d) => `<option value="${d}">${d}</option>`).join("")}
      </select>
      <button type="button" class="btn" data-quiz-shuffle>Shuffle</button>
    </div>
    <div data-quiz-card></div>`
  );

  $("[data-quiz-topic]").addEventListener("change", applyFilters);
  $("[data-quiz-difficulty]").addEventListener("change", applyFilters);
  $("[data-quiz-shuffle]").addEventListener("click", () => {
    pool = shuffle(pool);
    idx = 0;
    renderQuestion();
  });
}

function applyFilters() {
  const topic = $("[data-quiz-topic]").value;
  const diff = $("[data-quiz-difficulty]").value;
  pool = all.filter(
    (q) => (!topic || q.category === topic) && (!diff || q.difficulty === diff)
  );
  idx = 0;
  correctCount = 0;
  attempted = 0;
  renderQuestion();
}

function renderQuestion() {
  const card = $("[data-quiz-card]");
  if (!pool.length) {
    card.innerHTML = '<p class="empty-state">No questions match these filters.</p>';
    return;
  }
  answered = false;
  const q = pool[idx];

  card.innerHTML = `
    <div class="quiz-card">
      <div class="quiz-card__meta">
        <span>${label(q.category)}${q.difficulty ? " · " + q.difficulty : ""}</span>
        <span>Question ${idx + 1} / ${pool.length}${attempted ? ` · ${correctCount}/${attempted} correct` : ""}</span>
      </div>
      <p class="quiz-card__question">${escapeHtml(q.question)}</p>
      <div class="quiz-options" data-options role="group" aria-label="Answer options">
        ${q.options
          .map(
            (opt, i) =>
              `<button type="button" class="quiz-option" data-option="${i}">
                <span class="quiz-option__marker" aria-hidden="true"></span>
                <span>${escapeHtml(opt)}</span>
              </button>`
          )
          .join("")}
      </div>
      <div data-explanation></div>
      <div class="quiz-controls">
        <button type="button" class="btn" data-prev ${idx === 0 ? "disabled" : ""}>Previous</button>
        <button type="button" class="btn btn--primary" data-next ${idx >= pool.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    </div>`;

  card.querySelectorAll("[data-option]").forEach((btn) => {
    btn.addEventListener("click", () => check(Number(btn.getAttribute("data-option"))));
  });
  const prev = card.querySelector("[data-prev]");
  const next = card.querySelector("[data-next]");
  if (prev) prev.addEventListener("click", () => { if (idx > 0) { idx--; renderQuestion(); } });
  if (next) next.addEventListener("click", () => { if (idx < pool.length - 1) { idx++; renderQuestion(); } });
}

function check(choice) {
  if (answered) return;
  answered = true;
  attempted++;
  const q = pool[idx];
  const options = $("[data-options]").querySelectorAll(".quiz-option");

  options.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.answer) btn.classList.add("is-correct");
    else if (i === choice) btn.classList.add("is-wrong");
  });

  if (choice === q.answer) correctCount++;

  $("[data-explanation]").innerHTML = `
    <div class="quiz-explanation">
      <h4>${choice === q.answer ? "Correct" : "Not quite"}</h4>
      <p>${escapeHtml(q.explanation)}</p>
    </div>`;
}

// ---- helpers ----
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function label(cat) {
  return (cat || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}
