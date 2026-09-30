---
title: QA Process Fundamentals (SDLC, STLC, Defect Life Cycle)
navTitle: QA Process Fundamentals
slug: qa-process-fundamentals
category: career
difficulty: beginner
order: 30
status: published
tags:
  - process
  - stlc
  - sdlc
  - defect-life-cycle
  - service-based
related:
  - title: Agile for SDETs
    url: /career/agile-for-sdet/
  - title: Presenting Your Experience
    url: /career/presenting-your-experience/
---

## Why this matters

Service-based company interviews (Infosys, TCS, Cognizant, Accenture, Wipro,
Capgemini and similar) almost always test process theory: SDLC, STLC, defect
life cycle, severity vs priority. These are near-guaranteed questions. Knowing
them crisply — with the QA angle — is easy marks you should never drop.

## SDLC vs STLC

- **SDLC (Software Development Life Cycle)** is the whole process of building
  software: requirements, design, development, testing, deployment, maintenance.
- **STLC (Software Testing Life Cycle)** is the testing-specific process that
  runs in parallel within SDLC.

<div class="callout callout--important">
<p class="callout__title">The one-line distinction</p>
<p>SDLC covers building the entire product; STLC covers only the testing
activities. STLC is a phase-set inside SDLC, not a replacement for it.</p>
</div>

## The STLC phases

```text
Requirement Analysis → Test Planning → Test Case Design →
Environment Setup → Test Execution → Test Closure
```

1. **Requirement Analysis** — understand what to test; identify testable
   requirements (raise gaps early).
2. **Test Planning** — scope, strategy, effort estimation, resources, schedule.
3. **Test Case Design** — write test cases and prepare test data.
4. **Test Environment Setup** — get the environment/build ready.
5. **Test Execution** — run tests, log defects, retest.
6. **Test Closure** — reports, metrics, lessons learned.

## Entry and exit criteria

Each STLC phase has **entry criteria** (what must be ready to start) and **exit
criteria** (what must be true to move on).

- Execution entry: environment ready, test cases reviewed, build deployed.
- Execution exit: planned tests run, critical defects closed, results reported.

## Verification vs validation

- **Verification** — "Are we building the product right?" Static checks against
  spec: reviews, walkthroughs, inspections. No code execution.
- **Validation** — "Are we building the right product?" Dynamic checks: actually
  running the software (your automated and manual tests).

## The defect (bug) life cycle

The states a defect moves through from discovery to closure:

```text
New → Assigned → Open → Fixed → Retest → Closed
                          │
                          └──(fails retest)──→ Reopened
Also: Rejected · Duplicate · Deferred · Not a Bug
```

1. **New** — tester logs it.
2. **Assigned** — lead/dev picks it up.
3. **Open** — developer is working on it.
4. **Fixed** — developer marks it resolved.
5. **Retest** — tester verifies the fix.
6. **Closed** — fix confirmed. If it still fails, it's **Reopened**.

Other outcomes: **Rejected** (not valid), **Duplicate**, **Deferred** (valid but
postponed), **Not a Bug** (works as designed).

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>In tools like Azure DevOps or Jira, this life cycle is the workflow on a bug
work item. A good defect report includes: clear title, steps to reproduce,
expected vs actual, environment, severity, priority, and evidence (screenshot,
logs). Reproducibility is what gets a bug fixed fast.</p>
</div>

## Severity vs priority

This pairing is asked constantly — know it cold.

- **Severity** — how badly the defect affects the system (technical impact). Set
  by the tester.
- **Priority** — how urgently it must be fixed (business urgency). Set by the
  product owner/lead.

| Combination | Example |
|---|---|
| High severity, high priority | Checkout crashes for all users |
| High severity, low priority | App crashes on a rarely used legacy screen |
| Low severity, high priority | Company logo misspelled on the home page |
| Low severity, low priority | Minor typo in a help tooltip |

<div class="callout callout--important">
<p class="callout__title">Severity ≠ priority</p>
<p>A misspelled company name is low severity (nothing breaks) but high priority
(embarrassing, must fix now). A crash on an obscure screen can be high severity
but low priority. They're independent axes.</p>
</div>

## Test plan vs test strategy

- **Test Strategy** — high-level, often organization/program-wide: overall
  approach, levels, tools, standards. Relatively static.
- **Test Plan** — project/release-specific document: scope, schedule, resources,
  entry/exit criteria, deliverables. Derived from the strategy.

## Test case vs test scenario

- **Test Scenario** — a high-level "what to test" (e.g. "verify login").
- **Test Case** — detailed steps, data, and expected result for one condition
  (e.g. "valid credentials → dashboard loads").

## Common mistakes

- Confusing SDLC and STLC (STLC is the testing subset).
- Saying severity and priority are the same thing.
- Defect reports without steps to reproduce or expected-vs-actual.
- Mixing up verification (static, no execution) and validation (dynamic).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>For service-based rounds, be able to rattle off STLC phases, the defect life
cycle states, and severity-vs-priority with an example of each mismatch
(high-severity/low-priority and vice versa). Tie it to your tool — "I tracked
defects through this life cycle in Azure DevOps" — to make it concrete.</p>
</div>

## Practice

Write a complete defect report for a real bug (title, steps, expected vs actual,
environment, severity, priority, evidence), and justify the severity and
priority you assigned — including one case where they deliberately differ.
