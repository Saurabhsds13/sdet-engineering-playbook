---
title: ThreadLocal in Java
navTitle: ThreadLocal
slug: threadlocal
category: java
difficulty: advanced
order: 50
status: published
tags:
  - java
  - concurrency
  - threadlocal
  - parallel
related:
  - title: ThreadLocal WebDriver
    url: /framework/threadlocal-webdriver/
  - title: Collections
    url: /java/collections/
---

## Why this matters

Parallel test execution is where fragile frameworks fall apart. The single most
important concurrency tool for an SDET is `ThreadLocal`, because it is how you
give each test thread its own WebDriver without passing the driver through
every method call.

## What is a ThreadLocal?

A `ThreadLocal<T>` holds a value that is **local to each thread**. Every thread
that calls `get()` sees its own independent copy. There is no sharing and thus
no need for locks.

```java
ThreadLocal<WebDriver> driver = new ThreadLocal<>();
driver.set(new ChromeDriver()); // only visible to this thread
WebDriver d = driver.get();     // this thread's driver
```

## How it works

Internally, each `Thread` has a map from `ThreadLocal` instance to value. When
you call `get()`, it reads from the *current thread's* map. That is why thread A
and thread B calling `get()` on the same `ThreadLocal` field receive different
objects.

## The classic use: a driver manager

```java
public final class DriverManager {
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

    public static void set(WebDriver driver) { DRIVER.set(driver); }
    public static WebDriver get() { return DRIVER.get(); }
    public static void remove() { DRIVER.remove(); }
}
```

Page objects and tests call `DriverManager.get()` and never worry about which
thread they're on. Ten tests can run in parallel, each with its own browser.

<div class="callout callout--warning">
<p class="callout__title">Always remove() to prevent leaks</p>
<p>Thread pools (used by TestNG) reuse threads. If you never call
<code>remove()</code>, the previous test's driver stays attached to the thread
and the next test may reuse a dead browser — or you leak memory. Call
<code>DRIVER.remove()</code> in teardown, always.</p>
</div>

## When NOT to use it

- As a substitute for passing parameters when there's no threading involved —
  it becomes hidden global state that's hard to test.
- For values that should genuinely be shared across threads (use a
  `ConcurrentHashMap` or proper synchronization instead).
- When a simple method parameter or a scoped object would be clearer.

## Common mistakes

- Forgetting `remove()` → stale drivers reused from the thread pool.
- Making the `ThreadLocal` non-static, so each instance has its own — usually
  you want one static registry.
- Assuming `@BeforeClass` runs per-thread the way `@BeforeMethod` can, leading
  to shared drivers across parallel methods.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Expect: "How do you make WebDriver thread-safe for parallel runs?" The answer
is a static <code>ThreadLocal&lt;WebDriver&gt;</code> set in setup and cleared
with <code>remove()</code> in teardown. Mention the thread-pool reuse gotcha to
show real experience.</p>
</div>

## Practice

Build a `DriverManager` with `ThreadLocal`, wire it into a `BaseTest`, and run
four tests in parallel. Verify by logging `Thread.currentThread().getName()`
and the driver's session id that each thread has a distinct driver.
