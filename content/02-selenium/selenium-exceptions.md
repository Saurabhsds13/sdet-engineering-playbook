---
title: Selenium Exceptions and How to Fix Them
navTitle: Selenium Exceptions
slug: selenium-exceptions
category: selenium
difficulty: intermediate
order: 40
status: published
tags:
  - selenium
  - exceptions
  - reliability
  - flaky
related:
  - title: Explicit Waits
    url: /selenium/explicit-waits/
  - title: Exception Handling
    url: /java/exception-handling/
---

## Why this matters

Selenium's exceptions are diagnostic messages, not random noise. Each one points
to a specific root cause. Learning to read them turns "the test is flaky" into
"the element wasn't clickable yet, add the right wait."

## The exceptions you'll meet most

### NoSuchElementException

The element was not in the DOM when you looked. Causes: wrong locator, or the
element hasn't rendered yet.

```java
// Fix: wait for presence instead of looking immediately.
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.presenceOfElementLocated(By.id("results")));
```

### TimeoutException

An explicit wait's condition never became true in time. The message tells you
which condition. Ask: is the timeout too short, or is the condition wrong (e.g.
waiting for visibility of something that's `display:none`)?

### StaleElementReferenceException

You held a `WebElement` reference and the DOM re-rendered, replacing that node.

```java
// Fix: re-find, or wait for a refreshed condition.
wait.until(ExpectedConditions.refreshed(
    ExpectedConditions.elementToBeClickable(By.css(".row"))));
```

### ElementClickInterceptedException

Another element (overlay, sticky header, cookie banner) is on top of your
target at click time.

```java
// Fix options: dismiss the overlay, scroll into view, or wait for it to clear.
new WebDriverWait(driver, Duration.ofSeconds(10))
    .until(ExpectedConditions.invisibilityOfElementLocated(By.css(".cookie-banner")));
driver.findElement(By.id("checkout")).click();
```

### ElementNotInteractableException

The element exists but can't receive the action — it's hidden, disabled, or has
zero size. Wait for it to be visible/enabled rather than forcing the action.

### InvalidSelectorException

Your CSS/XPath is syntactically invalid. This is a code bug, not a timing issue
— fix the selector.

<div class="callout callout--important">
<p class="callout__title">Match the wait to the exception</p>
<p>NoSuchElement → presence. NotInteractable/Intercepted → clickable/visible.
Stale → refreshed. The right ExpectedCondition is usually a direct answer to the
exception you're seeing.</p>
</div>

## A diagnosis table

| Exception | Most likely cause | First fix to try |
|---|---|---|
| NoSuchElement | Not rendered / wrong locator | `presenceOfElementLocated` |
| Timeout | Condition never true | Verify condition, raise timeout |
| Stale | DOM re-rendered | Re-find / `refreshed(...)` |
| ClickIntercepted | Overlay on top | Wait for overlay to vanish |
| NotInteractable | Hidden/disabled | `elementToBeClickable` |
| InvalidSelector | Bad syntax | Fix the selector |

## Common mistakes

- Wrapping everything in blanket try/catch + retry instead of fixing the cause.
- Using `presence` when you need `clickable` (element exists but isn't ready).
- Blaming flakiness on Selenium rather than reading the exception message.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Be able to name the top four exceptions, state the cause of each, and give
the matching ExpectedCondition. Bonus: explain why StaleElement happens (the
WebElement is a handle to a specific DOM node that was replaced).</p>
</div>

## Practice

Deliberately trigger an `ElementClickInterceptedException` with a sticky cookie
banner, then fix it two ways: by waiting for the banner to disappear, and by
scrolling the target into view.
