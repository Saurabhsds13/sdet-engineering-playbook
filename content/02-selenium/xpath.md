---
title: XPath for Selenium
navTitle: XPath
slug: xpath
category: selenium
difficulty: intermediate
order: 20
status: published
tags:
  - selenium
  - xpath
  - locators
related:
  - title: Locators
    url: /selenium/locators/
  - title: Explicit Waits
    url: /selenium/explicit-waits/
---

## Why this matters

XPath is the most powerful locator language Selenium supports. It can match on
text, traverse to parents and siblings, and build dynamic expressions — things
CSS cannot do. Used well it is precise and durable; used carelessly it is the
most brittle locator of all.

## Relative vs absolute

- **Absolute** starts at the root: `/html/body/div[2]/form/input`. Any
  structural change breaks it. Avoid it.
- **Relative** starts anywhere with `//`: `//input[@id='user']`. This is what
  you should almost always write.

## The building blocks

Match by attribute:

```text
//input[@id='user']
//button[@type='submit']
//*[@data-testid='row']
```

Match by text and functions:

```text
//button[text()='Save']
//button[normalize-space()='Place order']
//a[contains(text(),'Details')]
//input[starts-with(@id,'user_')]
//div[contains(@class,'alert')]
```

<div class="callout callout--important">
<p class="callout__title">normalize-space beats text()</p>
<p><code>text()</code> is exact and breaks on stray whitespace or nested tags.
<code>normalize-space()</code> trims and collapses whitespace, so it matches
"  Place order  " and inline-wrapped text reliably.</p>
</div>

## Axes: moving through the DOM

Axes are XPath's superpower — CSS cannot walk upward.

```text
//label[text()='Email']/following-sibling::input   (the input after a label)
//td[text()='ORD-42']/parent::tr                    (the row containing a cell)
//span[@class='price']/ancestor::div[@class='card'] (climb to the card)
//li[1]/preceding-sibling::li                        (earlier siblings)
```

A very common table pattern — find the "Edit" button in the row whose name cell
says a given value:

```java
String name = "Laptop Pro";
By editInRow = By.xpath(
    "//td[normalize-space()='" + name + "']/ancestor::tr//button[@aria-label='Edit']"
);
driver.findElement(editInRow).click();
```

## Dynamic XPath

When part of an attribute is stable, match the stable part:

```text
//div[starts-with(@id,'gwt-uid-')]        (stable prefix)
//*[contains(@class,'menu-item') and contains(.,'Reports')]
```

<div class="callout callout--warning">
<p class="callout__title">Don't index your way out of a problem</p>
<p><code>(//button)[3]</code> works until someone adds a button. Prefer matching
by a meaningful attribute or text. Indices are a last resort, not a default.</p>
</div>

## Common mistakes

- Copying "Copy full XPath" from dev tools (absolute XPath).
- Using `text()` where `normalize-space()` is needed.
- Over-qualifying: `//div/div/div/span` couples you to structure.
- Building XPath by string concatenation with unescaped user input (quote
  carefully).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Interviewers love the "find the button in the row containing X" question.
Answer with an ancestor/following-sibling axis expression and explain why
axes are the reason XPath is chosen over CSS here.</p>
</div>

## Practice

For a data table, write an XPath that clicks the "Delete" icon on the row whose
first column equals a given order ID — without using positional indices.
