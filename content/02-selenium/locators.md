---
title: Selenium Locators
navTitle: Locators
slug: locators
category: selenium
difficulty: beginner
order: 10
status: published
tags:
  - selenium
  - locators
  - css
  - xpath
related:
  - title: XPath
    url: /selenium/xpath/
  - title: Explicit Waits
    url: /selenium/explicit-waits/
---

## Why this matters

A locator is how your test finds an element. Locators are the single biggest
source of maintenance pain: brittle ones break on every UI tweak; good ones
survive redesigns. Choosing locators well is a core reliability skill, not an
afterthought.

## The eight strategies

Selenium supports these via the `By` class:

- `By.id` — fastest and most stable when IDs are unique and static.
- `By.name` — form fields.
- `By.className` — a single class (no spaces).
- `By.tagName` — rarely specific enough on its own.
- `By.linkText` / `By.partialLinkText` — anchor text.
- `By.cssSelector` — flexible, fast, readable.
- `By.xpath` — most powerful, can traverse in any direction.

## A pragmatic priority order

1. A stable, unique `id`.
2. A dedicated test attribute (`data-testid`) via CSS.
3. A specific, meaningful `cssSelector`.
4. `xpath` when you need text matching or axis traversal.
5. Avoid absolute XPath and index-based locators.

```java
driver.findElement(By.id("checkout"));
driver.findElement(By.cssSelector("[data-testid='add-to-cart']"));
driver.findElement(By.cssSelector("nav .cart-count"));
driver.findElement(By.xpath("//button[normalize-space()='Place order']"));
```

## CSS selectors you should know

| Goal | Selector |
|---|---|
| By id | `#checkout` |
| By class | `.price` |
| Attribute | `[data-testid='row']` |
| Attribute starts-with | `[id^='user_']` |
| Descendant | `form .error` |
| Direct child | `ul > li` |
| Nth child | `tr:nth-child(2)` |

<div class="callout callout--important">
<p class="callout__title">Ask for test hooks</p>
<p>The most durable locator strategy is a <code>data-testid</code> attribute
added by developers specifically for automation. It survives CSS refactors and
copy changes. Advocating for these hooks is one of the highest-leverage things
an SDET can do.</p>
</div>

## What makes a locator brittle

- Auto-generated IDs (`id="ext-gen-4821"`) that change per session.
- Absolute XPath (`/html/body/div[3]/div[2]/...`).
- Positional selectors that break when a row is inserted.
- Deep coupling to styling classes that designers rename freely.

## CSS vs XPath

CSS is faster and more readable for most cases. XPath wins when you need to:

- match on visible **text** (`//button[text()='Save']`),
- walk **up** the DOM to a parent/ancestor,
- select by sibling relationships.

Use CSS by default; reach for XPath when the DOM structure or text demands it.

## Common mistakes

- Copying "full XPath" from browser dev tools (that's absolute XPath).
- Using `className` with a multi-class value (it only accepts one class).
- Relying on element order that the backend does not guarantee.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>"Which locator is best?" There is no single answer — but a strong candidate
gives a priority order (id → data-testid → specific CSS → XPath for text/axes)
and explains why absolute XPath and positional locators are brittle.</p>
</div>

## Practice

Take a form page and write the most robust locator you can for each field,
justifying why. Then change a wrapper class and confirm your locators still
work.
