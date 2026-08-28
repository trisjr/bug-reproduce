---
id: SPEC-SECURITY-AUDIT-P0B
type: reference
status: approved
created: 2026-08-28
author: "@security-auditor / repro-spike"
---

# Báo cáo Thẩm định An toàn Mã nguồn Spike (Phase P0-B · Task B9)

> **Căn cứ**: [Spec-Spike-Protocol §5](../../030-Specs/Spec-Spike-Protocol.md), [Spec-Security-Repro-Threat-Model](../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md), [MTP-Spike-Phase-0 §5](../../035-QA/Test-Plans/MTP-Spike-Phase-0.md).  
> **Mục tiêu**: Thẩm định độc lập 5 chiều an toàn của toàn bộ mã nguồn `src/spike/` và `test/spike/` trước khi mở cổng sang Phase `P0-C` ($C1$).

---

## 1. Tổng quan & Phương pháp Thẩm định

Khác với giai đoạn `P0-A` (thiết lập mô hình đe dọa trên giấy), thẩm định `B9` tại cuối Phase `P0-B` thực hiện rà soát thực nghiệm trực tiếp trên toàn bộ codebase đã hiện thực từ Wave 1 đến Wave 4 ($B0'$, $S\text{-}1$, $INF\text{-}1$, $B1$, $B2$, $B3$, $B4$, $B5$, $B6$, $B7a$, $B7b$, $B8$).

Cuộc thẩm định bao phủ **5 chiều bảo mật then chốt**:
1. **Synthetic Data 100% ($G2$, $THREAT\text{-}005$)**
2. **External HTTP Stub Isolation**
3. **Thẩm tra Shortcut Ledger (`Spec-Spike-Protocol §5`)**
4. **Đánh giá Cơ chế Miễn trừ $SPIKE\_RUN\_ID$ (Structural vs Forgeable Exclusion)**
5. **Bề mặt Output & Kiểm soát Đường dẫn Capsule ($D\text{-}8$)**

---

## 2. Kết quả Thẩm định Chi tiết 5 Chiều

### Chiều 1 — Xác minh Synthetic Data 100% ($G2$, $THREAT\text{-}005$)

- **Phạm vi kiểm tra**: `src/spike/app/seed.js`, `src/spike/app/checkout.js`, `test/spike/scenarios/`, `src/spike/infra/canary/`.
- **Phát hiện & Bằng chứng**:
  - Dữ liệu khách hàng (`CUSTOMERS`) và sản phẩm (`PRODUCTS`) trong `seed.js` là các chuỗi cứng nhân tạo: `cust-1001` (Alice), `cust-1002` (Bob), `cust-1003` (Charlie), `SKU-BOOK-001`, `SKU-LAPTOP-001`.
  - Không có bất kỳ kết nối hay export dữ liệu từ cơ sở dữ liệu thật, không có PII (email, số điện thoại, thẻ tín dụng thật) hay thông tin nhạy cảm.
  - Toàn bộ 10 scenario fixtures trong `test/spike/scenarios/` sử dụng ID giả lập và giá trị deterministic.
- **Kết luận**: ✅ **ĐẠT (Synthetic Data 100% compliant)**.

---

### Chiều 2 — External HTTP Stub Isolation

- **Phạm vi kiểm tra**: `src/spike/app/stub/server.js`, `src/spike/app/external.js`, `src/spike/app/config.js`.
- **Phát hiện & Bằng chứng**:
  - Service `spike-httpstub` chạy hoàn toàn cục bộ (in-process hoặc container `spike-httpstub` trên cổng `8081`).
  - Toàn bộ phản hồi thanh toán được sinh tất định (deterministic hashing SHA-256 trên request body), không dùng `Math.random()` và không phụ thuộc system clock.
  - Mã nguồn hoàn toàn không chứa API key thật, OAuth secret hay outbound internet socket.
  - Mọi lời gọi HTTP ra ngoài trong ứng dụng đều trỏ về `SPIKE_HTTP_STUB_URL` nội bộ.
- **Kết luận**: ✅ **ĐẠT (Zero external internet exposure)**.

---

### Chiều 3 — Thẩm tra Shortcut Ledger (`Spec-Spike-Protocol §5`)

Rà soát đối chiếu 6 mục đã khai báo trong bảng Shortcut Ledger (`Spec §5.2`):

| Mục Shortcut | Mã `SEC` | Hiện trạng Mã nguồn Spike | Đánh giá Tuân thủ Ledger |
|---|---|---|---|
| 1. Bỏ qua hash/signature verify | `SEC-027` | `src/spike/capsule/` parse JSON trực tiếp, không kiểm tra chữ ký HMAC/RSA. | ✅ Khớp 100% khai báo. |
| 2. Không persist khi redaction lỗi | `SEC-001` | `src/spike/recorder/` capture 8 nhóm trực tiếp, không có redaction layer. | ✅ Khớp 100% khai báo (chấp nhận vì dữ liệu 100% synthetic). |
| 3. Không có redaction config profile | `SEC-011` | Không có cơ chế redaction profile, capture toàn bộ field theo schema $B0'$. | ✅ Khớp 100% khai báo. |
| 4. Capsule không mã hoá at-rest | `SEC-015` | Capsule lưu trữ dạng JSON thô `.capsule`, không mã hoá AES-GCM. | ✅ Khớp 100% khai báo. |
| 5. Không authn/authz/audit trên capsule | `SEC-018/019/020` | Lưu trữ file system local, không kiểm tra quyền người dùng hay token. | ✅ Khớp 100% khai báo. |
| 6. IAM Isolation & Revoke Credential | Exit criteria `B2` | Script `destroy.sh` xoá container cục bộ qua Docker socket, không có IAM role tầng cloud. | ✅ Khớp 100% khai báo. |

- **Kết luận**: ✅ **ĐẠT (Mọi shortcut kỹ thuật đều minh bạch, không có shortcut ngầm)**.

---

### Chiều 4 — Đánh giá Cơ chế Miễn trừ $SPIKE\_RUN\_ID$ (Structural vs Forgeable Exclusion)

- **Phân tích cơ chế**:
  - Spike sử dụng header `x-spike-run-id` và biến môi trường `SPIKE_RUN_ID` để định tuyến và đối chiếu log giữa app, recorder, replay runtime và canary sink.
  - Canary listener lọc các kết nối dựa trên chuỗi correlation này để xác định `escaped_side_effects`.
- **Phân loại**:
  - **Bản chất**: Đây là cơ chế **Structural Test Harness Isolation** (cách ly luồng kiểm thử cấu trúc trong môi trường đơn máy).
  - **Đánh giá rủi ro**: Trong môi trường spike Phase 0 (single-node, local synthetic workload), token này an toàn và không bị giả mạo từ bên ngoài.
  - **Ràng buộc chuyển đổi sang V0.1 ($P1$)**: Khi phát triển V0.1 trên production thật, cơ chế này **BẮT BUỘC** phải bị bãi bỏ và thay thế bằng cryptographically signed trace context (W3C Trace Context + HMAC) để ngăn chặn bypass an toàn.
- **Kết luận**: ✅ **ĐẠT (Hợp lệ cho phạm vi Spike Phase 0)**.

---

### Chiều 5 — Bề mặt Output & Kiểm soát Đường dẫn Capsule ($D\text{-}8$)

- **Phạm vi kiểm tra**: `src/spike/capsule/index.js`, `.gitignore`, `src/spike/bench/reporter.js`.
- **Phát hiện & Bằng chứng**:
  - **Quy tắc $D\text{-}8$**: `src/spike/capsule/index.js` thực thi fail-closed enforcement — từ chối ghi capsule nếu thư mục đích không chứa cụm `/capsules/` hoặc đuôi file không phải `.capsule`.
  - `.gitignore` (dòng 61) đã cấu hình chặn `src/spike/**/capsules/` và `*.capsule`, ngăn chặn tuyệt đối việc commit capsule vào Git history.
  - Báo cáo benchmark JSON/CSV trong `src/spike/bench/reporter.js` chỉ xuất các chỉ số định lượng (latency, CPU, memory, match rate), không dump nội dung nhạy cảm của request body.
- **Kết luận**: ✅ **ĐẠT (Output containment & Git history leak prevention enforced)**.

---

## 3. Tổng kết Phán quyết Thẩm định

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| **Zero Production Data Leakage** | ✅ **PASSED** | 100% synthetic, zero PII |
| **Network & Stub Containment** | ✅ **PASSED** | Local stub isolation, zero internet socket |
| **Shortcut Ledger Integrity** | ✅ **PASSED** | 6/6 shortcuts khớp thực tế |
| **Exclusion Mechanism Validity** | ✅ **PASSED** | Structural test isolation hợp lệ |
| **Output Path Enforcement ($D\text{-}8$)** | ✅ **PASSED** | Capsule & git containment chặt chẽ |

**Phán quyết**: ✅ **MÃ NGUỒN PHASE P0-B ĐỦ ĐIỀU KIỆN AN TOÀN ĐỂ MỞ GATE VÀO PHASE P0-C ($C1$).**
