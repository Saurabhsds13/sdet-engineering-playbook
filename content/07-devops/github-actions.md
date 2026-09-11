---
title: GitHub Actions for Test Automation
navTitle: GitHub Actions
slug: github-actions
category: devops
difficulty: intermediate
order: 30
status: published
tags:
  - devops
  - github-actions
  - ci
  - yaml
related:
  - title: Maven
    url: /devops/maven/
  - title: Jenkins
    url: /devops/jenkins/
---

## Why this matters

GitHub Actions puts CI right next to the code, free for public repos, with no
server to maintain. For modern projects it's often the fastest way to run tests
on every push and pull request — including this very playbook.

## The vocabulary

- **Workflow** — a YAML file in `.github/workflows/` triggered by events.
- **Job** — a set of steps running on a runner (a VM).
- **Step** — a single command or reusable **action**.
- **Matrix** — run the same job across combinations (browsers, versions).

## A test workflow

```yaml
name: Tests
on:
  push:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven
      - name: Run tests
        run: mvn -B clean test -Dheadless=true
      - name: Publish results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: surefire-reports
          path: target/surefire-reports/
```

`if: always()` uploads reports even when tests fail.

## Matrix builds for cross-browser

```yaml
strategy:
  matrix:
    browser: [chrome, firefox]
steps:
  - run: mvn test -Dbrowser=${{ matrix.browser }} -Dheadless=true
```

One definition, two parallel jobs.

## Caching

Caching dependencies (Maven `.m2`, npm) dramatically speeds up runs. The
`setup-java`/`setup-node` actions have built-in caching via the `cache` input,
or use `actions/cache` directly.

## Secrets and environment variables

<div class="callout callout--warning">
<p class="callout__title">Secrets via the repo settings, never in YAML</p>
<p>Store credentials in the repository's Secrets, reference them as
<code>${{ secrets.MY_TOKEN }}</code>, and remember secrets are masked in logs.
Never commit tokens into the workflow file.</p>
</div>

## Deploying to GitHub Pages

A static site can build and deploy on push to `main`:

```yaml
permissions:
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - uses: actions/deploy-pages@v4
```

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>This playbook itself uses two workflows: one that validates content, lints,
builds, and tests on every PR, and one that deploys to GitHub Pages on push to
main — no secrets required.</p>
</div>

## Common mistakes

- Forgetting `if: always()`, so reports aren't uploaded on failure.
- No dependency caching, making every run slow.
- Running heavy browser tests on every push instead of a smoke subset.
- Committing secrets into the workflow file.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Know the workflow/job/step/matrix vocabulary, how to cache dependencies, how
to publish artifacts with <code>if: always()</code>, and how secrets are
injected. Being able to compare it to Jenkins (no server to maintain, config
lives with code) is a plus.</p>
</div>

## Practice

Write a workflow that runs your suite headless on every PR across a
Chrome/Firefox matrix, caches Maven dependencies, and uploads the TestNG reports
even when tests fail.
