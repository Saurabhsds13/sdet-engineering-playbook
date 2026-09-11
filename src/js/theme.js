/**
 * Theme toggle cycling light → dark → system. The initial theme is applied
 * pre-paint by an inline script in base.njk; this module handles user toggles
 * and reacting to OS changes while in "system" mode.
 */
import { $, store } from "./utils.js";

const ORDER = ["light", "dark", "system"];
const KEY = "theme";

function resolve(pref) {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return pref;
}

function apply(pref) {
  const resolved = resolve(pref);
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.setAttribute("data-theme-pref", pref);
}

export function initTheme() {
  const btn = $("[data-theme-toggle]");
  let pref = store.getRaw(KEY, "system");
  apply(pref);

  if (btn) {
    btn.addEventListener("click", () => {
      const idx = ORDER.indexOf(pref);
      pref = ORDER[(idx + 1) % ORDER.length];
      store.setRaw(KEY, pref);
      apply(pref);
      btn.setAttribute("title", `Theme: ${pref}`);
    });
  }

  // React to OS theme changes only while following the system preference.
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (store.getRaw(KEY, "system") === "system") apply("system");
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
}
