---
title: Explicit Waits in Selenium
navTitle: Explicit Waits
slug: explicit-waits
category: selenium
difficulty: intermediate
order: 30
status: published
tags:
  - selenium
  - waits
  - synchronization
related:
  - title: Selenium Exceptions
    url: /selenium/selenium-exceptions/
  - title: Why Thread.sleep is Problematic
    url: /selenium/explicit-waits/
---

## Why this matters

Most flaky Selenium tests are not broken tests. They are **synchronization
problems**. The browser and your test run in two different processes, and the
page changes asynchronously — network calls, animations, JavaScript rendering.
An explicit wait is how you tell WebDriver: *do not act until this specific
condition is true.*

<div class="callout callout--warning">
<p class="callout__title">The number one cause of flakiness</p>
<p>Somewhere between 60% and 80% of "random" UI test failures trace back to a
test acting on an element before the page was ready. Waits are not a nicety —
they are core reliability engineering.</p>
</div>

## What is an explicit wait?

An explicit wait pauses execution until a **defined condition** is met or a
timeout expires. Unlike an implicit wait (which applies globally to element
lookups), an explicit wait targets one specific expectation.

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement checkout = wait.until(
    ExpectedConditions.elementToBeClickable(By.id("checkout"))
);
checkout.click();
```

## How it works

`WebDriverWait` polls the condition repeatedly (every 500ms by default) until
one of two things happens:

1. The condition returns a truthy value — the wait returns immediately.
2. The timeout elapses — a `TimeoutException` is thrown.

This polling model is why an explicit wait that succeeds early costs almost
nothing, while `Thread.sleep(10000)` always burns the full ten seconds.

## Explicit vs implicit vs fluent

| Wait type      | Scope                     | Condition-aware | Recommended |
|----------------|---------------------------|-----------------|-------------|
| Implicit       | Global (all findElement)  | No              | Avoid mixing |
| Explicit       | Per-condition             | Yes             | Yes |
| Fluent         | Per-condition + tuning    | Yes             | For special polling/ignored exceptions |

<div class="callout callout--warning">
<p class="callout__title">Never mix implicit and explicit waits</p>
<p>Combining them produces unpredictable, compounding timeouts. Pick explicit
waits and set the implicit wait to zero.</p>
</div>

## Why Thread.sleep is problematic

`Thread.sleep` waits for a fixed duration regardless of state. It makes tests
both **slower** (you always pay the full time) and **flakier** (the guess is
wrong under load). It hides the real intent: you do not want to wait 5 seconds,
you want to wait *until the button is clickable*.

## Common mistakes

- Waiting for presence when you need clickability (`presenceOfElementLocated`
  vs `elementToBeClickable`).
- Setting timeouts too low for real network conditions.
- Re-using a stale `WebElement` reference after the DOM re-rendered.
- Wrapping every line in a wait instead of waiting on the meaningful state.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>When asked "implicit vs explicit wait," do not just define them. Explain that
explicit waits are condition-based and the preferred tool, that mixing the two
is an anti-pattern, and that <code>Thread.sleep</code> is a code smell signalling
a missing synchronization strategy.</p>
</div>

## Practice

Refactor a test that uses `Thread.sleep(5000)` before a click into an explicit
wait on `elementToBeClickable`. Measure the runtime difference across 20 runs.
