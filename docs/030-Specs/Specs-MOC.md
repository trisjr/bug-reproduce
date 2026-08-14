---
id: MOC-SPECS
type: moc
status: draft
created: 2026-08-14
updated: 2026-08-14
---

# 📂 030-Specs Map of Content (MOC)

Đặc tả kỹ thuật: thiết kế hệ thống, quyết định kiến trúc, và bảo mật. Xem thêm [Documentation Master Index](../000-Index.md).

> [!IMPORTANT]
> **Toàn bộ tài liệu trong thư mục này là thiết kế TRƯỚC KHI hiện thực.** `src/` và `test/` của repo còn rỗng. Không tài liệu nào ở đây mô tả code đang tồn tại.

---

## 🏛️ Architecture

### System Design

- [SDD-Repro](./Architecture/SDD-Repro.md) — System Design Document: kiến trúc, component design, **capsule format**, CLI/SDK contract, deployment, security constraints
  - **§8.3 — TBD Register**: 25 technical unknown (`U-01`…`U-25`), mỗi mục ghi rõ *nó chặn cái gì* và disposition. Đây là nơi tài liệu khai báo **những gì chưa biết** — đọc mục này trước khi ước lượng bất cứ thứ gì.

### Architecture Decision Records

**Tất cả 11 ADR đang ở `Decision status: Proposed` — chưa ai duyệt.**

| ADR | Quyết định |
|---|---|
| [ADR-001](./Architecture/ADR-001-Replay-Execution-Not-Environment.md) | Replay **execution**, không phải environment |
| [ADR-002](./Architecture/ADR-002-Repro-Capsule-Format-Contract.md) | Repro Capsule là artifact portable và là **format contract** |
| [ADR-003](./Architecture/ADR-003-Database-Record-Replay-Not-Snapshot.md) | Record/replay **kết quả query**, không snapshot database |
| [ADR-004](./Architecture/ADR-004-Record-Replay-External-Inputs-At-Boundary.md) | Record/replay input ngoài tại **dependency boundary** |
| [ADR-005](./Architecture/ADR-005-Default-Deny-Write-Side-Effects.md) | **Default-deny** mọi write side effect khi replay |
| [ADR-006](./Architecture/ADR-006-Execution-Verification-By-Equivalence.md) | Verification bằng **execution equivalence** |
| [ADR-007](./Architecture/ADR-007-In-Process-SDK-Interception.md) | **In-process SDK**, không proxy / sidecar / container runtime |
| [ADR-008](./Architecture/ADR-008-Async-Bounded-Failure-Triggered-Capture.md) | Capture **async, bounded, sampled, failure-triggered** |
| [ADR-009](./Architecture/ADR-009-Private-Self-Hosted-Topology.md) | Topology **private / self-hosted** |
| [ADR-010](./Architecture/ADR-010-Bounded-Determinism-Scope.md) | **Bounded determinism**: clock ở trong, scheduler/race ở ngoài |
| [ADR-011](./Architecture/ADR-011-Execution-Diff-First-Class.md) | Execution Diff là **kết quả hạng nhất** của reproduction thất bại |

## 🛡️ Security

- [Spec-Security-Repro-Threat-Model](./Security/Spec-Security-Repro-Threat-Model.md) — Threat model của thiết kế: 13 asset, 6 trust boundary trên 4 zone, 19 threat theo STRIDE per-boundary, 43 requirement `SEC-*` dạng given/then, ràng buộc tuân thủ (GDPR / HIPAA / PCI DSS / SOC 2)
  - **11 trong 19 threat được đánh dấu `[GAP — RQ.md KHÔNG CÓ MITIGATION]`** — chúng được theo dõi tại [Risk-Register §3](../010-Planning/Risk-Register.md).
  - Kết luận **không được làm mềm** ở mục 7: *redaction là **hygiene control**, KHÔNG phải containment boundary.*

---

## ⚠️ Ba điều cần biết trước khi dùng bộ spec này

1. **Hai unknown lõi chưa được giải và cố ý không được giả vờ là đã giải**: `U-04` (định nghĩa *"execution path"* / *"sufficiently equivalent"* của `RQ.md §10` — unknown lớn nhất của cả tài liệu, nó chặn `ADR-006`) và `U-02` (query matching identity — rủi ro hiện thực cao nhất, nó chặn `ADR-003`). Cả hai ở dạng `TBD` kèm phương án gắn nhãn *"cần validate"*.
2. **Mâu thuẫn M2 chưa chốt** — `RQ.md §28` xếp access control vào commercial layer trong khi §20.5/§21 coi là MVP. Ảnh hưởng trực tiếp tới [ADR-009](./Architecture/ADR-009-Private-Self-Hosted-Topology.md) và [threat model §10](./Security/Spec-Security-Repro-Threat-Model.md).
3. **Khi trích dẫn ở tài liệu hạ nguồn, hãy trỏ section cụ thể** (ví dụ `SDD §3.7`) thay vì trỏ cả file — `SDD-Repro.md` và threat model đều dài trên 1200 dòng.

## 📁 Thư mục con theo RULE-001 — chưa tạo

- `API/` — Endpoint Spec và Integration Spec. Chưa có: V0.1 là CLI-first (`RQ.md §33.2`), và Capsule Store API còn là `TBD` (`U-06`).
- `Schema/` — DB Entity. Chưa có: V0.1 **không có application database** — "persistence" của Repro là capsule, xem `SDD §4`.
