---
id: KB-SDLC-P6
type: process
status: approved
parent: "../SDLC-Agile-Workflow.md"
created: 2026-03-20
updated: 2026-03-20
---

# Phase 6: Kiểm Thử (Quality Assurance)

## Mục lục

1. [Thông tin Phase](#1-thông-tin-phase)
2. [Input cần có](#2-input-cần-có)
3. [Output (Artifacts)](#3-output-artifacts)
4. [Câu lệnh mẫu](#4-câu-lệnh-mẫu)
5. [Luồng xử lý Bug](#5-luồng-xử-lý-bug)
6. [Tiêu chí chuyển Phase](#6-tiêu-chí-chuyển-phase)

---

## 1. Thông tin Phase

| Thuộc tính             | Chi tiết                                                                            |
| :--------------------- | :---------------------------------------------------------------------------------- |
| **Role chính**         | 🧪 **QA** (Quality Assurance)                                                       |
| **Support**            | 🛡️ **Security Auditor** (security testing)                                          |
| **Mục tiêu**           | Đảm bảo chất lượng sản phẩm trước khi release                                       |
| **Kích hoạt**          | `"Hãy đóng vai trò QA"` → File `.agent/roles/quality-assurance.md`                  |
| **Thư mục tác nghiệp** | `docs/035-QA/`                                                                      |
| **Skills gợi ý**       | `quality-assurance`, `senior-qa`, `systematic-debugging`, `test-driven-development` |

---

## 2. Input cần có

- User Stories + Acceptance Criteria (Phase 4)
- API Specs (Phase 2)
- Source code & PR (Phase 5)

---

## 3. Output (Artifacts)

| #   | Artifact               | Đường dẫn SSOT                                 | Mô tả                               |
| :-- | :--------------------- | :--------------------------------------------- | :---------------------------------- |
| 1   | **Test Plan**          | `docs/035-QA/Test-Plans/MTP-{Sprint}.md`       | Chiến lược kiểm thử cho Sprint      |
| 2   | **Test Cases**         | `docs/035-QA/Test-Cases/TC-{Feature}-{NNN}.md` | Test case chi tiết (Gherkin format) |
| 3   | **Test Report**        | `docs/035-QA/Reports/Report-Sprint-{NNN}.md`   | Kết quả thực thi test               |
| 4   | **Bug Reports**        | `docs/035-QA/Reports/Bug-{NNN}-{Title}.md`     | Báo cáo lỗi (nếu có)                |
| 5   | **Performance Report** | `docs/035-QA/Performance/Perf-{Scenario}.md`   | Kết quả kiểm thử hiệu năng          |
| 6   | **Automation Scripts** | `docs/035-QA/Automation/`                      | Test scripts tự động hóa            |

---

## 4. Câu lệnh mẫu

```
"Dùng vai trò QA để viết Test Plan cho Sprint 1
 dựa trên @Sprint-001.md."

"Dùng vai trò QA để viết Test Cases cho feature Login
 dựa trên @UC-01-Login.md và @Story-Login.md."

"Dùng vai trò Security Auditor để quét lỗ hổng bảo mật
 trên codebase @src/."
```

---

## 5. Luồng xử lý Bug

1. QA phát hiện bug → Tạo Bug Report → Chuyển về Phase 5 (Engineer fix)
2. Engineer fix → Tạo PR → QA re-test
3. Pass → Chuyển Phase 7

---

## 6. Tiêu chí chuyển Phase

- [ ] Tất cả Test Cases đều Pass
- [ ] Không có bug Critical/Blocker còn mở
- [ ] Regression test pass
- [ ] Security scan pass (nếu áp dụng)

---

## Tài liệu tham khảo

- [← Phase 5: Development Sprint](./Phase-5-Development-Sprint.md)
- [Index — Quy trình SDLC Agile](../SDLC-Agile-Workflow.md)
- [Phase 7: Deployment & Release →](./Phase-7-Deployment-Release.md)
