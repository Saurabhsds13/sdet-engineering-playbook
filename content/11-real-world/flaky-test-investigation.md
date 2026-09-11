---
title: Investigating and Reducing Flaky Tests
navTitle: Flaky Test Investigation
slug: flaky-test-investigation
category: real-world
difficulty: advanced
order: 20
status: published
tags:
  - real-world
  - flaky
  - reliability
  - scenario
related:
  - title: Explicit Waits
    url: /selenium/explicit-waits/
  - title: Parallel Execution
    url: /selenium/parallel-execution/
---

## The scenario

Your suite has 2,000 tests and 15% are flaky — they pass and fail without code
changes. The team has stopped trusting the pipeline and just re-runs until it's
green. Your job: investigate systematically and drive the flaky rate down.

## Problem

Flakiness destroys the value of a test suite. If a red build might be noise,
people ignore red builds — and then a real regression slips through. Blanket
retries hide the problem instead of fixing it.

## Approach: measure first, then fix the biggest clusters

<div class="callout callout--important">
<p class="callout__title">Data before opinions</p>
<p>Don't guess which tests are flaky or why. Run the suite many times, record
every failure with its exception, stack trace, screenshot, and timing, then
cluster. Flakiness almost always concentrates in a few root causes — fix those
and the rate drops fast.</p>
</div>

## Design of the investigation

1. **Quantify** — track per-test pass/fail over N runs to identify the actually
   flaky tests (not the ones that failed once).
2. **Capture context** — screenshot + DOM + logs on every failure via a
   listener.
3. **Cluster by cause** — group failures by exception type and stack trace.
4. **Prioritize** — attack the largest clusters first for maximum impact.

## The usual clusters (and fixes)

| Cluster | Typical share | Root cause | Fix |
|---|---|---|---|
| TimeoutException | large | Missing/short waits | Explicit `elementToBeClickable` |
| StaleElement | medium | DOM re-render | Re-find / `refreshed(...)` |
| Data collisions | medium | Shared/hardcoded data | Unique data per test |
| ClickIntercepted | small | Overlays/animations | Wait for overlay to clear |
| Order dependence | small | Shared state | Make tests independent |
| Environment | varies | Grid/browser instability | Stabilize infra |

## Implementation

A failure listener that captures evidence:

```java
public class DiagnosticsListener implements ITestListener {
    public void onTestFailure(ITestResult result) {
        WebDriver d = DriverManager.get();
        Screenshots.capture(d, result.getName());
        Logs.dumpBrowserConsole(d, result.getName());
    }
}
```

Then cluster the recorded exceptions (a stream `groupingBy` over failure records)
to see where the 80% lives.

## Quarantine, don't ignore

<div class="callout callout--warning">
<p class="callout__title">Retries and quarantine are tools, not solutions</p>
<p>Move chronically flaky tests into a separate, non-blocking quarantine suite so
the main pipeline stays trustworthy — but <em>track</em> the quarantine and burn
it down. Add retries only as a temporary net, and report every retry so you can
see what's being masked. Never retry assertion failures.</p>
</div>

## Prevent recurrence

- Gate merges on a flaky-rate metric.
- Enable parallel execution to surface hidden state dependencies early.
- Code review for `Thread.sleep`, shared statics, and hardcoded data.
- Treat a new flaky test like a new bug, with an owner.

## Failure cases / traps

- "Fixing" flakiness by increasing all timeouts (slower suite, same races).
- Retrying everything, which hides real product bugs.
- Chasing individual tests instead of clusters.
- Declaring victory without a metric to prove improvement.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>This is the flagship scenario question. Answer as an engineer: quantify and
cluster failures, fix the biggest root causes (usually synchronization and test
data), quarantine the worst while tracking them, use retries only as a reported
safety net, and gate on a flaky-rate metric. Explicitly reject blind retries as
a fix.</p>
</div>

## Practice

Instrument your suite to record failures with exception + stack trace over 20
runs, cluster them, and write a one-page plan targeting the top two clusters
with an expected flaky-rate reduction.
