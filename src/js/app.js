/**
 * App entry point. Wires up the always-on chrome (theme, nav, search, focus
 * mode) and lazily initialises page-specific features based on markers present
 * in the DOM. Feature modules are ES modules with no framework dependency.
 */
import { initTheme } from "./theme.js";
import { initNavigation, initTocScrollSpy } from "./navigation.js";
import { initFocusMode } from "./reading-mode.js";
import { initSearch } from "./search.js";
import { initProgress } from "./progress.js";
import { initBookmarks } from "./bookmarks.js";
import { initCodeCopy } from "./code.js";

function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

ready(async () => {
  // Chrome — present on every page.
  initTheme();
  initNavigation();
  initFocusMode();
  initSearch();

  // Article-scoped features.
  initProgress();
  initBookmarks();
  initCodeCopy();
  initTocScrollSpy();

  // Page-scoped features — imported lazily to keep the base bundle small.
  if (document.querySelector("[data-quiz-root]")) {
    const { initQuiz } = await import("./quiz.js");
    initQuiz();
  }
  if (document.querySelector("[data-interview-root]")) {
    const { initInterview } = await import("./interview.js");
    initInterview();
  }
  if (
    document.querySelector("[data-continue-card]") ||
    document.querySelector("[data-recent-list]")
  ) {
    const { initDashboard } = await import("./dashboard.js");
    initDashboard();
  }
  if (document.querySelector("[data-bookmarks-list]")) {
    const { renderBookmarksPage } = await import("./dashboard.js");
    renderBookmarksPage();
  }
});
