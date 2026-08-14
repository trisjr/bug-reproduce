---
id: MOC-080
type: moc
status: draft
created: 2026-03-03
updated: 2026-08-14
---

# 📂 080-Operations MOC (Vận hành & Sự cố)

Quản lý các hoạt động vận hành hệ thống, xử lý sự cố và thỏa thuận mức dịch vụ. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Chưa có tài liệu vận hành nào cho dự án Repro** — chưa có hệ thống nào đang chạy để vận hành.

Nhưng ở đây có một khoản **nợ tường minh đã được ghi nhận**, không phải khoảng trống vô hại:

> [!WARNING]
> **`GAP-04` — chưa có giao diện vận hành.** Sau quyết định `D2` (2026-08-14), **authentication, authorization và audit log thuộc OSS core** và là `MUST-V0.1`. Nhưng `RQ.md §18` **không có một CLI verb nào** để vận hành chúng — cả 6 verb (`list`, `pull`, `inspect`, `replay`, `diff`, `verify`) đều là developer-side. Nghĩa là V0.1 **bắt buộc phải có** authz/audit/retention mà **chưa có nơi nào để SRE/admin thao tác chúng**.
>
> Đây là một **quyết định sản phẩm chưa được đưa ra**, không phải việc tài liệu vận hành tự lấp được. Xem [PRD](../020-Requirements/PRD-Repro.md) mục 10.4, [Analysis-Target-Users §4.1](../050-Research/Analysis-Target-Users.md) và [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md).

Yêu cầu vận hành ở tầng thiết kế đã có sẵn tại [SDD §7.4 — Retention · deletion · audit · data residency](../030-Specs/Architecture/SDD-Repro.md); tài liệu trong thư mục này sẽ dẫn xuất từ đó khi có hệ thống chạy thật.

## Thư mục con theo RULE-001 — **chưa tạo**

- `Incidents/` — Incident Report và Post-Mortem. Chưa có sự cố nào vì chưa có hệ thống chạy.
- `SLAs/` — SLA theo service. Chưa có service nào, và Repro là công cụ **self-hosted** nên SLA (nếu có) sẽ do chính tổ chức vận hành đặt ra, không do sản phẩm cam kết — xem [ADR-009](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md).

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Incidents/` và `./SLAs/` — **hai thư mục chưa bao giờ tồn tại trong repo**. Hai link chết đó đã được gỡ ngày 2026-08-14 và thay bằng tên dạng plain text kèm lý do. Không có file hay thư mục nào bị xoá.
