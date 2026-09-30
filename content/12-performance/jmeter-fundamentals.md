---
title: Performance Testing with JMeter
navTitle: JMeter Fundamentals
slug: jmeter-fundamentals
category: performance
difficulty: intermediate
order: 10
status: published
tags:
  - performance
  - jmeter
  - load-testing
  - api
related:
  - title: REST Fundamentals
    url: /api/rest-fundamentals/
  - title: Rest Assured
    url: /api/rest-assured/
---

## Why this matters

Functional tests prove the app works for one user; performance tests prove it
survives many. Apache JMeter is the most common open-source tool for load and
performance testing of APIs and web apps. If JMeter is on your resume,
interviewers will expect you to explain how a test plan is structured and how to
read the results — not just that you "used JMeter."

## What JMeter does

JMeter simulates many virtual users hitting your system concurrently, then
measures response times, throughput, and errors under that load. It's protocol-
level (HTTP, JDBC, JMS, etc.), so it drives the server directly without a
browser — which is why it scales to thousands of users on modest hardware.

## Anatomy of a test plan

```text
Test Plan
└── Thread Group            (the virtual users)
    ├── HTTP Request         (the sampler — what you call)
    ├── Config Elements      (HTTP Header Manager, defaults)
    ├── Timers               (pacing between requests)
    ├── Assertions           (pass/fail checks on responses)
    └── Listeners            (collect + view results)
```

- **Thread Group** — defines the load: number of threads (users), ramp-up
  period, and loop count.
- **Sampler** (e.g. HTTP Request) — the actual request each user sends.
- **Config Elements** — shared settings like headers or base host.
- **Timers** — add think-time so you model realistic pacing, not a hammer.
- **Assertions** — validate status/response so failures are counted.
- **Listeners** — aggregate and display results.

<div class="callout callout--important">
<p class="callout__title">Threads, ramp-up, loops</p>
<p>A Thread Group of 100 threads, 20-second ramp-up, 10 loops means: 100 virtual
users start gradually over 20 seconds (5 per second), and each sends its request
sequence 10 times. Ramp-up matters — starting all users at once is an unrealistic
spike, not a load test.</p>
</div>

## The metrics that matter

When you read a JMeter summary or aggregate report, focus on:

| Metric | Meaning |
|---|---|
| Average / Median | Typical response time |
| 90th / 95th / 99th percentile | Tail latency — what slow users experience |
| Throughput | Requests per second the system handled |
| Error % | Share of failed requests |
| Min / Max | Best and worst response times |

<div class="callout callout--warning">
<p class="callout__title">Percentiles beat averages</p>
<p>An average can look healthy while 5% of users wait 10 seconds. The 95th/99th
percentile reveals the tail latency real users feel. Interviewers love asking
why you'd report the 95th percentile instead of the average — this is why.</p>
</div>

## GUI to design, CLI to run

Use the JMeter GUI to build and debug your test plan, but always run the actual
load test from the **command line (non-GUI mode)** — the GUI itself consumes
resources and skews results.

```bash
jmeter -n -t test-plan.jmx -l results.jtl -e -o report/
```

`-n` non-GUI, `-t` the plan, `-l` the raw results, `-e -o` generate an HTML
dashboard. This is also how you run JMeter inside a CI pipeline.

## Correlation and parameterization

Real flows aren't static:

- **Parameterization** — feed each virtual user different data (from a CSV Data
  Set Config) so they don't all log in as the same user.
- **Correlation** — extract a dynamic value from one response (a token, session
  id) and pass it into the next request using a post-processor like a JSON/Regex
  extractor. Without correlation, tokens expire and every request after login
  fails.

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>A common telecom/enterprise use: load-test a service-qualification or
provisioning API by ramping virtual users, correlating the auth token from the
login response, feeding account numbers from a CSV, and asserting 95th-percentile
latency stays under an agreed SLA. The HTML dashboard becomes the evidence you
share with the team.</p>
</div>

## Common mistakes

- Running the load test in GUI mode (skews results).
- Reporting the average and hiding the tail latency.
- No think-time/timers, producing an unrealistic hammer instead of load.
- Forgetting correlation, so every post-login request fails.
- Not adding assertions, so "fast" responses that were actually errors count as
  passing.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Describe the test-plan hierarchy (Thread Group -> Sampler -> Assertions ->
Listeners), threads/ramp-up/loops, why you report percentiles over averages, and
why you run in non-GUI mode. Mentioning correlation (extracting a token and
passing it forward) signals you've built real load tests, not just recorded a
click.</p>
</div>

## Practice

Build a JMeter plan that logs in, correlates the returned token, calls a
protected API with data from a CSV for 50 users over a 30-second ramp-up, asserts
200 responses, and reports the 95th-percentile latency from a non-GUI run.
