---
id: MOC-STORIES
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-14
---

# User Stories Map of Content (MOC)

Agile backlog: Epic và User Story. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Chưa có Epic hay Story nào cho dự án Repro.** Đây là trạng thái đúng, không phải thiếu sót:

- [PRD-Repro](../020-Requirements/PRD-Repro.md) đã hoàn tất và có sẵn `FR-001`…`FR-082` để dẫn xuất Epic/Story, nhưng việc phân rã đó **chưa được yêu cầu**.
- Hai mâu thuẫn **M1** và **M2** của `RQ.md` đã **✅ ĐÃ CHỐT 2026-08-14** (`D1`: regression test giữ ở V0.2, chỉ số thành công V0.1 là *số bug đạt trạng thái "Execution matched"*; `D2`: authn + authz + audit log thuộc OSS core). Phạm vi V0.1 vì thế đã **ổn định đủ để phân rã story** — xem [Risk-Register §4](../010-Planning/Risk-Register.md). Nhưng bốn rủi ro **mới** do chính hai quyết định sinh ra (`C-01-r`, `C-01-r2`, `C-02-r`, `C-02-r2`) phải được đọc trước khi ước lượng bất cứ story nào.
- **Chỉ số thành công của V0.1 vẫn chưa có tiêu chí pass/fail** — `N-05` là thước đo chính nhưng `RQ.md §24` không đặt ngưỡng, và `U-04` (*"sufficiently equivalent"*) còn chặn cả khả năng **đếm** nó. Story nào có acceptance criteria dựa trên *"execution matched"* sẽ chưa kiểm chứng được. Xem [NFR-Repro §3](../020-Requirements/NFR-Repro.md).
- `RQ.md §39` khuyến nghị chạy **technical spike trước**, chưa vào MVP.

## Thư mục

- [Epics/](./Epics/) — *(chưa có nội dung)*
- [Backlog/](./Backlog/) — *(chưa có nội dung)*
- `Active-Sprint/` — **chưa tạo**. RULE-001 dành thư mục này cho story đang trong sprint; chưa có sprint nào.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `Story-Request-OTP.md` và `Story-Verify-OTP.md` — **hai file chưa bao giờ tồn tại trong repo**, thuộc một dự án khác (OTP). Hai link chết đó đã được gỡ ngày 2026-08-14. Không có file nào bị xoá; chỉ gỡ tham chiếu tới file không tồn tại.
