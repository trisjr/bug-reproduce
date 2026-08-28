---
id: MOC-080
type: moc
status: approved
project: repro
owner: "@security-auditor"
created: 2026-03-03
updated: 2026-08-28
---

# 📂 080-Operations Map of Content (MOC)

Quản lý các hoạt động vận hành hệ thống, quy trình ứng phó sự cố và thỏa thuận mức dịch vụ (SLAs). Xem thêm [Documentation Master Index](../000-Index.md).

---

## 🛡️ Service Level Agreements (SLAs)

- [SLAs/SLA-Security-Response](./SLAs/SLA-Security-Response.md) — **Cam kết Mức Dịch vụ Phản hồi Lỗ hổng An ninh (Security SLA)** (Ban hành chính thức tại Phase P1 — 2026-08-28, Task `LG5`).
  - **Bảng cam kết thời gian phản hồi**: P0 (Critical) $<24$h (Hotfix $<72$h), P1 (High) $<48$h (Patch $<7$ ngày), P2 (Medium) $<7$ ngày, P3 (Low) $<14$ ngày.
  - **Quy trình 5 bước ứng phó sự cố**: Ingest $\to$ Triage $\to$ Hotfix $\to$ Verification with Canary Sink $\to$ Release & Advisory.
  - Ánh xạ trực tiếp tới chính sách công bố lỗ hổng có trách nhiệm tại `SECURITY.md` ở thư mục gốc.

---

## ⚙️ Trạng Thái Vận Hành & Giải Quyết `GAP-04` (Phase P1)

Khoản nợ kỹ thuật **`GAP-04` (chưa có giao diện vận hành)** đã được giải quyết dứt điểm tại Phase P1:
1. **Bổ sung 4 nhóm Verbs vận hành cho CLI ([PRD-Repro §5.5](../020-Requirements/PRD-Repro.md) / [Epic-05](../022-User-Stories/Epics/Epic-05-CLI-Admin.md))**:
   - `repro auth login/logout`: Xác thực mTLS / API Token với Capsule Store.
   - `repro purge --before=<date>`: Kích hoạt crypto-shredding xoá vĩnh viễn khoá giải mã capsule quá hạn.
   - `repro keys rotate/status`: Kiểm tra trạng thái và xoay vòng khoá mã hoá.
   - `repro audit log`: Truy vết lịch sử truy cập capsule.
2. **Quy trình Quản lý Khoá Key Custody ([ADR-012](../030-Specs/Architecture/ADR-012-Key-Custody.md))**:
   - Xác lập rõ ràng nơi giữ khoá (Private KMS / Vault) và cơ chế tự động auto-shredding theo vòng đời TTL 30 ngày (`SEC-022`), giải quyết hoàn toàn rủi ro `GATE-05b-r2`.

---

## 🔗 Liên Kết Liên Quan

- `SECURITY.md` (Repo Root)
- [Documentation Master Index](../000-Index.md)
- [Specs-MOC](../030-Specs/Specs-MOC.md)
