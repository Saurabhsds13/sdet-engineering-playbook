---
title: Strings in Java
navTitle: Strings
slug: strings
category: java
difficulty: beginner
order: 8
status: published
tags:
  - java
  - strings
  - immutability
related:
  - title: Java Fundamentals
    url: /java/java-fundamentals/
  - title: JVM Memory & Garbage Collection
    url: /java/jvm-memory/
---

## Why this matters

Automation code is full of strings: locators, URLs, expected text, JSON
payloads, log messages. And String questions are the single most common Java
interview topic — immutability, the string pool, `==` vs `equals()`, and
`StringBuilder` vs `StringBuffer`. Get these exactly right.

## Strings are immutable

Once created, a `String` object never changes. Methods like `toUpperCase()` or
`replace()` return a **new** String.

```java
String s = "hello";
s.toUpperCase();          // result discarded — s is still "hello"
s = s.toUpperCase();      // now s points to a new object "HELLO"
```

**Why immutable?**

- **String pool** — safe to share one literal across the whole program.
- **Security** — values like URLs, file paths, and class names can't be altered
  after validation.
- **Thread safety** — immutable objects can be shared across threads freely.
- **Hashing** — the hashCode can be cached, making Strings fast `HashMap` keys.

## The string pool

String **literals** are stored once in the string pool (part of the heap).
Identical literals point to the same object. `new String(...)` always creates a
new object on the heap.

```java
String a = "chrome";
String b = "chrome";
String c = new String("chrome");

a == b;          // true  — same pooled object
a == c;          // false — different objects
a.equals(c);     // true  — same characters
c.intern() == a; // true  — intern() returns the pooled copy
```

<div class="callout callout--important">
<p class="callout__title">Always compare text with equals()</p>
<p><code>==</code> compares references and happens to work for literals, which
makes the bug intermittent. Use <code>equals()</code>, or
<code>equalsIgnoreCase()</code> for UI text, and
<code>Objects.equals(a, b)</code> when either could be null.</p>
</div>

**Interview classic:** `String s = new String("abc");` creates up to **two**
objects — the literal `"abc"` in the pool (if not already there) and a new
object on the heap.

## String vs StringBuilder vs StringBuffer

| | String | StringBuilder | StringBuffer |
|---|---|---|---|
| Mutable | No | Yes | Yes |
| Thread-safe | Yes (immutable) | No | Yes (synchronized) |
| Speed | Slow for repeated edits | Fastest | Slower than Builder |
| Use when | Fixed text | Building text in one thread | Shared across threads (rare) |

```java
// Bad: creates a new String every iteration
String report = "";
for (String r : results) report += r + "\n";

// Good
StringBuilder sb = new StringBuilder();
for (String r : results) sb.append(r).append('\n');
String report = sb.toString();
```

In practice use `StringBuilder`; `StringBuffer` is legacy.

## Methods you use every day

```java
String text = "  Order #1042 confirmed  ";
text.trim();                       // "Order #1042 confirmed"
text.strip();                      // Unicode-aware trim (Java 11+)
text.contains("confirmed");        // true
text.toLowerCase().startsWith("  order");
text.replace("#", "No. ");
text.split("\\s+");                // split on whitespace
text.substring(2, 7);              // "Order"
text.indexOf("#");                 // position or -1
text.isBlank();                    // Java 11+
String.join(", ", List.of("a", "b"));
String.format("Expected %s but got %s", exp, act);
String.valueOf(42);                // "42"
Integer.parseInt("42");            // 42
```

## Automation examples

Extract a number from UI text:

```java
String label = driver.findElement(By.id("order-msg")).getText(); // "Order #1042 confirmed"
String orderId = label.replaceAll("\\D+", "");                   // "1042"
```

Normalize before asserting, so whitespace or case doesn't cause false failures:

```java
Assert.assertEquals(actual.trim().toLowerCase(), expected.trim().toLowerCase());
```

Parse a price safely:

```java
double price = Double.parseDouble("$1,299.00".replaceAll("[^0-9.]", "")); // 1299.0
```

## Text blocks (Java 15+)

Multi-line JSON payloads for API tests without escaping:

```java
String body = """
    { "name": "Ada", "role": "admin" }
    """;
```

## Common coding questions

- Reverse a string (without `StringBuilder.reverse()`).
- Check palindrome.
- Count character frequency / first non-repeating character.
- Check anagrams.
- Count vowels, words, or occurrences of a substring.

These are all in the Interview Practice bank with model answers.

## Common mistakes

- Comparing strings with `==`.
- Calling `toUpperCase()` without assigning the result.
- String concatenation inside loops.
- `split(".")` — the argument is a regex, so escape it: `split("\\.")`.
- Calling methods on a possibly-null string (use `Objects.equals` or check first).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain immutability with its four reasons (pool, security, thread safety,
hashing), show the <code>==</code> vs <code>equals()</code> pool example, and
state when to use <code>StringBuilder</code>. Then expect a string coding
question — practise reversing and counting frequencies without an IDE.</p>
</div>

## Practice

Write a method that takes a UI message like `"3 of 25 tests failed"` and returns
the two numbers as integers, then assert them — handling extra whitespace and
mixed case safely.
