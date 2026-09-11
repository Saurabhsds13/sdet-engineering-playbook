/**
 * Interview practice mode. One question at a time from /interview-questions.json
 * with reveal-answer, prev/next, topic + difficulty filters, random order, and
 * per-question "known" / "revise" marks persisted in localStorage.
 */
import { $, store, withBase } from "./utils.js";

const MARK_KEY = "interview-marks"; // { [id]: "known" | "revise" }

let all = [];
let pool = [];
let idx = 0;
let revealed = false;

const root = () => $("[data-interview-root]");

function marks() {
  return store.get(MARK_KEY, {});
}
function setMark(id, value) {
  const m = marks();
  if (m[id] === value) delete m[id];
  else m[id] = value;
  store.set(MARK_KEY, m);
}

export async function initInterview() {
  const mount = root();
  if (!mount) return;

  try {
    const res = await fetch(withBase("/interview-questions.json"));
    all = await res.json();
  } catch {
    mount.innerHTML = '<p class="empty-state">Could not load interview questions.</p>';
    return;
  }

  const topics = [...new Set(all.map((q) => q.category))].sort();
  const difficulties = [...new Set(all.map((q) => q.difficulty).filter(Boolean))];

  mount.insertAdjacentHTML(
    "afterbegin",
    `<div class="interview-progress-stats">
      <span><strong data-count-total>0</strong> questions</span>
      <span><strong data-count-known>0</strong> known</span>
      <span><strong data-count-revise>0</strong> to revise</span>
    </div>
    <div class="interview__filters">
      <select class="filter-select" data-iv-topic aria-label="Filter by topic">
        <option value="">All topics</option>
        ${topics.map((t) => `<option value="${t}">${label(t)}</option>`).join("")}
      </select>
      <select class="filter-select" data-iv-difficulty aria-label="Filter by difficulty">
        <option value="">All difficulties</option>
        ${difficulties.map((d) => `<option value="${d}">${d}</option>`).join("")}
      </select>
      <select class="filter-select" data-iv-marks aria-label="Filter by mark">
        <option value="">All</option>
        <option value="revise">To revise</option>
        <option value="known">Known</option>
        <option value="unmarked">Unmarked</option>
      </select>
      <button type="button" class="btn" data-iv-random>Random</button>
    </div>
    <div data-iv-card></div>`
  );

  $("[data-iv-topic]").addEventListener("change", applyFilters);
  $("[data-iv-difficulty]").addEventListener("change", applyFilters);
  $("[data-iv-marks]").addEventListener("change", applyFilters);
  $("[data-iv-random]").addEventListener("click", () => {
    pool = shuffle(pool);
    idx = 0;
    render();
  });

  applyFilters();
}

function applyFilters() {
  const topic = $("[data-iv-topic]").value;
  const diff = $("[data-iv-difficulty]").value;
  const mark = $("[data-iv-marks]").value;
  const m = marks();
  pool = all.filter((q) => {
    if (topic && q.category !== topic) return false;
    if (diff && q.difficulty !== diff) return false;
    if (mark === "unmarked" && m[q.id]) return false;
    if (mark && mark !== "unmarked" && m[q.id] !== mark) return false;
    return true;
  });
  idx = 0;
  render();
  updateStats();
}

function updateStats() {
  const m = marks();
  const known = Object.values(m).filter((v) => v === "known").length;
  const revise = Object.values(m).filter((v) => v === "revise").length;
  $("[data-count-total]").textContent = all.length;
  $("[data-count-known]").textContent = known;
  $("[data-count-revise]").textContent = revise;
}

function render() {
  const card = $("[data-iv-card]");
  if (!pool.length) {
    card.innerHTML = '<p class="empty-state">No questions match these filters.</p>';
    return;
  }
  revealed = false;
  const q = pool[idx];
  const m = marks();

  card.innerHTML = `
    <div class="interview-card">
      <div class="interview-card__meta">
        <span>${label(q.category)}${q.difficulty ? " · " + q.difficulty : ""}</span>
        <span>Question ${idx + 1} / ${pool.length}</span>
      </div>
      <p class="interview-card__question">${escapeHtml(q.question)}</p>
      <button type="button" class="btn btn--primary" data-reveal>Reveal answer</button>
      <div data-answer hidden></div>
      <div class="interview-controls">
        <button type="button" class="btn" data-prev ${idx === 0 ? "disabled" : ""}>Previous</button>
        <div style="display:flex;gap:0.5rem">
          <button type="button" class="btn" data-mark="revise" aria-pressed="${m[q.id] === "revise"}">${m[q.id] === "revise" ? "★ Revise" : "Mark revise"}</button>
          <button type="button" class="btn" data-mark="known" aria-pressed="${m[q.id] === "known"}">${m[q.id] === "known" ? "✓ Known" : "Mark known"}</button>
        </div>
        <button type="button" class="btn" data-next ${idx >= pool.length - 1 ? "disabled" : ""}>Next</button>
      </div>
    </div>`;

  card.querySelector("[data-reveal]").addEventListener("click", reveal);
  const prev = card.querySelector("[data-prev]");
  const next = card.querySelector("[data-next]");
  prev.addEventListener("click", () => { if (idx > 0) { idx--; render(); } });
  next.addEventListener("click", () => { if (idx < pool.length - 1) { idx++; render(); } });
  card.querySelectorAll("[data-mark]").forEach((b) =>
    b.addEventListener("click", () => {
      setMark(q.id, b.getAttribute("data-mark"));
      render();
      updateStats();
    })
  );
}

function reveal() {
  if (revealed) return;
  revealed = true;
  const q = pool[idx];
  const box = $("[data-answer]");
  const btn = $("[data-reveal]");
  if (btn) btn.hidden = true;

  box.hidden = false;
  box.innerHTML = `
    <div class="interview-answer">
      <h4>Key answer</h4>
      <p>${escapeHtml(q.short)}</p>
      ${q.detailed ? `<h4>Detailed answer</h4><p>${escapeHtml(q.detailed)}</p>` : ""}
      ${q.whyAsked ? `<h4>Why interviewers ask this</h4><p>${escapeHtml(q.whyAsked)}</p>` : ""}
      ${q.followUp ? `<h4>Common follow-up</h4><p>${escapeHtml(q.followUp)}</p>` : ""}
      ${q.example ? `<h4>Example</h4><p>${escapeHtml(q.example)}</p>` : ""}
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
  return (cat || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function escapeHtml(s) {
  const d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}
