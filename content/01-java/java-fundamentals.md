---
title: Java Fundamentals for SDETs
navTitle: Java Fundamentals
slug: java-fundamentals
category: java
difficulty: beginner
order: 5
status: published
tags:
  - java
  - fundamentals
  - basics
related:
  - title: Strings in Java
    url: /java/strings/
  - title: OOP for SDET
    url: /java/oop-for-sdet/
---

## Why this matters

Every automation framework is only as solid as the Java underneath it. Interviews
at service and product companies both start here: data types, pass-by-value,
static vs instance, arrays. These feel basic, but candidates with years of
Selenium experience still stumble on them â€” which makes them easy marks if
you're precise.

## The Java path in this playbook

Read in order; each chapter builds on the last.

| # | Chapter | Level |
|---|---|---|
| 1 | Java Fundamentals (this page) | Beginner |
| 2 | [Strings](../strings/) | Beginner |
| 3 | [OOP for SDET](../oop-for-sdet/) | Beginner |
| 4 | [Collections](../collections/) | Beginner |
| 5 | [Generics](../generics/) | Intermediate |
| 6 | [Lambdas & Functional Interfaces](../lambdas-functional-interfaces/) | Intermediate |
| 7 | [Streams](../streams/) | Intermediate |
| 8 | [Exception Handling](../exception-handling/) | Intermediate |
| 9 | [JVM Memory & Garbage Collection](../jvm-memory/) | Advanced |
| 10 | [Multithreading & Concurrency](../multithreading/) | Advanced |
| 11 | [ThreadLocal](../threadlocal/) | Advanced |
| 12 | [Design Patterns & SOLID](../design-patterns/) | Advanced |

## JDK, JRE, JVM

- **JVM** â€” runs bytecode; makes Java platform-independent ("write once, run
  anywhere").
- **JRE** â€” JVM plus the standard libraries needed to *run* Java.
- **JDK** â€” JRE plus the compiler (`javac`) and tools needed to *build* Java.

You write `.java`, `javac` compiles it to `.class` bytecode, the JVM executes it.

## Data types

**Primitives** hold values directly; there are eight:

| Type | Size | Default | Example |
|---|---|---|---|
| `byte` | 8-bit | 0 | `byte b = 10;` |
| `short` | 16-bit | 0 | `short s = 1000;` |
| `int` | 32-bit | 0 | `int timeout = 30;` |
| `long` | 64-bit | 0L | `long ms = 5000L;` |
| `float` | 32-bit | 0.0f | `float f = 1.5f;` |
| `double` | 64-bit | 0.0 | `double price = 9.99;` |
| `char` | 16-bit | '\u0000' | `char c = 'A';` |
| `boolean` | â€” | false | `boolean ok = true;` |

**Reference types** (objects, arrays, `String`) hold a reference to an object on
the heap.

### Wrapper classes and autoboxing

Each primitive has a wrapper (`int` â†’ `Integer`). Collections only hold objects,
so Java converts automatically â€” **autoboxing** (`int` â†’ `Integer`) and
**unboxing** (`Integer` â†’ `int`).

```java
List<Integer> counts = new ArrayList<>();
counts.add(5);            // autoboxing
int first = counts.get(0); // unboxing
```

<div class="callout callout--warning">
<p class="callout__title">The Integer cache trap</p>
<p><code>Integer a = 127, b = 127;</code> gives <code>a == b</code> true, but
with 128 it's false â€” Java caches Integers from -128 to 127. Always compare
wrapper values with <code>.equals()</code>. Unboxing a <code>null</code>
Integer also throws <code>NullPointerException</code>.</p>
</div>

### Type casting

- **Widening** (implicit, safe): `int` â†’ `long` â†’ `double`.
- **Narrowing** (explicit, may lose data): `double d = 9.7; int i = (int) d;` â†’ 9.

## Operators worth knowing precisely

- `==` compares primitive values, or object *references*.
- `&&` / `||` short-circuit (the right side may not run); `&` / `|` always evaluate both.
- `i++` returns the old value, `++i` the new one.
- `%` is remainder â€” handy for even/odd and FizzBuzz-style problems.
- Ternary: `String status = passed ? "PASS" : "FAIL";`

## Control flow

```java
if (retries > 3) { ... } else if (retries > 0) { ... } else { ... }

switch (browser) {                 // modern switch expression (Java 14+)
    case "chrome" -> startChrome();
    case "firefox" -> startFirefox();
    default -> throw new IllegalArgumentException("Unknown browser: " + browser);
}

for (int i = 0; i < rows.size(); i++) { ... }   // index loop
for (WebElement row : rows) { ... }              // enhanced for
while (!page.isLoaded()) { ... }                 // condition loop
```

`break` exits a loop; `continue` skips to the next iteration.

## Methods, parameters, and pass-by-value

<div class="callout callout--important">
<p class="callout__title">Java is always pass-by-value</p>
<p>For primitives, the value is copied. For objects, the <em>reference</em> is
copied â€” so a method can change the object's contents, but reassigning the
parameter doesn't affect the caller's variable. This is one of the most-asked
Java interview questions.</p>
</div>

```java
void rename(User u) { u.setName("Ada"); }  // caller sees the new name
void replace(User u) { u = new User(); }     // caller's variable unchanged
```

**Method overloading** = same name, different parameter lists (compile-time).
**Overriding** = subclass redefines a parent method (runtime) â€” see OOP.

## static vs instance

- **Instance** members belong to each object (`this.driver`).
- **static** members belong to the class, shared by all instances
  (`Config.get("url")`, `DriverManager.get()`).
- A static method can't use instance fields directly.

```java
public class Config {
    private static final Properties PROPS = load(); // one copy for the class
    public static String get(String key) { return PROPS.getProperty(key); }
}
```

Use `static` for true utilities and shared registries; overusing static mutable
state breaks parallel test runs.

## final

- `final` variable â€” assign once (constants: `static final int TIMEOUT = 10;`).
- `final` method â€” can't be overridden.
- `final` class â€” can't be extended (`String` is final).

## Arrays

```java
int[] scores = {90, 75, 88};
String[] browsers = new String[3];         // fixed size, defaults to null
int[][] grid = new int[3][4];              // 2D array
Arrays.sort(scores);
System.out.println(Arrays.toString(scores)); // [75, 88, 90]
```

Arrays are fixed-size; use `ArrayList` when size changes. `length` is a field on
arrays, `length()` a method on Strings, `size()` a method on collections â€” a
classic trick question.

## Access modifiers

| Modifier | Class | Package | Subclass | World |
|---|---|---|---|---|
| `private` | âœ“ | | | |
| (default) | âœ“ | âœ“ | | |
| `protected` | âœ“ | âœ“ | âœ“ | |
| `public` | âœ“ | âœ“ | âœ“ | âœ“ |

In page objects, locators are `private`; the intent-revealing methods are
`public`.

## Common mistakes

- Comparing `Integer` or `String` objects with `==`.
- Thinking Java passes objects by reference.
- Mixing up `length`, `length()`, and `size()`.
- Static mutable fields shared across parallel tests.
- Integer division surprises: `5 / 2` is `2`, not `2.5`.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Expect rapid-fire: primitives vs wrappers, pass-by-value, static vs instance,
final, JDK vs JRE vs JVM, and <code>length</code> vs <code>length()</code> vs
<code>size()</code>. Short, precise answers with one automation example each
beat long definitions.</p>
</div>

## Practice

Write a small `Config` class with a `static` loader and a `static final` default
timeout, then a method that takes a `List<Integer>` of response times and returns
the average as a `double` without integer-division errors.
