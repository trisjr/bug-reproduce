---
id: MOC-SPECS
type: moc
status: draft
created: 2026-08-14
updated: 2026-08-15
---

# 📂 030-Specs Map of Content (MOC)

Đặc tả kỹ thuật: thiết kế hệ thống, quyết định kiến trúc, và bảo mật. Xem thêm [Documentation Master Index](../000-Index.md).

> [!IMPORTANT]
> **Toàn bộ tài liệu trong thư mục này là thiết kế TRƯỚC KHI hiện thực.** `src/` và `test/` của repo còn rỗng. Không tài liệu nào ở đây mô tả code đang tồn tại.

---

## 🔬 Technical Spec

- [Spec-Spike-Protocol](./Spec-Spike-Protocol.md) — **Spike Protocol cho Phase 0** *(2026-08-15)*. Tài liệu làm cho technical spike **cho ra được pass/fail**. Đóng **bốn `ACG`** ở dạng **hypothesis có nhãn**:
  - **§2 `ACG-07`** — *Supported Execution Class*, khái niệm mà §20.1 lấy làm mitigation cho risk 🔴 `R-01` nhưng **không tồn tại ở đâu trong `RQ.md`**. Loại trừ trên **hai trục**: 9 hidden input §20.1 **và** dependency ngoài 8 nhóm capture §18.
  - **§3 `ACG-01`** — định nghĩa **vận hành** của *execution path* + rubric `matched`/`diverged`. Đây là `U-04`, *"unknown lớn nhất của cả tài liệu"*. Kèm **`U-13`** (ngữ nghĩa clock) và **`U-16`** (drift warn hay fatal) — hai open item của ADR nay đã có hypothesis.
  - **§4 `ACG-02` + `ACG-03`** — tiêu chí *"meaningful"*, **denominator = 7**, ngưỡng hiệu dụng **`≥6/7`**.
  - **§5 Shortcut ledger** — control cho `TL-r4`, ghi mỗi `SEC-*` bị cố ý bỏ qua trong code spike.

> [!WARNING]
> **Toàn bộ nội dung `Spec-Spike-Protocol.md` mang nhãn `HYPOTHESIS`, KHÔNG phải định nghĩa sản phẩm.** Việc nâng lên định nghĩa là task `D2`, thuộc `P1`, **sau `GATE-06`**. Tài liệu hạ nguồn **cấm** trích dẫn mục của nó như định nghĩa đã chốt.
>
> **Ba điểm yếu đã công bố, không phải phát hiện muộn:**
> - **`W1`** — rubric §3 có **recall = 0** với rẽ nhánh thuần logic: hai nhánh khác nhau, không chạm dependency nào, cùng kết cục ⇒ rubric kết luận `matched` **trong khi execution thực sự đã khác**. Phát biểu trung thực nhất rubric hỗ trợ được là *"không quan sát được phân kỳ nào tại boundary đã instrument và tại kết cục"* — **không phải** *"execution giống nhau"*.
> - **Bốn nhóm hidden input không có cơ chế phát hiện nào**: environment variables · filesystem state · **process state** · OS behavior. Class loại trừ chúng **bằng lời khai, không bằng phép kiểm**.
> - Rubric thừa hưởng toàn bộ độ giòn của **`U-02`** — thứ [SDD §8.3](./Architecture/SDD-Repro.md) gọi là *"rủi ro hiện thực cao nhất"*.

**Đo bằng gì**: [MTP-Spike-Phase-0](../035-QA/Test-Plans/MTP-Spike-Phase-0.md) · **Báo cáo bằng khuôn nào**: [Template-Spike-Report](../999-Resources/Templates/Template-Spike-Report.md)

---

## 🏛️ Architecture

### System Design

- [SDD-Repro](./Architecture/SDD-Repro.md) — System Design Document: kiến trúc, component design, **capsule format**, CLI/SDK contract, deployment, security constraints
  - **§8.3 — TBD Register**: 25 technical unknown (`U-01`…`U-25`), mỗi mục ghi rõ *nó chặn cái gì* và disposition. Đây là nơi tài liệu khai báo **những gì chưa biết** — đọc mục này trước khi ước lượng bất cứ thứ gì.

### Architecture Decision Records

**✅ CHỐT GATE-03 — 2026-08-14: tất cả 11 ADR đã được duyệt, `Decision status: Accepted`.** Người duyệt: **`@TrisJr`**.

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.

> [!WARNING]
> **`Accepted` KHÔNG có nghĩa mọi thứ trong ADR đã chốt.** Nó xác nhận **hướng quyết định**; mục `Open items` của các ADR vẫn giữ **6 unknown chưa giải**: `U-01` (cơ chế chặn driver `pg`), `U-02` (query matching identity — *rủi ro hiện thực cao nhất*), `U-03`, **`U-04`** (*unknown lớn nhất của cả tài liệu*), `U-13`, `U-20`. Bốn trong số đó có disposition `SPIKE`, tức là **chỉ trả lời được sau khi technical spike chạy**.
>
> Rủi ro *"hạ nguồn đọc `Accepted` như đã chốt hết"* được ghi thành **`GATE-03-r`** tại [Risk-Register §4.2](../010-Planning/Risk-Register.md). Mỗi ADR mang một callout tường minh về điều này — đó là mitigation.
>
> Lưu ý thêm: `GATE-03` đổi **`Decision status`** của ADR. Trường **`status:` trong frontmatter vẫn là `draft`** ở cả 11 file. Hai trường khác nhau.

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

1. **Hai unknown lõi — trạng thái đã đổi ngày 2026-08-15, nhưng KHÔNG phải "đã giải":**
   - **`U-04`** (*"execution path"* / *"sufficiently equivalent"* của `RQ.md §10` — unknown lớn nhất của cả tài liệu, chặn `ADR-006`) nay **có một rubric vận hành ở dạng `HYPOTHESIS`** tại [Spec-Spike-Protocol §3](./Spec-Spike-Protocol.md). Rubric **chạy tay được** và cho **kết luận nhị phân**. Nhưng nó **chưa phải định nghĩa sản phẩm** — việc nâng cấp là `D2`, sau `GATE-06`, và nó mang sẵn ba điểm yếu đã công bố (`W1` recall = 0 với rẽ nhánh thuần logic; bốn nhóm hidden input không có cơ chế phát hiện; phụ thuộc `U-02`).
   - **`U-02`** (query matching identity — rủi ro hiện thực cao nhất, chặn `ADR-003`) **vẫn `TBD` nguyên vẹn**. Rubric §3 **thừa hưởng toàn bộ độ giòn của nó**: định danh query theo thứ tự thì thêm/bớt một query làm lệch toàn bộ mapping ⇒ rubric báo `diverged` **sai**.
   - Hai mục khác đã có hypothesis cùng dịp: **`U-13`** (ngữ nghĩa clock) và **`U-16`** (drift là warning hay fatal) — xem [§3](./Spec-Spike-Protocol.md). `U-13` **buộc phải** đóng vì `B3`/`B5` không xây được nếu thiếu; không đóng ở đây thì Engineer sẽ quyết **ngầm** lúc hiện thực.
2. **Mâu thuẫn M2 đã ✅ CHỐT 2026-08-14** — `RQ.md §28` xếp access control vào commercial layer trong khi §20.5/§21 coi là MVP. Quyết định `D2`: **authentication + authorization + audit log thuộc OSS core**, ghi đè §28. `RQ.md` **vẫn nguyên văn nói ngược** — bằng chứng hai phía được giữ nguyên tại [ADR-009](./Architecture/ADR-009-Private-Self-Hosted-Topology.md) và [threat model §10](./Security/Spec-Security-Repro-Threat-Model.md).
   - **Hai điểm `D2` không chốt theo, nay đã được quyết riêng ngày 2026-08-14:**
     - `SEC-016` (crypto-shredding) — **✅ CHỐT GATE-05b**: rời `DEFER`, nay là **`MUST-V0.1`**. ⚠ Hệ quả: bất biến *"replay không cần kết nối mạng"* **bị phá** (`GATE-05b-r`), và `U-06d` (key custody) **thành blocker** (`GATE-05b-r2`). Xem [Risk-Register §4.2](../010-Planning/Risk-Register.md).
     - `GAP-04` (chưa có CLI verb nào để vận hành authz/audit) — **vẫn nặng, KHÔNG được đóng.** `GATE-04` chốt *sàn* Capsule Store nhưng không chốt *ai vận hành nó bằng lệnh nào* (`GATE-04-r`).
3. **`GATE-04` chốt sàn Capsule Store, nhưng chỉ phần *cái gì*.** Sàn đã chốt: **object/file storage + một index + authn/authz/audit hook**, với 3 thao tác tối thiểu — xem [SDD §3.6](./Architecture/SDD-Repro.md) và [ADR-009](./Architecture/ADR-009-Private-Self-Hosted-Topology.md) `D3`. **Cơ chế** authn/authz cụ thể **vẫn `TBD`** ([SDD §5.4](./Architecture/SDD-Repro.md)).
4. **Khi trích dẫn ở tài liệu hạ nguồn, hãy trỏ section cụ thể** (ví dụ `SDD §3.7`) thay vì trỏ cả file — `SDD-Repro.md` và threat model đều dài trên 1200 dòng.

## 📁 Thư mục con theo RULE-001 — chưa tạo

- `API/` — Endpoint Spec và Integration Spec. Chưa có: V0.1 là CLI-first (`RQ.md §33.2`). `U-06` nay đã **chốt phần sàn** (`GATE-04`) nhưng **API và cơ chế auth của Capsule Store vẫn `TBD`** ⇒ chưa đủ để viết Endpoint Spec.
- `Schema/` — DB Entity. Chưa có: V0.1 **không có application database** — "persistence" của Repro là capsule, xem `SDD §4`.
