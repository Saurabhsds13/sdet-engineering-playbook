---
title: SQL Joins for Testers
navTitle: SQL Joins
slug: joins
category: sql
difficulty: beginner
order: 10
status: published
tags:
  - sql
  - joins
  - database
related:
  - title: Database Validation
    url: /sql/database-validation/
  - title: API Chaining
    url: /api/api-chaining/
---

## Why this matters

Data validation is a core SDET skill, and almost every meaningful check spans
more than one table: an order and its customer, a user and their roles. Joins
are how you bring that data together. Join questions are also a staple of SDET
SQL interviews.

## The join types

Given `customers` and `orders` (orders has a `customer_id`):

- **INNER JOIN** — rows that match in both tables.
- **LEFT JOIN** — all rows from the left table, matched right rows (NULLs when
  no match).
- **RIGHT JOIN** — all rows from the right table.
- **FULL OUTER JOIN** — all rows from both, matched where possible.

```sql
-- Customers and their orders (only customers who ordered)
SELECT c.name, o.id, o.total
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id;
```

```sql
-- All customers, with order info where it exists
SELECT c.name, o.id
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id;
```

## The anti-join: finding what's missing

A LEFT JOIN with an `IS NULL` filter finds rows with no match — a classic
data-integrity check.

```sql
-- Customers who have never ordered
SELECT c.*
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.customer_id IS NULL;
```

<div class="callout callout--important">
<p class="callout__title">LEFT JOIN + IS NULL = anti-join</p>
<p>This pattern answers "which records in A have no related row in B?" — orphaned
records, customers with no orders, orders with no line items. It's one of the
most-asked SQL interview questions.</p>
</div>

## GROUP BY and aggregation

Aggregate after joining to answer "how many / how much per group":

```sql
SELECT c.name, COUNT(o.id) AS order_count, COALESCE(SUM(o.total), 0) AS spent
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
HAVING COUNT(o.id) > 3;
```

`WHERE` filters rows before grouping; `HAVING` filters groups after
aggregation.

## Subqueries and CTEs

A Common Table Expression (CTE) makes multi-step queries readable:

```sql
WITH big_spenders AS (
    SELECT customer_id, SUM(total) AS spent
    FROM orders
    GROUP BY customer_id
    HAVING SUM(total) > 1000
)
SELECT c.name, b.spent
FROM big_spenders b
JOIN customers c ON c.id = b.customer_id;
```

## Common mistakes

- Using INNER JOIN when you meant LEFT, silently dropping unmatched rows.
- Filtering the right table in the `WHERE` clause of a LEFT JOIN, which turns it
  back into an inner join (put the condition in the `ON`).
- Confusing `WHERE` and `HAVING`.
- Forgetting `COALESCE` on aggregates that can be NULL.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Expect "write a query for records in A with no match in B." Answer with LEFT
JOIN + IS NULL, and be ready to also express it with NOT EXISTS. Know the
WHERE-vs-HAVING distinction cold.</p>
</div>

## Practice

Write one query that lists every product and how many times it was ordered,
including products that were never ordered (count 0), sorted by count
descending.
