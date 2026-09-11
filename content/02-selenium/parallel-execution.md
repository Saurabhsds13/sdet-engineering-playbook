---
title: Parallel Test Execution
navTitle: Parallel Execution
slug: parallel-execution
category: selenium
difficulty: advanced
order: 70
status: published
tags:
  - selenium
  - parallel
  - testng
  - reliability
related:
  - title: ThreadLocal WebDriver
    url: /framework/threadlocal-webdriver/
  - title: Selenium Grid
    url: /selenium/selenium-grid/
---

## Why this matters

A 2,000-test suite that runs serially can take hours. Parallel execution is how
you keep the feedback loop fast. But parallelism exposes every hidden
assumption about shared state — done wrong, it multiplies flakiness instead of
saving time.

## The two ingredients

1. **A parallel runner** (TestNG threads) to run tests concurrently.
2. **Thread isolation** so those concurrent tests don't corrupt each other.

Miss either and you get either no speedup or chaos.

## Configuring TestNG parallelism

```xml
<suite name="Regression" parallel="methods" thread-count="5">
  <test name="checkout">
    <classes>
      <class name="tests.CheckoutTest"/>
    </classes>
  </test>
</suite>
```

`parallel` can be `methods`, `classes`, `tests`, or `instances`. `thread-count`
caps concurrent threads. Match `thread-count` to your available browser slots
(local cores or Grid nodes).

## Isolation: the non-negotiable part

Each thread needs its own driver. Store it in a `ThreadLocal` so page objects
and tests transparently get the right one.

```java
public final class DriverManager {
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();
    public static WebDriver get() { return DRIVER.get(); }
    public static void set(WebDriver d) { DRIVER.set(d); }
    public static void remove() { DRIVER.remove(); }
}
```

<div class="callout callout--warning">
<p class="callout__title">Shared mutable state is the enemy</p>
<p>Static fields that tests write to, a single reused login session, hardcoded
test data (same username), or ordering dependencies between tests all break
under parallelism. Each test must be able to run alone, in any order.</p>
</div>

## Test data isolation

Two threads creating "user@test.com" will collide. Generate unique data:

```java
String email = "user_" + UUID.randomUUID() + "@test.com";
```

Or allocate from a pool where each thread claims a distinct record.

## What parallelism reveals

Turning on parallel execution is a great **flakiness audit**. Tests that pass
serially but fail in parallel almost always have a hidden shared-state or data
dependency. Fixing those makes the suite more correct, not just faster.

## Common mistakes

- Sharing one WebDriver across threads (windows fight each other).
- `thread-count` higher than available browser slots — sessions just queue.
- Order-dependent tests (test B assumes test A ran first).
- Reporting/logging that isn't thread-aware, producing interleaved garbage.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Strong answer: parallelism needs a parallel runner PLUS isolation
(ThreadLocal driver, unique test data, no shared mutable state, order
independence). Note that enabling parallelism is also how you flush out hidden
flakiness.</p>
</div>

## Practice

Take a suite that passes serially, set TestNG `parallel="methods"
thread-count="4"`, and fix every test that now fails until the suite is green in
parallel.
