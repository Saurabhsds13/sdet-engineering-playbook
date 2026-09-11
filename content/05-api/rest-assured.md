---
title: API Testing with Rest Assured
navTitle: Rest Assured
slug: rest-assured
category: api
difficulty: intermediate
order: 20
status: published
tags:
  - api
  - rest-assured
  - java
related:
  - title: REST Fundamentals
    url: /api/rest-fundamentals/
  - title: API Chaining
    url: /api/api-chaining/
---

## Why this matters

Rest Assured is the standard Java library for API testing. Its fluent
given/when/then reads like a specification and integrates directly with TestNG,
so API and UI tests live in one framework.

## The given/when/then structure

```java
given()
    .baseUri("https://api.example.com")
    .header("Authorization", "Bearer " + token)
    .contentType(ContentType.JSON)
.when()
    .get("/users/1")
.then()
    .statusCode(200)
    .body("name", equalTo("Ada"))
    .time(lessThan(1500L));
```

`given` sets up the request, `when` fires it, `then` asserts on the response.

## Sending a body

```java
String payload = """
    { "name": "Grace", "email": "grace@test.com" }
    """;

given()
    .contentType(ContentType.JSON)
    .body(payload)
.when()
    .post("/users")
.then()
    .statusCode(201)
    .body("id", notNullValue());
```

## Extracting values

Pull data out of a response to use later (e.g. an id for the next call):

```java
int id = given().contentType(ContentType.JSON).body(payload)
    .when().post("/users")
    .then().statusCode(201)
    .extract().path("id");
```

## JSONPath for assertions

Rest Assured uses a Groovy-style JSONPath. A few patterns:

```java
.body("data.size()", equalTo(10))
.body("data[0].email", containsString("@"))
.body("data.findAll { it.active == true }.size()", greaterThan(0))
```

## Schema validation

Guard against structural regressions by validating against a JSON schema:

```java
given().get("/users/1")
    .then().statusCode(200)
    .body(matchesJsonSchemaInClasspath("schemas/user.json"));
```

<div class="callout callout--important">
<p class="callout__title">Schema first, values second</p>
<p>Schema validation catches whole classes of contract breaks (renamed fields,
type changes) in one assertion. Layer specific value checks on top for
business-critical fields.</p>
</div>

## Reusable specifications

Avoid repeating base URI, auth, and content type with a `RequestSpecification`:

```java
RequestSpecification api = new RequestSpecBuilder()
    .setBaseUri("https://api.example.com")
    .addHeader("Authorization", "Bearer " + token)
    .setContentType(ContentType.JSON)
    .build();

given().spec(api).when().get("/users/1").then().statusCode(200);
```

## Common mistakes

- Repeating base URI/auth in every test instead of a shared spec.
- Only asserting the status code.
- Logging full responses in CI (leaks tokens/PII) — log on failure only.
- Parsing JSON with brittle string operations instead of JSONPath.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Show the given/when/then flow, extracting a value to chain calls, and schema
validation. Mention shared RequestSpecification for DRY setup — it signals you've
built maintainable API suites, not one-off scripts.</p>
</div>

## Practice

Write a Rest Assured test that creates a resource with POST, extracts its id,
then GETs it and validates the response against a JSON schema.
