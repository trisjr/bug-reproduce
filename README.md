<div align="center">

# Repro

### **Production happened. Now replay it.**

**Repro turns production bugs into reproducible local executions.**

[![Stage](https://img.shields.io/badge/stage-Phase%200%20technical%20spike-orange)](#-project-status--read-this-before-anything-else)
[![License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen)](https://nodejs.org)
[![Target stack](https://img.shields.io/badge/target-Node.js%20%C2%B7%20PostgreSQL%20%C2%B7%20HTTP-informational)](#-scope-v01)
[![Docs](https://img.shields.io/badge/docs-19k%20lines-8a2be2)](./docs/000-Index.md)

</div>

---

> [!WARNING]
> **Repro is not usable yet.** There is no package to install and no CLI to run. The project is in a **Phase 0 technical spike** whose only purpose is to prove — or disprove — the core hypothesis before a single line of product code is written. Every CLI transcript in this README is the **designed target experience**, not shipped behaviour. See [Project status](#-project-status--read-this-before-anything-else).

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
                │ Repro Recorder  │
                │                 │
                │ HTTP            │
                │ DB              │
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

### A concrete example

Production runs this:

```javascript
async function checkout(userId) {
  const user   = await db.users.find(userId);
  const coupon = await db.coupons.find(user.couponId);
  const tax    = await taxAPI.calculate(user.address);

  return calculateDiscount(user, coupon, tax);   // 💥 coupon is null
}
```

In production, coupon `#9182` was `null` and the tax API returned `{ tax: 0 }`. On your machine, coupon `#9182` is `{ discount: 10 }`. **That is the entire reason you cannot reproduce it.**

Repro captured the boundary:

```text
db.users.find(18392)        → { id: 18392, couponId: 9182, ... }
db.coupons.find(9182)       → null
taxAPI.calculate(...)       → { tax: 0 }
featureFlag("new_checkout") → true
clock.now()                 → 2026-08-14T09:13:44.812Z
```

On replay, your local application receives exactly those results. Same path. Same crash. No production access required.

---

## The target experience

> ⚠️ Design target — not yet implemented.

**1. Production captures the incident**

```text
BUG-1842 · Checkout failed · Repro Capsule available
```

**2. You pull it and replay it**

```console
$ repro pull 1842
$ repro replay 1842

Replaying BUG-1842...

✓ Request
✓ Database inputs
✓ External API responses
✓ Feature flags
✓ Clock
✓ Application metadata

💥 BUG REPRODUCED
```

**3. When replay does *not* reproduce, Repro still earns its keep**

A failed reproduction is not a dead end — it is a diff. Repro tells you precisely where production and your machine parted ways:

```console
$ repro diff 1842

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

**4. You fix the code, then verify**

```console
$ repro verify 1842

BUG-1842

Before fix:  ✗ reproduced
After fix:   ✓ captured execution no longer reproduces
```

> [!NOTE]
> That wording is deliberate and enforced by the spec. Repro says **"this captured execution no longer reproduces"** — never *"the bug is fixed"*. Replaying one execution proves one execution. Claiming more would be the most dangerous thing this tool could do.

### Verification, not just completion

A replay that merely *finishes* proves nothing. Repro compares the two executions and only then reports a verdict:

```text
Production                 Local
──────────────             ──────────────
DB result: null            DB result: null
tax: 0                     tax: 0
flag: true                 flag: true
path: A → B → C            path: A → B → C

✓ Execution matched
```

If the local run took `A → B → D`, that is a **divergence**, not a success — and Repro says so.

---

## The Repro Capsule

A capsule is a portable, self-contained artifact. Its defining constraint: it holds **only what is required to reproduce the execution** — never a copy of your production environment.

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

The strongest test of that claim is built into the validation protocol: **the original environment is destroyed before replay is attempted.** If the capsule is not genuinely self-contained, the spike fails — and we would rather find that out now.

---

## The CLI

Six verbs. That is the whole surface.

```bash
repro list            # capsules available to you
repro pull 1842       # fetch one locally
repro inspect 1842    # what was captured, in full
repro replay 1842     # run it against your local app
repro diff 1842       # production vs local, where they diverged
repro verify 1842     # does the captured execution still reproduce?
```

---

## 🔒 Security & privacy

Capturing production executions means capturing production data. This is treated as a first-class design constraint, not a later hardening pass — the threat model exists in this repo *before* the product does.

- **Automatic redaction** — `authorization` / `cookie` headers, `password`, `access_token`, `credit_card` fields, redacted at capture time, before anything is written.
- **PII anonymization** — `john@example.com` → `user-1842@example.test`.
- **Encryption at rest** for capsules, with a default **30-day TTL** and crypto-shredding.
- **Default-deny side effects** — a replay must never be able to trigger a real payment, email or write. Fail-closed, not fail-open.
- **Self-hosting** — organizations can run the whole thing inside their own infrastructure. Capsules never have to leave.

📄 [Threat model & redaction policy](./docs/030-Specs/Security/) · [ADR-005: Default-deny write side effects](./docs/030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md)

---

## 🎯 Scope (V0.1)

Narrow on purpose. The target stack is deliberately small so the core hypothesis becomes testable rather than debatable:

> **Node.js + PostgreSQL + HTTP**

| Capture | Replay | Analysis |
|---|---|---|
| HTTP request | HTTP request replay | Execution verification |
| Stack trace | Database result replay | Execution diff |
| Database query & result | External API replay | Code/version mismatch detection |
| External HTTP response | Clock replay | |
| Feature flag state | Safe side-effect handling | |
| Clock / timestamp | | |
| Git commit & runtime metadata | | |

### Explicitly **not** in V0.1

Full production environment cloning · full database snapshots · browser replay · Kubernetes orchestration · Kafka replay · distributed race-condition replay · multi-language support · AI root-cause analysis · automatic code fixes · enterprise billing · observability dashboards.

A hard guardrail governs the backlog: **a feature is only considered if it directly improves `Capture → Replay → Verify`.** Everything else waits.

---

## 🚦 Project status — read this before anything else

Repro is at **Phase 0: a technical spike**. Not an alpha. Not a preview. A spike — funded to answer exactly one question, with an explicit right to fail:

> **Can we capture enough information from a real production execution to deterministically replay a meaningful class of production bugs?**

The spike is a real harness, not a thought experiment: a Node.js test application (`POST /checkout`) backed by PostgreSQL, Redis, an external HTTP API, a feature flag and the system clock, driven through scenarios covering database state, external API responses, feature flags, time dependence, missing data, version drift and side effects. Each scenario runs the full loop — capture → build capsule → **destroy the original environment** → replay locally → verify.

### The gate

| Measured | Bar |
|---|---|
| Scenarios reproduced | **≥ 6 of 7** (frozen denominator) |
| Production latency overhead | **< 5 %** |
| Average capsule size | **< 10 MB** |
| Replay time | **< 30 s** |

These are *initial hypotheses*, not product commitments — and they are written down precisely so the result can be falsified rather than rationalized.

**If the gate fails, V0.1 does not get built.** The scope gets narrowed to the bug classes that *are* replayable, or the concept gets rethought. That stop condition is in the charter, not in someone's head.

Everything under [`src/spike/`](./src/spike/) is **throwaway** by design. It exists to answer the question, not to become V0.1.

---

## 🗺️ Roadmap

| Version | Theme | Contents |
|---|---|---|
| **Phase 0** | *Validate the hypothesis* | Technical spike · capture/replay harness · gate decision ← **we are here** |
| **V0.1** | Validate the core | Node.js · PostgreSQL · HTTP · production capture · Repro Capsule · local replay · external API replay · execution verification · execution diff · CLI |
| **V0.2** | Developer workflow | **Regression test generation** · GitHub integration & Actions · browser replay · better anonymization · replay visualization · Next.js support |
| **V0.3** | Distributed systems | Python · Go · Redis · Kafka · background jobs · distributed tracing · multi-service replay |
| **Future** | | Minimal database snapshots · race-condition replay · AI root-cause analysis · AI-generated regression tests |

The long-term north star is a single number:

> **The number of production bugs successfully converted into deterministic local test cases.**

Not bugs *logged*. Not bugs *observed*. Bugs turned into a test that fails before your fix and passes after it.

---

## 📐 Design principles

1. **Replay execution, not infrastructure** — never try to clone production.
2. **Developer-first** — the primary interface is a simple CLI.
3. **Explain failure** — if replay fails, show exactly where production and local diverged.
4. **Privacy by default** — production data is always treated as sensitive.
5. **Determinism over magic** — the system must be able to state precisely what it captured and replayed.
6. **Safe by default** — a replay must never trigger a production side effect.
7. **Narrow before broad** — support a small class of bugs reliably before supporting many badly.

---

## 📚 Documentation

This repository carries roughly **19,000 lines** of specification and design work — written *before* the product, and deliberately so.

| | |
|---|---|
| [Documentation index](./docs/000-Index.md) | Entry point to the whole set |
| [Project Charter](./docs/010-Planning/Charter-Repro.md) | Business case, objectives, gates, stop conditions |
| [PRD](./docs/020-Requirements/PRD-Repro.md) | Product requirements |
| [NFR](./docs/020-Requirements/NFR-Repro.md) | Non-functional constraints and how to read the thresholds |
| [SDD + 11 ADRs](./docs/030-Specs/Architecture/) | Technical design and every accepted architectural decision |
| [Spike protocol](./docs/030-Specs/Spec-Spike-Protocol.md) | Frozen measurement rules for Phase 0 |
| [Risk register](./docs/010-Planning/Risk-Register.md) | 18 tracked risks, owners and mitigations |
| [Roadmap](./docs/010-Planning/Roadmap.md) | Phase ordering and transition conditions |

Two conventions run through all of it, and they are the reason it is worth reading:

- **Every claim is anchored to its source section.** If the source proposal did not say it, the document does not assert it.
- **Unknowns are labelled `TBD`, never guessed.** Open questions stay open and visible instead of being quietly resolved by wishful thinking.

> 🇻🇳 **Note:** the planning documents are written in Vietnamese. The product, the code, the specs' technical vocabulary and this README are in English.

---

## 🤖 How this repository is built

Repro is developed with [Claude Code](https://claude.com/claude-code) as its primary engineering environment, orchestrated as a multi-agent SDLC — and the repository keeps the receipts:

- [`.claude/agents/`](./.claude/agents/) — 12 specialist agent definitions (architect, security auditor, QA, DevOps, business analyst, and others).
- [`docs/010-Planning/pm-runs/`](./docs/010-Planning/pm-runs/) — a complete audit trail for every orchestrated run: brief, plan, per-agent findings, escalations, verdict.

Every decision gate, every escalation and every risk raised along the way is public. If you are curious what an AI-orchestrated engineering process actually looks like when it is written down honestly, that directory is the answer.

---

## 🤝 Contributing

The project is pre-alpha and moving fast through its validation phase, so there is no stable surface to build on yet. What *is* genuinely useful right now:

- **Challenge the hypothesis.** If you have a production bug class you believe this approach cannot capture, [open an issue](https://github.com/trisjr/bug-reproduce/issues) — that is worth more than a patch.
- **Review the specs.** The threat model, the ADRs and the spike protocol are all open. Holes found now are cheap.
- **Tell us about your "cannot reproduce" story.** Real incidents shape the scenario set.

---

## 📄 License

[MIT](./LICENSE) © 2026 TrisJr

---

<div align="center">

**Observability tells you what happened. Repro lets you replay it.**

</div>
