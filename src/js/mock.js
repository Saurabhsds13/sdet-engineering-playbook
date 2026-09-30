/**
 * Mock interview mode: runs a timed-free, ordered round (résumé -> core ->
 * process/scenario -> coding/design), lets the candidate answer aloud, reveal
 * the model answer, and self-rate. At the end it shows a score by stage and
 * sends every question that wasn't "nailed" to the Interview Practice
 * "To revise" list.
 */
import { $, store, withBase } from "./utils.js";
import { MOCK_TRACKS, buildMockPlan, scoreMock } from "./mock-plan.js";

const MARK_KEY = "interview-marks"; // shared with interview.js
const HISTORY_KEY = "mock-history";

let questions = [];
let plan = [];
let idx = 0;
let ratings = {};
let track = "service";

const root = () => $("[data-mock-root]");

function esc(s) {
  const d = document.createElement("div");
  d.textContent = String(s ?? "");
  return d.innerHTML;
}

export async function initMock() {
  const mount = root();
  if (!mount) return;
  try {
    const res = await fetch(withBase("/interview-questions.json"));
    questions = await res.json();
  } catch {
    mount.innerHTML = '<p class="empty-state">Could not load interview questions.</p>';
    return;
  }
  renderStart();
}

function renderStart() {
  const history = store.get(HISTORY_KEY, []);
  const last = history[0];
  root().innerHTML = `
    <div class="interview-card">
      <p class="interview-card__question">Choose an interview track</p>
      <p>Answer each question out loud as you would in a real round, then reveal
      the model answer and rate yourself honestly.</p>
      <div class="interview__filters" style="margin-top:1rem">
        ${Object.entries(MOCK_TRACKS)
          .map(
            ([key, t]) => `
          <label class="mock-track">
            <input type="radio" name="mock-track" value="${key}" ${key === track ? "checked" : ""} />
            <span><strong>${esc(t.label)}</strong><br />
            <small>${t.stages.map((s) => `${s.count} ${esc(s.label)}`).join(" · ")}</small></span>
          </label>`
          )
          .join("")}
      </div>
      ${last ? `<p class="mock-last">Last round: <strong>${last.percent}%</strong> (${esc(MOCK_TRACKS[last.track]?.label || last.track)}, ${new Date(last.at).toLocaleDateString()})</p>` : ""}
      <div class="interview-controls">
        <span></span>
        <button type="button" class="btn btn--primary" data-mock-start>Start mock interview</button>
      </div>
    </div>`;

  root()
    .querySelector("[data-mock-start]")
    .addEventListener("click", () => {
      const checked = root().querySelector("input[name=mock-track]:checked");
      track = checked ? checked.value : "service";
      plan = buildMockPlan(questions, track);
      idx = 0;
      ratings = {};
      renderQuestion();
    });
}

function renderQuestion() {
  const item = plan[idx];
  const q = item.question;
  root().innerHTML = `
    <div class="interview-card">
      <div class="interview-card__meta">
        <span>${esc(item.stageLabel)}</span>
        <span>Question ${idx + 1} / ${plan.length}</span>
      </div>
      <div class="meter" style="margin-bottom:1.25rem"><span class="meter__fill" style="width:${(idx / plan.length) * 100}%"></span></div>
      <p class="interview-card__question">${esc(q.question)}</p>
      <p class="mock-hint">Answer out loud first. Aim for 60–90 seconds.</p>
      <button type="button" class="btn btn--primary" data-mock-reveal>Reveal model answer</button>
      <div data-mock-answer hidden></div>
    </div>`;

  root()
    .querySelector("[data-mock-reveal]")
    .addEventListener("click", (e) => {
      e.currentTarget.hidden = true;
      const box = root().querySelector("[data-mock-answer]");
      box.hidden = false;
      box.innerHTML = `
        <div class="interview-answer">
          <h4>Key answer</h4><p>${esc(q.short)}</p>
          ${q.detailed ? `<h4>Detailed answer</h4><p>${esc(q.detailed)}</p>` : ""}
          ${q.followUp ? `<h4>Likely follow-up</h4><p>${esc(q.followUp)}</p>` : ""}
          ${q.example ? `<h4>Example</h4><p>${esc(q.example)}</p>` : ""}
        </div>
        <p class="mock-hint" style="margin-top:1rem">How did you do?</p>
        <div class="mock-rate" role="group" aria-label="Rate your answer">
          <button type="button" class="btn" data-rate="missed">Missed it</button>
          <button type="button" class="btn" data-rate="partial">Partially</button>
          <button type="button" class="btn btn--primary" data-rate="nailed">Nailed it</button>
        </div>`;
      box.querySelectorAll("[data-rate]").forEach((b) =>
        b.addEventListener("click", () => {
          ratings[q.id] = b.getAttribute("data-rate");
          idx++;
          if (idx < plan.length) renderQuestion();
          else renderSummary();
        })
      );
    });
}

function renderSummary() {
  const result = scoreMock(plan, ratings);

  // Send everything not nailed to the Interview Practice revision list.
  const marks = store.get(MARK_KEY, {});
  for (const q of result.missed) marks[q.id] = "revise";
  store.set(MARK_KEY, marks);

  const history = store.get(HISTORY_KEY, []);
  history.unshift({ track, percent: result.percent, at: Date.now() });
  store.set(HISTORY_KEY, history.slice(0, 10));

  const verdict =
    result.percent >= 80
      ? "Interview-ready on this set. Keep your stories sharp."
      : result.percent >= 55
        ? "Solid base. Revise the weaker stages below before your next round."
        : "Worth another pass. Focus on the stages below and retry.";

  root().innerHTML = `
    <div class="interview-card">
      <p class="interview-card__question">Round complete: ${result.percent}%</p>
      <p>${esc(verdict)}</p>
      <h4 class="mock-sub">By stage</h4>
      <ul class="mock-stages">
        ${Object.values(result.byStage)
          .map((s) => {
            const pct = Math.round((s.points / s.total) * 100);
            return `<li><span>${esc(s.label)}</span>
              <div class="meter"><span class="meter__fill" style="width:${pct}%"></span></div>
              <strong>${pct}%</strong></li>`;
          })
          .join("")}
      </ul>
      ${
        result.missed.length
          ? `<h4 class="mock-sub">Added to your revision list (${result.missed.length})</h4>
             <ul class="resume__list">${result.missed.map((q) => `<li>${esc(q.question)}</li>`).join("")}</ul>`
          : ""
      }
      <div class="interview-controls">
        <a class="btn" href="${withBase("/interview/practice/")}">Open revision list</a>
        <button type="button" class="btn btn--primary" data-mock-again>New round</button>
      </div>
    </div>`;

  root().querySelector("[data-mock-again]").addEventListener("click", renderStart);
}
