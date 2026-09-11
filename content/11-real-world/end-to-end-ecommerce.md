---
title: End-to-End E-Commerce Testing
navTitle: E2E E-Commerce
slug: end-to-end-ecommerce
category: real-world
difficulty: intermediate
order: 10
status: published
tags:
  - real-world
  - e-commerce
  - scenario
  - end-to-end
related:
  - title: API Chaining
    url: /api/api-chaining/
  - title: Database Validation
    url: /sql/database-validation/
---

## The scenario

Automate a purchase flow: search for a product, add it to the cart, check out,
and confirm the order — then verify it across UI, API, and database. This is the
canonical real-world exercise because it touches every skill: locators, waits,
page objects, API setup, and full-stack validation.

## Problem

A naive script clicks through every screen via the UI, including logging in and
building cart state by hand. It's slow, flaky, and re-tests the same login and
navigation over and over.

## Approach

Push setup down to the fastest reliable layer and reserve the UI for what you're
actually verifying — the checkout experience.

```text
Login          → API (fast, reliable) or reused storage state
Cart setup     → API (add items directly)
Checkout       → UI (this is what we're testing)
Verification   → UI + API + DB
```

## Design

Model the pages, keep assertions in tests, and isolate data.

```java
// Fast setup via API, then verify the UI checkout flow.
String token = auth.login("shopper@test.com", "pw");     // API
int cartId = cart.addItem(token, SKU_LAPTOP);            // API

DashboardPage dashboard = new LoginPage(driver)
    .loginWithToken(token);                              // reuse session in UI
CheckoutPage checkout = dashboard.openCart().checkout(); // UI under test
OrderConfirmationPage confirmation = checkout
    .withCard(TEST_CARD)
    .placeOrder();

Assert.assertTrue(confirmation.isSuccessful());
String orderId = confirmation.orderId();
```

## Implementation notes

- **Waits**: use explicit waits on the confirmation state, never `Thread.sleep`.
- **Test data**: generate a unique buyer per run so parallel tests don't collide.
- **Payment**: use the sandbox/test card the payment provider supplies.
- **Isolation**: each test creates its own cart; clean up afterward.

## Full-stack verification

```java
// API confirms the order exists and its status.
order.get(token, orderId).then().statusCode(200).body("status", equalTo("PENDING"));

// DB confirms it actually persisted.
Assert.assertEquals(jdbc.queryStatus(orderId), "PENDING");
```

If the UI shows success but the DB has no order, the bug is in the write path —
the layered check pinpoints it.

## Failure cases to plan for

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>The parts that actually break: OTP/2FA on login, CAPTCHA on checkout, payment
sandbox flakiness, dynamic price/stock changing mid-flow, and a cart that
persists across tests. Each needs a deliberate strategy — bypass OTP via a test
hook, use a CAPTCHA-disabled test environment, retry only known-transient
payment errors, and reset cart state between tests.</p>
</div>

- **OTP** — request a test-mode bypass or a deterministic test code from the
  team; don't try to defeat real 2FA.
- **CAPTCHA** — should be disabled in test environments; never attempt to solve
  production CAPTCHAs.
- **Dynamic pricing/stock** — assert on the value shown at add-to-cart, not a
  hardcoded price.
- **Cart leakage** — clear the cart in setup or use a fresh session per test.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Walk the interviewer through pushing setup to the API, testing only checkout
via the UI, and verifying across UI+API+DB. Then proactively raise the real
failure cases (OTP, CAPTCHA, payment, dynamic data, cart isolation) — naming
them unprompted signals genuine experience.</p>
</div>

## Practice

Automate a checkout where login and cart setup happen via API and only the
checkout is driven through the UI, then verify the resulting order in the
database.
