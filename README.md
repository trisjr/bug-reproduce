<div align="center">

# Repro

### **Production happened. Now replay it.**

**Repro turns production bugs into reproducible local executions.**

[![Stage](https://img.shields.io/badge/stage-V0.1%20Core%20Engine-brightgreen)](#-project-status)
[![Tests](https://img.shields.io/badge/tests-111%20passing-brightgreen)](#-testing--fidelity-benchmark)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](https://nodejs.org)
[![Target stack](https://img.shields.io/badge/target-Node.js%20%C2%B7%20PostgreSQL%20%C2%B7%20HTTP-informational)](#-scope-v01)
[![Docs](https://img.shields.io/badge/docs-25k%20lines-8a2be2)](./docs/000-Index.md)

</div>

---

> [!NOTE]
> **Repro V0.1 is implemented.** The core engine, in-process capture SDK, deterministic local replay runtime, two-tier verification diff engine, and unified CLI are implemented across 5 monorepo packages with 100% test coverage (111 tests in 24 suites). See [Project status](#-project-status).

---

## The problem

A bug happens in production. Nobody can reproduce it locally.

Your observability stack hands you this:

```text
ERROR #1842
TypeError: Cannot read property 'discount' of null
POST /api/checkout
User: 18392
Trace ID: abc123
```

Now answer these, from memory and guesswork:

| ? | The question you actually need answered |
|---|---|
| 1 | Which exact request triggered it? |
| 2 | What did the database return **at that moment**? |
| 3 | What did the external API respond? |
| 4 | Which feature flags were on? |
| 5 | What state was that user in? |
| 6 | Which version was running? |
| 7 | What was the system clock? |
| 8 | What happened in the downstream service? |
| 9 | Was it order- or timing-dependent? |

You try to guess your way to a local repro. You seed some data. You run it. Nothing happens. You try again.

The loop ends in exactly one word: **hope**.

### Observability is not the gap

Logs, traces, metrics and stack frames answer **"what happened?"** — brilliantly. They were never designed to answer the question that actually unblocks you:

> ### **"Can I make that same execution happen again?"**

That is a different problem, and nothing in the Node.js ecosystem solves it today. Repro is not another monitoring platform, and it does not replace Sentry, Datadog, an APM, a logging platform, a testing framework or your CI. It adds a **reproducibility layer** on top of the diagnostics you already have.

> **Observability tells you what happened. Repro lets you replay it.**

---

## The key insight

The obvious idea is to clone production. It does not work:

| Production | Local |
|---|---|
| Kubernetes, 20 API replicas | Docker, 1 API |
| PostgreSQL cluster | Local PostgreSQL |
| Redis, Kafka | Local Redis |
| Live external APIs | Mock services |
| Cloud infra, secrets, flags | `.env` |

Cloning that produces enormous complexity and still does not reproduce the bug — because the bug was never caused by the *infrastructure*. It was caused by the *inputs that execution received*.

So Repro uses a different abstraction:

> ## 🎯 **Capture the execution, not the environment.**

---

## How it works

Repro records the **boundary** of a failing execution — every value that crossed into your code from the outside — and packages it into a portable artifact called a **Repro Capsule**. You replay that capsule locally, *after the original environment is gone*, and your application walks the same path with the same inputs.

```text
                    PRODUCTION
                         │
                         ▼
                ┌─────────────────┐
                │ @repro/node SDK │
                │ (Zero-Dep)      │
                │ HTTP            │
                │ DB              │
                │ External APIs   │
                │ Feature Flags   │
                │ Clock           │
                └────────┬────────┘
                         │
                         ▼
                  Repro Capsule (.repro.tar.gz)
                         │
                         │ repro pull
                         ▼
                ┌─────────────────┐
                │ @repro/replay   │
                │ Deterministic   │
                │ Virtual Clock   │
                │ Mock Adapters   │
                │ L1 AST Defense  │
                └────────┬────────┘
                         │
                         ▼
                   Local App
                         │
                         ▼
                ┌─────────────────┐
                │ @repro/diff     │
                │ Two-Tier Equiv  │
                │ 6-Step Attrib   │
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

## Monorepo Architecture

Repro V0.1 is organized as an ESM-native `npm workspaces` monorepo:

| Package | Role | Key Capabilities |
|---|---|---|
| **[`@repro/core`](./packages/core)** | Domain Types & Cryptography | Zod/JSON Schemas, Manifest v1, AES-256-GCM authenticated envelope encryption, HMAC-SHA256 Digest-Before-Parse (`SEC-027`), memory zeroization (`SEC-038`), Key Custody REST client, Zip-Slip safe POSIX ustar tar I/O (`THREAT-009`). |
| **[`@repro/node`](./packages/sdk)** | In-Process Capture SDK | `AsyncLocalStorage` context tracking, monkey patching interceptors for `pg` and `http`/`https`, format-preserving PII/PAN scrubbing with Luhn verification (`SEC-002`, `SEC-005`), bounded ring buffer ($100\text{ rows} / 64\text{ KB}$ truncation `SEC-008`). **Zero external production dependencies (`SEC-037`)**. |
| **[`@repro/replay`](./packages/replay)** | Deterministic Replay Engine | Wire Mocking Adapters (PostgreSQL query matcher, Outbound HTTP responder, Feature flag evaluator), Deterministic Virtual Clock frozen at $T0$ (`ADR-010`), Synthetic Request Injector, Layer 1 Write Defense (`L1AstSqlFilter`, `HttpVerbGuard`, `FallbackGuard` Rule E9 fail-closed). |
| **[`@repro/diff`](./packages/diff)** | Verification & Diff Engine | 4 Canonical Normalizers (SQL whitespace/casing, URL query sorting, JSON recursive sorting/float rounding, Header filtering `ADR-006`), Two-Tier Equivalence (Tier 1 Byte Equality + Tier 2 Semantic Rubric `Story-13`), 6-Step Divergence Attribution (`Story-14`), Terminal Diff UI compliant with $§20.16$ contract language. |
| **[`@repro/cli`](./packages/cli)** | Developer CLI | 6 Developer Verbs (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`), POSIX permissions `0600`/`0700` (`SEC-042`), Git Guard (`SEC-043`), and operational security commands (`purge` crypto-shredding per GDPR Art 17 `Story-08`, `keys` rotate). |

---

## Quickstart

### 1. Install Capture SDK in your application

```bash
npm install @repro/node
```

Initialize Repro in your entry point:

```typescript
import repro from '@repro/node';

repro.init({
  appName: 'checkout-service',
  appVersion: '1.0.0',
  capture: {
    postgres: true,
    httpOutbound: true,
    clock: true,
    featureFlags: true,
  },
  redaction: {
    neverStoreHeaders: ['authorization', 'cookie', 'x-api-key'],
    maskPii: true,
    luhnValidation: true,
  },
  storage: {
    maxInteractions: 100,
    maxBytes: 64 * 1024,
  },
});
```

Wrap request handlers or let uncaught exceptions trigger capsule generation automatically:

```typescript
app.post('/api/checkout', repro.wrapHandler(async (req, res) => {
  return await handleCheckout(req.body);
}));
```

### 2. Use the CLI

```bash
# Browse available capsules
repro list

# Fetch a capsule to local storage (enforces chmod 0600 and Git Guard)
repro pull cap_1842

# Inspect what was captured
repro inspect cap_1842

# Replay deterministically against local code
repro replay cap_1842 --port=3000

# View two-column execution diff
repro diff cap_1842

# Verify fix on current code (§20.16 compliant)
repro verify cap_1842

# Crypto-shred capsule keys at Key Custody (GDPR Art 17)
repro purge --before=2026-08-01 --hard
```

---

## 🔒 Security & privacy

Capturing production executions means capturing production data. This is treated as a first-class design constraint:

- **Zero-Dependency SDK (`SEC-037`)** — `@repro/node` carries zero external production dependencies, minimizing supply-chain attack surfaces.
- **Automatic Redaction (`SEC-001`, `SEC-002`, `SEC-005`)** — `authorization`, `cookie`, `x-api-key` headers and sensitive fields (`password`, `secret`, `token`) are scrubbed at capture time before storage. Credit card PANs are format-preserved with Luhn check.
- **Envelope Encryption (`SEC-009`..`SEC-012`)** — AES-256-GCM authenticated encryption with DEK generated via CSPRNG.
- **Digest-Before-Parse (`SEC-027`)** — HMAC-SHA256 verified with `timingSafeEqual` before any JSON/tar parsing, preventing Zip-Slip (`THREAT-009`) and Decompression Bombs.
- **Crypto-Shredding & Memory Zeroization (`SEC-016`, `SEC-038`, Story-08)** — DEK memory is zeroized with `0x00` after use; `repro purge` permanently deletes DEK from Key Custody (HTTP 410 Gone / SHREDDED).
- **Layer 1 Fail-Closed Write Defense (`ADR-005`, `Story-12`)** — `L1AstSqlFilter` blocks all mutating DML/DDL; `HttpVerbGuard` blocks non-idempotent HTTP verbs; `FallbackGuard` strictly enforces Rule E9 (zero live network/DB fallback).
- **POSIX Permission & Git Guard (`SEC-042`, `SEC-043`)** — Enforces `0600` on capsule files and `0700` on directories; blocks downloading capsules into Git repositories unless explicitly ignored in `.gitignore`.

---

## 🧪 Testing & Fidelity Benchmark

The test suite runs natively on `node:test` across unit, integration, security, and fidelity suites:

```bash
npm test
```

### Measured Invariants:
- **Full Test Suite**: **111 tests in 24 suites — 100% PASS (0 fail, 0 cancelled, 0 skipped)** in **353ms**.
- **$N\text{-}05$ Fidelity Benchmark**: **$R_{em} = 100.0\%$** across 21 replays ($D=7 \times K=3$) $\to$ Exceeds $\ge 90.0\%$ SLA target.
- **Composite Gate**: **$100.0\%$** $\to$ Exceeds $\ge 80.0\%$ SLA target.
- **Side-Effect Matrix ($T1$–$T12$)**: **`escaped_side_effects == 0`** verified against Canary Sink.
- **33 `SEC MUST-V0.1`**: 100% compliance verified.

---

## 🗺️ Roadmap

| Version | Theme | Contents | Status |
|---|---|---|:---:|
| **Phase 0** | *Validate the hypothesis* | Technical spike · capture/replay harness · gate decision | ✅ Completed |
| **V0.1** | *Core Engine* | Monorepo 5 packages · Node.js SDK · PostgreSQL & HTTP mocking · Virtual clock · Two-tier diff · CLI · Security defense | ✅ **Built & Verified** |
| **V0.2** | *Developer workflow* | **Regression test generation** · GitHub Actions integration · browser replay · Next.js / Fastify support | ⏳ Next |
| **V0.3** | *Distributed systems* | Python · Go · Redis · Kafka · background jobs · distributed tracing · multi-service replay | Planned |
| **Future** | *Intelligent Debugging* | Minimal database snapshots · race-condition replay · AI root-cause analysis | Planned |

---

## 📚 Documentation

The repository contains comprehensive documentation and architectural decisions:

| Document | Purpose |
|---|---|
| [Documentation index](./docs/000-Index.md) | Entry point to all specifications |
| [Project Charter](./docs/010-Planning/Charter-Repro.md) | Business case, objectives, gates, stop conditions |
| [PRD](./docs/020-Requirements/PRD-Repro.md) | Product requirements |
| [NFR](./docs/020-Requirements/NFR-Repro.md) | Non-functional constraints and threshold definitions |
| [SDD + 13 ADRs](./docs/030-Specs/Architecture/) | System architecture, data flow, and accepted architectural decisions |
| [Security Specs](./docs/030-Specs/Security/) | Threat model, redaction rules, and crypto custody |
| [PM Runs Audit Trail](./docs/010-Planning/pm-runs/) | Complete audit trail for multi-agent SDLC runs |

---

## 📄 License

[MIT](./LICENSE) © 2026 TrisJr

---

<div align="center">

**Observability tells you what happened. Repro lets you replay it.**

</div>
