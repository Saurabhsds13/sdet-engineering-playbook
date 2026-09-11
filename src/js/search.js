/**
 * Client-side search over the build-generated index (public/search-index.json,
 * emitted to /search-index.json). Uses Fuse.js for fuzzy matching, groups
 * results by category, and supports full keyboard navigation.
 *
 * The dialog opens with Ctrl/Cmd+K or the header search button.
 */
import { $, $$, debounce, withBase } from "./utils.js";

let fuse = null;
let indexLoaded = false;
let loading = null;
let results = [];
let activeIndex = -1;

const dialog = () => $("[data-search-dialog]");
const input = () => $("[data-search-input]");
const resultsEl = () => $("[data-search-results]");

async function loadIndex() {
  if (indexLoaded) return;
  if (loading) return loading;
  loading = (async () => {
    const [{ default: Fuse }, res] = await Promise.all([
      import(withBase("/js/vendor/fuse.min.mjs")),
      fetch(withBase("/search-index.json"))
    ]);
    const docs = await res.json();
    fuse = new Fuse(docs, {
      includeMatches: true,
      threshold: 0.35,
      ignoreLocation: true,
      keys: [
        { name: "title", weight: 3 },
        { name: "category", weight: 1 },
        { name: "tags", weight: 2 },
        { name: "headings", weight: 1.5 },
        { name: "keywords", weight: 1.5 },
        { name: "excerpt", weight: 0.5 }
      ]
    });
    indexLoaded = true;
  })();
  return loading;
}

function highlight(text, query) {
  if (!query) return escape(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escape(text);
  return (
    escape(text.slice(0, idx)) +
    "<mark>" +
    escape(text.slice(idx, idx + query.length)) +
    "</mark>" +
    escape(text.slice(idx + query.length))
  );
}

function escape(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function render(query) {
  const box = resultsEl();
  if (!box) return;

  if (!query) {
    box.innerHTML = '<p class="search-dialog__hint">Type to search across the playbook.</p>';
    results = [];
    activeIndex = -1;
    return;
  }

  const found = fuse ? fuse.search(query, { limit: 30 }) : [];
  results = found.map((r) => r.item);
  activeIndex = results.length ? 0 : -1;

  if (!results.length) {
    box.innerHTML = `<p class="search-dialog__empty">No results for “${escape(query)}”.</p>`;
    return;
  }

  // Group by category label.
  const groups = new Map();
  results.forEach((item, i) => {
    const key = item.categoryLabel || item.category;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ item, i });
  });

  let html = "";
  for (const [label, items] of groups) {
    html += `<p class="search-group__label">${escape(label)}</p>`;
    for (const { item, i } of items) {
      html +=
        `<a class="search-result" href="${withBase(item.url)}" role="option" data-index="${i}" aria-selected="${i === activeIndex}">` +
        `<span class="search-result__title">${highlight(item.title, query)}</span>` +
        (item.excerpt
          ? `<span class="search-result__excerpt">${escape(item.excerpt)}</span>`
          : "") +
        `</a>`;
    }
  }
  box.innerHTML = html;
}

function updateActive() {
  $$(".search-result", resultsEl()).forEach((el) => {
    const i = Number(el.getAttribute("data-index"));
    el.setAttribute("aria-selected", String(i === activeIndex));
    if (i === activeIndex) el.scrollIntoView({ block: "nearest" });
  });
}

function open() {
  const d = dialog();
  if (!d) return;
  d.hidden = false;
  document.body.style.overflow = "hidden";
  loadIndex().then(() => {
    const q = input().value.trim();
    if (q) render(q);
  });
  setTimeout(() => input().focus(), 20);
}

function close() {
  const d = dialog();
  if (!d) return;
  d.hidden = true;
  document.body.style.overflow = "";
}

function isOpen() {
  const d = dialog();
  return d && !d.hidden;
}

export function initSearch() {
  const d = dialog();
  if (!d) return;

  $$("[data-search-open]").forEach((b) => b.addEventListener("click", open));
  $$("[data-search-close]", d).forEach((b) => b.addEventListener("click", close));

  const runSearch = debounce(() => {
    if (!indexLoaded) return;
    render(input().value.trim());
  }, 120);

  input().addEventListener("input", runSearch);

  input().addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length) {
        activeIndex = (activeIndex + 1) % results.length;
        updateActive();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length) {
        activeIndex = (activeIndex - 1 + results.length) % results.length;
        updateActive();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[activeIndex];
      if (target) window.location.href = withBase(target.url);
    }
  });

  // Global keyboard: Ctrl/Cmd+K to open, Esc to close, / to open.
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isOpen() ? close() : open();
    } else if (e.key === "Escape" && isOpen()) {
      close();
    } else if (
      e.key === "/" &&
      !isOpen() &&
      !/input|textarea/i.test(e.target.tagName) &&
      !e.target.isContentEditable
    ) {
      e.preventDefault();
      open();
    }
  });
}
