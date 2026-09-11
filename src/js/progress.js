/**
 * Reading progress: a subtle top bar that tracks scroll position through the
 * article, plus per-article status (not-started / in-progress / completed)
 * persisted in localStorage and reflected in the sidebar dots and the
 * article status button.
 */
import { $, $$, store } from "./utils.js";

const KEY = "progress"; // { [slug]: "in-progress" | "completed" }
const STATES = ["not-started", "in-progress", "completed"];
const LABELS = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed"
};

export function getProgress() {
  return store.get(KEY, {});
}

function setStatus(slug, state) {
  const data = getProgress();
  if (state === "not-started") delete data[slug];
  else data[slug] = state;
  store.set(KEY, data);
  reflectDots();
}

/** Update all sidebar status dots from stored progress. */
export function reflectDots() {
  const data = getProgress();
  $$("[data-progress-dot]").forEach((dot) => {
    const slug = dot.getAttribute("data-progress-dot");
    dot.setAttribute("data-state", data[slug] || "not-started");
  });
}

/** Overall completion percentage across all known articles in the sidebar. */
export function completionPercent() {
  const dots = $$("[data-progress-dot]");
  const total = dots.length;
  if (!total) return 0;
  const data = getProgress();
  const done = dots.filter(
    (d) => data[d.getAttribute("data-progress-dot")] === "completed"
  ).length;
  return Math.round((done / total) * 100);
}

export function initProgress() {
  reflectDots();

  const article = $("[data-article]");
  const bar = $(".reading-progress__bar");
  const statusBtn = $("[data-status-btn]");

  if (!article) return;

  const slug = article.getAttribute("data-slug");

  // Record "recently viewed" for the dashboard.
  recordRecent(article);

  // ---- Scroll progress bar ----
  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    if (bar) bar.style.width = `${pct}%`;

    // Auto-mark in-progress once the reader scrolls past the intro,
    // and completed near the end (unless already completed).
    const data = getProgress();
    if (data[slug] !== "completed") {
      if (pct >= 92) setStatusUI("completed");
      else if (pct > 8 && data[slug] !== "in-progress") setStatusUI("in-progress");
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  // ---- Status button (manual cycling) ----
  function setStatusUI(state) {
    if (statusBtn) {
      statusBtn.setAttribute("data-state", state);
      const label = statusBtn.querySelector(".status-btn__label");
      if (label) label.textContent = LABELS[state];
    }
    setStatus(slug, state);
  }

  if (statusBtn) {
    const current = getProgress()[slug] || "not-started";
    setStatusButtonOnly(statusBtn, current);
    statusBtn.addEventListener("click", () => {
      const cur = getProgress()[slug] || "not-started";
      const next = STATES[(STATES.indexOf(cur) + 1) % STATES.length];
      setStatusUI(next);
    });
  }

  update();
}

function setStatusButtonOnly(btn, state) {
  btn.setAttribute("data-state", state);
  const label = btn.querySelector(".status-btn__label");
  if (label) label.textContent = LABELS[state];
}

function recordRecent(article) {
  const entry = {
    slug: article.getAttribute("data-slug"),
    title: article.getAttribute("data-title"),
    category: article.getAttribute("data-category"),
    url: article.getAttribute("data-url"),
    at: Date.now()
  };
  if (!entry.slug || !entry.url) return;
  let recent = store.get("recent", []);
  recent = recent.filter((r) => r.slug !== entry.slug);
  recent.unshift(entry);
  store.set("recent", recent.slice(0, 8));
}
