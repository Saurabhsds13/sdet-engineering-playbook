# Contributing

Thanks for contributing to the SDET Engineering Playbook. This guide covers how
to add content and the conventions the build enforces.

## Principles

- **Markdown is the source of truth.** Content lives in `content/`, decoupled
  from the UI. It should read well in Obsidian, VS Code, and GitHub.
- **Reading first.** Write like a technical book chapter, not a marketing page.
  Explain *why*, not just *how*.
- **No hype.** For AI topics, prefer measured, practical explanations and use
  maturity labels.
- **Quality over quantity.** A few excellent articles beat many shallow ones.

## Local setup

```bash
npm install
npm run dev        # http://localhost:8080 with live reload
```

Before opening a pull request:

```bash
npm run validate   # front matter, slugs, links, data integrity
npm run lint       # validation + style warnings
npm run build      # full build (runs validate + search index)
npm test           # node:test suites
```

CI runs the same steps and fails on any validation error or test failure.

## Adding an article

1. Create a Markdown file under the right category folder, e.g.
   `content/02-selenium/my-topic.md`.
2. Add the front matter contract:

   ```yaml
   ---
   title: My Topic in Selenium
   navTitle: My Topic          # optional; shown in the sidebar (defaults to title)
   slug: my-topic              # lowercase-kebab-case, globally unique
   category: selenium          # must be a valid category (see below)
   difficulty: intermediate    # beginner | intermediate | advanced
   order: 50                   # sort order within the category
   status: published           # published | draft (draft is excluded)
   tags: [selenium, example]
   related:
     - title: Explicit Waits
       url: /selenium/explicit-waits/
   ---
   ```

3. The URL is derived automatically: `/<category>/<slug>/`.
4. Structure the body with `##`/`###` headings — these populate the on-page
   table of contents automatically.

### Valid categories

Defined in `src/lib/categories.js` (the single source of truth):

`java`, `selenium`, `testng`, `framework`, `api`, `sql`, `devops`,
`playwright`, `ai-testing`, `ai-agents`, `real-world`, `interview`.

### Recommended article shape

Use the sections that fit; don't force all of them:

```text
## Why this matters
## What is it? / Concept
## How it works
## Example (with code)
## Common mistakes
## Real-world usage
## Interview perspective
## Practice
```

## Callouts

Use sparingly — not every paragraph needs a box. Callouts are plain HTML so they
render in Obsidian and on the site:

```html
<div class="callout callout--warning">
<p class="callout__title">Title</p>
<p>Body text.</p>
</div>
```

Available types: `callout--important` (default), `callout--warning`,
`callout--remember`, `callout--interview`, `callout--realworld`,
`callout--ai`.

## AI maturity labels

AI-related content must distinguish maturity so experimental capabilities are
not presented as established standards:

```html
<span class="maturity maturity--stable">Stable</span>
<span class="maturity maturity--common">Common Practice</span>
<span class="maturity maturity--emerging">Emerging</span>
<span class="maturity maturity--experimental">Experimental</span>
```

## Code blocks

Use fenced code blocks with a language for syntax highlighting and the copy
button. Supported languages include `java`, `javascript`, `json`, `xml`/`html`,
`sql`, `yaml`, `bash`, `markdown`, `dockerfile`.

## Adding a quiz question

Append to `data/quizzes.json`:

```json
{
  "id": "unique-id",
  "category": "selenium",
  "difficulty": "beginner",
  "question": "…",
  "options": ["A", "B", "C", "D"],
  "answer": 2,
  "explanation": "Explain *why* the answer is correct."
}
```

`answer` is the zero-based index into `options`. Validation checks the id is
unique, the category is valid, and the answer index is in range.

## Adding an interview question

Append to `data/interview-questions.json`:

```json
{
  "id": "unique-id",
  "category": "framework",
  "difficulty": "advanced",
  "question": "…",
  "short": "One or two sentence key answer.",
  "detailed": "Fuller explanation.",
  "whyAsked": "Why interviewers ask this.",
  "followUp": "A common follow-up question.",
  "example": "Optional concrete example."
}
```

Only `id`, `category`, `question`, and `short` are required.

## Commit style

Use conventional commits:

```text
feat:      new feature or content
fix:       bug fix
docs:      documentation
refactor:  code change without behaviour change
test:      tests
chore:     tooling / maintenance
ci:        CI configuration
style:     formatting only
```

## Branches

Work on a feature branch (`feature/<short-name>`) and open a pull request against
`main`. CI must be green before merge.
