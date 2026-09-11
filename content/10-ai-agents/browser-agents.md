---
title: Browser Agents
navTitle: Browser Agents
slug: browser-agents
category: ai-agents
difficulty: advanced
order: 20
status: published
tags:
  - ai-agents
  - browser
  - automation
  - agentic
related:
  - title: AI Agent Fundamentals
    url: /ai-agents/ai-agent-fundamentals/
  - title: Testing Agentic Systems
    url: /ai-agents/testing-agentic-systems/
---

## Why this matters

A browser agent is an AI agent whose tools drive a web browser — it can read a
page, decide what to click, type, and navigate to accomplish a goal. This is
directly relevant to SDETs: browser agents are being explored as a way to do
exploratory testing and self-writing automation, and they're also a product
category we're increasingly asked to test.

<div class="callout callout--ai">
<p class="callout__title">AI Era maturity</p>
<p>Browser agents are <span class="maturity maturity--emerging">Emerging</span>.
They're impressive in demos and improving fast, but for regression-critical
automation they're not yet a dependable replacement for deterministic scripts.
Treat them as a powerful assistant, not a turnkey solution.</p>
</div>

## How a browser agent works

It's the standard agent loop with browser tools:

```text
Goal: "Find a laptop under $1000 and add it to the cart"
  │
  ▼
Observe page (DOM / accessibility tree / screenshot)
  │
  ▼
Decide action → tool: click / type / navigate / scroll
  │
  ▼
Observe new page state → repeat until goal met or limit hit
```

The agent perceives the page (often via the accessibility tree, which is more
robust than raw pixels), reasons about the next step, and acts through browser
tools built on Playwright/CDP or similar.

## Where browser agents help testing today

- **Exploratory testing** — an agent can wander an app and surface unexpected
  states or errors a scripted test wouldn't reach.
- **Test scaffolding** — turning a plain-language scenario into a first-draft
  automation script.
- **Resilience to small UI changes** — because it reasons about intent, it may
  handle a moved button that would break a hardcoded locator.

## Where they fall short

<div class="callout callout--warning">
<p class="callout__title">Non-determinism vs regression testing</p>
<p>Regression testing wants the <em>same</em> steps and the <em>same</em> verdict
every run. A browser agent may take a different path each time and occasionally
"succeed" by doing the wrong thing. For a stable regression gate, deterministic
scripts still win. Use agents where exploration and adaptability matter more than
repeatability.</p>
</div>

- **Cost and latency** — every step is an LLM call; suites get slow and pricey.
- **Flaky verdicts** — the agent may declare success on a wrong outcome.
- **Injection risk** — page content can hijack the agent (indirect prompt
  injection).
- **Auditability** — "why did it click that?" is harder to answer than a
  scripted step.

## Guardrails for browser agents

- **Sandbox** the environment (test data, resettable state) so runs are safe and
  reproducible.
- **Step limits** to prevent runaway loops.
- **Action allow-lists** — no destructive actions without confirmation.
- **Treat page content as untrusted** to blunt indirect injection.
- **Record trajectories** (actions + observations) for debugging and evaluation.

## Common mistakes

- Pointing a browser agent at production with real data.
- No step cap, so a stuck agent loops forever and burns budget.
- Accepting "task complete" without a machine-checkable success criterion.
- Assuming intent-based navigation removes all flakiness.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Describe a browser agent as the agent loop with browser tools perceiving the
page (accessibility tree) and acting. Be balanced: strong for exploratory
testing and scaffolding, weak as a deterministic regression gate. Name the
guardrails (sandbox, step limits, allow-lists, untrusted content) — that's the
tester's contribution.</p>
</div>

## Practice

Define a machine-checkable success criterion for "add a laptop under $1000 to
the cart" (e.g. cart contains one item with price < 1000), plus the step limit
and forbidden actions you'd enforce.
