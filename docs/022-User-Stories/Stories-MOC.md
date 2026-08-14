---
id: MOC-STORIES
type: moc
status: draft
created: 2026-02-04
updated: 2026-08-14
---

# User Stories Map of Content (MOC)

Agile backlog: Epic và User Story. Xem thêm [Documentation Master Index](../000-Index.md).

## Trạng thái hiện tại — ✅ CHỐT GATE-02 — 2026-08-14: **hoãn có chủ ý**

> `GATE-01` = G1 · `GATE-02` = G2 · `GATE-03` = G3 · `GATE-04` = G4 · `GATE-05a`/`GATE-05b` = G5.

**Chưa có Epic hay Story nào cho dự án Repro — và đây là QUYẾT ĐỊNH, không phải trạng thái chờ.**

Ngày 2026-08-14 anh chốt `GATE-02`: **phân rã Epic/Story được hoãn tới sau khi gate ra khỏi Phase 0 đóng.** Không làm song song với technical spike.

### Vì sao hoãn — bốn lý do, mỗi lý do một neo văn bản

Lý do **không** phải "chưa có ai yêu cầu". Lý do là **story viết bây giờ không kiểm chứng được**:

| # | Lý do | Neo |
|---|---|---|
| 1 | **Chỉ số thành công của V0.1 chưa có tiêu chí pass/fail.** `N-05` (Execution Match Rate) là thước đo chính sau `D1`, nhưng `RQ.md §24` **không đặt ngưỡng** cho nó | `C-01-r` — [Risk-Register §4.1](../010-Planning/Risk-Register.md) · [NFR §3.1](../020-Requirements/NFR-Repro.md) |
| 2 | **Không định nghĩa được *"sufficiently equivalent"* thì không ĐẾM được *"execution matched"*.** Story nào có AC dựa trên trạng thái đó đều chưa kiểm chứng được | `C-01-r2` · `U-04` — [SDD §8.3](../030-Specs/Architecture/SDD-Repro.md) |
| 3 | **Ngưỡng `N-05` phải đến từ dữ liệu đo của spike**, không từ bàn giấy. [NFR §3.1](../020-Requirements/NFR-Repro.md) ghi rõ *"cần anh chốt **sau** spike §22"* | §24 vs §23 |
| 4 | **`U-06` bị `GATE-04` thu hẹp nhưng cơ chế auth vẫn `TBD`** ⇒ ước lượng story cho phần Capsule Store còn hở | `GATE-04-r` — [Risk-Register §4.2](../010-Planning/Risk-Register.md) |

⇒ **Viết story trước spike không phải tiến độ, là rework có kế hoạch.**

### Điều kiện gỡ hoãn

Cả **hai** điều kiện phải đạt: (a) gate ra khỏi Phase 0 đóng với kết quả **Có** (xem [Roadmap](../010-Planning/Roadmap.md)); **và** (b) `N-05` có ngưỡng đến từ dữ liệu spike.

### Bối cảnh phạm vi vẫn giữ nguyên

- [PRD-Repro](../020-Requirements/PRD-Repro.md) đã hoàn tất và có sẵn `FR-001`…`FR-082` để dẫn xuất Epic/Story khi hoãn được gỡ.
- Hai mâu thuẫn **M1** và **M2** của `RQ.md` đã **✅ ĐÃ CHỐT 2026-08-14** (`D1`: regression test giữ ở V0.2, chỉ số thành công V0.1 là *số bug đạt trạng thái "Execution matched"*; `D2`: authn + authz + audit log thuộc OSS core) — xem [Risk-Register §4](../010-Planning/Risk-Register.md). **Phạm vi V0.1 ổn định về nội dung**, nhưng ổn định phạm vi **không** đủ để phân rã: còn thiếu tiêu chí *đo* nó.
- **Chín rủi ro phải đọc trước khi ước lượng bất cứ story nào**: bốn rủi ro từ `D1`/`D2` (`C-01-r`, `C-01-r2`, `C-02-r`, `C-02-r2` — [§4.1](../010-Planning/Risk-Register.md)) và năm rủi ro từ năm quyết định gate (`GATE-01-r`, `GATE-03-r`, `GATE-04-r`, `GATE-05b-r`, `GATE-05b-r2` — [§4.2](../010-Planning/Risk-Register.md)).
- **Guardrail khi hoãn được gỡ**: **không** dùng `N-01`…`N-04` làm acceptance criteria của bất kỳ story, sprint hay release nào — bốn con số đó là *initial hypotheses* của spike, §24 tự nói vậy. Xem [NFR-Repro §1](../020-Requirements/NFR-Repro.md).

## Thư mục

- [Epics/](./Epics/) — *(rỗng theo `GATE-02` — hoãn tới sau Phase 0)*
- [Backlog/](./Backlog/) — *(rỗng theo `GATE-02` — hoãn tới sau Phase 0)*
- `Active-Sprint/` — **chưa tạo**. RULE-001 dành thư mục này cho story đang trong sprint; chưa có sprint nào.

## Ghi chú lịch sử

MOC này trước đây trỏ tới `Story-Request-OTP.md` và `Story-Verify-OTP.md` — **hai file chưa bao giờ tồn tại trong repo**, thuộc một dự án khác (OTP). Hai link chết đó đã được gỡ ngày 2026-08-14. Không có file nào bị xoá; chỉ gỡ tham chiếu tới file không tồn tại.
