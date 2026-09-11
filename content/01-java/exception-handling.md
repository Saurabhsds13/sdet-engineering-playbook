---
title: Exception Handling in Automation Frameworks
navTitle: Exception Handling
slug: exception-handling
category: java
difficulty: intermediate
order: 40
status: published
tags:
  - java
  - exceptions
  - error-handling
related:
  - title: ThreadLocal in Java
    url: /java/threadlocal/
  - title: Selenium Exceptions
    url: /selenium/selenium-exceptions/
---

## Why this matters

How a framework handles failure decides how debuggable it is. Good exception
handling turns a cryptic red run into a report that tells you *what* failed and
*why* in one line. Bad handling swallows errors, hides root causes, and turns
real bugs into "just re-run it".

## Checked vs unchecked

- **Checked exceptions** (`IOException`, `SQLException`) must be declared or
  caught. The compiler forces you to acknowledge them.
- **Unchecked exceptions** (`RuntimeException` and subclasses like
  `NullPointerException`, `NoSuchElementException`) do not require handling.

Most Selenium exceptions are unchecked, which is why a missing element blows up
at runtime rather than compile time.

## The right shape of a try/catch

```java
public String readConfig(String path) {
    try (var in = Files.newInputStream(Path.of(path))) {   // try-with-resources
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException e) {
        // Add context, wrap, and rethrow — never swallow.
        throw new FrameworkException("Could not read config: " + path, e);
    }
}
```

Two things make this good: **try-with-resources** guarantees the stream is
closed, and the catch block **preserves the cause** (`e`) so the stack trace
survives.

<div class="callout callout--warning">
<p class="callout__title">The cardinal sin: swallowing exceptions</p>
<p>An empty catch block, or one that logs and continues, hides the real
failure. If a test cannot proceed, let it fail loudly with context. Silent
catches are how frameworks accumulate hidden flakiness.</p>
</div>

## Custom exceptions

A small set of framework-specific exceptions makes failures self-describing:

```java
public class FrameworkException extends RuntimeException {
    public FrameworkException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Now a config problem reads as `FrameworkException: Could not read config...`
rather than a raw `IOException` three layers deep.

## Where exception handling belongs in a framework

- **Driver setup** — fail fast with a clear message if the driver can't start.
- **Waits** — catch and translate `TimeoutException` into a message naming the
  element/condition.
- **Retries** — a listener may retry on specific, known-transient exceptions,
  but never on assertion failures.
- **Cleanup** — `@AfterMethod`/`finally` must run even when the test throws.

```java
@AfterMethod(alwaysRun = true)
public void tearDown() {
    if (driver != null) {
        try { driver.quit(); }
        catch (WebDriverException ignore) { /* browser already gone */ }
        finally { DriverFactory.remove(); }
    }
}
```

## Common mistakes

- Catching `Exception` (or `Throwable`) broadly and losing specificity.
- Retrying on `AssertionError` — that masks real product bugs.
- Logging and rethrowing the same exception at every layer (log spam).
- Not using `alwaysRun = true` on teardown, so cleanup is skipped after
  failures.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>A strong answer connects exception handling to reliability: wrap-with-context
instead of swallow, retry only known-transient exceptions (never assertions),
and guarantee cleanup with try-with-resources or alwaysRun teardown.</p>
</div>

## Practice

Write a utility that reads a JSON test-data file and throws a custom
`TestDataException` (with the file path and cause) when the file is missing or
malformed, and add a test proving the message is helpful.
