---
title: Generics in Java
navTitle: Generics
slug: generics
category: java
difficulty: intermediate
order: 25
status: published
tags:
  - java
  - generics
  - type-safety
related:
  - title: Collections
    url: /java/collections/
  - title: Lambdas & Functional Interfaces
    url: /java/lambdas-functional-interfaces/
---

## Why this matters

Generics are why `List<WebElement>` is safe and `List` isn't. In frameworks they
let you write one reusable utility — a JSON reader, an API response wrapper, a
fluent page base class — that works for any type while still catching mistakes
at compile time.

## What generics solve

Without generics, collections hold `Object`, and every read needs a cast that can
fail at runtime:

```java
List items = new ArrayList();      // raw type
items.add("chrome");
Integer n = (Integer) items.get(0); // compiles, then ClassCastException at runtime
```

With generics, the compiler enforces the type:

```java
List<String> items = new ArrayList<>();
items.add("chrome");
String first = items.get(0);        // no cast needed
// items.add(42);                   // compile error
```

**Benefits:** compile-time type safety, no casts, reusable code.

## Generic classes

```java
public class ApiResponse<T> {
    private final int status;
    private final T body;

    public ApiResponse(int status, T body) { this.status = status; this.body = body; }
    public int status() { return status; }
    public T body() { return body; }
}

ApiResponse<User> res = new ApiResponse<>(200, user);
User u = res.body();                 // typed — no cast
```

## Generic methods

A method can declare its own type parameter, independent of the class:

```java
public static <T> T readJson(String path, Class<T> type) throws IOException {
    return new ObjectMapper().readValue(new File(path), type);
}

User user = readJson("data/user.json", User.class);
Order order = readJson("data/order.json", Order.class);
```

One method, any test-data type.

## Bounded types

Restrict what `T` can be with `extends`:

```java
public static <T extends Number> double average(List<T> values) {
    return values.stream().mapToDouble(Number::doubleValue).average().orElse(0);
}
```

A framework example — a fluent page base where every subclass returns its own
type:

```java
public abstract class BasePage<T extends BasePage<T>> {
    @SuppressWarnings("unchecked")
    public T waitUntilLoaded() { /* ... */ return (T) this; }
}
public class LoginPage extends BasePage<LoginPage> { ... }

new LoginPage().waitUntilLoaded().loginAs("u", "p"); // returns LoginPage, not BasePage
```

## Wildcards and PECS

- `List<?>` — a list of some unknown type (read as `Object`).
- `List<? extends Number>` — a **producer**: you can *read* Numbers from it, but
  can't add (except null).
- `List<? super Integer>` — a **consumer**: you can *add* Integers to it.

<div class="callout callout--important">
<p class="callout__title">PECS: Producer Extends, Consumer Super</p>
<p>If a parameter only gives you values, use <code>? extends T</code>. If it only
takes values, use <code>? super T</code>. <code>Collections.copy(List&lt;? super
T&gt; dest, List&lt;? extends T&gt; src)</code> is the textbook example.</p>
</div>

<div class="callout callout--warning">
<p class="callout__title">List&lt;Integer&gt; is not a List&lt;Number&gt;</p>
<p>Even though Integer is a Number, <code>List&lt;Integer&gt;</code> is not a
subtype of <code>List&lt;Number&gt;</code> — otherwise you could add a Double to
a list of Integers. Wildcards (<code>? extends Number</code>) are how you accept
both.</p>
</div>

## Type erasure

Generic type information exists only at compile time. After compilation,
`List<String>` and `List<Integer>` are both just `List`. Consequences:

- You can't do `new T()` or `instanceof List<String>`.
- You can't create generic arrays like `new T[10]`.
- That's why methods like `readJson` take a `Class<T>` argument — to have the
  type at runtime.

## Common mistakes

- Using raw types (`List` instead of `List<String>`), losing type safety.
- Expecting `List<Integer>` to be accepted where `List<Number>` is required.
- Trying to create `new T()` — pass a `Class<T>` or a `Supplier<T>` instead.
- Overcomplicating framework code with generics nobody else can read.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain the three benefits (type safety, no casts, reuse), write a small
generic method, and mention type erasure. PECS and the <code>List&lt;Integer&gt;
</code> vs <code>List&lt;Number&gt;</code> question show you understand generics
beyond using collections.</p>
</div>

## Practice

Write a generic `TestDataLoader.load(String file, Class<T> type)` that reads a
JSON file into any POJO, and a generic `ApiResponse<T>` wrapper that your API
tests return instead of raw Rest Assured responses.
