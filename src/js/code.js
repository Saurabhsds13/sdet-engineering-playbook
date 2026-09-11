/**
 * Copy-to-clipboard for code blocks rendered by the build (see eleventy
 * highlight()). Uses the async Clipboard API with a text-selection fallback.
 */
import { $$ } from "./utils.js";

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for insecure contexts (e.g. plain http preview).
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export function initCodeCopy() {
  $$(".code-block").forEach((block) => {
    const btn = block.querySelector(".code-block__copy");
    const code = block.querySelector("pre code");
    if (!btn || !code) return;

    btn.addEventListener("click", async () => {
      try {
        await copyText(code.innerText);
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("is-copied");
        }, 1600);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => (btn.textContent = "Copy"), 1600);
      }
    });
  });
}
