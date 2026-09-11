---
title: API Chaining and Full-Stack Validation
navTitle: API Chaining
slug: api-chaining
category: api
difficulty: intermediate
order: 30
status: published
tags:
  - api
  - chaining
  - integration
  - database
related:
  - title: Rest Assured
    url: /api/rest-assured/
  - title: Database Validation
    url: /sql/database-validation/
---

## Why this matters

Real workflows span multiple calls: create an order, then fetch it, then cancel
it. API chaining uses the output of one request as the input to the next,
letting you test whole business flows quickly and deterministically — and to
reconcile the API against the UI and database for full-stack confidence.

## The pattern

Extract a value, feed it forward:

```java
// 1. Create
int orderId = given().spec(api).body(newOrder)
    .when().post("/orders")
    .then().statusCode(201)
    .extract().path("id");

// 2. Read the created resource
given().spec(api)
    .when().get("/orders/" + orderId)
    .then().statusCode(200)
    .body("status", equalTo("PENDING"));

// 3. Act on it
given().spec(api)
    .when().post("/orders/" + orderId + "/cancel")
    .then().statusCode(200)
    .body("status", equalTo("CANCELLED"));
```

Each step depends only on data produced by the previous step, so the flow is
self-contained and repeatable.

## Managing chained test data

<div class="callout callout--important">
<p class="callout__title">Create what you need, clean up after</p>
<p>Chained tests should set up their own preconditions via the API (fast and
reliable) rather than depending on pre-existing data. Where possible, tear the
data down afterward so runs stay isolated and repeatable.</p>
</div>

## API + UI validation

A powerful pattern: perform an action via the API (fast) and verify its effect
in the UI, or vice versa.

```text
POST /cart/items  (API, fast setup)
  → open the cart page in the browser
  → assert the UI shows the item the API added
```

This isolates *where* a bug lives: if the API says the item is in the cart but
the UI doesn't show it, the defect is in the front end.

## API + UI + Database validation

For the highest confidence, reconcile all three layers:

```text
UI: user places an order
API: GET /orders/{id} returns status PENDING
DB: SELECT status FROM orders WHERE id = ? returns 'PENDING'
```

Agreement across layers means the write truly persisted; disagreement pinpoints
the failing layer.

```java
// After the UI action, verify persistence directly.
String status = jdbc.queryForString(
    "SELECT status FROM orders WHERE id = ?", orderId);
Assert.assertEquals(status, "PENDING");
```

## Common mistakes

- Hardcoding IDs that only exist in one environment.
- Chaining so tightly that one flaky step fails a long chain (keep chains
  focused).
- Leaving created data behind, so later runs collide.
- Validating only one layer when the bug is in another.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain chaining (extract → feed forward), self-created preconditions, and
the UI+API+DB reconciliation strategy that pinpoints which layer a bug lives in.
This shows you think about systems, not just endpoints.</p>
</div>

## Practice

Build a three-step chain (create → read → update) that creates its own data,
asserts the state at each step, and verifies the final state directly in the
database.
