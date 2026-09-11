---
title: REST API Fundamentals for Testers
navTitle: REST Fundamentals
slug: rest-fundamentals
category: api
difficulty: beginner
order: 10
status: published
tags:
  - api
  - rest
  - http
related:
  - title: Rest Assured
    url: /api/rest-assured/
  - title: API Chaining
    url: /api/api-chaining/
---

## Why this matters

API tests are faster, more stable, and closer to the logic than UI tests. If
you can validate behaviour at the API layer, you should — it moves testing down
the pyramid where feedback is quick and flakiness is low.

## What REST is

REST is an architectural style for web APIs built on HTTP. Resources (users,
orders) are addressed by URLs, and you act on them with HTTP methods. Responses
are typically JSON.

## HTTP methods and their semantics

| Method | Purpose | Idempotent? |
|---|---|---|
| GET | Read a resource | Yes |
| POST | Create a resource | No |
| PUT | Replace a resource | Yes |
| PATCH | Partially update | No (usually) |
| DELETE | Remove a resource | Yes |

Idempotency matters for testing: calling GET or DELETE twice should be safe;
calling POST twice usually creates two resources.

## Status codes you must know

- **2xx success** — 200 OK, 201 Created, 204 No Content.
- **3xx redirect** — 301/302.
- **4xx client error** — 400 Bad Request, 401 Unauthorized, 403 Forbidden,
  404 Not Found, 409 Conflict, 422 Unprocessable.
- **5xx server error** — 500 Internal, 503 Unavailable.

<div class="callout callout--important">
<p class="callout__title">401 vs 403</p>
<p>401 means "I don't know who you are" (authentication missing/invalid). 403
means "I know who you are, but you're not allowed" (authorization). Testers mix
these up constantly — the distinction matters for security tests.</p>
</div>

## Anatomy of a request

- **URL** with path and query parameters: `/users/42?include=orders`
- **Headers**: `Content-Type: application/json`, `Authorization: Bearer ...`
- **Body**: the JSON payload (for POST/PUT/PATCH).

```http
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer eyJ...

{ "name": "Ada", "email": "ada@test.com" }
```

## Path vs query parameters

- **Path** identifies a resource: `/orders/1001`.
- **Query** filters/sorts/paginates: `/orders?status=open&page=2`.

## Authentication basics

- **Bearer token / JWT** — a signed token sent in the `Authorization` header.
- **OAuth 2.0** — a flow to obtain that token.
- **API key** — a shared secret in a header or query param.

For tests, obtain a token once (or per suite) and reuse it, rather than logging
in for every request.

## What to validate

Beyond the status code:

- **Schema** — the response structure (catches contract regressions).
- **Key values** — business-critical fields.
- **Headers** — content type, caching, auth.
- **Response time** — within a reasonable bound.

## Common mistakes

- Asserting only the status code and ignoring the body.
- Confusing 401 and 403.
- Hardcoding tokens that expire, causing mass failures.
- Using POST where PUT/PATCH is correct, muddying idempotency.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Be fluent in methods, status-code families, the 401-vs-403 distinction, and
the difference between path and query parameters. Then say why you'd validate
schema and key fields rather than just the status code.</p>
</div>

## Practice

For a public REST API, write down the method, URL, headers, and expected status
for create, read, update, and delete of a resource — and note what you'd assert
beyond the status code for each.
