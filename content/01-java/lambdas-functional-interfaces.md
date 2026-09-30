---
title: Lambdas, Functional Interfaces & Optional
navTitle: Lambdas & Functional Interfaces
slug: lambdas-functional-interfaces
category: java
difficulty: intermediate
order: 28
status: published
tags:
  - java
  - java8
  - lambdas
  - functional
  - optional
related:
  - title: Streams
    url: /java/streams/
  - title: Generics
    url: /java/generics/
---

## Why this matters

Java 8 changed how Java is written, and Selenium code uses it constantly:
`wait.until(d -> d.findElement(...))` is a lambda, `ExpectedCondition` is a
functional interface, and streams depend on both. "What's new in Java 8?" is a
standard interview question — this chapter covers everything except streams,
which have their own chapter.

## Lambda expressions

A lambda is a short way to write an implementation of a single-method interface.

```java
// Before Java 8: anonymous class
Comparator<String> byLength = new Comparator<>() {
    @Override public int compare(String a, String b) { return a.length() - b.length(); }
};

// Java 8+: lambda
Comparator<String> byLength = (a, b) -> a.length() - b.length();
```

Syntax: `(parameters) -> expression` or `(parameters) -> { statements; }`.

## Functional interfaces

A **functional interface** has exactly one abstract method, so a lambda can
implement it. Mark it with `@FunctionalInterface` so the compiler enforces that.

The built-ins you should know:

| Interface | Method | Shape | Example |
|---|---|---|---|
| `Predicate<T>` | `test(T)` | T → boolean | `s -> s.isBlank()` |
| `Function<T,R>` | `apply(T)` | T → R | `WebElement::getText` |
| `Consumer<T>` | `accept(T)` | T → void | `el -> el.click()` |
| `Supplier<T>` | `get()` | () → T | `() -> new ChromeDriver()` |
| `BiFunction<T,U,R>` | `apply(T,U)` | (T,U) → R | `(a, b) -> a + b` |
| `UnaryOperator<T>` | `apply(T)` | T → T | `String::trim` |

### In Selenium you already use them

```java
// ExpectedCondition<T> is essentially Function<WebDriver, T>
WebElement btn = wait.until(d -> d.findElement(By.id("pay")));

// A Supplier as a driver factory
Map<String, Supplier<WebDriver>> drivers = Map.of(
    "chrome", ChromeDriver::new,
    "firefox", FirefoxDriver::new
);
WebDriver driver = drivers.get(browser).get();
```

That `Map<String, Supplier<WebDriver>>` replaces a whole `switch` statement —
a clean, interview-worthy use of functional interfaces.

## Method references

A shorter lambda when you're just calling an existing method:

| Kind | Syntax | Equivalent lambda |
|---|---|---|
| Static method | `Integer::parseInt` | `s -> Integer.parseInt(s)` |
| Instance method of an object | `System.out::println` | `x -> System.out.println(x)` |
| Instance method of a type | `WebElement::getText` | `el -> el.getText()` |
| Constructor | `ChromeDriver::new` | `() -> new ChromeDriver()` |

## Default and static methods in interfaces

Java 8 lets interfaces contain method bodies:

```java
public interface Page {
    boolean isLoaded();                       // abstract
    default void assertLoaded() {             // default: inherited, overridable
        if (!isLoaded()) throw new AssertionError(getClass().getSimpleName() + " not loaded");
    }
    static void log(String m) { System.out.println(m); } // static helper
}
```

Default methods were added so existing interfaces (like `Collection`) could gain
new methods (like `stream()`) without breaking every implementation.

## Optional

`Optional<T>` makes "might be empty" explicit instead of returning `null`.

```java
Optional<WebElement> banner = driver.findElements(By.id("promo")).stream().findFirst();

banner.ifPresent(WebElement::click);                 // act only if present
String text = banner.map(WebElement::getText).orElse("none");
WebElement el = banner.orElseThrow(() -> new AssertionError("promo banner missing"));
```

<div class="callout callout--warning">
<p class="callout__title">Optional anti-patterns</p>
<p>Don't call <code>optional.get()</code> without checking — that just moves the
NullPointerException. Don't use Optional for fields or method parameters; it's
meant for return values. Prefer <code>orElse</code>, <code>orElseThrow</code>,
<code>map</code>, and <code>ifPresent</code>.</p>
</div>

## Effectively final

A lambda can use local variables from the surrounding method only if they're
**effectively final** (never reassigned).

```java
int timeout = 10;
Runnable r = () -> System.out.println(timeout); // ok
// timeout = 20;                                 // would make the lambda above fail to compile
```

## The Date/Time API (java.time)

Java 8 replaced the error-prone `Date`/`Calendar` with immutable, thread-safe
classes — useful for test data and date-picker tests:

```java
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusDays(7);
String formatted = nextWeek.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
Duration timeout = Duration.ofSeconds(10);      // what WebDriverWait takes
```

## Other Java 8+ features worth naming

- **Streams** — see the next chapter.
- **`var`** (Java 10) — local type inference: `var list = new ArrayList<String>();`
- **Records** (Java 16) — concise immutable data classes: `record User(String name, int age) {}`
- **Switch expressions** (Java 14) and **text blocks** (Java 15).

## Common mistakes

- Calling `Optional.get()` without a presence check.
- Long, multi-line lambdas that should be named methods.
- Trying to modify a local variable inside a lambda.
- Using `java.util.Date` in new code instead of `java.time`.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>For "What's new in Java 8?", list lambdas, functional interfaces, method
references, streams, Optional, default/static interface methods, and
<code>java.time</code>. Then connect it to Selenium: <code>wait.until(d -&gt;
...)</code> is a lambda and <code>ExpectedCondition</code> is a functional
interface. That link is what makes the answer stand out.</p>
</div>

## Practice

Replace a `switch`-based driver factory with a `Map<String, Supplier<WebDriver>>`,
and write a method that returns `Optional<String>` for an element's text that may
not exist, used with `orElse("N/A")`.
