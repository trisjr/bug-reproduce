---
id: ADR-013
type: adr
status: approved
project: repro
owner: "@TrisJr"
created: 2026-08-28
updated: 2026-08-28
linked-to: "./SDD-Repro.md"
---

# 🏛️ ADR-013 — Open Source License Selection & Contribution Model

## 1. Context & Problem Statement

Theo `Timeline-Repro.md §6.1` (Task `LG1`), việc lựa chọn giấy phép mã nguồn mở (OSS License) cho Repro là một **quyết định một chiều (one-way door)**. Đổi license sau khi đã có nhiều cá nhân và tổ chức bên ngoài đóng góp là cực kỳ phức tạp và tốn kém vì đòi hỏi sự đồng thuận bằng văn bản của 100% người đóng góp.

Đồng thời, theo `RQ.md §28` (*Commercial Model*), Repro định vị là một dự án **Open Core**:
- Phần lõi mã nguồn mở (Core Replay Engine, In-Process SDK `@repro/node`, CLI 6 verbs) được phát hành miễn phí để thúc đẩy tối đa sự đón nhận của lập trình viên (Developer Adoption — risk 🔴 Critical `R-08`).
- Các tính năng mở rộng dành cho doanh nghiệp lớn (Self-Hosted Enterprise Storage, Multi-tenant RBAC, Advanced Compliance Reporting, Enterprise SSO/Audit) sẽ là các module thương mại ở các phase sau (từ V0.3+ / `P5`).

Tài liệu này phân tích các phương án license và lựa chọn chính thức giấy phép OSS cùng mô hình quản trị đóng góp (Contribution Governance) cho Repro.

---

## 2. Decision Drivers

1. **Thúc đẩy Adoption Tối đa (`R-08` / `FR-001`)**: Giấy phép phải thân thiện với doanh nghiệp (Permissive / Enterprise-friendly) để các công ty không ngần ngại cài `@repro/node` vào môi trường production.
2. **Bảo vệ Quyền Sở Hữu Trí Tuệ & Bằng Sáng Chế (Patent Grant)**: Phải có điều khoản cấp quyền sáng chế rõ ràng và điều khoản rút lại quyền sáng chế nếu có bên thứ ba kiện vi phạm bản quyền (Patent Retaliation Clause).
3. **Mở đường cho Mô hình Open Core (`RQ.md §28`)**: License mã nguồn mở không được ngăn cản việc xây dựng các proprietary extension modules hoặc hosted enterprise offerings.
4. **Bảo vệ Dự án trước Rủi ro Bản quyền Đóng góp (Contributor IP Hygiene)**: Quy trình tiếp nhận đóng góp từ cộng đồng phải rõ ràng về bản quyền để tránh tranh chấp sở hữu trí tuệ về sau.

---

## 3. Considered Options

| Tiêu chí | Option 1: MIT | Option 2: Apache-2.0 (Được Chọn) | Option 3: AGPL-3.0 | Option 4: BSL 1.1 / FSL |
|---|---|---|---|---|
| **Mức độ Permissive** | Rất cao | Rất cao | Thấp (Copyleft mạng) | Không phải OSS chuẩn (Source Available) |
| **Bảo vệ Bằng sáng chế** | ❌ Không có điều khoản cấp/rút bằng sáng chế | ✅ **Có điều khoản cấp quyền & thu hồi khi bị kiện (Section 3)** | ⚠️ Phức tạp | ✅ Có điều khoản thương mại |
| **Doanh nghiệp chấp nhận** | 100% | **100% (Tiêu chuẩn công nghiệp)** | ❌ Bị cấm bởi nhiều tập đoàn lớn (Google, Meta, etc.) | ⚠️ Ngại dính rủi ro pháp lý |
| **Open Core Compatibility** | Dễ kết hợp | **Dễ kết hợp, rõ ràng về ranh giới** | Khó kết hợp với proprietary modules | Tự nó là mô hình thương mại |

- **MIT**: Quá ngắn gọn, thiếu điều khoản bảo hộ bằng sáng chế tường minh (`Patent Grant`), dễ tạo rủi ro pháp lý khi dự án phát triển quy mô lớn.
- **AGPL-3.0**: Răn đe các nhà cung cấp đám mây nhưng tạo ra rào cản tâm lý cực lớn đối với các Enterprise Security/Legal Teams khi cài SDK vào production.
- **BSL 1.1**: Làm mất tính chất Open Source chính thống theo định nghĩa của OSI, gây tổn hại nghiêm trọng tới tín hiệu cộng đồng tại thời điểm OSS Launch (`P3` / `W37`).

---

## 4. Decision: Apache License 2.0 & Developer Certificate of Origin (DCO)

Repro V0.1 chính thức lựa chọn:

### 4.1 Giấy Phép: Apache License 2.0 (`Apache-2.0`)
- Áp dụng cho toàn bộ mã nguồn của `@repro/node` SDK, `@repro/cli`, `@repro/replay-runtime`, và `@repro/core`.
- File `LICENSE` chuẩn Apache-2.0 được đặt tại thư mục gốc của repository.
- Toàn bộ source code files phải mang header bản quyền tiêu chuẩn:
  ```text
  Copyright 2026 Repro Authors.
  Licensed under the Apache License, Version 2.0 (the "License");
  ```

### 4.2 Mô Hình Đóng Góp: Developer Certificate of Origin (`DCO` — Sign-off via `git commit -s`)
- Lựa chọn **DCO (chuẩn Linux Foundation / CNCF)** thay vì CLA (Contributor License Agreement) phức tạp:
  - Người đóng góp chỉ cần thêm dòng `Signed-off-by: Name <email>` vào commit message.
  - Tích hợp bot tự động kiểm tra `DCO` trên toàn bộ Pull Requests.
- Ban hành chính thức file `CONTRIBUTING.md` và `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1) tại thư mục gốc.

---

## 5. Consequences & Commercial Alignment

### Phân tích Tác động Lên Mô Hình Thương Mại (§28)

1. **Mô hình Open Core được bảo đảm**:
   - Doanh nghiệp có thể sử dụng miễn phí `@repro/node` và CLI để phục vụ quy trình debug nội bộ.
   - Khi phát triển Enterprise Storage & Control Plane ở `P5`, Repro có thể phân phối các plugin doanh nghiệp (ví dụ `@repro/enterprise-vault`, `@repro/sso-saml`) dưới dạng proprietary license mà không vi phạm giấy phép Apache-2.0 của Core.
2. **Khả năng Contributor Adoption**:
   - Lập trình viên và tổ chức bên ngoài có thể đóng góp an toàn, minh bạch thông qua DCO mà không lo ngại rủi ro nhượng quyền sở hữu trí tuệ cá nhân.
3. **Pháp lý Chuỗi Cung ứng**:
   - Giấy phép Apache-2.0 tương thích hoàn toàn với hệ sinh thái npm và các dependency Node.js / PostgreSQL hiện hành.

---

## 6. Related Documents

- [SDD-Repro](./SDD-Repro.md) — System Design Document.
- [Timeline-Repro](../../010-Planning/Estimates/Timeline-Repro.md) — §6.1 Task `LG1` & `LG2`.
- [Risk-Register](../../010-Planning/Risk-Register.md) — `R-08` Developer Adoption.
- `CONTRIBUTING.md` & `CODE_OF_CONDUCT.md` (Repo Root).
