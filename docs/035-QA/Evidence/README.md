---
id: QA-EVIDENCE-INDEX
type: reference
status: draft
owner: devops-engineer
created: 2026-08-15
---

# 📁 Evidence — bằng chứng máy sinh, có ngày tháng

> Thư mục này **phải vào git**. `.gitignore` của repo có dòng `!docs/035-QA/Evidence/` tường minh. ⛔ **Không thêm pattern rộng** (`*.json`, `evidence/`, `out/`) nuốt mất nó — chuẩn niêm phong của phase (`B10`) là *"commit vào git"*, và bằng chứng không vào git thì **không tồn tại**.

Toàn bộ file ở đây do **công cụ sinh**, không viết tay. Sửa tay một file bằng chứng làm nó mất hoàn toàn giá trị chứng minh.

## Hai schema

### `destroy-evidence-<run_id>-<phase>-<ts>.json`

Sinh bởi `src/spike/infra/verify/verify.js` — **verifier độc lập**, mỗi lần chạy một file.

| Khối | Dùng để | Có được so hai file không |
|---|---|:--:|
| `assertions` | tàn dư theo nhãn · network sống lâu · tài sản `tnm_*` còn nguyên · probe cổng | ✅ **Đây chính là phép chứng minh idempotent** |
| `observations` | ai giữ cổng spike · **toàn bộ loopback listener đầu/cuối** · volume ẩn danh | ❌ đọc bối cảnh |
| `independence` | **khoảng hở** giữa cái được chứng minh và cái exit criteria phát biểu | ❌ đọc cùng mọi kết luận |
| `volatile` | timestamp, thời gian probe | ❌ **không bao giờ** |

⚠️ `independence.authority_layer` **luôn là `false`** ở mô phỏng cục bộ. Đọc `proposition_proven` và `proposition_NOT_proven` **trước khi** phát biểu bất cứ điều gì về destroy.

### `canary-coverage-<run_id>-<ts>.json`

Sinh bởi `src/spike/infra/coverage/coverage.js`.

🔴 **Đọc `canary_coverage` TRƯỚC `escaped_side_effects`.** Hai trường nằm cạnh nhau trong cùng file có chủ đích: một số `0` không kèm coverage là **số không diễn giải được**. `canary_coverage: incomplete` ⇒ **fail-closed** theo `Spec-Spike-Protocol §4.6` — run tính là **KHÔNG đạt**.

## Không thuộc thư mục này

Canary log thô (`src/spike/infra/canary-log/`) và run state (`src/spike/infra/artifacts/`) **gitignored có chủ đích** — chúng có thể chứa payload rò rỉ. Bản tóm tắt máy đọc được của chúng nằm trong `canary-coverage-*.json`.

Cách vận hành đầy đủ: [`docs/070-Deployment/Deploy-Spike.md`](../../070-Deployment/Deploy-Spike.md).
