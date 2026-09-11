---
title: Maven for Automation Engineers
navTitle: Maven
slug: maven
category: devops
difficulty: beginner
order: 10
status: published
tags:
  - devops
  - maven
  - build
related:
  - title: GitHub Actions
    url: /devops/github-actions/
  - title: Jenkins
    url: /devops/jenkins/
---

## Why this matters

Maven builds your framework, resolves dependencies, and runs your tests from the
command line — which is exactly what CI does. If you understand Maven, wiring a
pipeline is trivial. If you don't, "works in my IDE, fails in CI" becomes a
recurring mystery.

## The pom.xml

The `pom.xml` declares dependencies, plugins, and configuration.

```xml
<project>
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>ui-automation</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.seleniumhq.selenium</groupId>
      <artifactId>selenium-java</artifactId>
      <version>4.25.0</version>
    </dependency>
    <dependency>
      <groupId>org.testng</groupId>
      <artifactId>testng</artifactId>
      <version>7.10.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
</project>
```

## The build lifecycle

Maven runs phases in order; running one runs all before it:

```text
validate → compile → test → package → verify → install → deploy
```

- `mvn compile` — compile main code.
- `mvn test` — run unit tests (Surefire).
- `mvn verify` — run integration tests (Failsafe).

## Surefire vs Failsafe

- **Surefire** runs unit tests in the `test` phase. A failure stops the build.
- **Failsafe** runs integration tests in `integration-test`/`verify`, and is
  designed so post-test cleanup still runs before the build fails.

Point Surefire at your `testng.xml`:

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.2.5</version>
  <configuration>
    <suiteXmlFiles>
      <suiteXmlFile>testng.xml</suiteXmlFile>
    </suiteXmlFiles>
  </configuration>
</plugin>
```

## Running from the command line

```bash
mvn clean test                          # clean, then run tests
mvn test -Dbrowser=firefox -Dheadless=true   # pass config via system props
mvn test -Dgroups=smoke                 # run a TestNG group
```

<div class="callout callout--important">
<p class="callout__title">System properties bridge config into CI</p>
<p>Reading <code>-Dbrowser</code> / <code>-Dheadless</code> in your config layer
lets the same command run locally and in CI with different settings — no code
change, just flags.</p>
</div>

## Profiles

Profiles bundle environment-specific settings (e.g. `staging` vs `prod` URLs)
activated with `-P`:

```bash
mvn test -Pstaging
```

## Common mistakes

- Forgetting to bind Surefire to `testng.xml`, so tests don't run in CI.
- Hardcoding config instead of passing `-D` system properties.
- Committing IDE run configs instead of a repeatable `mvn` command.
- Mixing unit and slow UI tests in Surefire, making every build slow.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Know the lifecycle order, Surefire vs Failsafe, how to run a TestNG suite via
Surefire, and how <code>-D</code> properties pass config into CI. This is the
bridge between "runs in my IDE" and "runs in the pipeline."</p>
</div>

## Practice

Configure Surefire to run your `testng.xml`, then run the smoke group headless
from the command line using only Maven flags.
