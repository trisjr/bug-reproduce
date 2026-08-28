---
id: STORY-002
type: story
status: approved
project: repro
owner: "@software-engineer"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-01-SDK-Capture.md"
---

# 📝 Story-02 — Đánh Chặn & Ghi Nhận 8 Nhóm Tương Tác Cốt Lõi

## 1. User Story Statement

**As a** Replay Engine / Developer,  
**I want to** SDK tự động ghi nhận đầy đủ 8 nhóm tương tác ngoại vi cốt lõi ($RQ.md\ \S18$) trong suốt quá trình xử lý một request lỗi,  
**So that** capsule mang đủ thông tin để tái hiện chính xác bug mà không cần kết nối lại với cơ sở dữ liệu hay API production.

- **Parent Epic**: [Epic-01 — SDK Capture](../Epics/Epic-01-SDK-Capture.md)
- **Target Workstream**: `WS-1` (SDK & Capture)
- **Estimation**: 3.5 MD
- **Parent Requirements**: `FR-004` .. `FR-015`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Capture Inbound HTTP & Metadata
- **Given** một HTTP request gửi tới endpoint `POST /checkout`,
- **When** request được tiếp nhận bởi server Node.js,
- **Then** SDK ghi nhận HTTP Method, Route Path, Filtered Headers, và Canonical Request Body làm đơn vị neo bắt đầu $U0$.

### Scenario 2: Capture PostgreSQL Query & Result
- **Given** ứng dụng thực thi câu lệnh SQL qua thư viện `pg` (ví dụ `client.query('SELECT * FROM coupons WHERE code = $1', ['SAVE10'])`),
- **When** query hoàn tất thành công,
- **Then** SDK ghi nhận Interaction Unit gồm SQL Query Template, Parameter Values, và Mảng Dòng Kết Quả (Result Rows).

### Scenario 3: Capture Outbound HTTP API Call
- **Given** ứng dụng gọi API tính thuế bên ngoài qua `fetch('https://tax.api/calculate', { method: 'POST', body: ... })`,
- **When** external API phản hồi,
- **Then** SDK ghi nhận Target URL Template, Outbound Request Body, Response Status Code, và Response JSON Payload.

### Scenario 4: Capture Feature Flags, Clock & Exception Stack Trace
- **Given** execution xảy ra ngoại lệ không bắt được (Uncaught Error),
- **When** request kết thúc ở trạng thái lỗi,
- **Then** SDK ghi nhận giá trị Feature Flag đã đọc, Timestamp khởi tạo, Git Commit Hash, Node.js version, và Exception Type Identity làm neo kết thúc $U\infty$.
