/**
 * Small shared utilities: DOM helpers and a namespaced, resilient
 * localStorage wrapper. All feature modules use `store` so persistence
 * behaves consistently and never throws in private-mode browsers.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const PREFIX = "sdet-";

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  // Raw string access (used by the pre-paint theme script's keys).
  getRaw(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : raw;
    } catch {
      return fallback;
    }
  },
  setRaw(key, value) {
    try {
      localStorage.setItem(PREFIX + key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  }
};

/** Debounce a function by `wait` ms. */
export function debounce(fn, wait = 150) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Resolve a site-root-relative URL respecting a possible path prefix. */
export function withBase(path) {
  const base = document.documentElement.getAttribute("data-base") || "/";
  if (base === "/" || !base) return path;
  return (base.replace(/\/$/, "") + path).replace(/\/{2,}/g, "/");
}
