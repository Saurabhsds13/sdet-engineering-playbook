---
title: Database Validation in Automation
navTitle: Database Validation
slug: database-validation
category: sql
difficulty: intermediate
order: 20
status: published
tags:
  - sql
  - jdbc
  - database
  - validation
related:
  - title: SQL Joins
    url: /sql/joins/
  - title: API Chaining
    url: /api/api-chaining/
---

## Why this matters

The UI and API can lie — they may show cached or optimistic state. The database
is the source of truth. Validating what actually persisted, and setting up clean
test data directly in the DB, makes automation both more trustworthy and more
reliable.

## Connecting with JDBC

JDBC is the standard Java database API. Always use **try-with-resources** so
connections, statements, and result sets close even on failure.

```java
public String queryStatus(long orderId) {
    String sql = "SELECT status FROM orders WHERE id = ?";
    try (Connection conn = DriverManager.getConnection(url, user, pass);
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setLong(1, orderId);
        try (ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getString("status") : null;
        }
    } catch (SQLException e) {
        throw new FrameworkException("DB query failed for order " + orderId, e);
    }
}
```

<div class="callout callout--warning">
<p class="callout__title">Always use PreparedStatement</p>
<p>Never build SQL by concatenating values. <code>PreparedStatement</code> with
<code>?</code> placeholders prevents SQL injection and handles quoting/typing
correctly — this applies to test code too.</p>
</div>

## The three uses of the DB in testing

### 1. Validation

Confirm a write persisted after a UI or API action:

```java
Assert.assertEquals(queryStatus(orderId), "PENDING");
```

### 2. Data setup

Insert exactly the data a test needs, faster and more reliably than clicking
through the UI:

```sql
INSERT INTO users (email, active) VALUES ('seed_user@test.com', true);
```

### 3. Data cleanup

Remove what the test created so runs stay isolated (especially under
parallelism):

```sql
DELETE FROM users WHERE email LIKE 'seed_%@test.com';
```

## Full-stack reconciliation

The strongest validation checks UI, API, and DB agree:

```text
UI shows order as "Placed"
API GET /orders/{id} → status PENDING
DB SELECT status → 'PENDING'
```

If they disagree, the layer that differs is where the bug lives.

## Timing and transactions

<div class="callout callout--important">
<p class="callout__title">Beware read timing</p>
<p>An async write may not be committed the instant the UI responds. If a DB check
races the write, poll with a short timeout (a wait, not a fixed sleep) rather
than asserting immediately, and be aware of transaction isolation on your test
database.</p>
</div>

## Common mistakes

- Concatenating values into SQL (injection + quoting bugs).
- Leaking connections by not using try-with-resources.
- Leaving test data behind, causing collisions across runs.
- Reading the DB before an async write commits.
- Pointing tests at a shared/production database.

## Interview perspective

<div class="callout callout--interview">
<p class="callout__title">Interview tip</p>
<p>Cover the three uses (validate, set up, clean up), insist on
PreparedStatement + try-with-resources, and describe UI+API+DB reconciliation.
Mention async-write timing — it shows real experience with DB checks.</p>
</div>

## Practice

Write a JDBC helper that seeds a user, and a test that registers via the UI then
verifies the row exists in the database with the expected fields — cleaning up
the seeded data afterward.
