---
title: OOP for SDET Engineers
navTitle: OOP for SDET
slug: oop-for-sdet
category: java
difficulty: beginner
order: 10
status: published
tags:
  - java
  - oop
  - fundamentals
related:
  - title: Collections
    url: /java/collections/
  - title: Page Object Model
    url: /framework/page-object-model/
---

## Why this matters

Every serious automation framework is an object-oriented system. Page objects,
driver factories, base test classes, utilities — they are all classes with
state and behaviour. If you understand OOP well, framework design feels
obvious. If you don't, you end up copying patterns without knowing why they
work, and your framework rots as it grows.

## The four pillars, through an automation lens

### Encapsulation

Encapsulation means bundling data with the methods that operate on it and
hiding the internals. In a page object, the locators are private
implementation details; the public methods express *intent*.

```java
public class LoginPage {
    private final WebDriver driver;
    private final By username = By.id("user");
    private final By password = By.id("pass");
    private final By submit = By.cssSelector("[type=submit]");

    public LoginPage(WebDriver driver) {
        this.driver = driver;
    }

    // Callers say what they want, not how it's done.
    public DashboardPage loginAs(String user, String pass) {
        driver.findElement(username).sendKeys(user);
        driver.findElement(password).sendKeys(pass);
        driver.findElement(submit).click();
        return new DashboardPage(driver);
    }
}
```

A test that calls `loginPage.loginAs("a", "b")` does not care about locators.
When the login markup changes, only this class changes.

### Inheritance

Inheritance models an "is-a" relationship and lets you share behaviour. A
`BaseTest` that sets up and tears down the driver is the classic example.

```java
public abstract class BaseTest {
    protected WebDriver driver;

    @BeforeMethod
    public void setUp() { driver = DriverFactory.create(); }

    @AfterMethod
    public void tearDown() { if (driver != null) driver.quit(); }
}

public class LoginTest extends BaseTest {
    @Test
    public void validLogin() { /* uses this.driver */ }
}
```

<div class="callout callout--warning">
<p class="callout__title">Prefer composition over deep inheritance</p>
<p>A one-level BaseTest is fine. Four levels of inheritance is a smell. When you
find yourself overriding to <em>remove</em> behaviour, reach for composition
(inject helpers) instead of extending.</p>
</div>

### Polymorphism

Polymorphism lets one interface work with many implementations. This is how a
framework supports multiple browsers behind a single `WebDriver` type, or
multiple report sinks behind one `Reporter` interface.

```java
WebDriver driver = useChrome ? new ChromeDriver() : new FirefoxDriver();
// The rest of the code only knows WebDriver.
driver.get("https://example.com");
```

### Abstraction

Abstraction is exposing *what* something does while hiding *how*. Interfaces
and abstract classes are the tools. `WebDriver` itself is an interface — your
tests depend on the abstraction, not on `ChromeDriver`.

## Interface vs abstract class

| | Interface | Abstract class |
|---|---|---|
| State | Constants only (until default/private methods) | Can hold fields |
| Multiple | A class can implement many | Single inheritance |
| Use when | You define a capability/contract | You share partial implementation |

In frameworks: use an **interface** for `Page` capabilities or a `Reporter`
contract; use an **abstract class** for a `BasePage`/`BaseTest` that carries
shared driver state.

## Common mistakes

- Public locators leaking out of page objects (breaks encapsulation).
- God classes: one `Utils` class doing everything.
- Inheritance used for code reuse when the relationship isn't really "is-a".
- Returning `void` from page actions instead of the next page object, losing
  fluent chaining.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>When asked to explain OOP, anchor every pillar to a framework example:
encapsulation = page object locators, polymorphism = multi-browser WebDriver,
abstraction = coding against the WebDriver interface. Concrete beats abstract.</p>
</div>

## Practice

Refactor a test with inline `driver.findElement(...)` calls into a page object
that exposes intent-revealing methods and returns the next page object.
