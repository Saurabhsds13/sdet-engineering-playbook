---
title: The Page Object Model
navTitle: Page Object Model
slug: page-object-model
category: framework
difficulty: intermediate
order: 10
status: published
tags:
  - framework
  - pom
  - design-pattern
  - maintainability
related:
  - title: Framework Architecture
    url: /framework/framework-architecture/
  - title: OOP for SDET
    url: /java/oop-for-sdet/
---

## Why this matters

The Page Object Model (POM) is the pattern that keeps UI automation
maintainable. It puts all the knowledge about a page — its locators and the
actions you can take — in one class, so a UI change touches one file instead of
fifty tests.

## The core idea

A page object represents a page (or a meaningful component) as a class:

- **Locators** are private fields.
- **Actions** are public methods that express user intent.
- **Assertions live in tests**, not in page objects.

```java
public class LoginPage {
    private final WebDriver driver;
    private final By email = By.id("email");
    private final By password = By.id("password");
    private final By submit = By.cssSelector("[type=submit]");

    public LoginPage(WebDriver driver) { this.driver = driver; }

    public DashboardPage loginAs(String user, String pass) {
        driver.findElement(email).sendKeys(user);
        driver.findElement(password).sendKeys(pass);
        driver.findElement(submit).click();
        return new DashboardPage(driver);
    }
}
```

A test reads like a user story:

```java
DashboardPage dashboard = new LoginPage(driver).loginAs("u@test.com", "pw");
Assert.assertTrue(dashboard.isLoaded());
```

<div class="callout callout--important">
<p class="callout__title">Return the next page object</p>
<p>An action that navigates should return the page it lands on. This "fluent"
style makes tests read as a flow and lets the compiler catch impossible
sequences.</p>
</div>

## Page Factory (and why many skip it)

Selenium's `PageFactory` initializes `@FindBy` fields lazily:

```java
@FindBy(id = "email") private WebElement email;
public LoginPage(WebDriver driver) { PageFactory.initElements(driver, this); }
```

It's concise, but the lazy proxies can obscure staleness handling and it's less
flexible than plain `By` fields. Many modern frameworks prefer explicit `By`
locators for clarity. Either is acceptable — be consistent.

## Component objects

For repeated UI pieces (a header, a data grid, a modal), model them as
**component objects** and compose them into pages. This avoids duplicating the
header's locators across every page.

```java
public class DashboardPage {
    private final Header header;
    public DashboardPage(WebDriver driver) { this.header = new Header(driver); }
    public Header header() { return header; }
}
```

## What does NOT belong in a page object

- Assertions (`Assert.*`) — those are the test's job.
- Test data or business logic.
- Waits scattered everywhere — encapsulate them, but keep methods focused on
  intent.

<div class="callout callout--warning">
<p class="callout__title">The bloated page object anti-pattern</p>
<p>A single page object with 60 methods and assertions inside is a POM in name
only. Split by component, keep methods intent-revealing, and keep assertions
out.</p>
</div>

## Common mistakes

- Exposing `WebElement` or `By` publicly, leaking implementation.
- Putting `Assert` calls inside page methods.
- One giant page object for a whole SPA instead of components.
- Returning `void` from navigation actions, losing the fluent flow.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Define POM as encapsulating locators + actions per page with assertions kept
in tests. Mention component objects for reuse and the fluent return-the-next-page
style. Be ready to critique a "page object" that has assertions inside it.</p>
</div>

## Practice

Model a login and dashboard page as page objects with a shared `Header`
component, and write a test that logs in and asserts the header shows the
username — with the assertion in the test, not the page object.
