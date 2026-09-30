---
title: JVM Memory & Garbage Collection
navTitle: JVM Memory & GC
slug: jvm-memory
category: java
difficulty: advanced
order: 45
status: published
tags:
  - java
  - jvm
  - memory
  - garbage-collection
related:
  - title: Strings
    url: /java/strings/
  - title: Multithreading & Concurrency
    url: /java/multithreading/
---

## Why this matters

Large automation suites run for hours in CI with many threads and browsers.
When they slow down or die with `OutOfMemoryError`, you need to know where
objects live and why they aren't being freed. Interviewers use stack vs heap and
garbage collection to separate "uses Java" from "understands Java."

## Stack vs heap

| | Stack | Heap |
|---|---|---|
| Stores | Method frames, local primitives, references | All objects and arrays |
| Scope | Per thread | Shared by all threads |
| Lifetime | Freed when the method returns | Freed by the garbage collector |
| Size | Small | Large (set with `-Xmx`) |
| Error when full | `StackOverflowError` | `OutOfMemoryError: Java heap space` |

```java
void login() {
    int retries = 3;                      // primitive -> stack
    WebDriver driver = new ChromeDriver(); // reference on stack, object on heap
}
// when login() returns, the stack frame is gone; the ChromeDriver object
// becomes eligible for GC once nothing else references it
```

<div class="callout callout--important">
<p class="callout__title">Each thread has its own stack</p>
<p>Local variables are thread-safe because every thread gets its own stack.
Objects on the heap are shared — which is exactly why shared mutable objects
need synchronization, and why a ThreadLocal driver is safe.</p>
</div>

## Where other things live

- **String pool** — part of the heap (since Java 7).
- **Metaspace** — class metadata (replaced PermGen in Java 8); grows natively.
- **static fields** — referenced from class metadata; they live as long as the
  class is loaded, often the whole run.

## Garbage collection

The GC automatically frees heap objects that are **no longer reachable** from
any live reference (stack variables, static fields, active threads).

Key ideas:

- **Generational heap** — most objects die young. New objects go into the
  **Young Generation**; survivors are promoted to the **Old Generation**.
- **Minor GC** cleans the young generation (frequent, fast); **major/full GC**
  cleans the old generation (slower, can pause the app).
- Collectors: **G1** is the default since Java 9; ZGC and Shenandoah target very
  low pauses.
- `System.gc()` is only a *request* — the JVM may ignore it. Don't rely on it.

An object becomes eligible for GC when you set its reference to `null`, the
reference goes out of scope, or it's only reachable through other unreachable
objects.

## Memory leaks in Java

Java has a GC, but you can still leak: an object that's unused yet still
*referenced* is never collected. Common automation examples:

- **Static collections that only grow** — a static `List<String> logs` appended
  to by every test.
- **ThreadLocal never removed** — pooled threads keep old drivers alive.
- **Drivers never quit** — each `ChromeDriver` holds a browser process too.
- **Listeners/caches** holding references to test objects after the test ends.

<div class="callout callout--warning">
<p class="callout__title">quit() and remove() are memory management</p>
<p>Calling <code>driver.quit()</code> in <code>@AfterMethod(alwaysRun = true)</code>
and <code>DRIVER.remove()</code> on your ThreadLocal isn't just tidy — skipping
them is the most common cause of memory and process leaks in parallel suites.</p>
</div>

## References: strong, soft, weak

- **Strong** (normal) — never collected while reachable.
- **Soft** — collected when memory is low (simple caches).
- **Weak** — collected at the next GC if only weakly reachable (`WeakHashMap`).
- **Phantom** — for cleanup tracking; rarely used directly.

## Tuning basics for CI

```bash
java -Xms512m -Xmx2g -jar tests.jar          # initial and max heap
mvn test -DargLine="-Xmx2g"                  # via Surefire
java -XX:+HeapDumpOnOutOfMemoryError ...     # capture a heap dump on OOM
```

Analyse a heap dump with tools like Eclipse MAT or VisualVM to find what's
holding memory.

## Common mistakes

- Thinking Java can't leak memory because it has a GC.
- Calling `System.gc()` to "fix" memory issues.
- Raising `-Xmx` to hide a leak instead of finding it.
- Confusing `StackOverflowError` (deep recursion) with `OutOfMemoryError` (heap).

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Explain stack vs heap with one line of code, say when an object becomes
eligible for GC, and name the young/old generations. Then give an automation
memory-leak example — an unremoved ThreadLocal or unquit drivers — to show you've
debugged a real suite, not just read about the JVM.</p>
</div>

## Practice

Write a deliberately leaky test utility (a static list that grows every test),
run it in a loop with a small `-Xmx`, observe the `OutOfMemoryError`, then fix it
and explain why the fix works.
