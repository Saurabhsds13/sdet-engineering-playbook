---
title: BDD with Cucumber
navTitle: BDD & Cucumber
slug: bdd-cucumber
category: framework
difficulty: intermediate
order: 50
status: published
tags:
  - framework
  - bdd
  - cucumber
  - gherkin
related:
  - title: Page Object Model
    url: /framework/page-object-model/
  - title: TestNG Essentials
    url: /testng/testng-essentials/
---

## Why this matters

BDD with Cucumber appears in a large share of QA job descriptions, so it's worth
being able to explain and use even if your current framework doesn't. The value
isn't the tool — it's making tests readable to non-technical people
(BAs, product owners, clients) so everyone agrees on behaviour before code exists.

## What BDD actually is

**Behaviour-Driven Development** describes features as concrete examples of
behaviour, written in plain language, agreed *before* development. Those examples
double as living documentation and as automated tests.

<div class="callout callout--important">
<p class="callout__title">BDD is a collaboration practice, not a tool</p>
<p>The real win is the conversation: BAs, developers, and testers agree on
examples up front (the "three amigos"). Cucumber just automates the examples
they agreed on. Saying this in an interview shows you understand BDD's purpose,
not only its syntax.</p>
</div>

## Gherkin: Given / When / Then

Feature files are written in **Gherkin**, a structured plain-language format.

```gherkin
Feature: Login

  Scenario: Successful login with valid credentials
    Given the user is on the login page
    When they log in as "ada@test.com" with password "correct"
    Then the dashboard is displayed
```

- **Given** — the starting context / preconditions.
- **When** — the action under test.
- **Then** — the expected outcome.
- **And** / **But** — extra steps of the previous type.

## Scenario Outline for data-driven scenarios

Run the same scenario across many inputs with an `Examples` table:

```gherkin
  Scenario Outline: Login validation
    Given the user is on the login page
    When they log in as "<email>" with password "<password>"
    Then the result should be "<result>"

    Examples:
      | email        | password | result   |
      | ada@test.com | correct  | success  |
      | ada@test.com | wrong    | error    |
      | bad-email    | correct  | error    |
```

## Step definitions: gluing Gherkin to code

Each Gherkin step maps to a Java method annotated with the matching pattern.
Step definitions should be thin — they delegate to page objects.

```java
public class LoginSteps {
    private final WebDriver driver = DriverManager.get();
    private DashboardPage dashboard;

    @Given("the user is on the login page")
    public void openLoginPage() {
        driver.get(Config.get("baseUrl") + "/login");
    }

    @When("they log in as {string} with password {string}")
    public void login(String email, String password) {
        dashboard = new LoginPage(driver).loginAs(email, password);
    }

    @Then("the dashboard is displayed")
    public void dashboardShown() {
        Assert.assertTrue(dashboard.isLoaded());
    }
}
```

<div class="callout callout--warning">
<p class="callout__title">Keep step definitions thin</p>
<p>Put Selenium/locator logic in page objects, not in step definitions. Steps
should read like the Gherkin they implement and call page methods. Fat step
definitions with raw <code>findElement</code> calls are the most common Cucumber
anti-pattern.</p>
</div>

## How a Cucumber project fits together

```text
src/test/resources/features/   login.feature      (Gherkin)
src/test/java/steps/           LoginSteps.java     (step definitions)
src/test/java/pages/           LoginPage.java      (page objects)
src/test/java/runners/         TestRunner.java     (JUnit/TestNG runner)
```

A runner ties features to steps and configures reporting:

```java
@RunWith(Cucumber.class)
@CucumberOptions(
    features = "src/test/resources/features",
    glue = "steps",
    plugin = {"pretty", "html:target/cucumber-report.html"},
    tags = "@smoke"
)
public class TestRunner { }
```

## Hooks and tags

- **Hooks** — `@Before` / `@After` methods run around each scenario (start/quit
  the driver, screenshot on failure). These are Cucumber's hooks, not TestNG's.
- **Tags** — label scenarios (`@smoke`, `@regression`) and run subsets:
  `mvn test -Dcucumber.filter.tags="@smoke"`.
- **Background** — steps common to every scenario in a feature, written once.

## Cucumber vs TestNG/JUnit — when to use BDD

<div class="callout callout--realworld">
<p class="callout__title">Real world: BDD isn't free</p>
<p>Gherkin adds a layer (feature files + step definitions + glue) on top of your
page objects. It pays off when non-technical stakeholders actually read and
help write the scenarios. If only engineers ever touch the tests, plain
TestNG/JUnit is often simpler and faster to maintain. Choose BDD for the
collaboration, not for the syntax.</p>
</div>

## Common mistakes

- Treating BDD as just "tests written with Given/When/Then" and skipping the
  collaboration that gives it value.
- Fat step definitions containing locators and waits instead of page-object calls.
- Technical, UI-specific Gherkin ("click the #submit button") instead of
  behaviour ("submit the login form").
- Duplicated step definitions because steps aren't reused or parameterized.
- Using BDD where no non-technical stakeholder ever reads the features.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Define BDD as a collaboration practice (agree examples up front) that Cucumber
automates. Explain Gherkin (Given/When/Then), Scenario Outline for data-driven
cases, thin step definitions delegating to page objects, and runner/tags/hooks.
The mature note — "use BDD when stakeholders read the scenarios, otherwise plain
TestNG may be simpler" — signals real judgment.</p>
</div>

## Practice

Write a `login.feature` with a Scenario Outline covering valid and invalid
logins, implement thin step definitions that call a `LoginPage` object, and run
only the `@smoke`-tagged scenarios from the command line.
