/**
 * Shared build-time helpers (pure, no Eleventy dependency) so they can also
 * be imported by scripts and tests.
 */

/** URL-safe slug used for anchors and slugs. */
export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Minimal HTML escaping for code blocks and attributes. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip HTML tags to plain text (for search excerpts / word counts). */
export function stripHtml(html) {
  return String(html)
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Estimate reading time in minutes from rendered HTML or plain text. */
export function readingTime(content) {
  const text = /<[a-z]/i.test(String(content)) ? stripHtml(content) : String(content);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 220));
}

/** Build a short excerpt from text. */
export function excerpt(text, max = 160) {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  return clean.slice(0, max).replace(/\s+\S*$/, "") + "\u2026";
}
