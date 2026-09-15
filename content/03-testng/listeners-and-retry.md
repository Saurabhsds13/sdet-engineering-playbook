---
title: TestNG Listeners and Retry
navTitle: Listeners & Retry
slug: listeners-and-retry
category: testng
difficulty: intermediate
order: 20
status: published
tags:
  - testng
  - listeners
  - retry
  - reporting
related:
  - title: TestNG Essentials
    url: /testng/testng-essentials/
  - title: Flaky Test Investigation
    url: /real-world/flaky-test-investigation/
---

## Why this matters

Listeners and retry analyzers are how a framework reacts to test events without
cluttering the tests themselves. They power screenshots on failure, custom
reporting, and controlled re-runs. Used well they make failures debuggable; used
carelessly (blind retries) they hide real bugs.

## Listeners: hooking into the test lifecycle

A listener receives callbacks as tests run. The most useful is `ITestListener`.

```java
public class DiagnosticsListener implements ITestListener {
    @Override
    public void onTestFailure(ITestResult result) {
        WebDriver driver = DriverManager.get();
        Screenshots.capture(driver, result.getName());
        Logs.attachBrowserConsole(driver, result.getName());
    }

    @Override
    public void onTestStart(ITestResult result) {
        Log.info("Starting: " + result.getName());
    }
}
```

Register it globally in `testng.xml` (so every test gets it) or per-class with
`@Listeners(DiagnosticsListener.class)`:

```xml
<suite name="Regression">
  <listeners>
    <listener class-name="listeners.DiagnosticsListener"/>
  </listeners>
  <!-- tests… -->
</suite>
```

<div class="callout callout--important">
<p class="callout__title">Screenshot-on-failure belongs in a listener</p>
<p>Capturing evidence on failure is a cross-cutting concern — it should live in
one listener, not be copy-pasted into every test's catch block. This keeps tests
focused on intent and guarantees consistent diagnostics.</p>
</div>

## The listener types worth knowing

- **`ITestListener`** — test start/success/failure/skip events (most common).
- **`ISuiteListener`** — suite start/finish (global setup/teardown, reporting).
- **`IRetryAnalyzer`** — decides whether a failed test is retried.
- **`IAnnotationTransformer`** — programmatically attach a retry analyzer to
  every test (so you don't annotate each one).

## Retry analyzers

A retry analyzer re-runs a failed test up to a limit:

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int attempt = 0;
    private static final int MAX_RETRIES = 1;

    @Override
    public boolean retry(ITestResult result) {
        if (attempt < MAX_RETRIES) {
            attempt++;
            return true;   // retry once
        }
        return false;
    }
}
```

Attach it to every test automatically with an `IAnnotationTransformer` instead of
adding `retryAnalyzer = …` to each `@Test`:

```java
public class RetryTransformer implements IAnnotationTransformer {
    @Override
    public void transform(ITestAnnotation ann, Class c, Constructor m, Method method) {
        ann.setRetryAnalyzer(RetryAnalyzer.class);
    }
}
```

## The danger of retries

<div class="callout callout--warning">
<p class="callout__title">Retries hide bugs if you don't track them</p>
<p>A test that fails then passes on retry looks green — but something was wrong.
If that "something" is a real product bug that's intermittent, a blind retry
ships it. Rules: never retry <code>AssertionError</code> for correctness bugs you
can detect, keep the retry count low (1), and <strong>report every retried
test</strong> so flakiness stays visible instead of hidden.</p>
</div>

A safer analyzer only retries known-transient exceptions:

```java
@Override
public boolean retry(ITestResult result) {
    Throwable cause = result.getThrowable();
    boolean transientFailure =
        cause instanceof TimeoutException ||
        cause instanceof StaleElementReferenceException;
    return transientFailure && attempt++ < MAX_RETRIES;
}
```

This retries synchronization hiccups but lets genuine assertion failures fail
loudly.

## Listeners for reporting

`ISuiteListener` (or a reporter behind an interface) is where you hook rich
reporting — Allure, ExtentReports, or your own. Keeping reporting in a listener
means tests never call the reporter directly, preserving separation of concerns.

## Common mistakes

- Screenshot/log capture duplicated in every test instead of one listener.
- Retrying everything, including assertion failures, masking real bugs.
- High retry counts that turn a flaky suite "green" and hide the problem.
- Not reporting retries, so nobody knows how much is being papered over.
- Forgetting to register the listener in `testng.xml` (so it silently does
  nothing).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain <code>ITestListener</code> for screenshot-on-failure, and
<code>IRetryAnalyzer</code> + <code>IAnnotationTransformer</code> for
framework-wide retries. Then show judgment: retry only known-transient
exceptions, keep the count low, never retry real assertion bugs, and always
report retries. That balance is what separates senior answers.</p>
</div>

## Practice

Add a listener that screenshots on failure and a retry analyzer that retries
only `TimeoutException` once, wire both via `testng.xml` / an annotation
transformer, and add logging that makes every retry visible in the report.
