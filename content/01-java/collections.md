---
title: Java Collections for Automation
navTitle: Collections
slug: collections
category: java
difficulty: beginner
order: 20
status: published
tags:
  - java
  - collections
  - data-structures
related:
  - title: Streams
    url: /java/streams/
  - title: OOP for SDET
    url: /java/oop-for-sdet/
---

## Why this matters

Automation code manipulates data constantly: rows from a table, values from an
API response, expected vs actual sets, test data pools. Choosing the right
collection makes assertions clear and fast. Choosing the wrong one produces
slow, order-dependent, flaky comparisons.

## The core interfaces

- **List** — ordered, allows duplicates, index access. (`ArrayList`,
  `LinkedList`)
- **Set** — no duplicates. (`HashSet`, `LinkedHashSet`, `TreeSet`)
- **Map** — key → value. (`HashMap`, `LinkedHashMap`, `TreeMap`)
- **Queue/Deque** — FIFO/LIFO processing. (`ArrayDeque`, `LinkedList`)

## Picking the right one

| Need | Use | Why |
|---|---|---|
| Ordered list, random access | `ArrayList` | O(1) get by index |
| Frequent insert/remove at ends | `ArrayDeque` | Better than LinkedList in practice |
| Unique values, don't care about order | `HashSet` | O(1) contains |
| Unique values, keep insertion order | `LinkedHashSet` | Predictable iteration |
| Sorted unique values | `TreeSet` | Natural / comparator ordering |
| Key lookup, unordered | `HashMap` | O(1) average |
| Key lookup, insertion order | `LinkedHashMap` | Great for ordered results / LRU |
| Sorted keys, range queries | `TreeMap` | `floorKey`, `ceilingKey`, submaps |

## Real automation examples

Comparing UI table values against the database — order may differ, so compare
as sets:

```java
Set<String> uiNames = new HashSet<>(getColumnValues("name"));
Set<String> dbNames = new HashSet<>(queryNames());
Assert.assertEquals(uiNames, dbNames, "UI and DB name sets differ");
```

De-duplicating while preserving first-seen order:

```java
List<String> input = List.of("a", "b", "a", "c", "b");
List<String> unique = new ArrayList<>(new LinkedHashSet<>(input));
// [a, b, c]
```

Counting occurrences (grouping flaky failures by exception type):

```java
Map<String, Integer> counts = new HashMap<>();
for (String ex : failures) {
    counts.merge(ex, 1, Integer::sum);
}
```

<div class="callout callout--important">
<p class="callout__title">Equals and hashCode</p>
<p>Sets and map keys rely on <code>equals()</code> and <code>hashCode()</code>.
If you put a custom object in a HashSet/HashMap without overriding both, it will
use identity, and lookups will silently miss. Use records or override both
together.</p>
</div>

## Thread safety

Plain `ArrayList` / `HashMap` are not thread-safe. In parallel frameworks that
share a collection across threads, use:

- `ConcurrentHashMap` for shared maps (e.g. a driver registry).
- `Collections.synchronizedList(...)` for simple synchronized wrappers.
- `CopyOnWriteArrayList` for read-heavy listener lists.

Better still: avoid sharing mutable state across threads at all (see
ThreadLocal WebDriver).

## Common mistakes

- Using `List.contains` in a loop (O(n²)) when a `HashSet` gives O(n).
- Comparing lists when order shouldn't matter — causing false failures.
- Modifying a collection while iterating it (`ConcurrentModificationException`).
- Forgetting `equals`/`hashCode` on custom keys.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>The classic "HashMap vs TreeMap vs LinkedHashMap" question is really asking
whether you choose data structures deliberately. Answer with ordering and
complexity tradeoffs, then give a concrete testing use case.</p>
</div>

## Practice

Given two lists of order IDs (UI vs API), write code that reports which IDs are
missing from each side. Choose collections that make this O(n).
