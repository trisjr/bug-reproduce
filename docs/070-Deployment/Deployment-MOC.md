---
id: MOC-070
type: moc
status: draft
created: 2026-03-03
updated: 2026-08-14
---

# 📂 070-Deployment MOC (Phát hành & Triển khai)

Quản lý quá trình đóng gói, phát hành và triển khai phần mềm lên các môi trường. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Chưa có tài liệu triển khai nào cho dự án Repro**, vì chưa có gì để triển khai — `src/` và `test/` của repo còn rỗng.

Thiết kế triển khai **đã tồn tại** nhưng nằm ở tầng spec, không ở đây:

- [SDD §6 — Infrastructure & Deployment](../030-Specs/Architecture/SDD-Repro.md): topology self-hosted (§6.1), ngân sách overhead phía production (§6.2), môi trường local của developer (§6.3), tích hợp CI (§6.5), ranh giới đóng gói OSS core / commercial layer (§6.6).
- [ADR-009 — Private / Self-Hosted Topology](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md): **self-hosting là bắt buộc từ V0.1**, không phải tuỳ chọn về sau. Ba lens độc lập đồng thuận điểm này.

> [!IMPORTANT]
> **Deployment guide của Repro không phải tài liệu vận hành thông thường.** Bản self-host chứa dữ liệu production đã capture; ranh giới *storage → laptop developer* được threat model xếp là **boundary nguy hiểm nhất** và nó bị vượt qua **trên happy path** (`repro pull` *là* tính năng). Xem [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) trước khi viết bất kỳ hướng dẫn triển khai nào.

## Thư mục con theo RULE-001 — **chưa tạo**

- `Releases/` — Release Notes (`Release-{Version}.md`). Chưa có phiên bản nào được phát hành.
- `Runbooks/` — Runbook theo service (`Runbook-{Service}.md`). Chưa có service nào đang chạy.

## Tài liệu chưa tồn tại

- `CHANGELOG.md` — sẽ đặt tại `docs/070-Deployment/CHANGELOG.md` theo `RULE-001` §Document Type Mapping. Chưa tạo vì chưa có thay đổi phần mềm nào để ghi; lịch sử hiện tại của repo là lịch sử **tài liệu**, đã được ghi ở `docs/010-Planning/pm-runs/`.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Releases/`, `./Runbooks/` và `./CHANGELOG.md` — **cả ba chưa bao giờ tồn tại trong repo**. Ba link chết đó đã được gỡ ngày 2026-08-14 và thay bằng tên dạng plain text kèm lý do. Không có file hay thư mục nào bị xoá.
