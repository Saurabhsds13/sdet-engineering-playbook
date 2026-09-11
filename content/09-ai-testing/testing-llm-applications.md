---
title: Testing LLM Applications
navTitle: Testing LLM Applications
slug: testing-llm-applications
category: ai-testing
difficulty: advanced
order: 20
status: published
tags:
  - ai-testing
  - llm
  - evaluation
  - non-deterministic
related:
  - title: Hallucination Testing
    url: /ai-testing/hallucination-testing/
  - title: RAG Evaluation
    url: /ai-testing/rag-evaluation/
---

## Why this matters

There are two very different activities people call "AI testing." Confusing them
is the most common mistake in this space.

<div class="callout callout--ai">
<p class="callout__title">AI Era: draw this distinction first</p>
<p><strong>Testing software WITH AI</strong> = using AI tools to help you test
normal software.<br>
<strong>Testing software THAT USES AI</strong> = validating an application whose
behaviour is powered by an LLM. This article is about the second.</p>
</div>

## Why LLM outputs break traditional testing

Traditional tests assert exact outputs. LLMs are **non-deterministic** and
**open-ended**: the same prompt can produce different valid answers, and there's
rarely one "correct" string. Equality assertions are therefore brittle and
mostly useless.

The shift: from *assertion* to *evaluation*.

## The evaluation toolkit

### Golden / evaluation datasets

Curate representative inputs with expected *properties* (not exact text): the
answer must mention X, must not claim Y, must be in the right format. This
dataset is your regression suite for prompt and model changes.

### Semantic similarity

Compare the response to a reference answer by meaning (embeddings /
cosine similarity) rather than exact match, with a threshold.

### LLM-as-judge

Use a model to score responses against a rubric ("is this answer grounded,
relevant, and safe?"). Powerful but imperfect — validate the judge itself and
keep humans in the loop for high-stakes cases.

### Structured-output validation <span class="maturity maturity--stable">Stable</span>

When the LLM must return JSON, validate it against a schema deterministically.
This part *can* be a hard assertion.

```javascript
// Structured output is deterministically checkable.
expect(() => userSchema.parse(JSON.parse(response))).not.toThrow();
```

## Properties worth testing

- **Correctness / groundedness** — is it factually right and supported?
- **Relevance** — does it answer the actual question?
- **Format** — valid JSON / required fields.
- **Safety** — refuses unsafe requests, no toxic output.
- **Consistency** — stable across paraphrases and runs.
- **Cost & latency** — tokens and response time within budget.
- **Drift** — quality over time as models/prompts change.

## Making non-deterministic tests CI-friendly

<div class="callout callout--important">
<p class="callout__title">Stabilize what you can, sample what you can't</p>
<p>Pin the model version and lower temperature for reproducibility. Assert
deterministically on structure/format. For free-text quality, run multiple
samples and gate on a <em>pass rate</em> and score threshold rather than a
single pass/fail — and track the trend, not just the latest run.</p>
</div>

## Common mistakes

- Asserting exact string equality on generated text.
- No pinned model version, so results drift silently.
- Trusting an LLM judge without validating it.
- Ignoring cost/latency until the bill or the P99 explodes.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Lead with the WITH-AI vs THAT-USES-AI distinction. Then explain the shift
from assertion to evaluation: golden datasets, semantic similarity, LLM-as-judge,
deterministic schema checks for structured output, and gating CI on pass-rate
thresholds. Mention drift, cost, and latency.</p>
</div>

## Practice

Design an evaluation set of 10 prompts for a support-answer bot: define the
expected properties for each, and decide which checks are deterministic (schema)
vs evaluated (similarity/judge).
