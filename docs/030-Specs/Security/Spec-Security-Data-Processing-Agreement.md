---
id: SPEC-SEC-003
type: security-spec
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "./Spec-Security-Repro-Threat-Model.md"
---

# 📑 Data Processing Agreement (DPA) Template — Repro Design Partner Program

## 1. Context & Purpose

Thỏa thuận Xử lý Dữ liệu (**Data Processing Agreement — DPA**) này được thiết kế theo chuẩn mực **GDPR (Điều 28)** và các quy định bảo vệ dữ liệu hiện hành, nhằm phục vụ chương trình **Design Partner & Market Validation (Phase P4 — Task `P4-1` / `P4-2`)** và các đợt thử nghiệm sản thi của Repro V0.1.

DPA này xác lập rõ ràng ranh giới trách nhiệm, vai trò pháp lý giữa Tổ chức Khách hàng (Data Controller) và Nhóm Dự án Repro, bảo đảm an toàn dữ liệu tuyệt đối khi cài đặt in-process SDK `@repro/node` vào môi trường production.

---

## 2. Phân Định Vai Trò Pháp Lý (Classification of Parties)

### 2.1 Mô Hình Mặc Định: Self-Hosted Architecture (V0.1 Core)
- **Tổ chức Sử dụng Repro**: Là **Data Controller** duy nhất. Toàn bộ dữ liệu ghi nhận (Repro Capsule), khoá mã hoá (Key Custody Store) và môi trường replay nằm $100\%$ bên trong hạ tầng tự lưu trữ của tổ chức.
- **Tác giả / Maintainers Dự án Repro**: **KHÔNG PHẢI LÀ DATA PROCESSOR**, vì phần mềm được phân phối dưới dạng mã nguồn mở (Apache-2.0), không có bất kỳ kênh truyền dữ liệu telemetry ngầm hay kết nối máy chủ SaaS nào về phía tác giả ([ADR-009](../Architecture/ADR-009-Private-Self-Hosted-Topology.md)).

### 2.2 Mô Hình Design Partner & Hỗ Trợ Kỹ Thuật (Phase P4)
Khi một tổ chức tham gia chương trình Design Partner và yêu cầu đội ngũ kỹ thuật Repro trực tiếp hỗ trợ phân tích một capsule sự cố:
- **Tổ chức Khách hàng**: **Data Controller**.
- **Đội ngũ Kỹ thuật Repro (Core Team)**: **Data Processor** (chỉ xử lý dữ liệu trong phạm vi và thời hạn hỗ trợ kỹ thuật được uỷ quyền bằng văn bản).

---

## 3. Khung Điều Khoản Chuẩn DPA (Standard Clauses)

### Điều 1: Phạm Vi & Bản Chất Xử Lý Dữ Liệu
1. **Mục đích duy nhất**: Dữ liệu trong Repro Capsule chỉ được xử lý nhằm mục đích chẩn đoán, debug và sửa chữa lỗi phần mềm phát sinh tại môi trường production. Nghiêm cấm sử dụng cho mục đích profiling, tiếp thị hoặc phân tích hành vi người dùng.
2. **Loại dữ liệu**: Chỉ giới hạn trong các tương tác ngoại vi đã được lọc qua Redaction Pipeline (HTTP headers/body đã khử nhạy cảm, SQL query parameters, timestamp, metadata ứng dụng).

### Điều 2: Nghĩa Vụ Của Bên Xử Lý Dữ Liệu (Processor Obligations)
1. **Xử lý theo chỉ đạo**: Chỉ phân tích capsule khi có sự yêu cầu bằng văn bản hoặc lệnh điều phối sự cố từ Data Controller.
2. **Bảo mật nhân sự**: 100% nhân sự tham gia phân tích phải ký thoả thuận bảo mật thông tin (NDA) và tuân thủ quy tắc làm việc trên môi trường cách ly.
3. **Không thuê bên thứ ba (No Unapproved Sub-processors)**: Không chuyển giao dữ liệu capsule cho bất kỳ bên thứ ba nào nếu không có sự đồng ý trước bằng văn bản của Data Controller.

### Điều 3: Biện Pháp Kỹ Thuật & Tổ Chức Bảo Vệ (TOMs — Art 32 GDPR)
Bên Xử lý cam kết tuân thủ nghiêm ngặt các biện pháp an ninh kỹ thuật được quy định tại [Spec-Security-Repro-Threat-Model.md](./Spec-Security-Repro-Threat-Model.md):
- Mã hoá toàn diện dữ liệu tại trạng thái nghỉ bằng **AES-256-GCM** với khoá riêng từng capsule ([ADR-012](../Architecture/ADR-012-Key-Custody.md)).
- Kiểm tra toàn vẹn trước khi giải mã **HMAC-SHA256** ($SEC\text{-}027$).
- Thực thi replay trong **L2 Container Sandbox** ngăn chặn 100% rò rỉ side-effect ra ngoài mạng internet (`escaped_side_effects == 0`).
- Lưu vết toàn bộ lịch sử truy cập capsule trong **Append-only Audit Log**.

### Điều 4: Hỗ Trợ Thực Thi Quyền Chủ Thể Dữ Liệu (Data Subject Rights — Art 15–22)
1. Khi nhận được yêu cầu xoá dữ liệu (Right-to-Erasure — Art 17 GDPR), Bên Xử lý phối hợp với Data Controller thực hiện lệnh **Crypto-Shredding** (`repro purge --capsule-id=<id>`) để tiêu huỷ vĩnh viễn khoá giải mã DEK tại Key Custody Store trong vòng không quá **24 giờ**.

### Điều 5: Quy Trình Thông Báo Sự Cố Dữ Liệu (Personal Data Breach Notification — Art 33)
1. Trong trường hợp phát hiện bất kỳ sự cố rò rỉ dữ liệu hoặc vi phạm an ninh nào liên quan đến capsule, Bên Xử lý có trách nhiệm thông báo cho Data Controller bằng văn bản khẩn cấp trong vòng không quá **24 giờ** (nhanh hơn mức trần 72 giờ của GDPR) kèm báo cáo đánh giá tác động ban đầu.

### Điều 6: Huỷ Dữ Liệu Khi Kết Thúc Hỗ Trợ (Return and Deletion — Art 28(3)(g))
1. Khi hoàn tất việc phân tích sự cố hoặc khi hết hạn TTL 30 ngày (tuỳ điều kiện nào đến trước), toàn bộ dữ liệu capsule tạm thời và khoá giải mã liên quan bắt buộc phải được tiêu huỷ vĩnh viễn không thể phục hồi.

---

## 4. Liên Kết Liên Quan

- [Spec-Security-Data-Retention-Legal-Review](./Spec-Security-Data-Retention-Legal-Review.md)
- [ADR-012 — Key Custody Architecture](../Architecture/ADR-012-Key-Custody.md)
- [Spec-Security-Repro-Threat-Model](./Spec-Security-Repro-Threat-Model.md)
- [PRD-Repro §5.6](../../020-Requirements/PRD-Repro.md)
