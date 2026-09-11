/**
 * Renders localStorage-backed widgets on the home page and the bookmarks page:
 * continue-reading, overall progress, bookmark list, recently viewed.
 */
import { $, store, withBase } from "./utils.js";
import { getBookmarks } from "./bookmarks.js";
import { completionPercent } from "./progress.js";

function label(cat) {
  return (cat || "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initDashboard() {
  renderContinue();
  renderProgress();
  renderRecent();
}

function renderContinue() {
  const section = $("[data-continue-section]");
  const mount = $("[data-continue-card]");
  if (!mount) return;

  const recent = store.get("recent", []);
  const progress = store.get("progress", {});
  // Prefer an in-progress article, else most recent.
  const candidate =
    recent.find((r) => progress[r.slug] === "in-progress") || recent[0];

  if (!candidate) return;
  if (section) section.hidden = false;
  mount.innerHTML = `
    <a class="continue-card" href="${withBase(candidate.url)}">
      <span>
        <span class="continue-card__label">${label(candidate.category)}</span>
        <span class="continue-card__title">${escape(candidate.title)}</span>
      </span>
      <span class="btn">Resume →</span>
    </a>`;
}

function renderProgress() {
  const fill = $("[data-progress-fill]");
  const value = $("[data-progress-value]");
  if (!fill && !value) return;
  const pct = completionPercent();
  if (fill) fill.style.width = pct + "%";
  if (value) value.textContent = pct + "%";
}

function renderRecent() {
  const mount = $("[data-recent-list]");
  if (!mount) return;
  const recent = store.get("recent", []);
  if (!recent.length) {
    mount.innerHTML = '<p class="empty-state">No recently viewed articles yet.</p>';
    return;
  }
  mount.innerHTML =
    "<ul class='recent-list'>" +
    recent
      .map(
        (r) =>
          `<li><a class="list-link" href="${withBase(r.url)}"><span>${escape(r.title)}</span><small>${label(r.category)}</small></a></li>`
      )
      .join("") +
    "</ul>";
}

export function renderBookmarksPage() {
  const mount = $("[data-bookmarks-list]");
  if (!mount) return;
  const list = getBookmarks();
  if (!list.length) {
    mount.innerHTML =
      '<p class="empty-state">No bookmarks yet. Open any article and press the Bookmark button to save it here.</p>';
    return;
  }
  mount.innerHTML =
    "<ul class='bookmark-list'>" +
    list
      .map(
        (b) =>
          `<li><a class="list-link" href="${withBase(b.url)}"><span>${escape(b.title)}</span><small>${label(b.category)}</small></a></li>`
      )
      .join("") +
    "</ul>";
}

function escape(s) {
  const d = document.createElement("div");
  d.textContent = String(s);
  return d.innerHTML;
}
