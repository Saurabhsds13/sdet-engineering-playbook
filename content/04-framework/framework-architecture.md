---
title: Automation Framework Architecture
navTitle: Framework Architecture
slug: framework-architecture
category: framework
difficulty: advanced
order: 40
status: published
tags:
  - framework
  - architecture
  - solid
  - design
related:
  - title: Page Object Model
    url: /framework/page-object-model/
  - title: Driver Factory
    url: /framework/driver-factory/
---

## Why this matters

A framework is a software product whose users are your team. Like any product,
it succeeds or fails on architecture. A well-layered framework lets the hundredth
test be as easy to add as the tenth; a tangled one collapses under its own
weight.

## Treat it as engineering, not a pattern checklist

The goal is not "we used POM." The goal is **separation of concerns**: each part
of the framework has one job, and changes stay local.

```text
┌───────────────────────────────────────────────┐
│ Tests (intent + assertions)                     │
├───────────────────────────────────────────────┤
│ Page / Component objects (UI interactions)      │
├───────────────────────────────────────────────┤
│ Core: DriverFactory · DriverManager · Waits     │
├───────────────────────────────────────────────┤
│ Support: Config · TestData · Logging · Reporting│
└───────────────────────────────────────────────┘
```

Dependencies point downward. Tests depend on pages; pages depend on core; core
depends on support. Nothing points back up.

## The layers

- **Tests** — declare intent and assertions only. Readable as user stories.
- **Page/Component objects** — encapsulate locators and interactions.
- **Core** — driver creation (factory), per-thread storage (ThreadLocal),
  reusable wait/interaction helpers.
- **Support** — configuration, test data, logging, screenshots, reporting.

## SOLID in a framework

- **S**ingle responsibility — a page object handles one page; the factory only
  creates drivers.
- **O**pen/closed — add a new browser by extending the factory, not editing
  every test.
- **L**iskov — any `WebDriver` implementation works wherever `WebDriver` is
  expected.
- **I**nterface segregation — small focused contracts (`Reporter`,
  `TestDataSource`) over god interfaces.
- **D**ependency inversion — depend on abstractions (`WebDriver`, `Reporter`),
  inject concretes.

<div class="callout callout--important">
<p class="callout__title">Configuration is architecture</p>
<p>Environment URLs, browser, headless, timeouts, and Grid endpoints belong in
config (files + environment variable overrides), loaded once and treated as
read-only. Hardcoded values are the number-one reason a framework can't move
between local and CI.</p>
</div>

## Cross-cutting concerns

Handle these once, centrally, via listeners/hooks:

- **Logging** — structured, thread-aware.
- **Screenshots on failure** — via an `ITestListener`.
- **Reporting** — a pluggable reporter behind an interface.
- **Retry** — narrow, tracked, never on assertions.

## Framework anti-patterns

- Hardcoded waits (`Thread.sleep`) sprinkled everywhere.
- Assertions inside page objects.
- A single `Utils` god class.
- Tests that depend on execution order or on each other.
- Copy-pasted setup in every test class instead of a `BaseTest`.
- Configuration scattered as string literals.

<div class="callout callout--warning">
<p class="callout__title">Scalability test</p>
<p>Ask: "does adding the 100th test require touching the framework?" If yes, the
architecture is leaking. Adding tests should be additive, not invasive.</p>
</div>

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Describe the layers and the downward dependency rule, then tie in SOLID with
concrete examples (factory = open/closed, WebDriver = dependency inversion).
Finish with the "adding the 100th test" scalability check — it signals you think
about maintainability, not just patterns.</p>
</div>

## Practice

Sketch your current framework as layers and mark every place a test reaches
"down" past the page layer into raw Selenium or config. Those are your
refactoring targets.
