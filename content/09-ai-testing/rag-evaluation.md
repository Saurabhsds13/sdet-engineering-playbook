---
title: RAG Evaluation
navTitle: RAG Evaluation
slug: rag-evaluation
category: ai-testing
difficulty: advanced
order: 40
status: published
tags:
  - ai-testing
  - rag
  - retrieval
  - evaluation
related:
  - title: Hallucination Testing
    url: /ai-testing/hallucination-testing/
  - title: Testing LLM Applications
    url: /ai-testing/testing-llm-applications/
---

## Why this matters

Retrieval-Augmented Generation (RAG) is how most production LLM apps answer
questions over private data: retrieve relevant documents, then generate an answer
from them. RAG has two failure surfaces — retrieval and generation — and good
testing evaluates each separately, because "the answer was wrong" could be
either's fault.

## The RAG pipeline

```text
Question
   │
   ▼
Embed → Vector search → Retrieve top-k chunks
   │
   ▼
Prompt (question + retrieved context)
   │
   ▼
LLM → Answer
```

If retrieval fetches the wrong chunks, even a perfect model can't answer. If
retrieval is perfect but the model ignores the context, you still get a bad
answer. Evaluate both.

## Retrieval metrics

- **Context precision** — of the retrieved chunks, how many are actually
  relevant? (low precision = noise in the prompt)
- **Context recall** — of the chunks needed to answer, how many were retrieved?
  (low recall = missing information)
- **Hit rate / MRR** — did the right chunk appear, and how highly ranked?

<div class="callout callout--important">
<p class="callout__title">Diagnose retrieval before blaming the model</p>
<p>If context recall is low, the answer was doomed before generation. Fixing the
prompt or model won't help — the fix is in chunking, embeddings, or the number
of retrieved results (k).</p>
</div>

## Generation metrics

- **Faithfulness / groundedness** — is the answer supported by the retrieved
  context? (guards against hallucination)
- **Answer relevance** — does it address the question?
- **Correctness** — does it match the known/expected answer (when you have one)?

## Building an evaluation set

A RAG eval dataset typically has, per item:

```text
question         — the user query
ground_truth     — the ideal answer (or key facts)
relevant_chunks  — which source passages should be retrieved
```

With this you can score retrieval (did we get `relevant_chunks`?) and generation
(is the answer faithful and correct?) independently.

## Common failure patterns to test

- **Chunking too large/small** — context gets diluted or split mid-fact.
- **Stale index** — the source changed but embeddings weren't rebuilt.
- **k too low** — the needed chunk exists but isn't in the top-k.
- **Ignored context** — model answers from its training data, not the retrieved
  docs (test with facts only present in your corpus).
- **Conflicting sources** — retrieved chunks disagree; how does the system
  handle it?

<div class="callout callout--ai">
<p class="callout__title">AI Era</p>
<p>A sharp test: ask something answerable <em>only</em> from your private corpus,
using a fact the base model can't know. If the answer is right, retrieval and
grounding both worked. If it's wrong or generic, you've isolated the failure.</p>
</div>

## Common mistakes

- Evaluating only the final answer, so you can't tell which stage failed.
- No labeled relevant chunks, so retrieval can't be scored.
- Ignoring recall (missing info is invisible if you only look at what was
  returned).
- Never rebuilding the index after the corpus changes.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Split RAG evaluation into retrieval (precision, recall, hit rate) and
generation (faithfulness, relevance, correctness), and stress that you diagnose
retrieval first. Mention testing with facts only in the private corpus to prove
grounding actually happened.</p>
</div>

## Practice

For a docs chatbot, build a 15-item eval set with questions, ground-truth
answers, and the expected source passages. Report retrieval recall and answer
faithfulness separately.
