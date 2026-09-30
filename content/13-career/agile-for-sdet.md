---
title: Agile and Scrum for SDETs
navTitle: Agile for SDETs
slug: agile-for-sdet
category: career
difficulty: beginner
order: 10
status: published
tags:
  - agile
  - scrum
  - process
  - career
related:
  - title: Presenting Your Automation Experience
    url: /career/presenting-your-experience/
  - title: Framework Architecture
    url: /framework/framework-architecture/
---

## Why this matters

Almost every automation role runs on Agile/Scrum, and interviewers ask about it
to check you can work inside a delivery team — not just write code in isolation.
If you hold an Agile certification, expect at least a few process questions. This
is the vocabulary and the QA-specific angle you need.

## Agile in one sentence

Deliver working software in short, iterative cycles, getting feedback early and
adapting, instead of one big upfront plan. Scrum is the most common framework
for doing Agile.

## The Scrum ceremonies

| Ceremony | Purpose | QA/SDET angle |
|---|---|---|
| Sprint Planning | Pick and estimate the sprint's work | Raise testability, effort for automation, test data needs |
| Daily Standup | 15-min sync: done / doing / blockers | Surface blockers early (env down, unclear AC) |
| Sprint Review | Demo the increment to stakeholders | Show what's tested and any risk |
| Retrospective | Improve the process | Flag flaky tests, slow pipelines, quality gaps |
| Backlog Refinement | Clarify upcoming stories | Define acceptance criteria and test scope |

## Roles

- **Product Owner** — owns the backlog and priorities.
- **Scrum Master** — facilitates the process, removes blockers.
- **Development Team** — includes developers and QA/SDETs; quality is a shared,
  whole-team responsibility, not a phase at the end.

<div class="callout callout--important">
<p class="callout__title">Shift-left: quality is not the last step</p>
<p>In Agile, testing happens continuously, not after development "finishes."
SDETs get involved at refinement (is this story testable?), automate alongside
development, and give fast feedback each sprint. Saying "we test throughout the
sprint, starting from acceptance criteria" is the answer interviewers want.</p>
</div>

## Definition of Done and acceptance criteria

- **Acceptance Criteria (AC)** — the specific conditions a story must meet;
  they're the basis for your test cases.
- **Definition of Done (DoD)** — the team's shared bar for "complete," which
  typically includes: code reviewed, unit + automated tests passing, no critical
  defects, and merged. As an SDET you help enforce the DoD by making automated
  tests part of it.

## Where automation fits in a sprint

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>A healthy rhythm: refine stories and pin down acceptance criteria, automate
new tests in the same sprint as the feature (not a sprint later), keep a fast
smoke suite in CI for quick feedback, and run the full regression before release.
Discuss flaky tests and pipeline speed in retros so quality stays a team topic,
not a QA silo.</p>
</div>

## Estimation

Teams often estimate stories in **story points** (relative size, frequently a
Fibonacci-like scale) rather than hours, to capture complexity and uncertainty.
As an SDET, factor in automation effort, test data setup, and environment needs
when estimating.

## Common mistakes

- Treating QA as a separate end-of-sprint phase (waterfall inside Agile).
- Automating a feature one or two sprints after it ships, so regression lags.
- Vague acceptance criteria leading to untestable stories.
- Not raising quality/process issues (flakiness, slow pipeline) in retros.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Name the ceremonies and roles, but the differentiator is the QA angle:
quality is a whole-team responsibility, you engage from refinement/acceptance
criteria, you automate within the sprint, and automated tests are part of the
Definition of Done. Tie it to your real experience — standups, sprint work,
regression before release.</p>
</div>

## Practice

Write two or three sentences you could say in an interview describing how you
worked in Agile on your last project: which ceremonies you took part in, when you
automated, and how you kept regression current sprint to sprint.
