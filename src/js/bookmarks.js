/**
 * Bookmarks: toggle on an article and list them on the /bookmarks/ page.
 * Stored as an array of { slug, title, category, url } in localStorage.
 */
import { $, store } from "./utils.js";

const KEY = "bookmarks";

export function getBookmarks() {
  return store.get(KEY, []);
}

function isBookmarked(slug) {
  return getBookmarks().some((b) => b.slug === slug);
}

function toggle(entry) {
  let list = getBookmarks();
  if (list.some((b) => b.slug === entry.slug)) {
    list = list.filter((b) => b.slug !== entry.slug);
  } else {
    list.unshift(entry);
  }
  store.set(KEY, list);
  return isBookmarked(entry.slug);
}

export function initBookmarks() {
  const article = $("[data-article]");
  const btn = $("[data-bookmark]");
  if (!article || !btn) return;

  const entry = {
    slug: article.getAttribute("data-slug"),
    title: article.getAttribute("data-title"),
    category: article.getAttribute("data-category"),
    url: article.getAttribute("data-url")
  };

  const render = () => {
    const on = isBookmarked(entry.slug);
    btn.setAttribute("aria-pressed", String(on));
    const label = btn.querySelector(".bookmark-btn__label");
    if (label) label.textContent = on ? "Bookmarked" : "Bookmark";
  };

  render();
  btn.addEventListener("click", () => {
    toggle(entry);
    render();
  });
}
