# Repro — Product Proposal

> **Production happened. Now replay it.**

**Status:** Concept  
**Type:** Open-source Developer Tool  
**Target users:** Software Engineers, QA Engineers, SRE / DevOps  
**Primary goal:** Turn production bugs into reproducible local executions and, eventually, regression tests.

---

# 1. Executive Summary

Repro is an open-source developer tool designed to solve one of the most frustrating problems in software development:

> **A bug happens in production, but nobody can reproduce it locally.**

Instead of trying to clone the entire production environment, Repro captures the **execution context** that caused a production failure and packages it into a portable **Repro Capsule**.

Developers can then replay that execution against their local code.

```text
Production Bug
      │
      ▼
Capture Execution
      │
      ▼
Repro Capsule
      │
      ▼
Replay Locally
      │
      ├── Bug reproduced
      │
      └── Execution diverged
              │
              ▼
        Show the difference
```

The fundamental product principle is:

> **Repro does not reproduce the production environment. It reproduces the production execution.**

---

# 2. Problem

## 2.1 The "Cannot Reproduce" Problem

A typical production incident may provide information such as:

```text
ERROR #1842

TypeError: Cannot read properties of undefined

POST /api/checkout

User: 18392
Trace ID: abc123
```

This tells the developer **what happened**, but often not enough to reproduce it.

The developer may still need to determine:

- What exact request triggered the error?
- What data did the database return?
- What did external APIs return?
- Which feature flags were enabled?
- What was the user's state?
- What application version was running?
- What was the system time?
- What happened in dependent services?
- Was the bug caused by a specific ordering or timing?

The result is a debugging loop like:

```text
Production Bug
      ↓
Read logs
      ↓
Inspect traces
      ↓
Guess the state
      ↓
Try locally
      ↓
Cannot reproduce
      ↓
Ask for more information
      ↓
Guess again
      ↓
Deploy
      ↓
Hope
```

---

# 3. Existing Observability Is Not Enough

Observability tools answer questions such as:

> What happened?

They provide:

- logs
- traces
- metrics
- stack traces
- request information
- timestamps
- service information

But developers still need to answer:

> **Can I make the same execution happen again?**

This is where Repro fits.

```text
Observability
"What happened?"

        +

Repro
"Can I replay what happened?"
```

Repro is therefore not intended to replace observability platforms.

It adds a **reproducibility layer** on top of production diagnostics.

---

# 4. Key Product Insight

A naive approach would be:

```text
Production
    ↓
Copy production environment
    ↓
Run locally
```

This is not practical.

Production and local environments are fundamentally different:

```text
Production
────────────────────────────
Kubernetes
20 API replicas
PostgreSQL cluster
Redis
Kafka
External APIs
Cloud infrastructure
Feature flags
Secrets
        │
        ▼
       BUG
────────────────────────────

Developer Local
────────────────────────────
Docker
1 API
Local PostgreSQL
Local Redis
Mock services
────────────────────────────
```

Trying to reproduce the entire environment creates enormous complexity.

Therefore Repro uses a different abstraction:

> **Capture the execution, not the environment.**

---

# 5. Core Concept: Execution Replay

An application execution can be viewed as:

```text
HTTP Request
     ↓
Authentication
     ↓
Feature Flags
     ↓
Database Reads
     ↓
Cache Reads
     ↓
External APIs
     ↓
Business Logic
     ↓
Response
```

When a production bug occurs, Repro captures the relevant external inputs.

For example:

```text
Production Execution

HTTP Request
     ↓
DB Query → Result A
     ↓
Redis → Result B
     ↓
Tax API → Response C
     ↓
Feature Flag → true
     ↓
Application Code
     ↓
💥 BUG
```

During local replay:

```text
Local Application

HTTP Request
     ↓
Recorded DB Result A
     ↓
Recorded Redis Result B
     ↓
Recorded Tax API Response C
     ↓
Recorded Feature Flag
     ↓
Developer's Code
     ↓
💥 BUG
```

The local application is not running inside production.

It is simply receiving the same relevant inputs that the production execution received.

---

# 6. Repro Capsule

The captured execution is packaged into a portable artifact called a **Repro Capsule**.

Example:

```text
repro-1842/
├── manifest.json
├── request.json
├── environment.json
├── feature-flags.json
├── database/
│   ├── query-001.json
│   └── query-002.json
├── network/
│   ├── tax-api.json
│   └── payment-api.json
└── metadata.json
```

A capsule may contain:

- original request
- relevant database query results
- external API responses
- feature flag state
- relevant environment metadata
- timestamps
- application version
- Git commit
- runtime information

The capsule should contain **only the information necessary to reproduce the execution**.

It should not be a copy of the production environment.

---

# 7. Example

Suppose production runs:

```javascript
async function checkout(userId) {
  const user = await db.users.find(userId);
  const coupon = await db.coupons.find(user.couponId);

  const tax = await taxAPI.calculate(user.address);

  return calculateDiscount(user, coupon, tax);
}
```

Production data:

```text
user.couponId = 9182

coupon #9182 = null

tax API = {
  tax: 0
}
```

The code eventually executes:

```javascript
coupon.discount
```

and crashes.

Locally, however:

```text
coupon #9182 = {
  discount: 10
}
```

So the bug cannot be reproduced.

Repro records:

```text
db.users.find(18392)
→ production result

db.coupons.find(9182)
→ null

taxAPI.calculate(...)
→ { tax: 0 }
```

During replay, the local application receives those recorded results.

The same execution path can therefore be reproduced without accessing production.

---

# 8. Developer Experience

The ideal developer workflow should be extremely simple.

## Step 1 — Production captures the incident

```text
BUG-1842

Checkout failed.

Repro Capsule available.
```

## Step 2 — Developer retrieves it

```bash
repro pull 1842
```

## Step 3 — Developer replays it

```bash
repro replay 1842
```

Output:

```text
Replaying BUG-1842...

✓ Request
✓ Database inputs
✓ External API responses
✓ Feature flags
✓ Clock
✓ Application metadata

💥 BUG REPRODUCED
```

## Step 4 — Developer fixes the code

## Step 5 — Developer verifies the fix

```bash
repro verify 1842
```

Output:

```text
BUG-1842

Before fix:
✗ reproduced

After fix:
✓ execution no longer reproduces
```

---

# 9. Execution Diff

Reproduction will not always succeed.

The local environment may behave differently from production.

Instead of simply returning:

```text
Could not reproduce.
```

Repro should explain **where the execution diverged**.

Example:

```text
⚠️ Execution diverged

1. Database query

   Production → coupon = null
   Local      → coupon = { discount: 10 }

2. Tax API

   Production → tax = 0
   Local      → tax = 12.43

3. Feature flag

   Production → new_checkout = true
   Local      → new_checkout = false
```

This is a key product capability.

Repro can still provide value even when the bug cannot be reproduced.

The product becomes:

> **"Show me what was different between production and my environment."**

---

# 10. Execution Verification

Repro should not simply verify that a replay completed.

It should determine whether the execution was sufficiently equivalent.

Example:

```text
Production
──────────────
DB result: null
tax: 0
flag: true
execution path: A → B → C

Local
──────────────
DB result: null
tax: 0
flag: true
execution path: A → B → C

✓ Execution matched
```

If the execution differs:

```text
⚠️ Execution diverged

Production:
A → B → C

Local:
A → B → D
```

This prevents a dangerous situation where Repro says "replay succeeded" even though the application did not actually follow the same execution path.

---

# 11. Database Strategy

Database reproduction is one of the hardest technical areas.

The MVP should **not attempt to copy the production database**.

Instead, the initial approach should be **record/replay of database results**.

Production:

```sql
SELECT *
FROM coupons
WHERE id = 9182;
```

Result:

```text
null
```

Repro records that result.

During replay:

```text
Local Application
       ↓
Database Query
       ↓
Repro Replay Layer
       ↓
Recorded Production Result
       ↓
Application
```

This avoids requiring production database access.

A future version may support minimal database snapshots for cases where query-result replay is insufficient.

---

# 12. External API Strategy

The same model applies to external APIs.

Production:

```text
POST /tax

Response:
{
  "tax": 0
}
```

Local:

```text
POST /tax

Real response:
{
  "tax": 12.43
}
```

Repro replaces the real response during replay:

```text
Production
    │
    ▼
External API
    │
    ▼
Record Response
    │
    ▼
Repro Capsule
    │
    ▼
Local Replay
```

The application therefore sees the same response it saw in production.

---

# 13. Side Effects

Replaying production must never accidentally repeat dangerous side effects.

Examples:

```text
Charge credit card
Send email
Create shipment
Send webhook
Delete record
Publish Kafka event
```

Repro therefore needs to distinguish between:

```text
READ
────
SELECT
GET
Cache read

WRITE
─────
INSERT
UPDATE
DELETE
POST payment
Publish event
```

During replay:

```text
READ
→ return recorded result

WRITE
→ do not execute against real production systems
→ return recorded result
```

This must be a core safety mechanism.

---

# 14. Microservices

Modern applications often consist of multiple services:

```text
Checkout Service
       │
       ├── User Service
       ├── Pricing Service
       ├── Payment Service
       ├── Inventory Service
       └── Tax Service
```

Repro should not require developers to run the entire production architecture locally.

Instead, service boundaries can become replay boundaries.

Example:

```text
                 Local Checkout
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      Recorded      Recorded      Recorded
      User API      Tax API       Pricing API
      response      response      response
```

The developer runs the service under investigation while Repro replays its dependencies.

---

# 15. Code Version

Production may run:

```text
Git commit: 8f31ac2
```

while local code is:

```text
Git commit: 92ab381
```

Repro should record:

```text
Application version
Git commit
Runtime version
Dependency versions
Schema version
```

If the code differs:

```text
⚠️ Code mismatch

Bug occurred on:
8f31ac2

Your local code:
92ab381

Replay may not be deterministic.
```

A future version may support:

```bash
repro replay 1842 --checkout
```

to automatically check out the production commit.

---

# 16. Security & Privacy

This is a critical part of the product.

Repro may capture:

- user data
- authentication information
- database results
- HTTP headers
- API responses
- internal service data

Therefore the system must support:

## Automatic Redaction

```yaml
redaction:
  headers:
    - authorization
    - cookie

  fields:
    - password
    - access_token
    - credit_card
```

## PII Anonymization

```text
john@example.com
        ↓
user-1842@example.test
```

## Encryption

Capsules should support encryption at rest.

## Self-hosting

Organizations should be able to run Repro entirely inside their own infrastructure.

---

# 17. Core Product Flow

```text
                    PRODUCTION
                         │
                         ▼
                ┌─────────────────┐
                │ Repro Recorder  │
                │                 │
                │ HTTP            │
                │ DB              │
                │ Redis           │
                │ External APIs   │
                │ Feature Flags   │
                │ Clock           │
                └────────┬────────┘
                         │
                         ▼
                  Repro Capsule
                         │
                         │ pull
                         ▼
                ┌─────────────────┐
                │ Replay Runtime  │
                └────────┬────────┘
                         │
                         ▼
                   Local App
                         │
                         ▼
                ┌─────────────────┐
                │ Execution Diff  │
                └────────┬────────┘
                         │
                  ┌──────┴──────┐
                  ▼             ▼
               Matched       Diverged
                  │             │
                  ▼             ▼
              Reproduced     Explain
```

---

# 18. MVP Scope

## Target

Start with:

> **Node.js + PostgreSQL + HTTP applications**

This intentionally limits the scope to make the core hypothesis testable.

## MVP capabilities

### Capture

- HTTP request
- stack trace
- database query/result
- external HTTP response
- feature flag state
- clock/timestamp
- Git commit
- runtime metadata

### Replay

- HTTP request replay
- database result replay
- external API replay
- clock replay
- safe side-effect handling

### Analysis

- execution verification
- execution diff
- code/version mismatch detection

### CLI

```bash
repro list
repro pull 1842
repro inspect 1842
repro replay 1842
repro diff 1842
repro verify 1842
```

---

# 19. MVP Non-Goals

The following should explicitly be out of scope for V0.1:

- Full production environment cloning
- Full production database snapshots
- Browser replay
- Kubernetes orchestration
- Kafka replay
- Distributed race-condition replay
- Multi-language support
- AI root-cause analysis
- Automatic code fixes
- Enterprise billing
- Large observability dashboard

The MVP should answer one question:

> **Can we reliably capture and replay a meaningful class of production executions?**

---

# 20. Major Risks

## 20.1 Insufficient Execution Capture — Critical

An application execution can depend on more than HTTP, database and API responses.

Potential hidden inputs include:

```text
Environment variables
Filesystem state
Randomness
System clock
Process state
Concurrency
Network behavior
OS behavior
Background jobs
```

If these are not captured, replay may fail.

### Mitigation

Limit the MVP to a clearly defined class of deterministic request/response executions.

Do not promise to reproduce every possible production bug.

---

## 20.2 Non-Determinism — Critical

Examples:

```text
Random numbers
UUIDs
Timestamps
Scheduling
Concurrency
Race conditions
```

A production bug may only happen under a specific timing or random value.

### Mitigation

Initial support:

- clock capture/replay
- UUID capture where practical
- deterministic external inputs

Defer complex scheduler/race-condition replay to future versions.

---

## 20.3 Replay Without True Equivalence — Critical

A replay may complete successfully while following a different execution path.

This creates false confidence.

### Mitigation

Make **Execution Verification** a core feature.

Repro should distinguish:

```text
Replay completed
```

from:

```text
Execution matched
```

---

## 20.4 Side Effects — Critical

Replay could accidentally send:

- payments
- emails
- webhooks
- database writes
- events

### Mitigation

Default-deny write behavior during replay.

Recorded responses should be returned instead of executing real side effects.

---

## 20.5 Sensitive Production Data — Critical

Captured data may contain:

- PII
- credentials
- tokens
- financial information
- internal data

### Mitigation

- redaction
- anonymization
- encryption
- configurable retention
- self-hosting
- strict access control

---

## 20.6 Security Attack Surface — Critical

Repro has access to highly sensitive production execution data.

A compromised Repro storage or collector could expose production information.

### Mitigation

Prefer:

```text
Production
    ↓
Private Recorder
    ↓
Encrypted Capsule
    ↓
Private Storage
```

rather than requiring production data to be sent to a public SaaS by default.

---

## 20.7 Production Performance Overhead — High

Instrumentation can increase:

- latency
- CPU usage
- memory usage
- network traffic

### Mitigation

- asynchronous capture
- bounded buffers
- sampling
- configurable capture limits
- capture only failed/high-value executions

Principle:

> **Repro must never become the reason production becomes slower or fails.**

---

## 20.8 Version Drift — High

Production and local may differ in:

- Git commit
- runtime
- dependencies
- OS
- database version

### Mitigation

Capture environment metadata and warn about mismatches.

---

## 20.9 Database Schema Drift — High

Production and local may use different schema versions.

### Mitigation

Capture schema/migration version and expose mismatch during replay.

---

## 20.10 External Dependency Drift — High

External services can change behavior between production and local replay.

### Mitigation

Use recorded responses for supported external dependencies.

---

## 20.11 Replay Boundary — High

In a distributed architecture it may be unclear what should be replayed and what should actually run.

Example:

```text
Checkout
 ├── User
 ├── Pricing
 ├── Inventory
 └── Payment
```

If everything is mocked, replay becomes deterministic but less realistic.

If nothing is mocked, local setup becomes too complex.

### Mitigation

Define explicit replay boundaries around service dependencies.

---

## 20.12 Capsule Size — High

Large requests, database results, file uploads and binary data can create very large capsules.

### Mitigation

- compression
- deduplication
- content hashing
- size limits
- selective capture
- lazy loading

---

## 20.13 Race Conditions — Critical but Out of Scope

Some bugs depend on precise concurrency and event ordering.

A simple request replay will not reproduce them reliably.

### Mitigation

Defer advanced concurrency replay.

Future versions may use distributed tracing, event ordering and scheduling information.

---

## 20.14 Developer Adoption — Critical Product Risk

Developers may perceive Repro as:

> "Another observability SDK."

Or:

> "This looks complicated to install."

If integration requires significant infrastructure, adoption will suffer.

### Mitigation

The first experience should be extremely simple:

```bash
npm install @repro/node
```

```javascript
repro.init()
```

Then the developer should be able to capture the first replayable execution with minimal configuration.

---

## 20.15 Product Scope Explosion — Critical

The concept can easily expand into:

```text
APM
+
Distributed tracing
+
Network proxy
+
Database proxy
+
Container runtime
+
Artifact storage
+
Test framework
+
Browser automation
```

This would make the project too large.

### Product boundary

A feature should be considered only if it directly improves:

> **Capture → Replay → Verify**

Everything else should come later.

---

## 20.16 False Confidence About Fixes — Critical

A successful replay only proves that:

> **This captured execution no longer fails.**

It does not necessarily prove that every production manifestation of the bug has been eliminated.

For example, a race condition may still exist.

### Mitigation

Use precise language:

```text
✓ Captured execution no longer reproduces
```

rather than:

```text
✓ Production bug is definitely fixed
```

---

## 20.17 Compliance / Legal — High

Depending on the customer, captured production data may involve:

- GDPR
- HIPAA
- PCI DSS
- SOC 2
- internal security policies

### Mitigation

Support:

- data retention policies
- deletion
- encryption
- audit logs
- redaction
- self-hosting
- data residency where required

---

# 21. Risk Matrix

| Risk | Severity | MVP? | Mitigation |
|---|---|---:|---|
| Insufficient execution capture | 🔴 Critical | Yes | Narrow execution scope |
| Replay non-determinism | 🔴 Critical | Yes | Deterministic inputs |
| False replay equivalence | 🔴 Critical | Yes | Execution verification |
| Side effects | 🔴 Critical | Yes | Default-deny writes |
| Sensitive data | 🔴 Critical | Yes | Redaction + encryption |
| Security exposure | 🔴 Critical | Yes | Private/self-hosted architecture |
| False confidence | 🔴 Critical | Yes | Explicit replay semantics |
| Developer adoption | 🔴 Critical | Yes | Minimal integration |
| Race conditions | 🔴 Critical | No | Future |
| Production overhead | 🟠 High | Yes | Async + bounded capture |
| Version drift | 🟠 High | Yes | Version metadata |
| Schema drift | 🟠 High | Yes | Schema metadata |
| External dependency drift | 🟠 High | Yes | Recorded responses |
| Replay boundary | 🟠 High | Yes | Explicit service boundaries |
| Capsule size | 🟠 High | Yes | Compression + limits |
| Compliance | 🟠 High | Yes | Policies + self-hosting |
| OSS business model | 🟡 Medium | Later | Define after product validation |
| Compatibility matrix | 🟡 Medium | Yes | Narrow initial support |

---

# 22. Technical Validation Before MVP

Before investing in a full product, build a small technical spike.

The goal is **not** to build the product.

The goal is to answer:

> **Can a production execution be captured and deterministically replayed?**

## Test Application

Node.js:

```text
POST /checkout
```

Dependencies:

```text
PostgreSQL
Redis
External HTTP API
Feature flag
System clock
```

Create test scenarios:

```text
1. Database state causes bug
2. External API response causes bug
3. Feature flag causes bug
4. Time-dependent bug
5. Missing data
6. Dependency/version difference
7. Randomness
8. Side effect
9. Async behavior
10. Race condition
```

For each scenario:

```text
Production-like execution
        ↓
Capture
        ↓
Create Repro Capsule
        ↓
Destroy original environment
        ↓
Run local application
        ↓
Replay
        ↓
Verify execution
```

---

# 23. Validation Metrics

The technical spike should measure:

### Replay Success Rate

```text
Successfully reproduced
─────────────────────────
Total test cases
```

### Execution Match Rate

```text
Equivalent executions
──────────────────────
Total replays
```

### Capture Overhead

```text
CPU
Memory
Latency
Network
```

### Capsule Size

```text
Average capsule size
P95 capsule size
```

### Replay Time

```text
Time from:

repro replay

to:

execution result
```

---

# 24. Proposed Initial Success Threshold

A potential validation target:

```text
≥ 80% meaningful deterministic test cases reproduced

< 5% production latency overhead

< 10 MB average capsule size

< 30 seconds replay time
```

These numbers should be treated as **initial hypotheses**, not final product commitments.

If the spike cannot achieve a useful replay rate on a meaningful class of bugs, the product concept should be reconsidered before building the full platform.

---

# 25. Killer Demo

The product should be understandable in a 60–90 second demo.

## 1. Production

```text
ERROR #1842

Checkout failed.
```

## 2. Developer

```text
"I can't reproduce this locally."
```

## 3. Repro

```bash
repro replay 1842
```

## 4. Result

```text
Replaying...

✓ Request
✓ Database inputs
✓ External APIs
✓ Feature flags
✓ Application version

💥 BUG REPRODUCED
```

## 5. Developer fixes the code

## 6. Verify

```bash
repro verify 1842
```

Result:

```text
BUG-1842

✓ Execution replayed
✓ Original failure no longer occurs
✓ Regression case generated
```

This demo communicates the value proposition without requiring a large dashboard or complicated infrastructure.

---

# 26. Future Roadmap

## V0.1 — Validate the Core

- Node.js
- PostgreSQL
- HTTP
- Production capture
- Repro Capsule
- Local replay
- External API replay
- Execution verification
- Execution diff
- CLI

## V0.2 — Developer Workflow

- GitHub integration
- GitHub Actions
- Regression test generation
- Browser replay
- Better data anonymization
- Replay visualization
- Next.js support

## V0.3 — Distributed Systems

- Python
- Go
- Redis
- Kafka
- Background jobs
- Distributed tracing
- Multi-service replay

## Future

- Minimal database snapshots
- Race-condition replay
- Automatic environment reconstruction
- AI root-cause analysis
- AI-generated regression tests
- AI-generated fixes
- Automatic GitHub PR generation

---

# 27. AI Opportunity

AI should be treated as a layer on top of Repro, not the core product.

Once a structured execution is available, AI can analyze it.

Example:

```bash
repro explain 1842
```

Possible output:

```text
Root Cause

The checkout service assumes coupon.discount
is always defined.

Production returned:

coupon = null

The condition became possible after commit
8f31ac2 introduced nullable coupons.

Suggested fix:
Validate coupon before calculating discount.

Suggested regression test:
BUG-1842
```

Potential AI capabilities:

- root cause analysis
- execution diff explanation
- relevant commit identification
- suggested fix
- regression test generation
- GitHub issue generation
- pull request generation

However, these features should come **after the replay engine is proven reliable**.

---

# 28. Open Source Strategy

Repro is a strong candidate for open source because production execution data is highly sensitive.

Organizations may prefer:

```text
Self-hosted
    ↓
Production
    ↓
Private Repro infrastructure
```

rather than:

```text
Production
    ↓
Third-party SaaS
```

Potential OSS core:

```text
Repro SDK
Recorder
Replay Runtime
Capsule Format
CLI
Basic Self-hosting
```

Potential commercial layer:

```text
Hosted storage
Team management
Access control
Retention policies
Analytics
Enterprise security
AI analysis
Cloud integrations
```

The commercial model should only be defined after validating developer adoption and the core replay capability.

---

# 29. Product Positioning

Repro should not position itself as:

> "Another monitoring platform."

Instead:

> **Repro is a production reproducibility tool.**

Simple positioning:

```text
Observability
"What happened?"

Repro
"Can I replay it?"
```

Or:

> **Observability tells you what happened. Repro lets you replay it.**

---

# 30. Developer Journey

## Without Repro

```text
Production Bug
      ↓
Logs
      ↓
Traces
      ↓
Investigate
      ↓
Guess state
      ↓
Try locally
      ↓
Cannot reproduce
      ↓
More investigation
      ↓
Fix
      ↓
Deploy
      ↓
Hope
```

## With Repro

```text
Production Bug
      ↓
Repro Capsule
      ↓
repro replay
      ↓
Execution reproduced
      ↓
Inspect execution
      ↓
Fix
      ↓
repro verify
      ↓
Regression test
```

---

# 31. North Star Metric

Proposed North Star Metric:

> **Number of production bugs successfully converted into deterministic local test cases.**

Example:

```text
Monthly

2,431 production bugs captured
1,827 successfully replayed
1,203 converted into regression tests
```

This metric directly represents the value created by the product.

---

# 32. Supporting Metrics

### Activation

```text
Installation
    ↓
First successful replay
```

### Replay Success Rate

```text
Successful replays
───────────────────
Captured executions
```

### Time to Reproduce

Compare:

```text
Before Repro
Hours / Days

vs.

With Repro
Minutes
```

### Regression Conversion

```text
Production bugs
      ↓
Reproduced bugs
      ↓
Regression tests
```

### OSS Adoption

- GitHub stars
- forks
- contributors
- package downloads
- active installations
- active developers
- integrations

---

# 33. Product Principles

## 1. Replay execution, not infrastructure

Do not attempt to clone production.

## 2. Developer-first

The primary interface should be a simple CLI.

```bash
repro replay 1842
```

## 3. Explain failure

If replay fails, show how production and local executions differ.

## 4. Privacy by default

Production data should always be treated as sensitive.

## 5. Determinism over magic

The system should explain exactly what was captured and replayed.

## 6. Safe by default

Replay must never accidentally trigger production side effects.

## 7. Narrow before broad

Support a small class of bugs reliably before attempting to support every production scenario.

---

# 34. What Repro Is Not

Repro is not intended to replace:

- Sentry
- Datadog
- APM systems
- logging platforms
- testing frameworks
- CI/CD systems

Instead, it complements them.

A typical workflow could eventually become:

```text
Sentry / APM
      │
      │ incident
      ▼
    Repro
      │
      │ replay
      ▼
 Developer
      │
      │ fix
      ▼
 Regression Test
      │
      ▼
     CI
```

---

# 35. One-Liner

> **Repro turns production bugs into reproducible local executions.**

---

# 36. Tagline

> **Production happened. Now replay it.**

---

# 37. Key Hypothesis

The core product hypothesis is:

> **If developers can capture a failed production execution and replay it locally with the same relevant inputs, the time required to diagnose and fix production bugs will decrease significantly.**

The MVP should therefore optimize for one outcome:

```text
Production Bug
      ↓
Successful Local Replay
      ↓
Understand
      ↓
Fix
      ↓
Regression Test
```

---

# 38. Questions for PM Review

Before moving into implementation, the following questions should be validated.

### Product

1. Is production → local reproduction a sufficiently painful problem to justify a dedicated tool?
2. Is "Execution Replay" a compelling enough value proposition for developers?
3. Is Execution Diff valuable enough to be a core feature?

### Scope

4. Which initial stack should be supported?
    - Node.js + PostgreSQL
    - Python + PostgreSQL
    - Other

5. Should V0.1 support only failed executions?
6. Should manual recording also be supported?

### Technical

7. What percentage of real-world production bugs can realistically be replayed?
8. What is the minimum execution context required to achieve a useful replay success rate?
9. Where should the replay boundary sit for microservices?

### Security

10. What production data can safely be captured?
11. What should be redacted by default?
12. Is self-hosting required from day one?

### Adoption

13. What is the minimum integration effort that developers will accept?
14. Can a developer install and create their first replay within minutes?

### Business

15. Should Repro remain fully open source initially?
16. What capabilities, if any, should eventually become commercial?

---

# 39. Recommended Next Step

Do **not** start by building the full Repro platform.

First build a technical spike that validates the core loop:

```text
Production-like execution
        ↓
Capture
        ↓
Repro Capsule
        ↓
Local Replay
        ↓
Execution Verification
        ↓
Same execution?
```

The most important question to answer is:

> **Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?**

If the answer is **yes**, proceed to MVP.

If the answer is **no**, identify which classes of bugs cannot be replayed and narrow the product scope accordingly.

---

# 40. Final Product Thesis

Repro is not trying to make developers run production on their laptops.

It is trying to make a production execution **portable**.

```text
Production
─────────────
"This happened."
       │
       │ capture
       ▼
Repro Capsule
─────────────
"This is everything
needed to understand
the execution."
       │
       │ replay
       ▼
Local
─────────────
"Make it happen again."
       │
       ▼
Reproduce → Understand → Fix → Test
```

> **The fundamental promise of Repro is simple:**
>
> **When production breaks, developers should be able to replay what happened instead of guessing what happened.**
