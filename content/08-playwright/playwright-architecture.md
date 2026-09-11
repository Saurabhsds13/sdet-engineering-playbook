---
title: Playwright Architecture
navTitle: Playwright Architecture
slug: playwright-architecture
category: playwright
difficulty: intermediate
order: 10
status: published
tags:
  - playwright
  - architecture
  - modern
related:
  - title: Selenium vs Playwright
    url: /playwright/selenium-vs-playwright/
  - title: Explicit Waits
    url: /selenium/explicit-waits/
---

## Why this matters

Playwright has become a default choice for new web automation projects. To use
it well — and to argue credibly about when it beats Selenium — you need to
understand its architecture, because that architecture is exactly why it feels
faster and more stable.

## The model: Browser → Context → Page

```text
Browser
  └── BrowserContext (isolated, like an incognito profile)
        └── Page (a single tab)
              └── Locators
```

- **Browser** — a launched browser process (Chromium, Firefox, WebKit).
- **BrowserContext** — an isolated session: its own cookies, storage, and cache.
  Creating a fresh context is cheap and gives perfect test isolation.
- **Page** — a tab within a context.

<div class="callout callout--important">
<p class="callout__title">Contexts are the isolation superpower</p>
<p>Each test can run in its own BrowserContext without launching a new browser.
That's fast, and it means tests never leak cookies or storage into each other —
isolation is the default, not something you engineer.</p>
</div>

## Auto-waiting

Playwright waits for elements to be **actionable** (attached, visible, stable,
enabled, receives events) before acting. You rarely write explicit waits.

```javascript
// Playwright waits for the button to be actionable automatically.
await page.getByRole('button', { name: 'Place order' }).click();
```

This is the single biggest reason Playwright tests are less flaky out of the
box: the framework encodes the synchronization you'd otherwise write by hand.

## Web-first assertions

Assertions auto-retry until they pass or time out, removing another class of
race conditions:

```javascript
await expect(page.getByText('Order confirmed')).toBeVisible();
```

## Locators and roles

Playwright encourages user-facing locators that mirror how people find elements:

```javascript
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Email');
page.getByTestId('cart-count');
```

These are resilient to markup churn and align with accessibility.

## Power features built in

- **Network interception** — mock or assert on requests.
- **Tracing** — a step-by-step trace with DOM snapshots for debugging.
- **Screenshots and video** — captured automatically on failure.
- **Storage state** — save an authenticated session and reuse it, skipping login
  in every test.

```javascript
await page.route('**/api/price', route =>
  route.fulfill({ json: { price: 9.99 } }));
```

## Common mistakes

- Adding manual sleeps, defeating auto-waiting.
- Using brittle CSS/XPath instead of role/label/test-id locators.
- Reusing one context for everything, losing isolation.
- Ignoring trace/video, then debugging blind.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain Browser/Context/Page, why contexts give cheap isolation, and how
auto-waiting plus web-first assertions remove most synchronization code. Mention
tracing and storage-state reuse — they show hands-on Playwright depth.</p>
</div>

## Practice

Write a Playwright test that saves an authenticated storage state once and
reuses it across tests, and mock one network response to test an error path.
