/**
 * Left navigation behaviour: mobile off-canvas drawer and TOC scroll-spy.
 */
import { $, $$ } from "./utils.js";

export function initNavigation() {
  const toggle = $("[data-nav-toggle]");
  const overlay = $("[data-sidebar-overlay]");
  const root = document.body;

  function open() {
    root.setAttribute("data-nav-open", "");
    if (overlay) overlay.hidden = false;
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  function close() {
    root.removeAttribute("data-nav-open");
    if (overlay) overlay.hidden = true;
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }

  if (toggle) {
    toggle.addEventListener("click", () => {
      if (root.hasAttribute("data-nav-open")) close();
      else open();
    });
  }
  if (overlay) overlay.addEventListener("click", close);

  // Close the drawer after navigating on mobile.
  $$(".sidebar__article, .sidebar__link").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.matchMedia("(max-width: 900px)").matches) close();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.hasAttribute("data-nav-open")) close();
  });
}

/** Highlight the current section in the on-page TOC while scrolling. */
export function initTocScrollSpy() {
  const links = $$("[data-toc-link]");
  if (!links.length) return;

  const map = new Map();
  links.forEach((link) => map.set(link.getAttribute("data-toc-link"), link));

  const headings = $$(".prose h2[id], .prose h3[id]");
  if (!headings.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          const active = map.get(entry.target.id);
          if (active) active.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
  );

  headings.forEach((h) => observer.observe(h));
}
