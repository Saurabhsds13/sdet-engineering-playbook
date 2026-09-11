# SDET Engineering Playbook

> **From Selenium Automation to AI-Enabled Quality Engineering**

A practical SDET engineering playbook covering Java, Selenium 4, test automation
frameworks, API testing, SQL, CI/CD, Playwright, AI-powered testing, GenAI, and
agentic QA — built to read like a technical engineering book that happens to be
interactive.

---

## Why this project exists

Modern SDET engineering is not just writing Selenium scripts. This playbook is
designed to demonstrate — and to teach — the full range of the discipline:

> Strong programming + automation engineering + API + databases + CI/CD +
> architecture + modern browser automation + AI/LLM testing + engineering
> judgment.

It serves simultaneously as:

- a daily learning resource,
- an interview preparation system,
- a technical reference,
- an Obsidian-compatible knowledge base (Markdown is the source of truth),
- a portfolio-quality engineering project,
- a GitHub Pages website,
- and a foundation for a future downloadable PDF/book.

## Learning roadmap

Ten phases, from foundations to the AI era (see `/roadmap/` in the site, or
`data/roadmap.json`):

1. Java Foundations
2. Selenium Mastery
3. TestNG + Framework Engineering
4. API + SQL
5. CI/CD + DevOps
6. Playwright
7. AI-Assisted Testing
8. LLM Testing
9. AI Agents / Agentic QA
10. SDET Interview Preparation

## Technology stack

Deliberately lightweight and static:

- **[Eleventy](https://www.11ty.dev/)** — static site generator (no client
  framework).
- **markdown-it** + front matter — Markdown is the source of truth.
- **Prism** — build-time syntax highlighting.
- **Fuse.js** — fast client-side fuzzy search.
- **Vanilla JS (ES modules)** — theme, focus mode, progress, bookmarks, quiz,
  interview mode. No React/Next.js, no backend, no database, no analytics.
- **GitHub Actions + GitHub Pages** — CI and deployment.

## Architecture

Content and UI are intentionally decoupled so they can evolve independently.

```text
content/**/*.md        Markdown articles (front matter) — the source of truth
data/*.json            roadmap, navigation, quizzes, interview questions
src/_includes/         Nunjucks layouts + partials (book layout)
src/css/               modular CSS (variables, typography, layout, components…)
src/js/                ES module features (theme, search, quiz, interview…)
src/lib/               shared build-time helpers (categories, helpers)
scripts/               build-search-index, validate-content, generate-pdf
pages/                 roadmap / quiz / interview / bookmarks pages
tests/                 node:test suites
.github/workflows/     validate.yml (CI) + deploy.yml (Pages)
```

The site renders as a three-zone book layout: left navigation · a ~680–800px
reading column · an on-page table of contents. A build step generates the
search index; Eleventy renders Markdown to the reading experience.

## Content structure

Every article is a Markdown file with YAML front matter:

```yaml
---
title: Explicit Waits in Selenium
navTitle: Explicit Waits
slug: explicit-waits
category: selenium
difficulty: intermediate
order: 30
status: published
tags: [selenium, waits, synchronization]
related:
  - title: Selenium Exceptions
    url: /selenium/selenium-exceptions/
---
```

Valid categories, difficulties, and groups live in `src/lib/categories.js`, which
is the single source of truth used by both the build and content validation.

## Local development

```bash
npm install        # install dependencies
npm run dev        # serve locally with live reload at http://localhost:8080
```

## Build commands

```bash
npm run validate       # validate content front matter, links, data
npm run lint           # validation + style warnings
npm run build:search   # generate the client-side search index
npm run build          # validate + build search index + build the site to _site/
npm run clean          # remove build artifacts
```

`npm run build` runs `validate` and `build:search` automatically via the
`prebuild` hook, so a broken piece of content fails the build.

## Test commands

```bash
npm test               # run the node:test suites in tests/
```

Tests cover build helpers, front-matter parsing, search-index generation and
real search behaviour (via Fuse), content validation (including that the
validator catches bad content), and data-file integrity. There are no
placeholder `assert(true)` tests.

## PDF generation

Markdown remains the single source of truth — the PDF is generated from the same
content, never duplicated.

```bash
npm run build          # build the site first
npm run pdf            # assemble _site/playbook.html (print-ready, with TOC)
```

Open `_site/playbook.html` and use the browser's **Save as PDF**, or install
Puppeteer for a headless render:

```bash
npm i -D puppeteer
PDF_ENGINE=puppeteer npm run pdf   # writes playbook.pdf
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site
(with the correct GitHub Pages path prefix) and publishes it to GitHub Pages. No
secrets are required. Enable Pages for the repository with the "GitHub Actions"
source.

Every push and pull request also runs `.github/workflows/validate.yml`, which
validates content, lints, builds, and runs the tests.

## Contribution guidelines

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to add an article, quiz, or
interview question, the front-matter contract, and the conventional-commit
style.

## AI-era testing philosophy

This playbook treats AI as a first-class part of modern QA without the hype:

- It clearly separates **testing software _with_ AI** (using AI to help you
  test) from **testing software _that uses_ AI** (validating LLM/agent
  behaviour).
- AI content carries maturity labels — **Stable**, **Common Practice**,
  **Emerging**, **Experimental** — so experimental capabilities are never
  presented as established standards.
- The guiding principle throughout: **AI is an accelerator for testing
  engineering, not a replacement for engineering judgment.**

## License

[MIT](./LICENSE)
