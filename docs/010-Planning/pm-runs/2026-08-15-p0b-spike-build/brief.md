---
id: PM-RUN-2026-08-15-P0B
type: reference
status: draft
created: 2026-08-15
---

# Brief: 2026-08-15-p0b-spike-build

**Lane: code**

## Yêu cầu gốc

> điều phối thực hiện P0-B

Diễn giải phạm vi (PM, không phải suy đoán — đọc từ tài liệu): `P0-B` là **Phase Spike Build**, `W4`–`W7`, **22.0 MD**, gồm **10 task `B1`–`B10`**, định nghĩa tại [`Timeline-Repro.md §4`](../../Estimates/Timeline-Repro.md). Nó vừa được mở khoá bởi **`Gate A` DUYỆT ngày 2026-08-15** (`P0-A` đóng, ghi tại [`pm-runs/2026-08-15-p0a-spike-protocol/verdict.md`](../2026-08-15-p0a-spike-protocol/verdict.md)).

**Ràng buộc bất khả nhượng kế thừa** — [`Spec-Spike-Protocol §0.3`](../../../030-Specs/Spec-Spike-Protocol.md): toàn bộ code `P0-B` là **`throwaway`**. Nó tồn tại để trả lời `RQ.md §39`, **không** để tiến hoá thành V0.1. Mọi branch mang tiền tố `spike/`. Tái sử dụng cho V0.1 là quyết định **riêng** ở `P1`.

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| **Q1** | Chạm > 1 domain? | **Có** | 5 driver khác nhau trên 10 task: 🧑‍💻 Engineer (`B1`,`B3`,`B4`,`B5`,`B6`,`B8`) · ⚙️ DevOps (`B2`,`B7`) · 🛡️ Security (`B9`) · 🧪 QA (`B10`) · 🏗️ Architect (collaborator xuyên suốt). Không cách nào ép về một domain |
| **Q2** | Đổi kiến trúc / contract? | **Không** | `Gate A` đã **đóng băng** toàn bộ contract mà phase này tiêu thụ: `D = 7` · tập IN `{SC-1…SC-6, SC-8}` · `K = 3` · ngưỡng hiệu dụng `≥6/7` · chỉ số **composite fail-closed** · quyết định `G1` (`GAP-Redis`) · `G2` (synthetic + stub tự chạy). Câu hỏi mở duy nhất từng thuộc phase này — *`L2` chặn ở tầng nào* — **đã đóng** tại [`MTP §5.4`](../../../035-QA/Test-Plans/MTP-Spike-Phase-0.md): **tầng runtime**, và `T8`/`T12` FAIL là **khoảng hở đã đo được**, cấm làm nhẹ. ⇒ `P0-B` **hiện thực spec đã publish**, không đàm phán lại spec |
| **Q3** | Mơ hồ, thiếu AC? | **Không** | Mỗi task `B1`–`B10` có **exit criteria thành văn**, mức chi tiết bất thường (ví dụ `B5`: *12/12 test `T1`–`T12` chạy, `escaped_side_effects = 0` đo bằng **canary log**, không phải log của replay runtime*). Chỗ mơ hồ duy nhất là **môi trường chạy `B2`** — không phải mơ hồ về yêu cầu, mà là ràng buộc hạ tầng; giải ở gate |
| **Q4** | > 5 file hoặc > 1 ngày công? | **Có** | 22.0 MD, ~7 thư mục nguồn mới (`src/spike/{app,infra,recorder,capsule,replay,verify,bench}`), `test/spike/{scenarios,manifests}`, cộng `docs/070-Deployment/Deploy-Spike.md`. Repo hiện có `src/` và `test/` **rỗng hoàn toàn** — không một dòng code sản phẩm |

**Điểm**: **2/4** → **Tier: T2**

**Chọn tier thấp do phân vân**: **Có**. Tier còn lại cân nhắc là **T3**.

- **Vì sao không chọn T3**: T3 bắt sinh **delta specs** trong `openspec/changes/<name>/specs/` + `design.md` + `/opsx:archive`. Nhưng [`Spec-Spike-Protocol §0.3`](../../../030-Specs/Spec-Spike-Protocol.md) tuyên bố code phase này là `throwaway` và **cấm** nâng nó thành định nghĩa sản phẩm. Sinh delta spec cho code bị cấm trở thành sản phẩm là **nghi thức rỗng** — nó tạo ra một hiện vật mà `P1` sẽ phải xoá hoặc lờ đi. Thiết kế thật của phase này **đã nằm sẵn** trong `Spec-Spike-Protocol` + `MTP` + 11 ADR đã `Accepted`; `design.md` chỉ nhân bản chúng.
- **Guardrail hạ tầng củng cố lựa chọn**: `.claude/settings.local.json` **không tồn tại** ⇒ allowlist cho `openspec archive|sync|validate` chưa có. Theo Guardrail riêng lane code, chạy T3 trong tình trạng này sẽ **treo ở permission prompt giữa chừng**.
- **Điều kiện escalate lên T3**: (a) một task `B*` buộc phải **sửa** `Spec-Spike-Protocol` hoặc `MTP` — tức chạm contract đã đóng băng tại `Gate A`; hoặc (b) `@TrisJr` quyết định code spike **được phép** tái sử dụng cho V0.1 ngay tại phase này (đảo `§0.3`). Cả hai đều ghi vào `escalations.md` trước khi đổi tier.

## Assumptions

- **A1 — Toolchain có sẵn trên máy đủ chạy `B1`/`B7`.** Đã verify bằng lệnh, không suy đoán: `node v22.21.1` · `npm 11.10.1` · `Docker 29.6.1` (**daemon UP**) · `openspec 1.7.0` · branch hiện tại `main`.
  → **Sai thì hỏng ở đâu**: nếu daemon Docker tắt giữa chừng, `B1` (5 dependency: PostgreSQL, Redis, HTTP stub, feature flag, clock) mất môi trường ⇒ `B3`→`B10` đổ theo dây chuyền.
- **A2 — `B2` chạy ở dạng mô phỏng cục bộ, không phải cloud thật.** Repo **không có** credential cloud nào; `.env` tồn tại nhưng không được đọc/dùng cho hạ tầng. Mà exit criteria `B2` đòi **cách ly ở tầng IAM** — thứ **không mô phỏng được** bằng docker-compose.
  → **Sai thì hỏng ở đâu**: nếu anh muốn `B2` đúng chuẩn IAM, phải cấp credential thật; nếu chấp nhận mô phỏng, nó **phải** được ghi thành một dòng **shortcut ledger `§5` Spike Protocol**, và `B9` có nhiệm vụ xác minh dòng đó *đúng thực tế code*. Không ghi ledger ⇒ `C1` sinh 10 "bằng chứng destroy" mà giá trị bằng chứng thật là **thấp hơn tuyên bố**.
- **A3 — Không được commit nếu anh chưa cho phép tường minh.** Nhưng exit criteria `B10` ghi thẳng: *"🔒 **Niêm phong = commit vào git**; hash + ngày là **con dấu**"*.
  → **Sai thì hỏng ở đâu**: không có quyền commit ⇒ `B10` **không thể Done** ⇒ điều kiện tiên quyết (ii) của `C1` không thoả ⇒ `P0-C` bị chặn. Đây là lý do quyền commit phải chốt **tại gate**, không hỏi sau.
- **A4 — Verify cuối run KHÔNG được giao cho `quality-assurance`.** QA là **driver của `B10`** — verify bởi chính người vừa làm là nghi thức rỗng (guardrail `pm-core`).
  → **Sai thì hỏng ở đâu**: verdict sạch giả tạo trên đúng task sinh ra con dấu mà `C1` phải kiểm.

## Open questions

- **`OQ-B1` — Bảng `T1` của Spike Report chưa có file để tồn tại.** `B10` yêu cầu *"commit hash ghi vào `T1` ô 6"*, và [`Template §2.1`](../../../999-Resources/Templates/Template-Spike-Report.md) bắt `T1` phải **điền và đóng băng tại `Gate A`**. Nhưng `docs/035-QA/Reports/` **không tồn tại** — `T1` hiện chỉ sống dưới dạng khuôn trống trong Template, còn giá trị đóng băng thật nằm rải trong [`verdict.md` của `P0-A`](../2026-08-15-p0a-spike-protocol/verdict.md). ⇒ Hiện **không có ô nào để `B10` chép con dấu vào**. Ai trả lời: `@TrisJr` tại gate. Chặn: `B10`, và qua đó chặn điều kiện tiên quyết của `C1`.
- **`OQ-B2` — Phạm vi run này: cả 10 task, hay wave đầu?** 22.0 MD là phase **căng nhất Phase 0** và **110% capacity, không đệm** ([`Planning-MOC`](../../Planning-MOC.md)). Ai trả lời: `@TrisJr` tại gate.
- **`OQ-B3` — `B2` mô phỏng cục bộ hay cloud thật?** Xem `A2`. Ai trả lời: `@TrisJr` tại gate. Chặn: `B2`, và exit criteria "bằng chứng do công cụ độc lập sinh" của `C1`.

## Ghi chú thứ tự — ràng buộc `Depends` của phase

Đây không phải lựa chọn điều phối, nó là **dữ liệu từ `Timeline §4`**:

```
GA ──┬─→ B1 ──┬─→ B3 ──┬─→ B4 ──→ B5 ──→ B6
     │        │        └─→ B7        (B5 cần A5 ✓, B6 cần A3 ✓)
     │        └─→ B8 ──→ B10
     └─→ B2                    B9 ← B4
```

`B1` là **nút thắt tuyệt đối**: 6/10 task nằm sau nó. `B2` là nhánh **duy nhất** chạy song song được ngay từ đầu.
