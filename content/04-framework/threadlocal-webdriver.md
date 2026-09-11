---
title: ThreadLocal WebDriver
navTitle: ThreadLocal WebDriver
slug: threadlocal-webdriver
category: framework
difficulty: advanced
order: 30
status: published
tags:
  - framework
  - threadlocal
  - parallel
  - webdriver
related:
  - title: ThreadLocal in Java
    url: /java/threadlocal/
  - title: Parallel Execution
    url: /selenium/parallel-execution/
---

## Why this matters

The moment you run tests in parallel, "which driver does this method use?"
becomes a real question. A `ThreadLocal<WebDriver>` answers it cleanly: each
thread gets its own driver, invisibly, so page objects and tests never pass the
driver around.

## The problem it solves

Without isolation, a shared static `WebDriver` means two parallel tests drive
the *same* browser window — clicks and navigations collide, and results are
nonsense. Passing the driver as a parameter into every method works but is
noisy and error-prone.

## The manager

```java
public final class DriverManager {
    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

    private DriverManager() {}

    public static void set(WebDriver driver) { DRIVER.set(driver); }
    public static WebDriver get() {
        WebDriver d = DRIVER.get();
        if (d == null) throw new IllegalStateException("Driver not initialized for this thread");
        return d;
    }
    public static void remove() { DRIVER.remove(); }
}
```

Page objects call `DriverManager.get()`:

```java
public class LoginPage {
    public DashboardPage loginAs(String u, String p) {
        DriverManager.get().findElement(By.id("email")).sendKeys(u);
        // ...
    }
}
```

## Lifecycle: set in setup, remove in teardown

```java
@BeforeMethod
public void setUp() { DriverManager.set(DriverFactory.create()); }

@AfterMethod(alwaysRun = true)
public void tearDown() {
    DriverManager.get().quit();
    DriverManager.remove();  // critical
}
```

<div class="callout callout--warning">
<p class="callout__title">Why remove() is not optional</p>
<p>TestNG runs tests on a thread pool and reuses threads. If you skip
<code>remove()</code>, the next test on that thread inherits the previous
(now-quit) driver, causing confusing failures and memory leaks. Always clear the
ThreadLocal in teardown.</p>
</div>

## How it maps to threads

```text
Thread-1 ──► DriverManager.get() ──► Chrome session A
Thread-2 ──► DriverManager.get() ──► Chrome session B
Thread-3 ──► DriverManager.get() ──► Chrome session C
```

Each thread's `get()` returns a different browser. No locks, no sharing.

## Common mistakes

- Non-static `ThreadLocal` field, so each object has its own and sharing breaks.
- Forgetting `remove()` → stale drivers from pooled threads.
- Initializing the driver in `@BeforeClass` while running `parallel="methods"`,
  so multiple methods share one class-level driver.
- Catching the "not initialized" case by silently creating a new driver, hiding
  a lifecycle bug.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>This is a top framework question. Nail it: static
<code>ThreadLocal&lt;WebDriver&gt;</code>, set in <code>@BeforeMethod</code>,
cleared with <code>remove()</code> in <code>@AfterMethod(alwaysRun=true)</code>,
and explain the thread-pool reuse pitfall.</p>
</div>

## Practice

Wire `DriverManager` + `DriverFactory` into a `BaseTest`, run four tests with
`parallel="methods" thread-count="4"`, and log each session id to prove the
drivers are distinct per thread.
