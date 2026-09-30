---
title: Design Patterns & SOLID for Test Frameworks
navTitle: Design Patterns & SOLID
slug: design-patterns
category: java
difficulty: advanced
order: 60
status: published
tags:
  - java
  - design-patterns
  - solid
  - framework
related:
  - title: Framework Architecture
    url: /framework/framework-architecture/
  - title: Driver Factory
    url: /framework/driver-factory/
---

## Why this matters

"Which design patterns have you used in your framework?" is asked in almost
every SDET interview above junior level. The good answer isn't a list of names —
it's where each pattern lives in your framework and what problem it solved.

## Singleton

**Problem:** exactly one instance of something, shared everywhere — typically
configuration.

```java
public final class ConfigReader {
    private static volatile ConfigReader instance;
    private final Properties props = new Properties();

    private ConfigReader() { /* load config.properties */ }

    public static ConfigReader getInstance() {
        if (instance == null) {
            synchronized (ConfigReader.class) {
                if (instance == null) instance = new ConfigReader(); // double-checked locking
            }
        }
        return instance;
    }
    public String get(String key) { return props.getProperty(key); }
}
```

A simpler thread-safe version uses an enum or a static holder class.

<div class="callout callout--warning">
<p class="callout__title">Don't make WebDriver a Singleton</p>
<p>A singleton driver means one browser shared by every test — it breaks parallel
execution. Config is a good singleton; the driver should be one-per-thread via
ThreadLocal. Saying this unprompted is a strong interview signal.</p>
</div>

## Factory

**Problem:** create objects without the caller knowing the concrete class. The
driver factory is the canonical example.

```java
public class DriverFactory {
    public static WebDriver create(String browser) {
        return switch (browser.toLowerCase()) {
            case "firefox" -> new FirefoxDriver();
            case "edge" -> new EdgeDriver();
            default -> new ChromeDriver();
        };
    }
}
```

Tests ask for a `WebDriver`; only the factory knows about `ChromeDriver`.

## Builder

**Problem:** construct objects with many optional fields readably — perfect for
test data and API payloads.

```java
User user = new UserBuilder()
    .name("Ada")
    .email("ada+" + System.currentTimeMillis() + "@test.com")
    .role("admin")
    .build();
```

Far clearer than a constructor with eight parameters, and defaults can live in
the builder so each test only sets what matters to it. Lombok's `@Builder`
generates this for you.

## Page Object (and Fluent Interface)

The Page Object pattern encapsulates each page's locators and actions; returning
the next page object gives a **fluent interface**:

```java
new LoginPage(driver).loginAs("u", "p").openOrders().filterBy("OPEN");
```

## Strategy

**Problem:** swap an algorithm at runtime without `if/else` chains.

```java
interface LoginStrategy { void login(WebDriver d, User u); }
class UiLogin implements LoginStrategy { ... }      // through the form
class ApiLogin implements LoginStrategy { ... }     // set a session cookie from an API token

LoginStrategy login = fastSetup ? new ApiLogin() : new UiLogin();
login.login(driver, user);
```

Other framework uses: different wait strategies, report writers, or data sources.

## Decorator

**Problem:** add behaviour around an object without changing it. Selenium 4's
`EventFiringDecorator` wraps a driver to log every action:

```java
WebDriver driver = new EventFiringDecorator<>(new LoggingListener())
    .decorate(new ChromeDriver());
```

## Facade

**Problem:** hide a complex subsystem behind a simple interface — e.g. a
`CheckoutFlow` class that calls five page objects so tests can say
`checkout.placeOrder(cart, card)`.

## SOLID, with framework examples

| Principle | Meaning | In a test framework |
|---|---|---|
| **S**ingle Responsibility | One reason to change | `LoginPage` only models login; `DriverFactory` only creates drivers |
| **O**pen/Closed | Extend without modifying | Add a new browser to the factory without touching tests |
| **L**iskov Substitution | Subtypes work wherever the parent does | Any `WebDriver` implementation works with your pages |
| **I**nterface Segregation | Small, focused interfaces | `Reporter` and `ScreenshotTaker`, not one giant `Utils` interface |
| **D**ependency Inversion | Depend on abstractions | Pages take a `WebDriver`, not a `ChromeDriver` |

## Choosing wisely

<div class="callout callout--important">
<p class="callout__title">Patterns solve problems — don't collect them</p>
<p>Add a pattern when you feel the pain it removes: a Builder when test data
constructors get unreadable, a Strategy when <code>if/else</code> on login type
spreads across tests. A framework full of patterns nobody needed is harder to
maintain, not easier.</p>
</div>

## Common mistakes

- Singleton WebDriver (breaks parallel runs).
- Naming patterns in an interview without saying where and why you used them.
- Factories that return concrete types (`ChromeDriver`) instead of `WebDriver`.
- Over-engineering: abstract factories and strategies for one implementation.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Answer "which patterns have you used?" with a mini tour of your framework:
Singleton for config, Factory for drivers, ThreadLocal for per-thread drivers,
Page Object with a fluent interface, Builder for test data. Explain one in depth
with the problem it solved. Then map two or three SOLID principles to real
classes.</p>
</div>

## Practice

Refactor a test that builds a user with an eight-argument constructor into a
Builder with sensible defaults, and replace an `if (useApi) ... else ...` login
branch repeated across tests with a `LoginStrategy`.
