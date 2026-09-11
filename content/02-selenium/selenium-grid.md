---
title: Selenium Grid and Remote Execution
navTitle: Selenium Grid
slug: selenium-grid
category: selenium
difficulty: advanced
order: 60
status: published
tags:
  - selenium
  - grid
  - remote
  - parallel
related:
  - title: Parallel Execution
    url: /selenium/parallel-execution/
  - title: ThreadLocal WebDriver
    url: /framework/threadlocal-webdriver/
---

## Why this matters

Running tests on one machine limits you to that machine's browsers and cores.
Selenium Grid lets you run tests across many browsers and machines in parallel,
which is how large suites finish in minutes instead of hours and how you achieve
real cross-browser coverage.

## What Grid does

Grid distributes test execution: your test talks to a **Hub** (or a Grid
endpoint), which routes the session to a **Node** that has the requested
browser. In Selenium 4 the architecture is componentized (Router, Distributor,
Session Map, Nodes) but you can still run everything as a single "standalone"
process.

```text
   Test (RemoteWebDriver)
            │
            ▼
      Grid Router
            │
   ┌────────┴────────┐
   ▼                 ▼
 Node (Chrome)    Node (Firefox)
```

## Connecting with RemoteWebDriver

Instead of `new ChromeDriver()`, you point a `RemoteWebDriver` at the Grid URL
and pass the desired browser options.

```java
ChromeOptions options = new ChromeOptions();
WebDriver driver = new RemoteWebDriver(
    new URL("http://localhost:4444/wd/hub"),
    options
);
driver.get("https://example.com");
```

The rest of your test is unchanged — it still only sees `WebDriver`. This is the
payoff of coding against the interface.

## Running Grid with Docker

The most common modern setup is containerized browsers. A minimal
`docker-compose` brings up a Grid and browser nodes:

```yaml
services:
  selenium-hub:
    image: selenium/hub:4
    ports: ["4442:4442", "4443:4443", "4444:4444"]
  chrome:
    image: selenium/node-chrome:4
    depends_on: [selenium-hub]
    environment:
      - SE_EVENT_BUS_HOST=selenium-hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
```

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>Most teams don't self-host Grid for long. They start with dockerized Grid in
CI, then move to a managed provider (or keep Grid in Kubernetes) once scale and
maintenance become a burden. The RemoteWebDriver code stays the same either
way.</p>
</div>

## Common mistakes

- Assuming Grid makes a single test faster — it enables *parallelism*, not
  per-test speed.
- Hardcoding the Grid URL instead of reading it from config, so you can't switch
  between local and remote.
- Under-provisioning nodes: more parallel threads than available browser slots
  just queues sessions.
- Forgetting that each session needs its own driver (see ThreadLocal WebDriver).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain the Hub/Node model, that RemoteWebDriver is the client, and that Grid
provides scale and cross-browser coverage rather than speeding up individual
tests. Mention dockerized nodes — it signals modern, CI-first experience.</p>
</div>

## Practice

Stand up a dockerized Grid with Chrome and Firefox nodes, then run the same test
class against both by switching only the browser option, driven from config.
