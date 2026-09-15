---
title: SQL Fundamentals for Testers
navTitle: SQL Fundamentals
slug: sql-fundamentals
category: sql
difficulty: beginner
order: 5
status: published
tags:
  - sql
  - fundamentals
  - queries
related:
  - title: SQL Joins
    url: /sql/joins/
  - title: Database Validation
    url: /sql/database-validation/
---

## Why this matters

Before you can validate data across tables, you need to query one table well.
SELECT, filtering, sorting, and aggregation are the daily bread of database
testing — checking that a record exists, has the right values, or that counts
match expectations. These fundamentals also anchor most SDET SQL interviews.

## SELECT: reading data

```sql
SELECT id, name, email        -- pick specific columns (avoid SELECT * in tests)
FROM users;
```

Selecting named columns (not `SELECT *`) makes your intent explicit and your
assertions stable if the schema grows.

## WHERE: filtering rows

```sql
SELECT * FROM orders
WHERE status = 'PENDING'
  AND total > 100;
```

Common operators:

| Operator | Meaning |
|---|---|
| `=` `<>` `<` `>` `<=` `>=` | comparisons |
| `AND` `OR` `NOT` | combine conditions |
| `IN (…)` | matches any in a list |
| `BETWEEN a AND b` | inclusive range |
| `LIKE 'seed_%'` | pattern match (`%` = any chars) |
| `IS NULL` / `IS NOT NULL` | null checks |

<div class="callout callout--warning">
<p class="callout__title">NULL is not equal to anything</p>
<p><code>WHERE col = NULL</code> never matches — not even NULL values. Use
<code>IS NULL</code> / <code>IS NOT NULL</code>. This trips up testers writing
data-integrity checks and quietly returns zero rows.</p>
</div>

## ORDER BY and DISTINCT

```sql
SELECT DISTINCT country        -- unique values only
FROM users
ORDER BY country ASC;          -- ASC (default) or DESC
```

## Aggregation

Aggregate functions collapse many rows into one value:

```sql
SELECT COUNT(*)        AS total_orders,
       SUM(total)      AS revenue,
       AVG(total)      AS avg_order,
       MIN(total)      AS smallest,
       MAX(total)      AS largest
FROM orders
WHERE status = 'PAID';
```

<div class="callout callout--important">
<p class="callout__title">COUNT(*) vs COUNT(col)</p>
<p><code>COUNT(*)</code> counts all rows. <code>COUNT(col)</code> counts only
rows where <code>col</code> is not NULL. The difference is a favourite interview
trap — and a real source of wrong assertions in data tests.</p>
</div>

## GROUP BY and HAVING

`GROUP BY` produces one row per group; aggregate functions then apply per group.

```sql
SELECT status, COUNT(*) AS n, SUM(total) AS revenue
FROM orders
GROUP BY status
HAVING COUNT(*) > 5;         -- filter GROUPS after aggregation
```

The key distinction testers must know:

- **`WHERE`** filters individual rows **before** grouping.
- **`HAVING`** filters groups **after** aggregation.

```sql
SELECT customer_id, COUNT(*) AS orders
FROM orders
WHERE total > 0            -- row filter first
GROUP BY customer_id
HAVING COUNT(*) >= 3;      -- then group filter
```

## Logical order of execution

Queries are written `SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY`, but
the database evaluates them roughly as:

```text
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
```

Knowing this explains why you can't reference a `SELECT` alias in `WHERE` (it
isn't computed yet) but can in `ORDER BY`.

## Common mistakes

- `SELECT *` in tests, making assertions brittle as schemas change.
- `= NULL` instead of `IS NULL`.
- Confusing `WHERE` (row filter) with `HAVING` (group filter).
- Assuming `COUNT(col)` includes NULL rows.
- Forgetting that grouped queries can only SELECT grouped columns or aggregates.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Be ready to write a grouped, filtered aggregate on the spot and to explain
WHERE vs HAVING and COUNT(*) vs COUNT(col). Bonus points for the logical
execution order — it shows you understand the engine, not just the syntax.</p>
</div>

## Practice

Write one query that returns, per order status, the count of orders and total
revenue — but only for statuses with more than 10 paid orders, sorted by revenue
descending.
