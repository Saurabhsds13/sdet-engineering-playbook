---
title: Driver Factory Pattern
navTitle: Driver Factory
slug: driver-factory
category: framework
difficulty: intermediate
order: 20
status: published
tags:
  - framework
  - factory
  - design-pattern
  - webdriver
related:
  - title: ThreadLocal WebDriver
    url: /framework/threadlocal-webdriver/
  - title: Framework Architecture
    url: /framework/framework-architecture/
---

## Why this matters

Tests should not know how to build a browser. A Driver Factory centralizes
driver creation so switching browsers, adding headless mode, or pointing at a
remote Grid is a one-place change instead of a find-and-replace across the
codebase.

## The Factory pattern, applied

The Factory pattern encapsulates object creation behind a method. For drivers,
it reads configuration and returns a ready `WebDriver`.

```java
public final class DriverFactory {
    private DriverFactory() {}

    public static WebDriver create(String browser, boolean headless) {
        switch (browser.toLowerCase()) {
            case "firefox":
                FirefoxOptions ff = new FirefoxOptions();
                if (headless) ff.addArguments("-headless");
                return new FirefoxDriver(ff);
            case "chrome":
            default:
                ChromeOptions cr = new ChromeOptions();
                if (headless) cr.addArguments("--headless=new");
                return new ChromeDriver(cr);
        }
    }
}
```

Tests just ask for a driver; they never mention `ChromeDriver` directly.

## Reading configuration

The browser and mode come from config, not hardcoded values, so the same suite
runs locally and in CI:

```java
String browser = Config.get("browser", "chrome");
boolean headless = Boolean.parseBoolean(Config.get("headless", "false"));
WebDriver driver = DriverFactory.create(browser, headless);
```

<div class="callout callout--important">
<p class="callout__title">Local vs remote in one factory</p>
<p>Extend the factory to return a <code>RemoteWebDriver</code> when a Grid URL is
configured, and a local driver otherwise. Tests stay identical; only config
changes between your laptop and CI.</p>
</div>

## Combining with ThreadLocal for parallel runs

The factory creates drivers; a `ThreadLocal` manager stores the per-thread
instance. Keep these responsibilities separate.

```java
@BeforeMethod
public void setUp() {
    DriverManager.set(DriverFactory.create(browser, headless));
}

@AfterMethod(alwaysRun = true)
public void tearDown() {
    WebDriver d = DriverManager.get();
    if (d != null) d.quit();
    DriverManager.remove();
}
```

## Common mistakes

- Building drivers inline in every test (defeats the purpose).
- Mixing driver creation and storage into one tangled class.
- Forgetting `--headless=new` (the modern Chrome headless flag) and using the
  deprecated form.
- Not making the factory return `WebDriver` (the interface), coupling callers to
  a concrete class.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain that the factory centralizes creation and reads config so browser
and headless mode are runtime choices. Then separate creation (factory) from
storage (ThreadLocal manager) — interviewers like to see clean responsibility
boundaries.</p>
</div>

## Practice

Write a `DriverFactory` that supports Chrome and Firefox, headless via config,
and a remote Grid URL when present — returning `WebDriver` in every case.
