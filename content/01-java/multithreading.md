---
title: Multithreading & Concurrency
navTitle: Multithreading & Concurrency
slug: multithreading
category: java
difficulty: advanced
order: 48
status: published
tags:
  - java
  - concurrency
  - threads
  - parallel
related:
  - title: ThreadLocal
    url: /java/threadlocal/
  - title: Parallel Execution
    url: /selenium/parallel-execution/
---

## Why this matters

Parallel test execution is multithreading. When TestNG runs five tests at once,
five threads share your framework's code — and any shared mutable state becomes a
race condition. Understanding threads is how you build a suite that's fast *and*
reliable, and it's a standard topic in senior SDET interviews.

## Process vs thread

- A **process** is a running program with its own memory (each browser is one).
- A **thread** is a path of execution inside a process. Threads in the same JVM
  share the heap but each has its own stack.

## Creating threads

```java
// 1. Implement Runnable (preferred — separates the task from the thread)
Runnable task = () -> System.out.println("Running on " + Thread.currentThread().getName());
new Thread(task).start();

// 2. Extend Thread (less flexible: uses up your single inheritance)
class Worker extends Thread { public void run() { /* ... */ } }
```

<div class="callout callout--warning">
<p class="callout__title">start(), not run()</p>
<p><code>start()</code> creates a new thread that then calls <code>run()</code>.
Calling <code>run()</code> directly just executes the method on the current
thread — no concurrency at all. A classic interview trick question.</p>
</div>

**Runnable vs Callable:** `Runnable.run()` returns nothing and can't throw
checked exceptions; `Callable.call()` returns a value and can throw.

## Thread life cycle

```text
NEW → RUNNABLE → (BLOCKED | WAITING | TIMED_WAITING) → RUNNABLE → TERMINATED
```

- **NEW** — created, not started.
- **RUNNABLE** — running or ready to run.
- **BLOCKED** — waiting for a lock.
- **WAITING / TIMED_WAITING** — `wait()`, `join()`, `sleep(ms)`.
- **TERMINATED** — finished.

## ExecutorService: the right way to run tasks

Creating raw threads doesn't scale. A thread pool reuses a fixed number of
threads:

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
List<Future<Integer>> results = new ArrayList<>();

for (String endpoint : endpoints) {
    results.add(pool.submit(() -> callAndReturnStatus(endpoint))); // Callable
}
for (Future<Integer> f : results) {
    Assert.assertEquals(f.get(30, TimeUnit.SECONDS), 200);         // wait for each
}
pool.shutdown();
```

This is how you'd fire several API health checks at once in a test setup. TestNG
uses a pool the same way for `parallel="methods"`.

`CompletableFuture` (Java 8) adds non-blocking composition:
`supplyAsync(...).thenApply(...).join()`.

## Race conditions and synchronization

When two threads read-modify-write the same variable, updates get lost:

```java
class Counter {
    private int count = 0;
    public void increment() { count++; }             // NOT atomic: read, add, write
}
```

Fixes, from simplest:

```java
public synchronized void increment() { count++; }     // one thread at a time

private final AtomicInteger count = new AtomicInteger();
public void increment() { count.incrementAndGet(); }  // lock-free, atomic

private final ReentrantLock lock = new ReentrantLock(); // explicit lock, tryLock, fairness
```

### volatile

`volatile` guarantees that a write by one thread is **visible** to others, but
it does **not** make `count++` atomic. Use it for simple flags:

```java
private volatile boolean stopRequested;
```

## Deadlock

Two threads each hold a lock the other needs, and both wait forever. Avoid it by
always acquiring locks in the same order, holding locks briefly, or using
`tryLock` with a timeout.

## Thread-safe collections

| Instead of | Use | When |
|---|---|---|
| `HashMap` | `ConcurrentHashMap` | Shared map (e.g. a driver or result registry) |
| `ArrayList` | `CopyOnWriteArrayList` | Read-heavy, rarely modified (listeners) |
| `ArrayList` as a queue | `ConcurrentLinkedQueue` / `BlockingQueue` | Producer–consumer |

`Collections.synchronizedList(...)` works but locks the whole list on every call.

## wait/notify vs sleep

- `Thread.sleep(ms)` pauses the thread and **keeps** any locks it holds.
- `wait()` releases the lock and waits until `notify()`/`notifyAll()`; it must be
  called inside a `synchronized` block.

In test code you should rarely need either — use explicit waits for UI and
`Future.get(timeout)` or `CountDownLatch` for background work.

## What this means for parallel test suites

<div class="callout callout--realworld">
<p class="callout__title">Real world</p>
<p>Most parallel-run flakiness is a race condition in the framework, not the app:
a static WebDriver, a shared page object, a non-thread-safe report writer, or a
static "current user" field. The fixes are the same as above — no shared mutable
state, ThreadLocal for per-thread resources, concurrent collections for true
shared registries, and synchronized or atomic updates for shared counters.</p>
</div>

## Common mistakes

- Calling `run()` instead of `start()`.
- Assuming `volatile` makes compound operations atomic.
- Using a plain `HashMap` shared across TestNG threads.
- Forgetting `pool.shutdown()`, leaving threads alive after the run.
- Static mutable fields in page objects or utilities.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Cover Runnable vs Callable, start vs run, synchronized vs volatile vs Atomic,
ExecutorService, and ConcurrentHashMap. Then tie it to your suite: "parallel
TestNG runs are multithreading, so I keep drivers in ThreadLocal and avoid shared
mutable state." That connection is what interviewers want to hear from an SDET.</p>
</div>

## Practice

Write a counter incremented by 10 threads 1,000 times each. Show the wrong total
with a plain `int`, then fix it with `synchronized` and with `AtomicInteger`, and
explain why `volatile` alone doesn't fix it.
