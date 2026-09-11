/**
 * Content validation. Fails the build (exit 1) on critical content errors so
 * broken content never ships. Checks:
 *   - required front matter (title, slug, category, status)
 *   - valid category / difficulty / status values
 *   - duplicate slugs (globally unique)
 *   - internal links in `related` resolve to real articles
 *   - every category referenced in navigation.json has content (warning)
 *   - quiz + interview data reference valid categories and shapes
 *   - roadmap links point to real articles or known pages
 *
 * Run with --lint for the same checks (used by the CI "lint" step) plus
 * style warnings that do not fail the build.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  VALID_CATEGORIES,
  VALID_DIFFICULTIES,
  VALID_STATUS
} from "../src/lib/categories.js";
import { parseFrontMatter } from "./build-search-index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");

const LINT = process.argv.includes("--lint");

const errors = [];
const warnings = [];

const KNOWN_PAGES = new Set([
  "/",
  "/roadmap/",
  "/interview/practice/",
  "/quiz/",
  "/bookmarks/"
]);

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

/**
 * Pure, filesystem-free validation of a single article's front matter + body.
 * Returns an array of error strings (empty === valid). Used by the main
 * validate() loop and directly unit-tested with bad fixtures.
 */
export function validateArticle({ data = {}, body = "" }, where = "article") {
  const errs = [];
  if (!data.title) errs.push(`${where}: missing front-matter 'title'`);
  if (!data.slug) errs.push(`${where}: missing front-matter 'slug'`);
  if (!data.category) errs.push(`${where}: missing front-matter 'category'`);

  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errs.push(`${where}: invalid category '${data.category}'`);
  }
  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errs.push(`${where}: invalid difficulty '${data.difficulty}'`);
  }
  if (data.status && !VALID_STATUS.includes(data.status)) {
    errs.push(`${where}: invalid status '${data.status}'`);
  }
  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errs.push(`${where}: slug '${data.slug}' must be lowercase kebab-case`);
  }
  const fences = (body.match(/^```/gm) || []).length;
  if (fences % 2 !== 0) {
    errs.push(`${where}: unbalanced code fences`);
  }
  return errs;
}

function rel(file) {
  return file.replace(ROOT + "\\", "").replace(ROOT + "/", "").replace(/\\/g, "/");
}

export async function validate() {
  errors.length = 0;
  warnings.length = 0;

  const files = await walk(CONTENT_DIR);
  const slugs = new Map();
  const urls = new Set();
  const articles = [];

  for (const file of files) {
    const where = rel(file);
    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontMatter(raw);

    // Required fields
    if (!data.title) errors.push(`${where}: missing front-matter 'title'`);
    if (!data.slug) errors.push(`${where}: missing front-matter 'slug'`);
    if (!data.category) errors.push(`${where}: missing front-matter 'category'`);
    if (!data.status) warnings.push(`${where}: missing 'status' (defaulting to published)`);

    // Valid values
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      errors.push(
        `${where}: invalid category '${data.category}' (valid: ${VALID_CATEGORIES.join(", ")})`
      );
    }
    if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
      errors.push(
        `${where}: invalid difficulty '${data.difficulty}' (valid: ${VALID_DIFFICULTIES.join(", ")})`
      );
    }
    if (data.status && !VALID_STATUS.includes(data.status)) {
      errors.push(`${where}: invalid status '${data.status}'`);
    }

    // Slug shape + uniqueness
    if (data.slug) {
      if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push(`${where}: slug '${data.slug}' must be lowercase kebab-case`);
      }
      if (slugs.has(data.slug)) {
        errors.push(
          `${where}: duplicate slug '${data.slug}' (also in ${slugs.get(data.slug)})`
        );
      } else {
        slugs.set(data.slug, where);
      }
    }

    // Body sanity
    if (data.status !== "draft" && body.trim().length < 200) {
      warnings.push(`${where}: body looks very short (<200 chars)`);
    }
    // Unbalanced code fences
    const fences = (body.match(/^```/gm) || []).length;
    if (fences % 2 !== 0) {
      errors.push(`${where}: unbalanced code fences (found ${fences} \`\`\` markers)`);
    }

    if (data.slug && data.category) {
      urls.add(`/${data.category}/${data.slug}/`);
    }
    articles.push({ where, data });
  }

  // Validate `related` internal links now that every URL is known.
  for (const { where, data } of articles) {
    if (Array.isArray(data.related)) {
      for (const rel of data.related) {
        const url = typeof rel === "string" ? rel : rel.url;
        if (!url) continue;
        const norm = url.endsWith("/") ? url : url + "/";
        if (!urls.has(norm) && !KNOWN_PAGES.has(norm)) {
          warnings.push(`${where}: related link '${url}' does not resolve to a known article`);
        }
      }
    }
  }

  // Cross-check navigation.json categories against real content.
  try {
    const nav = JSON.parse(await readFile(join(ROOT, "data", "navigation.json"), "utf8"));
    const catsWithContent = new Set(articles.map((a) => a.data.category));
    for (const group of nav.groups || []) {
      for (const cat of group.categories) {
        if (!VALID_CATEGORIES.includes(cat)) {
          errors.push(`navigation.json: unknown category '${cat}'`);
        } else if (!catsWithContent.has(cat)) {
          warnings.push(`navigation.json: category '${cat}' has no published content yet`);
        }
      }
    }
  } catch (e) {
    errors.push(`navigation.json: could not read/parse (${e.message})`);
  }

  // Validate quizzes.json
  try {
    const quizzes = JSON.parse(await readFile(join(ROOT, "data", "quizzes.json"), "utf8"));
    const ids = new Set();
    quizzes.forEach((q, i) => {
      const at = `quizzes.json[${i}]`;
      if (!q.id) errors.push(`${at}: missing id`);
      else if (ids.has(q.id)) errors.push(`${at}: duplicate quiz id '${q.id}'`);
      else ids.add(q.id);
      if (!VALID_CATEGORIES.includes(q.category))
        errors.push(`${at}: invalid category '${q.category}'`);
      if (!Array.isArray(q.options) || q.options.length < 2)
        errors.push(`${at}: needs at least 2 options`);
      if (typeof q.answer !== "number" || q.answer < 0 || (q.options && q.answer >= q.options.length))
        errors.push(`${at}: 'answer' index out of range`);
      if (!q.explanation) warnings.push(`${at}: missing explanation`);
    });
  } catch (e) {
    errors.push(`quizzes.json: could not read/parse (${e.message})`);
  }

  // Validate interview-questions.json
  try {
    const iv = JSON.parse(
      await readFile(join(ROOT, "data", "interview-questions.json"), "utf8")
    );
    const ids = new Set();
    iv.forEach((q, i) => {
      const at = `interview-questions.json[${i}]`;
      if (!q.id) errors.push(`${at}: missing id`);
      else if (ids.has(q.id)) errors.push(`${at}: duplicate interview id '${q.id}'`);
      else ids.add(q.id);
      if (!VALID_CATEGORIES.includes(q.category))
        errors.push(`${at}: invalid category '${q.category}'`);
      if (!q.question) errors.push(`${at}: missing question`);
      if (!q.short) errors.push(`${at}: missing short answer`);
    });
  } catch (e) {
    errors.push(`interview-questions.json: could not read/parse (${e.message})`);
  }

  // Validate roadmap links.
  try {
    const roadmap = JSON.parse(await readFile(join(ROOT, "data", "roadmap.json"), "utf8"));
    for (const phase of roadmap.phases || []) {
      for (const link of phase.links || []) {
        const norm = link.url.endsWith("/") ? link.url : link.url + "/";
        if (!urls.has(norm) && !KNOWN_PAGES.has(norm)) {
          warnings.push(`roadmap.json: phase ${phase.phase} link '${link.url}' has no matching article yet`);
        }
      }
    }
  } catch (e) {
    errors.push(`roadmap.json: could not read/parse (${e.message})`);
  }

  return { errors: [...errors], warnings: [...warnings], articleCount: articles.length };
}

// CLI
if (process.argv[1]?.endsWith("validate-content.js")) {
  validate()
    .then(({ errors, warnings, articleCount }) => {
      console.log(`\nValidated ${articleCount} article(s).`);
      if (warnings.length && LINT) {
        console.log(`\n${warnings.length} warning(s):`);
        warnings.forEach((w) => console.log(`  ⚠ ${w}`));
      } else if (warnings.length) {
        console.log(`${warnings.length} warning(s) (run 'npm run lint' to list).`);
      }
      if (errors.length) {
        console.error(`\n${errors.length} error(s):`);
        errors.forEach((e) => console.error(`  ✖ ${e}`));
        console.error("\nContent validation failed.");
        process.exit(1);
      }
      console.log("Content validation passed.\n");
    })
    .catch((err) => {
      console.error("validation crashed:", err);
      process.exit(1);
    });
}
