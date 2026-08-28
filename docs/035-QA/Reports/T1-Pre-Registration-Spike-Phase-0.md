---
id: QA-REPORT-T1-PRE-REGISTRATION
type: reference
status: approved
created: 2026-08-28
author: "@quality-assurance / repro-spike"
---

# Bảng Tiền Đăng Ký T1 — Khai Báo Trước Khi Chạy Spike Phase 0 (Task B10)

> **Căn cứ**: [MTP-Spike-Phase-0 §6](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md), [Spec-Spike-Protocol §4](../../030-Specs/Spec-Spike-Protocol.md), Quyết định **$D\text{-}7$** (`2026-08-16-p0b-wave2-4/run-plan.md`).  
> **Mục đích**: Niêm phong danh sách 10 scenario fixtures + probe $SC\text{-}11$, chữ ký lỗi $M\text{-}5$, verdict kỳ vọng và 11 file manifest **TRƯỚC KHI** Phase `P0-C` ($C1$) chạy dòng đầu tiên.

---

## 1. Ba Luật Chống Gian Lận Thống Kê ($Spec\ \S4.7$)

1. **`L1` — Đóng băng**: Mọi phân loại In-Class, chữ ký lỗi $M\text{-}5$ và verdict kỳ vọng phải được đóng băng tại đây. ⛔ **CẤM** sửa đổi verdict kỳ vọng sau khi đã nhìn thấy kết quả chạy thực nghiệm.
2. **`L2` — Bánh cóc một chiều**: Mẫu số $D=7$ chỉ có thể co theo 3 con đường hợp lệ ($L2\text{-}a$), **tuyệt đối không bao giờ nở**. Scenario thuộc observation set dù pass cũng không được kéo vào mẫu số.
3. **`L3` — Báo cáo hai mẫu số**: Nếu denominator co lại trong quá trình chạy, báo cáo $C4$ bắt buộc phải in cả mẫu số gốc ($D=7$) và mẫu số đã co kèm lý do chi tiết.

---

## 2. Bảng Khai Báo Tiền Đăng Ký $T1$

| Scenario ID | Tên Kịch Bản | Phân Loại | In-Class? | Chữ ký lỗi kỳ vọng ($M\text{-}5$) | Verdict Kỳ Vọng ($M\text{-}5$) | Dự đoán Manifest ($D\text{-}4$) |
|---|---|---|:---:|---|:---:|:---:|
| **`SC-1`** | Database state | `database` | **IN** ($D_1$) | `201:approved` (Balance updated) | `matched` | None |
| **`SC-2`** | External API response | `external-api` | **IN** ($D_2$) | `402:declined` (Payment declined) | `matched` | None |
| **`SC-3`** | Feature flag | `feature-flag` | **IN** ($D_3$) | `201:approved` (Discount applied) | `matched` | None |
| **`SC-4`** | Time-dependent | `time-dependent` | **IN** ($D_4$) | `201:approved` (Night surcharge) | `matched` | None |
| **`SC-5`** | Missing data | `missing-data` | **IN** ($D_5$) | `404:not-found` (Entity missing) | `matched` | None |
| **`SC-6`** | Version difference | `version-drift` | **IN** ($D_6$) | `201:approved` (Nhánh A / $Spec\ \S4.3.1$) | `matched` | None |
| **`SC-7`** | Randomness | `randomness` | **OUT** (Obs) | `201:approved` (UUID diverged) | `diverged` | `out-of-scope-determinism` |
| **`SC-8`** | Side effect | `side-effect` | **IN** ($D_7$) | `402:declined` (Side effect blocked) | `matched` | None |
| **`SC-9`** | Async behavior | `async-behavior` | **OUT** (Obs) | `201:approved` (Tail unclosed) | `diverged` | `out-of-scope-determinism` |
| **`SC-10`** | Race condition | `race-condition` | **OUT** (Obs) | `201:approved` (Order conflict) | `diverged` | `out-of-scope-determinism` |
| **`SC-11`** | Redis probe | `cache-probe` | **OUT** (Probe) | `201:approved` (Cache miss post-destroy) | `diverged` | `incomplete-capture` |

---

## 3. Con Dấu Niêm Phong Tiền Đăng Ký (Ô 6)

Theo quy định tại `MTP §6.3` và $D\text{-}7$, con dấu niêm phong được gắn cố định với commit Git chứa đầy đủ 11 file manifest (`test/spike/manifests/SC-*.json`) và bảng này.

```text
================================================================================
 CON DẤU NIÊM PHONG TIỀN ĐĂNG KÝ (SEALING SEAL)
================================================================================
 Ngày Niêm Phong : 2026-08-28
 Tập Manifests   : 11 files (SC-1.json -> SC-10.json, SC-11.json)
 Quy tắc Kiểm soát: 5/5 baseline missing inputs per manifest (D-4 fail-closed)
 Trạng thái       : 🔒 ĐÃ NIÊM PHONG — MỞ ĐIỀU KIỆN TIÊN QUYẾT CHO PHASE P0-C (C1)
================================================================================
```

⛔ **Ràng buộc cứng**: Mọi chỉnh sửa nội dung 11 file manifest hoặc bảng này sau thời điểm niêm phong sẽ bị coi là tạo ra phiên bản mới và tự động vô hiệu hoá điều kiện tiên quyết của $C1$.
