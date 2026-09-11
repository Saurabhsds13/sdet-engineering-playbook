/**
 * PDF generation (initial implementation).
 *
 * Markdown remains the single source of truth. Rather than duplicate content
 * or pull in a heavy headless-browser dependency by default, this script
 * assembles every published article into ONE print-ready HTML document
 * (_site/playbook.html) with a table of contents, page breaks between
 * chapters, and the site's print stylesheet.
 *
 * Produce the PDF by opening that file and using the browser's
 * "Save as PDF" (or: install puppeteer and set PDF_ENGINE=puppeteer to render
 * headlessly — kept optional so the default install stays lean).
 *
 * Requires the site to be built first (npm run build).
 */
import { readFile, readdir, writeFile, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

import { CATEGORIES, CATEGORY_GROUPS } from "../src/lib/categories.js";
import { slugify } from "../src/lib/helpers.js";
import { parseFrontMatter } from "./build-search-index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const OUT_HTML = join(ROOT, "_site", "playbook.html");
const OUT_PDF = join(ROOT, "playbook.pdf");

const md = markdownIt({ html: true, linkify: true, typographer: true }).use(
  markdownItAnchor,
  { slugify }
);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

async function collectArticles() {
  const files = await walk(CONTENT_DIR);
  const articles = [];
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontMatter(raw);
    if (!data.title || !data.slug || !data.category) continue;
    if (data.status === "draft") continue;
    articles.push({ data, html: md.render(body) });
  }
  // Sort by category order then in-category order.
  return articles.sort((a, b) => {
    const ca = CATEGORIES[a.data.category]?.order ?? 999;
    const cb = CATEGORIES[b.data.category]?.order ?? 999;
    if (ca !== cb) return ca - cb;
    return (Number(a.data.order) || 999) - (Number(b.data.order) || 999);
  });
}

function buildHtml(articles) {
  // Group for the TOC.
  const byCat = new Map();
  for (const a of articles) {
    if (!byCat.has(a.data.category)) byCat.set(a.data.category, []);
    byCat.get(a.data.category).push(a);
  }

  let toc = "<nav class='pdf-toc'><h2>Contents</h2>";
  for (const group of CATEGORY_GROUPS) {
    for (const cat of group.categories) {
      const list = byCat.get(cat);
      if (!list) continue;
      toc += `<h3>${CATEGORIES[cat].label}</h3><ul>`;
      for (const a of list) {
        toc += `<li><a href="#${a.data.slug}">${a.data.title}</a></li>`;
      }
      toc += "</ul>";
    }
  }
  toc += "</nav>";

  let chapters = "";
  for (const a of articles) {
    chapters +=
      `<article class="pdf-chapter page-break" id="${a.data.slug}">` +
      `<p class="pdf-kicker">${CATEGORIES[a.data.category].label}</p>` +
      `<h1>${a.data.title}</h1>` +
      `<div class="prose">${a.html}</div>` +
      `</article>`;
  }

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8" />
<title>SDET Engineering Playbook</title>
<link rel="stylesheet" href="/css/main.css" />
<style>
  body { background:#fff; }
  .pdf-cover { text-align:center; padding:20vh 2rem; }
  .pdf-cover h1 { font-size:2.6rem; }
  .pdf-cover p { color:#555; }
  .pdf-toc { padding:2rem; }
  .pdf-toc a { color:#000; }
  .pdf-kicker { text-transform:uppercase; letter-spacing:0.05em; font-size:0.8rem; color:#666; }
  .pdf-chapter { max-width:46rem; margin:0 auto; padding:2rem; }
  .page-break { page-break-before: always; }
</style>
</head>
<body>
  <section class="pdf-cover">
    <h1>SDET Engineering Playbook</h1>
    <p>From Selenium Automation to AI-Enabled Quality Engineering</p>
    <p>${articles.length} chapters · generated ${new Date().toISOString().slice(0, 10)}</p>
  </section>
  <section class="page-break">${toc}</section>
  ${chapters}
</body>
</html>`;
}

async function maybePuppeteer(html) {
  if (process.env.PDF_ENGINE !== "puppeteer") return false;
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.warn("PDF_ENGINE=puppeteer set but puppeteer is not installed. Skipping headless render.");
    return false;
  }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html.replace('href="/css/main.css"', ""), { waitUntil: "networkidle0" });
  await page.pdf({ path: OUT_PDF, format: "A4", printBackground: true, margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" } });
  await browser.close();
  console.log(`Wrote ${OUT_PDF}`);
  return true;
}

async function main() {
  // Ensure the site is built so the print CSS is available.
  try {
    await access(join(ROOT, "_site"));
  } catch {
    console.error("_site not found. Run 'npm run build' first.");
    process.exit(1);
  }

  const articles = await collectArticles();
  const html = buildHtml(articles);
  await writeFile(OUT_HTML, html, "utf8");
  console.log(`Wrote print-ready document: _site/playbook.html (${articles.length} chapters)`);

  const rendered = await maybePuppeteer(html);
  if (!rendered) {
    console.log(
      "\nTo produce a PDF:\n" +
        "  1. Serve the site (npm run serve) and open /playbook.html\n" +
        "  2. Use the browser's Print dialog → Save as PDF\n" +
        "  Or: npm i -D puppeteer && PDF_ENGINE=puppeteer npm run pdf"
    );
  }
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
