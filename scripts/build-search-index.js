/**
 * Builds the client-side search index consumed by src/js/search.js.
 *
 * Reads every published markdown article under content/, parses front matter,
 * extracts headings and a plain-text excerpt, folds in quiz/interview keywords,
 * and writes public/search-index.json (which Eleventy copies to the site root).
 *
 * Kept dependency-light: a tiny front-matter parser instead of pulling in
 * gray-matter, so the build stays lean.
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { CATEGORIES } from "../src/lib/categories.js";
import { slugify, stripHtml, excerpt } from "../src/lib/helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const OUT = join(ROOT, "public", "search-index.json");

/** Minimal front-matter parser: returns { data, body }. */
export function parseFrontMatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { data: {}, body: raw };
  const data = parseYaml(match[1]);
  return { data, body: match[2] };
}

/** Extremely small YAML subset parser (scalars, lists, nested list objects). */
function parseYaml(text) {
  const lines = text.split(/\r?\n/);
  const root = {};
  let currentKey = null;
  let listMode = false;
  let objList = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const listItem = /^\s*-\s+(.*)$/.exec(line);
    if (listItem && currentKey) {
      const val = listItem[1];
      const kv = /^(\w[\w-]*):\s*(.*)$/.exec(val);
      if (kv) {
        // Start of a list-of-objects entry.
        if (!objList) objList = [];
        const obj = {};
        obj[kv[1]] = strip(kv[2]);
        objList.push(obj);
        root[currentKey] = objList;
      } else {
        if (!Array.isArray(root[currentKey])) root[currentKey] = [];
        root[currentKey].push(strip(val));
      }
      listMode = true;
      continue;
    }

    // continuation of a list-object's additional keys (indented)
    const contKv = /^\s{2,}(\w[\w-]*):\s*(.*)$/.exec(line);
    if (contKv && objList && objList.length) {
      objList[objList.length - 1][contKv[1]] = strip(contKv[2]);
      continue;
    }

    const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line);
    if (kv) {
      currentKey = kv[1];
      listMode = false;
      objList = null;
      const value = kv[2];
      if (value === "") {
        root[currentKey] = null; // maybe a following list
      } else {
        root[currentKey] = strip(value);
      }
    }
  }
  return root;
}

function strip(v) {
  const t = v.trim().replace(/^["']|["']$/g, "");
  return t;
}

/** Extract markdown headings (## / ###) as plain text. */
function extractHeadings(body) {
  const headings = [];
  const re = /^#{2,3}\s+(.+)$/gm;
  let m;
  while ((m = re.exec(body)) !== null) {
    headings.push(m[1].replace(/[#*`]/g, "").trim());
  }
  return headings;
}

/** Body markdown to rough plain text for excerpts. */
function toPlain(body) {
  return stripHtml(
    body
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_>#-]/g, " ")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/<[^>]+>/g, " ")
  );
}

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

export async function buildIndex() {
  const files = await walk(CONTENT_DIR);
  const docs = [];

  for (const file of files) {
    const raw = await readFile(file, "utf8");
    const { data, body } = parseFrontMatter(raw);
    if (!data.title || !data.slug || !data.category) continue;
    if (data.status === "draft") continue;

    const headings = extractHeadings(body);
    const plain = toPlain(body);

    docs.push({
      title: data.title,
      slug: data.slug,
      category: data.category,
      categoryLabel: CATEGORIES[data.category]?.label || data.category,
      url: `/${data.category}/${data.slug}/`,
      tags: Array.isArray(data.tags) ? data.tags : [],
      headings,
      keywords: [],
      excerpt: excerpt(plain, 160)
    });
  }

  // Fold interview + quiz questions in as searchable entries.
  try {
    const iv = JSON.parse(
      await readFile(join(ROOT, "data", "interview-questions.json"), "utf8")
    );
    for (const q of iv) {
      docs.push({
        title: q.question,
        slug: q.id,
        category: "interview",
        categoryLabel: "Interview",
        url: "/interview/practice/",
        tags: [q.category, q.difficulty].filter(Boolean),
        headings: [],
        keywords: [q.category],
        excerpt: excerpt(q.short || "", 140)
      });
    }
  } catch {}

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(docs), "utf8");
  return docs;
}

// Run when invoked directly.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("build-search-index.js")) {
  buildIndex()
    .then((docs) => console.log(`search index: ${docs.length} documents -> public/search-index.json`))
    .catch((err) => {
      console.error("search index build failed:", err);
      process.exit(1);
    });
}
