import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItAttrs from "markdown-it-attrs";
import Prism from "prismjs";
import loadLanguages from "prismjs/components/index.js";

import { CATEGORIES, CATEGORY_GROUPS } from "./src/lib/categories.js";
import { slugify, escapeHtml, readingTime } from "./src/lib/helpers.js";

// Preload Prism grammars used across the playbook.
loadLanguages([
  "java",
  "javascript",
  "json",
  "markup", // html / xml
  "sql",
  "yaml",
  "bash",
  "markdown",
  "docker",
  "properties"
]);

const PRISM_ALIAS = {
  html: "markup",
  xml: "markup",
  shell: "bash",
  sh: "bash",
  yml: "yaml",
  dockerfile: "docker"
};

/**
 * Highlight a code block with Prism and wrap it in the markup the
 * front-end enhances (language label + copy button live in code.js).
 */
function highlight(code, langRaw) {
  const lang = (langRaw || "").toLowerCase().trim();
  const prismLang = PRISM_ALIAS[lang] || lang;
  let highlighted;
  if (prismLang && Prism.languages[prismLang]) {
    highlighted = Prism.highlight(code, Prism.languages[prismLang], prismLang);
  } else {
    highlighted = escapeHtml(code);
  }
  const label = lang || "text";
  return (
    `<div class="code-block" data-lang="${escapeHtml(label)}">` +
    `<div class="code-block__header"><span class="code-block__lang">${escapeHtml(label)}</span>` +
    `<button type="button" class="code-block__copy" aria-label="Copy code to clipboard">Copy</button></div>` +
    `<pre class="code-block__pre language-${escapeHtml(prismLang || "text")}"><code>${highlighted}</code></pre>` +
    `</div>`
  );
}

export default function (eleventyConfig) {
  // ---- Markdown engine -----------------------------------------------------
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight
  })
    .use(markdownItAttrs)
    .use(markdownItAnchor, {
      slugify,
      permalink: markdownItAnchor.permalink.headerLink({ safariReaderFix: true }),
      level: [2, 3]
    });

  eleventyConfig.setLibrary("md", md);

  // Expose a filter so templates can render markdown strings (e.g. answers).
  eleventyConfig.addFilter("markdown", (str) =>
    str ? md.render(String(str)) : ""
  );
  eleventyConfig.addFilter("markdownInline", (str) =>
    str ? md.renderInline(String(str)) : ""
  );

  // ---- Passthrough assets --------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "public": "." });
  eleventyConfig.addPassthroughCopy({
    "node_modules/fuse.js/dist/fuse.min.mjs": "js/vendor/fuse.min.mjs"
  });
  // Self-hosted Inter variable font (Latin subset only, keeps it lean).
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2":
      "fonts/inter-latin-wght-normal.woff2",
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2":
      "fonts/inter-latin-wght-italic.woff2"
  });

  eleventyConfig.addWatchTarget("src/css/");
  eleventyConfig.addWatchTarget("src/js/");

  // ---- Global data ---------------------------------------------------------
  eleventyConfig.addGlobalData("categories", CATEGORIES);
  eleventyConfig.addGlobalData("categoryGroups", CATEGORY_GROUPS);
  eleventyConfig.addGlobalData("buildYear", new Date().getFullYear());

  // ---- Collections ---------------------------------------------------------
  // Every published article, sorted by category order then in-category order.
  eleventyConfig.addCollection("articles", (collectionApi) => {
    const items = collectionApi
      .getFilteredByGlob("content/**/*.md")
      .filter((item) => item.data.status !== "draft");

    return items.sort((a, b) => {
      const catA = CATEGORIES[a.data.category]?.order ?? 999;
      const catB = CATEGORIES[b.data.category]?.order ?? 999;
      if (catA !== catB) return catA - catB;
      const orderA = a.data.order ?? 999;
      const orderB = b.data.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return (a.data.title || "").localeCompare(b.data.title || "");
    });
  });

  // Articles grouped by category, used to render the left navigation.
  eleventyConfig.addCollection("nav", (collectionApi) => {
    const articles = collectionApi
      .getFilteredByGlob("content/**/*.md")
      .filter((item) => item.data.status !== "draft")
      .sort((a, b) => (a.data.order ?? 999) - (b.data.order ?? 999));

    return CATEGORY_GROUPS.map((group) => ({
      ...group,
      categories: group.categories
        .map((catKey) => ({
          key: catKey,
          ...CATEGORIES[catKey],
          articles: articles
            .filter((art) => art.data.category === catKey)
            .map((art) => ({
              title: art.data.navTitle || art.data.title,
              url: art.url,
              slug: art.data.slug,
              difficulty: art.data.difficulty
            }))
        }))
        .filter((cat) => cat.articles.length > 0)
    })).filter((group) => group.categories.length > 0);
  });

  // ---- Filters -------------------------------------------------------------
  eleventyConfig.addFilter("readingTime", (content) => readingTime(content));

  eleventyConfig.addFilter("categoryLabel", (key) =>
    CATEGORIES[key]?.label || key
  );

  eleventyConfig.addFilter("toc", (content) => {
    // Extract h2/h3 headings from rendered HTML for the on-page TOC.
    const headings = [];
    const re = /<h([23])[^>]*\sid="([^"]+)"[^>]*>(.*?)<\/h[23]>/gis;
    let m;
    while ((m = re.exec(content)) !== null) {
      const level = Number(m[1]);
      const id = m[2];
      const text = m[3].replace(/<[^>]+>/g, "").trim();
      headings.push({ level, id, text });
    }
    return headings;
  });

  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));

  // ---- Config --------------------------------------------------------------
  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      layouts: "src/_includes/layouts",
      data: "data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html"],
    pathPrefix: process.env.PATH_PREFIX || "/"
  };
}
