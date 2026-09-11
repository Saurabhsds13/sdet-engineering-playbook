---
title: TestNG Essentials for SDETs
navTitle: TestNG Essentials
slug: testng-essentials
category: testng
difficulty: beginner
order: 10
status: published
tags:
  - testng
  - annotations
  - framework
related:
  - title: Framework Architecture
    url: /framework/framework-architecture/
  - title: Parallel Execution
    url: /selenium/parallel-execution/
---

## Why this matters

TestNG is the backbone of most Java automation frameworks. It controls the test
lifecycle, grouping, parameterization, parallelism, and reporting. Knowing it
well is the difference between a pile of `main` methods and a real suite.

## The lifecycle annotations

Ordered from outermost to innermost:

```text
@BeforeSuite → @BeforeTest → @BeforeClass → @BeforeMethod → @Test → @AfterMethod → ...
```

```java
public class LoginTest {
    @BeforeMethod
    public void setUp() { driver = DriverFactory.create(); }

    @Test
    public void validLogin() {
        Assert.assertTrue(new LoginPage(driver).loginAs("u", "p").isLoaded());
    }

    @AfterMethod(alwaysRun = true)
    public void tearDown() { driver.quit(); }
}
```

<div class="callout callout--important">
<p class="callout__title">Use alwaysRun on teardown</p>
<p>Without <code>alwaysRun = true</code>, a failure in a configuration method can
skip your <code>@AfterMethod</code>, leaking browser processes. Cleanup must run
no matter what.</p>
</div>

## Assertions: hard vs soft

A hard `Assert` stops the test on first failure. `SoftAssert` collects failures
and reports them all at `assertAll()` — useful when you want to check several
independent things in one test.

```java
SoftAssert softly = new SoftAssert();
softly.assertEquals(page.title(), "Dashboard");
softly.assertTrue(page.hasWelcomeBanner());
softly.assertAll(); // reports every failure together
```

## Data-driven tests with DataProvider

```java
@DataProvider(name = "logins")
public Object[][] logins() {
    return new Object[][] {
        {"valid@test.com", "correct", true},
        {"valid@test.com", "wrong", false}
    };
}

@Test(dataProvider = "logins")
public void login(String user, String pass, boolean expectSuccess) {
    boolean ok = new LoginPage(driver).loginAs(user, pass).isLoaded();
    Assert.assertEquals(ok, expectSuccess);
}
```

## Groups, dependencies, and priorities

```java
@Test(groups = "smoke")
public void homepageLoads() { }

@Test(dependsOnMethods = "homepageLoads")
public void search() { }
```

Groups let you run subsets (`smoke`, `regression`) from `testng.xml`. Use
`dependsOnMethods` sparingly — heavy dependency chains create fragile,
order-coupled suites.

## Listeners and retries

`ITestListener` and `IRetryAnalyzer` hook into events. A retry analyzer can
re-run a failed test, and a listener can capture a screenshot on failure.

```java
public class RetryAnalyzer implements IRetryAnalyzer {
    private int count = 0;
    private static final int MAX = 1;
    public boolean retry(ITestResult result) {
        return count++ < MAX;   // retry once
    }
}
```

<div class="callout callout--warning">
<p class="callout__title">Retries are a safety net, not a fix</p>
<p>A retry that turns red to green is hiding a real cause — usually a
synchronization bug. Track retried tests and burn them down; never let retries
silently mask product defects.</p>
</div>

## testng.xml

The suite file wires everything: which classes/packages run, parameters, groups,
parallelism, and listeners.

```xml
<suite name="Regression" parallel="classes" thread-count="4">
  <listeners><listener class-name="listeners.ScreenshotListener"/></listeners>
  <test name="checkout">
    <groups><run><include name="regression"/></run></groups>
    <packages><package name="tests.checkout"/></packages>
  </test>
</suite>
```

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Know the annotation order cold, the difference between hard and soft
assertions, how DataProvider enables data-driven tests, and why retries should
be tracked rather than trusted. These come up constantly.</p>
</div>

## Practice

Convert three near-duplicate login tests into one `@Test` driven by a
`@DataProvider`, and add a listener that screenshots on failure.
