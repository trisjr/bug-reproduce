---
id: STORY-012
type: story
status: approved
project: repro
owner: "@security-auditor"
created: 2026-08-28
updated: 2026-08-28
linked-to: "../Epics/Epic-03-Replay-Runtime.md"
---

# 📝 Story-12 — Lá Chắn Chống Tác Dụng Phụ Fail-Closed Hai Tầng ($L1+L2$)

## 1. User Story Statement

**As a** Security Officer / Engineer,  
**I want to** toàn bộ các thao tác ghi dữ liệu (Database Write, External API POST/PUT, Subprocess execution) bị chặn đứng và giả lập an toàn ở 2 tầng bảo vệ ($L1$ AST Sink Filter + $L2$ OS Process Sandbox — [ADR-005](../../030-Specs/Architecture/ADR-005-Default-Deny-Write-Side-Effects.md)),  
**So that** việc replay không bao giờ vô tình kích hoạt các tác dụng phụ thật ra ngoài môi trường bên ngoài (`escaped_side_effects == 0`).

- **Parent Epic**: [Epic-03 — Replay Runtime](../Epics/Epic-03-Replay-Runtime.md)
- **Target Workstream**: `WS-3` & `WS-6`
- **Estimation**: 3.5 MD
- **Parent Requirements**: `FR-034` .. `FR-036`, `SEC-032` .. `SEC-036`, `ADR-005`

---

## 2. Acceptance Criteria (Given-When-Then)

### Scenario 1: Chặn Câu Lệnh Ghi SQL Tại $L1$ AST Sink Filter
- **Given** ứng dụng local phát ra câu lệnh `INSERT INTO orders ...` hoặc `UPDATE payments ...`,
- **When** câu lệnh đi qua $L1$ AST SQL Classifier,
- **Then** Runtime phân loại câu lệnh là WRITE, chặn đứng việc gửi tới database thật, và trả về mock result đã ghi lại để execution tiếp tục chạy mà không gây side-effect.

### Scenario 2: Chặn Egress Mạng & Subprocess Tại $L2$ OS Sandbox
- **Given** ứng dụng cố gắng gọi lệnh hệ điều hành `child_process.exec('curl -X POST https://real-bank.com')` ($T8$) hoặc mở raw socket TCP ($T9$),
- **When** Replay Runtime chạy dưới cơ chế Node.js `--permission --deny-child-process` và Isolated Egress Proxy,
- **Then** OS Sandbox từ chối cấp quyền thực thi tiến trình con và chặn toàn bộ network traffic ra ngoài, Canary Sink ghi nhận `0` kết nối thoát ra.

### Scenario 3: Bịt Kín Lỗ Hổng CTE và Stored Procedures
- **Given** câu lệnh phức tạp như `WITH x AS (UPDATE accounts ...) SELECT ...` ($T2$) hoặc `CALL proc()` ($T4$),
- **When** đi qua bộ phân tích cú pháp sâu (Deep AST Tokenizer),
- **Then** Runtime nhận diện hành vi mutation tiềm ẩn và xử lý fail-closed như một WRITE operation an toàn.
