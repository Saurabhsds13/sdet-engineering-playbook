---
title: Hallucination Testing
navTitle: Hallucination Testing
slug: hallucination-testing
category: ai-testing
difficulty: advanced
order: 30
status: published
tags:
  - ai-testing
  - hallucination
  - grounding
  - llm
related:
  - title: Testing LLM Applications
    url: /ai-testing/testing-llm-applications/
  - title: RAG Evaluation
    url: /ai-testing/rag-evaluation/
---

## Why this matters

A hallucination is when an LLM produces fluent, confident output that is
factually wrong or unsupported. It's the defining reliability risk of LLM
features: the model doesn't sound unsure when it's wrong. Testing for it is
different from testing for crashes or errors.

## What a hallucination actually is

<div class="callout callout--ai">
<p class="callout__title">AI Era</p>
<p>A hallucination isn't a bug in the traditional sense — the model is doing
exactly what it was trained to do (predict plausible text). The output is simply
<em>ungrounded</em>: not supported by facts or the provided context.</p>
</div>

Common forms: invented citations, fake API methods, wrong dates/numbers stated
confidently, and answers that contradict the source documents in a RAG system.

## Grounding: the core concept

**Grounding** means the answer is anchored to a trusted source. The key testable
property is **faithfulness** (also called groundedness): every claim in the
answer should be supported by the provided context.

Two distinct questions:

- **Faithfulness** — is the answer supported by the context? (guards against
  hallucination)
- **Relevance** — does the answer address the question?

An answer can be faithful but irrelevant, or relevant but hallucinated.

## How to test for hallucination

### Context-grounded checks

For RAG/context-based features, verify each claim traces to the retrieved
context. LLM-as-judge with a strict rubric is a common approach: "Is every
statement supported by the context? Flag any that aren't."

### Golden datasets with known answers

Use questions where the correct answer (and the correct "I don't know") is
known, then measure how often the model invents an answer instead of abstaining.

### Adversarial / unanswerable prompts

Ask questions the source *cannot* answer. A good system says "I don't have that
information." A hallucinating system confidently makes something up.

```text
Prompt: "According to the provided policy, what is the refund window for
         enterprise plans?"  (the policy says nothing about enterprise)
Good:  "The provided policy doesn't specify a refund window for enterprise plans."
Bad:   "Enterprise plans have a 45-day refund window."   ← hallucination
```

### Consistency checks

Ask the same factual question several ways. Contradictory answers signal the
model is generating rather than recalling grounded facts.

<div class="callout callout--warning">
<p class="callout__title">Measure abstention, not just accuracy</p>
<p>A model that guesses can score well on answerable questions while being
dangerous on unanswerable ones. Include unanswerable cases and reward "I don't
know" — abstention is a feature, not a failure.</p>
</div>

## Reducing hallucination (context for testers)

Grounding techniques (retrieval, citations, constrained prompts) reduce
hallucination but never eliminate it. That's why testing remains essential:
you're measuring a rate, not proving absence.

## Common mistakes

- Only testing questions the system can answer.
- Treating fluent output as correct output.
- No penalty for confident wrong answers vs honest "I don't know."
- Relying on a single judge run without spot-checking by a human.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Define hallucination as ungrounded output, distinguish faithfulness from
relevance, and describe testing with golden datasets plus <em>unanswerable</em>
prompts that reward abstention. Emphasize you're measuring a rate — you can't
prove a model never hallucinates.</p>
</div>

## Practice

Build a 10-question set for a document Q&A bot where 3 questions are unanswerable
from the source. Score the bot on both accuracy and how often it correctly says
"I don't know."
