---
title: Docker for Test Automation
navTitle: Docker
slug: docker
category: devops
difficulty: intermediate
order: 15
status: published
tags:
  - devops
  - docker
  - containers
  - ci
related:
  - title: Selenium Grid
    url: /selenium/selenium-grid/
  - title: GitHub Actions
    url: /devops/github-actions/
---

## Why this matters

"Works on my machine" dies with Docker. Containers give every test run the same
browser versions, drivers, and dependencies, whether on a laptop or in CI. For
SDETs, Docker is how you get reproducible environments and disposable, parallel
browsers on demand.

## The core concepts

- **Image** — an immutable blueprint (OS + tools + your app/tests).
- **Container** — a running instance of an image; disposable and isolated.
- **Dockerfile** — the recipe that builds an image.
- **Volume** — persistent or shared storage mounted into a container.
- **Network** — how containers talk to each other.

```text
Dockerfile  --build-->  Image  --run-->  Container(s)
```

## A Dockerfile for a test project

```dockerfile
FROM maven:3.9-eclipse-temurin-17

WORKDIR /tests
# Copy dependency descriptor first so layers cache well.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY . .
# Run headless in the container by default.
CMD ["mvn", "-B", "test", "-Dheadless=true"]
```

<div class="callout callout--important">
<p class="callout__title">Layer order = build speed</p>
<p>Copy <code>pom.xml</code> and resolve dependencies <em>before</em> copying
source. Docker caches layers; since dependencies change rarely, this avoids
re-downloading them every time your test code changes. Getting layer order right
is the difference between 10-second and 5-minute rebuilds.</p>
</div>

## Containerized browsers (the big win for SDETs)

You don't install Chrome and chromedriver on the CI runner — you run an official
Selenium image. This is the same pattern as a dockerized Grid:

```bash
docker run -d -p 4444:4444 --shm-size=2g selenium/standalone-chrome:4
```

Then your test points a `RemoteWebDriver` at `http://localhost:4444`.

<div class="callout callout--warning">
<p class="callout__title">Set --shm-size or Chrome will crash</p>
<p>Chrome uses <code>/dev/shm</code> (shared memory) for rendering. The default
64MB in containers is too small and causes random crashes and
<code>SessionNotCreated</code> errors. Pass <code>--shm-size=2g</code> (or mount
<code>/dev/shm</code>). This is the most common dockerized-Selenium gotcha.</p>
</div>

## Compose: a Grid with browser nodes

`docker-compose.yml` wires multiple containers together:

```yaml
services:
  hub:
    image: selenium/hub:4
    ports: ["4444:4444"]
  chrome:
    image: selenium/node-chrome:4
    shm_size: 2gb
    depends_on: [hub]
    environment:
      - SE_EVENT_BUS_HOST=hub
      - SE_EVENT_BUS_PUBLISH_PORT=4442
      - SE_EVENT_BUS_SUBSCRIBE_PORT=4443
```

```bash
docker compose up -d          # start the grid
docker compose up --scale chrome=3   # three parallel Chrome nodes
docker compose down           # tear it all down
```

## Why this matters for CI

- **Reproducibility** — the same image runs identically everywhere.
- **Isolation** — each run is a clean container; no state leaks between runs.
- **Scale** — spin up N browser nodes for parallel execution, then discard them.
- **Speed of setup** — no manual browser/driver installs on runners.

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>A very common pipeline: CI starts a dockerized Selenium Grid, runs the suite
against it with a matrix of browsers, publishes reports, then tears everything
down. The runner itself stays clean — all the browser complexity lives in
throwaway containers.</p>
</div>

## Common mistakes

- Forgetting `--shm-size`, causing flaky Chrome crashes.
- Poor layer ordering, making every build slow.
- Baking secrets into images (they live in the image layers — use env/secrets).
- Treating containers as pets: relying on state inside a container instead of
  keeping them disposable.
- Version drift between local Chrome and the container image.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain image vs container, why layer ordering matters for caching, and how
containerized Selenium images (with <code>--shm-size</code>) give reproducible,
scalable, disposable browsers in CI. The <code>--shm-size</code> detail is a
strong signal of hands-on experience.</p>
</div>

## Practice

Write a Dockerfile for your test project with cache-friendly layer ordering, then
run a dockerized Selenium standalone-chrome (with `--shm-size=2g`) and execute
one test against it via `RemoteWebDriver`.
