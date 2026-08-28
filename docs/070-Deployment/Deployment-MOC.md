---
id: MOC-070
type: moc
status: active
created: 2026-03-03
updated: 2026-08-28
---

# 📂 070-Deployment MOC (Phát hành & Triển khai)

Quản lý quá trình đóng gói, phát hành và triển khai phần mềm lên các môi trường. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại

**Repro đã có bản phát hành đầu tiên: [`v0.1.0`](./Releases/Release-V0.1.0.md) — 2026-08-28** (Core Engine, 5 workspace package, 111/111 test pass). Từ mốc này trở đi, thư mục `070-Deployment/` là nơi ghi nhận phát hành và triển khai thật, không còn là thư mục chờ.

Thiết kế triển khai chuẩn vẫn nằm ở tầng spec, không lặp lại ở đây:

- [SDD §6 — Infrastructure & Deployment](../030-Specs/Architecture/SDD-Repro.md): topology self-hosted (§6.1), ngân sách overhead phía production (§6.2), môi trường local của developer (§6.3), tích hợp CI (§6.5), ranh giới đóng gói OSS core / commercial layer (§6.6).
- [ADR-009 — Private / Self-Hosted Topology](../030-Specs/Architecture/ADR-009-Private-Self-Hosted-Topology.md): **self-hosting là bắt buộc từ V0.1**, không phải tuỳ chọn về sau. Ba lens độc lập đồng thuận điểm này.

> [!IMPORTANT]
> **Deployment guide của Repro không phải tài liệu vận hành thông thường.** Bản self-host chứa dữ liệu production đã capture; ranh giới *storage → laptop developer* được threat model xếp là **boundary nguy hiểm nhất** và nó bị vượt qua **trên happy path** (`repro pull` *là* tính năng). Xem [Spec-Security-Repro-Threat-Model](../030-Specs/Security/Spec-Security-Repro-Threat-Model.md) trước khi viết bất kỳ hướng dẫn triển khai nào.

## Thư mục con theo RULE-001

- [`Releases/`](./Releases/) — Release Notes (`Release-{Version}.md`).
  - [Release-V0.1.0](./Releases/Release-V0.1.0.md) — Core Engine, phát hành 2026-08-28.
- `Runbooks/` — Runbook theo service (`Runbook-{Service}.md`). **Chưa tạo** — chưa có service nào chạy thường trực để viết runbook.

## Tài liệu

- [`CHANGELOG.md`](./CHANGELOG.md) — nhật ký thay đổi **phần mềm**, đặt tại `docs/070-Deployment/CHANGELOG.md` theo `RULE-001` §Document Type Mapping. Bắt đầu ghi từ `v0.1.0`; lịch sử **tài liệu** của giai đoạn trước đó vẫn nằm ở `docs/010-Planning/pm-runs/`.
- [Deploy-Spike](./Deploy-Spike.md) — hướng dẫn dựng môi trường technical spike Phase 0 *(lịch sử)*.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `./Releases/`, `./Runbooks/` và `./CHANGELOG.md` — **cả ba chưa bao giờ tồn tại trong repo**. Ba link chết đó đã được gỡ ngày 2026-08-14 và thay bằng tên dạng plain text kèm lý do. Không có file hay thư mục nào bị xoá.

Ngày **2026-08-28**, cùng lúc phát hành `v0.1.0`, hai trong ba mục đó được **tạo thật** và link được khôi phục: `Releases/Release-V0.1.0.md` và `CHANGELOG.md`. `Runbooks/` vẫn giữ dạng plain text vì lý do ban đầu chưa mất hiệu lực.
