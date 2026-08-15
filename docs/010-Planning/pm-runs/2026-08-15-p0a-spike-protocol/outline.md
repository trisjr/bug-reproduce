# Doc Plan: 2026-08-15-p0a-spike-protocol

> **PM độc quyền chỉnh sửa file này.** Writer báo xong trong `SUMMARY` + `FILES_TOUCHED`; PM đối chiếu ownership rồi mới tick.

## Bốn quyết định của `@TrisJr` tại GATE — 2026-08-15

| # | Quyết định | Hệ quả trực tiếp |
|:--:|---|---|
| **G1** | **`GAP-Redis` = (c) + phần định nghĩa của (a)** | Test app vẫn đủ 5 dependency như §22 liệt kê, nhưng **Redis không ảnh hưởng kết cục**. `ACG-07` (ii-b) ghi *"execution phụ thuộc cache state nằm ngoài class"*. **Sửa exit criteria `B1`** |
| **G2** | **`OQ-2` = dữ liệu SYNTHETIC**, không ngoại lệ | Cấp **miễn trừ cap** cho `SEC-008` (capture không-cap chỉ chấp nhận được vì synthetic). `B9` chuyển từ *quyết định* sang *xác minh* |
| **G3** | **`A3` đóng thêm `U-13` + `U-16`** ở dạng hypothesis | **Denominator = 7**, ngưỡng hiệu dụng **`≥6/7`**. Scenario 4 và 6 vào denominator |
| **G4** | **Phase 0 → 10 tuần**, `P0-A` = `W1`–`W3` | `P0-A` 9.5 → **~14 MD** (93%). **`GATE-06` = `W10` = 2026-10-23**. Mọi mốc từ `P0-D` trở đi dịch **+1 tuần** |

## Hạng mục

| # | Tài liệu | Loại (RULE-001) | Đích | Trạng thái đích | Writer | Xong |
|:--:|---|---|---|---|---|:--:|
| 1 | Spike Protocol §0 + §1 khung + §5 shortcut ledger + §6 | technical-spec | `docs/030-Specs/Spec-Spike-Protocol.md` | `draft` | `business-analyst` | **[x]** |
| 2 | Spike Protocol §2 — `ACG-07` | *(cùng file)* | *(cùng file)* | `draft` | `architect` | **[x]** |
| 3 | Spike Protocol §3 — `ACG-01` + `U-13` + `U-16` | *(cùng file)* | *(cùng file)* | `draft` | `architect` | **[x]** |
| 4 | Spike Protocol §4 — `ACG-02` + `ACG-03` *(+ sửa banner H1)* | *(cùng file)* | *(cùng file)* | `draft` | `business-analyst` | **[x]** |
| 5 | Measurement plan | test-plan | `docs/035-QA/Test-Plans/MTP-Spike-Phase-0.md` | `draft` | `quality-assurance` | **[x]** |
| 6 | Template Spike Report | template | `docs/999-Resources/Templates/Template-Spike-Report.md` | `draft` | `quality-assurance` | **[x]** |

**6/6 hạng mục xong.** Mọi `FILES_TOUCHED` đều nằm trong ownership được cấp — không writer nào chạm file ngoài phạm vi, không writer nào chạm MOC hay `000-Index.md`.

### Close-step đã làm (PM)

| File | Cập nhật |
|---|---|
| `docs/030-Specs/Specs-MOC.md` | Mục **Technical Spec** mới + cảnh báo `HYPOTHESIS` + 3 điểm yếu đã công bố; sửa mục *"Ba điều cần biết"* #1 — `U-04` nay **có hypothesis**, `U-02` **vẫn `TBD` nguyên vẹn** |
| `docs/035-QA/QA-MOC.md` | Mục **Tài liệu** mới; đổi *"Chưa có tài liệu QA nào"* → *"Test plan cho V0.1 vẫn chưa có"*; `U-25` nâng từ *"đáng đưa vào"* → **điều kiện tiên quyết** |
| `docs/999-Resources/Resources-MOC.md` | `Template-Spike-Report` + ghi chú vì sao template này khác mọi template khác (nó định nghĩa cả **phát biểu bị CẤM viết**); đánh dấu `Template-Spec` là **stub** |
| `docs/000-Index.md` | Hai tài liệu lớn: `Spec-Spike-Protocol`, `MTP-Spike-Phase-0` |

### Xung đột namespace do writer phát hiện và tự chốt

`Template §2` dùng `T1`–`T8` cho bảng report; `MTP §5.3` dùng `T1`–`T12` cho ma trận threat test — **hai namespace sẽ cùng xuất hiện trong một file report** (vì `C1-5` yêu cầu in kết quả `T8`/`T12`). Writer chốt quy ước ở `Template §1.3`: `T#` trần **luôn** là bảng report, threat test **luôn** phải viết đủ *"test `T8` của ma trận §5.3 MTP"*. Cùng tiền lệ MTP đã dùng cho `L1`/`L2`.

## Thứ tự thực thi — chống ghi đè trên MỘT file

`Spec-Spike-Protocol.md` là **một file** mà hai writer cùng đóng góp. Ownership cắt theo **mục** không đủ an toàn với Edit tool ⇒ **tuần tự hoá quyền ghi vào file đó**, song song hoá phần khác file.

| Phase | Ai ghi `Spec-Spike-Protocol.md` | Song song (khác file) |
|:--:|---|---|
| **1** | `business-analyst` — tạo file, frontmatter, §1, §5, để placeholder §2/§3/§4 | — |
| **2** | `architect` — điền §2 và §3 | `quality-assurance` → `MTP-Spike-Phase-0.md` |
| **3** | `business-analyst` — điền §4 | `quality-assurance` → `Template-Spike-Report.md` |

> Tại mọi thời điểm **đúng một** agent có quyền ghi vào `Spec-Spike-Protocol.md`. `A4` (§4) phụ thuộc `A2`+`A3` về nội dung nên thứ tự này cũng đúng dependency của Timeline.

---

## Outline từng tài liệu

### 1. `docs/030-Specs/Spec-Spike-Protocol.md`

- **Độc giả đích**: Engineer thực thi `P0-B`, QA chạy `P0-C`, và `@TrisJr` tại `Gate A`. Người đọc phải trả lời được: *"chạy spike xong, tôi dùng cái gì để nói đạt hay không đạt?"*
- **Frontmatter**: `id: SPEC-SPIKE-001` · `type: technical-spec` · `status: draft` · `project: repro` · `created: 2026-08-15`
- **Cấu trúc**:
  - `§0` Mục đích + **ràng buộc bất khả nhượng** (mọi định nghĩa là `HYPOTHESIS`, nâng lên định nghĩa sản phẩm là `D2` sau `GATE-06`)
  - `§1` Phạm vi · cách gắn nhãn hypothesis · quy tắc cấm nâng cấp
  - `§2` **`ACG-07`** — Supported Execution Class *(architect)*
  - `§3` **`ACG-01`** — định nghĩa vận hành execution path + rubric *(architect)*
  - `§4` **`ACG-02` + `ACG-03`** — tiêu chí chọn test case + denominator *(business-analyst)*
  - `§5` **Shortcut ledger** — bảng ghi mỗi `SEC-xxx` bị cố ý bỏ qua trong spike
  - `§6` Related Documents
- **Nguồn sự thật**: `RQ.md` §5/§9/§10/§13/§18/§19/§20.1–20.3/§20.13/§22/§23/§24/§39 · `NFR-Repro` mục 7 · `ADR-005`/`ADR-006`/`ADR-010`/`ADR-011` · `SDD-Repro` (`U-02`, `U-13`, `U-16`, `U-20`, `U-25`) · `findings/architect.md` · `findings/business-analyst.md` · `findings/security-auditor.md`
- **Tiêu chí xong**: `§2` đủ ba phần (điều kiện đủ · loại trừ đối chiếu **9 nhóm §20.1 VÀ dependency ngoài 8 nhóm §18** · hành vi ngoài class); `§3` rubric **chạy tay được trên một ví dụ** và cho **kết luận nhị phân**, có mục *điểm yếu đã biết*; `§4` denominator là **một con số** và tiêu chí áp được lên cả 10 scenario **trước** khi chạy

### 2. `docs/035-QA/Test-Plans/MTP-Spike-Phase-0.md`

- **Độc giả đích**: DevOps xây harness `B7`, Engineer xây recorder `B3`, QA chạy `C1`–`C2`
- **Frontmatter**: `id: MTP-SPIKE-P0` · `type: test-plan` · `status: draft` · `project: repro` · `created: 2026-08-15`
- **Cấu trúc**: `§1` Phạm vi · `§2` **6 metric × 4 thuộc tính** (5 metric §23 + `escaped_side_effects`) · `§3` Điều kiện đo (`ACG-04`/`ACG-05`/`ACG-11`) · `§4` Thu dữ liệu `SEC-008` · `§5` **Ma trận 12 test `THREAT-018`** + canary sink · `§6` **Known-Missing-Input Manifest** · `§7` Thủ tục quy trách nhiệm divergence · `§8` Yêu cầu đối với `B3`/`B7`/`C1` · `§9` Related Documents
- **Nguồn sự thật**: `RQ.md` §20.7/§20.12/§20.16/§22/§23/§24 · `NFR-Repro` mục 3 và `ACG-04`/`ACG-05`/`ACG-11` · threat model §11.b + `SEC-008` + `SEC-030`/`SEC-034`/`SEC-035` · `ADR-005` · `SDD-Repro` §3.3–3.5 · `findings/quality-assurance.md` · `findings/security-auditor.md`
- **Tiêu chí xong**: mỗi metric có đủ **công cụ đo · mốc bắt đầu/kết thúc · population · đơn vị**; capsule size có **cả avg lẫn P95 kèm `N`**; ma trận 12 test có pass criterion `escaped_side_effects = 0`

### 3. `docs/999-Resources/Templates/Template-Spike-Report.md`

- **Độc giả đích**: QA viết `C4`; `@TrisJr` đọc tại `GATE-06`
- **Frontmatter**: `id: TEMP-SPIKEREPORT` · `type: template` · `status: draft` · `created: 2026-08-15`
- **Cấu trúc**: `§1` Cách dùng · `§2` **8 bảng bắt buộc `T1`–`T8`** · `§3` **Phát biểu được phép vs CẤM** · `§4` **Hai nhánh §39 đối xứng** · `§5` Related Documents
- **Nguồn sự thật**: `RQ.md` §24/§39/§20.16 · `NFR-Repro` mục 1 · `Timeline-Repro` §5 và §5.1 · `findings/quality-assurance.md`
- **Tiêu chí xong**: có ô cho **cả hai** nhánh Có/Không của §39 với **cùng bộ khung**; `T1` là bảng khai báo **trước khi chạy**; danh sách phát biểu cấm có neo cho từng dòng

---

## Standard markdown link phải tạo

> Theo **RULE-001 §Linking Rules** — `[text](./relative-path.md)`. **KHÔNG** wiki-link.

| Từ | Tới | Quan hệ |
|---|---|---|
| `Spec-Spike-Protocol.md` | `../020-Requirements/NFR-Repro.md` | Nguồn của 4 `ACG` |
| `Spec-Spike-Protocol.md` | `./Architecture/ADR-006`, `ADR-010`, `ADR-011`, `ADR-005` | Quyết định kiến trúc ràng buộc rubric và class |
| `Spec-Spike-Protocol.md` | `../010-Planning/Estimates/Timeline-Repro.md` | Task `A1`–`A4` sinh ra tài liệu này |
| `MTP-Spike-Phase-0.md` | `../../030-Specs/Spec-Spike-Protocol.md` | **`Covers:`** — RULE-001 Linking Rule #8 |
| `MTP-Spike-Phase-0.md` | `../../030-Specs/Security/Spec-Security-Repro-Threat-Model.md` | Nguồn `SEC-008`, `THREAT-018` |
| `Template-Spike-Report.md` | `../../035-QA/Test-Plans/MTP-Spike-Phase-0.md` | Report điền số do MTP định nghĩa |

## MOC cần cập nhật — **PM giữ, không cấp cho writer**

| MOC | Mục thêm |
|---|---|
| `docs/030-Specs/Specs-MOC.md` | `Spec-Spike-Protocol.md` |
| `docs/035-QA/QA-MOC.md` | `MTP-Spike-Phase-0.md` — **file đầu tiên** của `035-QA/` |
| `docs/999-Resources/Resources-MOC.md` | `Template-Spike-Report.md` |
| `docs/000-Index.md` | `Spec-Spike-Protocol` + `MTP-Spike-Phase-0` (tài liệu lớn) |

## Quyết định do writer sở hữu và đã đóng — PM ghi nhận

| Quyết định | Chủ | Nội dung |
|---|---|---|
| **`K = 3`** cho `U-25` | `MTP-Spike-Phase-0.md` §2.3 | Mỗi capsule replay **3 lần**. `2` chỉ là **sàn** từ findings chứ không phải lựa chọn; năng lực phát hiện non-determinism ở `K=3` cao hơn `K=2` khoảng **50%** tại `p=0.1`. Population `N-05` = `D × K` (`D` = denominator từ §4 Spike Protocol, hiện `= 7`) |
| **5 mức cắt/trục + 1 control** cho thí nghiệm `SEC-008` | `MTP-Spike-Phase-0.md` §4.3 | Hai trục row/byte **biến thiên độc lập**; mức định nghĩa bằng **phân vị `P50/P75/P90/P95/P99` của chính phân bố đo được**. Thoả **cả hai** ràng buộc cùng lúc: số mức và quy tắc suy mức **đóng băng trước khi chạy**, còn giá trị **suy ra cơ học từ dữ liệu** ⇒ không bịa ngưỡng, không có tự do hậu kỳ |

## Chuyển tiếp giữa writer — PM theo dõi

| Từ | Tới | Ràng buộc | Trạng thái |
|---|---|---|---|
| `quality-assurance` (`MTP` §7.2) | `architect` (Spike Protocol §3) | Rubric §3 **phải xuất ra "điểm phân kỳ ĐẦU TIÊN"**, không chỉ verdict nhị phân — dòng 2 (Manifest), 3 (redaction record), 3b (`truncated`) của bảng quy trách nhiệm đều lấy nó làm **khoá tra cứu**. Thiếu ⇒ thủ tục **gãy tại `C3`** | ✅ **PM ĐÃ VERIFY** — `Spec-Spike-Protocol.md` §3 ghi *"Chỉ số đơn vị phân kỳ đầu tiên là **output bắt buộc**, không phải tuỳ chọn"*, neo vào [`ADR-011`](../../../030-Specs/Architecture/ADR-011-Execution-Diff-First-Class.md) `D1`/`D2`. Ràng buộc **thoả** |
| `quality-assurance` (`MTP` §8) | `B3` (`P0-B`) | `B3-8`: capsule mang **redaction record** + cờ **`truncated`** ở dạng máy đọc được | Ghi vào Ripple bên dưới |

**Hai ô "khoảng hở đã đo được" trong ma trận 12 test — cả hai CẤM làm nhẹ:**
- **`T8`** (`child_process` gọi `curl`) — FAIL nếu `L2` ở tầng runtime.
- **`T12`** (đích resolve về loopback) — loopback nằm **trong** allowlist của `L2` theo thiết kế ⇒ chỉ `L1` + `SEC-035` chặn được, và **canary bắt buộc lắng nghe cả trên loopback**; nếu không, test **mù và báo pass sai**.

## Ripple — tài liệu/task sẽ lệch sau khi run này xong

| Nơi | Lệch gì | Ai sửa |
|---|---|---|
| `Timeline-Repro.md` §2, §3, §4, §5 | **G4**: Phase 0 → 10 tuần, `P0-A` = `W1`–`W3`, `GATE-06` = `W10`; mọi mốc từ `P0-D` +1 tuần. **G1**: sửa `GAP-Redis` (F1/F2 — bỏ mệnh đề *"`B1` chép đúng §22"*) | **PM**, trong close-step |
| `Timeline-Repro.md` §4 `B1` | Exit criteria: *"chạm cả 5 dependency"* → *"…, trong đó **Redis không ảnh hưởng kết cục**"* + bất biến hạ dòng (`R1`/`R2`) | **PM** |
| `Timeline-Repro.md` §4 `B3` | Thêm: log `row_count`/`byte_size`/`consumed_by_replay`; **capture không-cap** | **PM** |
| `Timeline-Repro.md` §4 `B5` | Thêm: **L2 bắt buộc** + ma trận 12 test; siết exit criteria (L1 đơn thuần không đủ) | **PM** |
| `Timeline-Repro.md` §4 `B7` | Thêm: A/B **xen kẽ**, traffic **đa số thành công**, tỷ lệ lỗi là điều kiện đo | **PM** |
| `Timeline-Repro.md` §4 `B9` | Vai đổi: **quyết định → xác minh** (`OQ-2` đã đóng ở `A7`) | **PM** |
| `Timeline-Repro.md` §5 `C1` | Thêm: `U-25` replay `K` lần · canary sink · 10 bằng chứng destroy độc lập | **PM** |
| `Risk-Register.md` `C-03` | Cập nhật mục `GAP-Redis`: đã có phương án chọn (G1), và **F1/F2** sửa lại mô tả | **PM** |
| `Risk-Register.md` `TL-r1` | Đệm `W7` đã bị tiêu vào `P0-A`; Phase 0 = 10 tuần | **PM** |
| `Planning-MOC.md`, `000-Index.md` | `GATE-06` = 2026-10-23 (đang ghi 2026-10-16) | **PM** |
