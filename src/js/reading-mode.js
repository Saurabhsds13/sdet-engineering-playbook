/**
 * Focus / reading mode. Hides the two side rails and centers the reading
 * column. Persisted so the reader stays "in the book" across pages.
 */
import { $, store } from "./utils.js";

const KEY = "focus";

export function initFocusMode() {
  const btn = $("[data-focus-toggle]");
  if (!btn) return;

  const setState = (on) => {
    document.documentElement.classList.toggle("focus-mode", on);
    btn.setAttribute("aria-pressed", String(on));
    store.setRaw(KEY, on ? "on" : "off");
  };

  // Reflect the pre-paint state applied in base.njk.
  const initial = document.documentElement.classList.contains("focus-mode");
  btn.setAttribute("aria-pressed", String(initial));

  btn.addEventListener("click", () =>
    setState(!document.documentElement.classList.contains("focus-mode"))
  );

  // Keyboard shortcut: Shift+F toggles focus mode (ignored while typing).
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (e.shiftKey && (e.key === "F" || e.key === "f")) {
      e.preventDefault();
      setState(!document.documentElement.classList.contains("focus-mode"));
    }
  });
}
