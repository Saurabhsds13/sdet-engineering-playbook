---
title: AI Agent Fundamentals
navTitle: AI Agent Fundamentals
slug: ai-agent-fundamentals
category: ai-agents
difficulty: intermediate
order: 10
status: published
tags:
  - ai-agents
  - agentic
  - tool-calling
related:
  - title: Browser Agents
    url: /ai-agents/browser-agents/
  - title: Testing Agentic Systems
    url: /ai-agents/testing-agentic-systems/
---

## Why this matters

Agents are the next layer of AI systems: instead of answering once, they plan,
act, observe, and repeat until a goal is met. They're showing up in QA tooling
(autonomous test generation, exploratory agents) and in the products we test.
Understanding the agent loop is the foundation for testing them.

## What is an AI agent?

<div class="callout callout--ai">
<p class="callout__title">AI Era</p>
<p>An agent is an LLM given a goal, a set of <strong>tools</strong>, and a
<strong>loop</strong>: it decides an action, executes it, observes the result,
and decides again — until it finishes or hits a limit. The model does the
reasoning; the tools give it the ability to <em>act</em>.</p>
</div>

## The agent loop

```text
Goal
 │
 ▼
┌───────────────────────────────────────┐
│  Plan / decide next action             │◄────────┐
│         │                              │         │
│         ▼                              │         │
│  Call a tool (search, click, query)    │         │
│         │                              │         │
│         ▼                              │         │
│  Observe the result                    │─────────┘
└───────────────────────────────────────┘
 │  (goal met, or step/limit reached)
 ▼
Result
```

## Key concepts

- **Planning / task decomposition** — breaking a goal into steps.
- **Tool calling** — the model emits a structured request to invoke a function
  (search, click, DB query, API call); your code runs it and returns the result.
- **Memory / context** — carrying state across steps (what's been done, what was
  observed).
- **Autonomy** — the agent chooses actions rather than following a fixed script.
- **Human-in-the-loop** — a checkpoint where a person approves risky actions.
- **Guardrails** — hard limits: allowed tools, permissions, max steps.

## Tool calling in practice

The model returns a structured call; your runtime executes it and feeds back the
observation:

```text
Model → { "tool": "search_products", "args": { "query": "laptop" } }
Runtime → runs the search, returns results
Model → observes results, decides next action (e.g. add_to_cart)
```

The model never touches your systems directly — every action goes through a tool
you control, which is exactly where guardrails belong.

## Why agents are hard to reason about

<div class="callout callout--warning">
<p class="callout__title">Non-determinism compounds</p>
<p>A single LLM call is non-deterministic. An agent chains many of them, so tiny
variations at each step lead to entirely different <em>plans</em> and action
sequences. Two runs of the same task can take different paths — which is why you
evaluate behaviour over many trials, not one.</p>
</div>

## The risks (preview)

- Unpredictable plans and action sequences.
- Tool misuse (wrong tool, wrong arguments).
- Infinite or wasteful loops.
- Exceeding intended permissions.
- Prompt injection redirecting the agent.
- State corruption from partial actions.

These are covered in depth in *Testing Agentic Systems*.

## Common mistakes

- Treating an agent like a deterministic function.
- Granting broad tool permissions "to be safe."
- No step limit, allowing runaway loops.
- No human checkpoint for irreversible actions.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain the loop (plan → act via tools → observe → repeat), that tool calling
is how the model acts through code you control, and why compounding
non-determinism makes agents behave differently run to run. That framing sets up
every testing question that follows.</p>
</div>

## Practice

Sketch the agent loop for "book the cheapest flight under $300." List the tools
it needs, the guardrails you'd impose, and where a human checkpoint belongs.
