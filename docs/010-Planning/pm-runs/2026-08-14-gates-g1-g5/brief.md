# Brief: 2026-08-14-gates-g1-g5

**Lane**: doc
**Shape**: **B — Normalization / propagation sweep**

**Lý do chọn Shape B**: yêu cầu không tạo tài liệu mới mà **sửa hàng loạt tài liệu đã tồn tại** để ghi lại 5 quyết định gate và làm cho toàn kho nói cùng một điều. Rủi ro đặc trưng của Shape B áp đúng ở đây: sửa nửa vời thì kho docs mâu thuẫn với chính nó — đúng thứ đã xảy ra ở run trước (`escalations.md` **E-06** của run `2026-08-14-repro-product-docs`: PM lập sót `ADR-004`/`ADR-006` vì dùng bản kê tóm tắt thay vì `grep` toàn kho). Vì vậy **phase inventory bằng `grep` là bắt buộc**, chạy trước khi lập plan.

---

## Yêu cầu gốc

```
/pm-doc giải quyết từ G1 => G5
```

Bối cảnh: `G1`…`G5` là năm **decision gate** do subagent `product-manager` nêu trong báo cáo tư vấn ngày 2026-08-14 (báo cáo trả lời câu hỏi *"với dự án hiện tại thì cần xử lý gì tiếp theo?"*). Nguyên văn năm gate kèm khuyến nghị của PM:

| Gate | Câu hỏi | Khuyến nghị trong báo cáo |
|---|---|---|
| **G1** | Bật Phase 0 (technical spike) hay không? | **BẬT** — coi là điều kiện đầu tư, không phải task. Kèm: cấp tên người cho `Sponsor`/`Manager` (`Charter §1` đang `TBD`) và owner cho 18 risk (`Risk-Register §2` — toàn bộ cột Owner là `TBD`) |
| **G2** | Chạy spike **trước** khi phân rã Epic/Story? | **CÓ — spike trước.** Viết story bây giờ là rework có kế hoạch, vì AC dựa trên *"execution matched"* chưa kiểm chứng được |
| **G3** | Duyệt 11 ADR ngay bây giờ? | **KHÔNG** — giữ `Decision status: Proposed` tới sau spike |
| **G4** | Sàn tối thiểu của Capsule Store (`U-06`) | Quyết ở **A4** (post-spike), chọn **sàn nhỏ nhất còn thoả `D2`** |
| **G5** | TTL mặc định của capsule (`SEC-022`) + crypto-shred (`SEC-016`) | Quyết **trước khi đóng băng capsule format v1**, không cần trước spike |

> [!IMPORTANT]
> **Cách đọc yêu cầu này.** "Giải quyết" **không** có nghĩa PM tự quyết thay anh. Cả năm gate đều là quyết định của **anh** (product owner): `G1` cần quyết định đầu tư *và tên người*, `G5` cần anh **cộng pháp chế**. PM không được bịa tên người hay bịa con số TTL — đó là vi phạm anti-hallucination, và run trước đã đặt tiền lệ rõ (`verdict.md §5`: *"khẳng định không có nguồn — **0 trường hợp**"*).
>
> Vì vậy run này hiểu yêu cầu là: **đưa năm gate đến chỗ được quyết tại GATE (Bước 3), rồi ghi + lan quyết định vào toàn kho tài liệu.** Nơi anh quyết chính là `AskUserQuestion` ở Bước 3 — đây là thiết kế có sẵn của `/pm-doc`, không phải ngoại lệ.

---

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| **Q1** | Yêu cầu chạm nhiều hơn một tầng tài liệu? | **Có** | Chạm tối thiểu **4 tầng**: `010-Planning` (Charter §1, Roadmap Phase 0, Risk-Register §2/§3.2/§4.1) · `020-Requirements` (PRD §10.5 `U-06`, NFR §3.1/§7) · `022-User-Stories` (Stories-MOC — sequencing của `G2`) · `030-Specs` (11 ADR cho `G3`, SDD §8.3 `U-06`, Threat Model `SEC-016`/`SEC-022` cho `G5`) |
| **Q2** | Sửa tài liệu `status: approved`, hoặc đổi taxonomy / naming convention / template dùng chung? | **Không** | Đã kiểm frontmatter **toàn bộ 65 file** dưới `docs/`: **không file nào** ở `status: approved`. `RULE-001` (`status: approved`) nằm ở `knowledge-base/`, **không thuộc phạm vi sửa**. Không đổi taxonomy, không đổi naming convention, không đổi template |
| **Q3** | Yêu cầu mơ hồ — chưa rõ độc giả đích, phạm vi, hoặc thế nào là "xong"? | **Có** | Phạm vi rõ (5 gate có tên), độc giả rõ. Nhưng **"xong" thì không rõ**, và mơ hồ ở chỗ có sức nặng: `G1` không đóng được nếu anh không cấp **tên người** — `RQ.md` không có tên người nào (`Charter §1` tự khai vậy); `G5` cần **pháp chế**, PM không có thẩm quyền chốt TTL. Với hai gate này, "xong" có thể là *đã quyết* hoặc *đã có deadline + owner cho quyết định*. Chấm **Có** thay vì bỏ qua, vì đây chính là thứ phải làm rõ tại gate |
| **Q4** | Ước lượng vượt 5 file hoặc vượt 1 ngày công? | **Có** | Ước lượng sơ bộ **15–20 file** phải sửa (11 ADR chỉ riêng `G3`), cộng MOC + `000-Index.md` ở close-step. Vượt xa ngưỡng 5 file |

**Điểm**: **3/4** → **Tier: T3**

**Chọn tier thấp do phân vân**: **Không.** Ba điểm rơi thẳng vào ngưỡng T3 theo bảng của `pm-core.md`, và khối lượng thực (4 tầng tài liệu, 15–20 file, cần cập nhật MOC + `000-Index.md`, cần mục *Ripple*) khớp đúng đặc trưng T3. Không có lưỡng lự cần ghi nhận.

**Tinh giản có ý thức trong T3**: Bước 2 **chỉ dispatch 1 lens** (`context-auditor` làm inventory), không dispatch `architect`/`security-auditor`/`business-analyst` ở phase phân tích. Lý do: option và khuyến nghị của cả 5 gate **đã tồn tại, đã có nguồn đầy đủ** trong báo cáo `product-manager` mà anh đã đọc — re-derive lại chỉ là overhead nạp context (`pm-core.md` Guardrail: *"không spawn khi phần việc nhỏ hơn overhead nạp context"*). Ba role đó vẫn được nạp ở **Bước 5** với vai writer. Đây **không phải hạ tier**: mọi bước còn lại của T3 giữ nguyên.

---

## Assumptions

- **A1 — Reading A của yêu cầu**: "giải quyết G1=>G5" = *đưa gate đến chỗ được quyết + ghi + lan quyết định*, không phải *PM tự quyết hộ*.
  → **Sai thì hỏng ở đâu**: nếu anh thực sự muốn PM tự quyết hết, thì `G1` (tên người) và `G5` (TTL, pháp chế) vẫn **không thể** làm được — kết quả cuối giống nhau, chỉ khác là gate sẽ mất một lượt hỏi. Rủi ro thấp, đã kiểm soát bằng chính gate.

- **A2 — Markdown link, KHÔNG wiki-link.** File `.claude/commands/pm-doc.md` Bước 5 mục 3 viết *"Wiki-link theo `[[Document-Name]]` như RULE-001 §Linking Rules quy định"*. **Đây là drift trong file command**: `RULE-001` MUST-rule #5 nói ngược lại — *"**BẮT BUỘC** sử dụng standard markdown links… **KHÔNG** dùng wiki-links `[[...]]`"*. RULE-001 là contract của lane nên **RULE-001 thắng**; thêm nữa `verdict.md §4` của run trước tính *"**0 wiki-link**"* là tiêu chí PASS.
  → **Sai thì hỏng ở đâu**: không hỏng — cả hai nguồn cùng khẳng định RULE-001 là contract. Ghi ở đây để không mở lại tranh luận này giữa run. **Nợ đã biết**: dòng đó trong `pm-doc.md` nên được sửa, nhưng **ngoài phạm vi run này** (sửa file command là lane khác).

- **A3 — Nhãn quyết định phải phân biệt được với M1/M2.** Chuỗi `ĐÃ CHỐT 2026-08-14` đã tồn tại và đang mang nghĩa *M1/M2* (`verdict.md §10.3` đếm chính chuỗi này làm tiêu chí verify). Run này quyết vào **cùng ngày** ⇒ nhãn mới **cố ý không chứa** chuỗi đó, để hai phép `grep` truy vết không lẫn nhau. Nhãn dùng cho run này: **`✅ CHỐT GATE-0N — 2026-08-14`**.
  → **Sai thì hỏng ở đâu**: nếu dùng trùng chuỗi, mọi `grep` truy vết về sau **không phân biệt được** quyết định nào lan tới file nào — đúng loại lỗi "dead link ngữ nghĩa" mà `verdict.md §1` gọi là *nguy hiểm hơn link chết thông thường*.

  > **Đính chính sau Bước 2.** Bản đầu của A3 viết *"đã tồn tại ở **14** file", lấy từ `verdict.md §10.3`. `context-auditor` đo lại bằng `grep` và **không tái lập được con số 14 bằng bất kỳ pattern nào**: chuỗi chính xác `✅ ĐÃ CHỐT 2026-08-14` = **13 file** (10 trong phạm vi sửa); chuỗi lỏng `ĐÃ CHỐT 2026-08-14` = **20 file** (17 trong phạm vi). PM tin số đo của auditor — lý do phân xử ở `findings/context-auditor.md §4`. **Không sửa `verdict.md`** của run cũ: con số 14 là dấu vết đo tại thời điểm đó, và guardrail cấm sửa run-state của run cũ.

- **A6 — Định danh gate trong tài liệu là `GATE-01`…`GATE-05`, không phải `G1`…`G5`.** Tên `G1`…`G5` không dùng được làm ID: `PRD-Repro.md:84–86` đã dùng `G1`/`G2`/`G3` làm **Goals** của V0.1, và `run-plan.md` của run trước dùng `G1`…`G4` làm **gate item** của nó. `D3`…`D7` cũng bị chiếm (`ADR-011:81–107`). PM đã verify `GATE-0` = **0 hit** toàn kho.
  → **Sai thì hỏng ở đâu**: dùng `G1`…`G5` sẽ tạo đúng loại "dead link ngữ nghĩa" mà `verdict.md §1` mô tả — `grep "G3"` phân giải im lặng sang *Goal 3 của V0.1* thay vì báo lỗi.

- **A7 — Ownership cắt theo FILE, không cắt theo gate.** Inventory cho thấy `SDD-Repro.md` bị cả 5 gate chạm, `Charter-Repro.md` 4 gate (3 dòng liền nhau 181/182/184), `Roadmap.md` có `GATE-01` và `GATE-02` cùng chèn vùng 103–107. Gate **chính là** "chủ đề" mà `pm-doc.md` Bước 5 cấm cắt theo. Mỗi writer thi hành **mọi** gate chạm file của mình.
  → **Sai thì hỏng ở đâu**: cắt theo gate = hai worker song song ghi hai section của cùng một file = ghi đè, không phải phân công.

- **A4 — Loại trừ khỏi phạm vi sửa**: `docs/010-Planning/pm-runs/**` (run-state của run cũ — Guardrail: *"không sửa run-state của run cũ"*) và `docs/999-Resources/RQ.md` (nguồn sự thật gốc — quyết định của anh **không xoá** mâu thuẫn trong `RQ.md`, tiền lệ `verdict.md §10.1`).
  → **Sai thì hỏng ở đâu**: sửa `RQ.md` sẽ làm mọi trích dẫn `§N` trong 26 file dẫn xuất trở thành không kiểm chứng được.

- **A5 — Giữ nguyên 100% bằng chứng hai phía.** Áp nguyên tắc thi hành của `verdict.md §10.1`: chỉ **thêm** quyết định / lý do / hệ quả và **đổi nhãn**, không xoá phần trích dẫn kèm section number.
  → **Sai thì hỏng ở đâu**: xoá bằng chứng thì người đọc `RQ.md` về sau sẽ tưởng tài liệu dẫn xuất sai.

---

## Open questions

Cả 5 câu dưới đây **chặn Bước 5**, và **chỉ anh trả lời được**. Chúng được đưa lên GATE ở Bước 3.

| # | Câu hỏi | Ai trả lời | Chặn phase |
|---|---|---|---|
| **OQ-1** | `G1` — Phase 0: Go / No-Go / Go-with-narrowed-scope? Và **ai** là `Sponsor` / `Manager` / owner của các risk 🔴 Critical? | **anh** — `RQ.md` không có tên người, PM không được bịa | Bước 5 (Charter §1, Roadmap, Risk-Register §2) |
| **OQ-2** | `G2` — chốt sequencing *spike trước, Epic/Story sau*? | anh (PM khuyến nghị Có) | Bước 5 (Stories-MOC, Roadmap) |
| **OQ-3** | `G3` — 11 ADR: giữ `Proposed` kèm **điều kiện review tường minh**, hay duyệt ngay? | anh (PM + báo cáo khuyến nghị giữ `Proposed`) | Bước 5 (11 ADR + SDD) |
| **OQ-4** | `G4` — `U-06` Capsule Store: quyết sàn ngay, hay **hoãn tới A4 kèm tiêu chí "sàn nhỏ nhất còn thoả D2"** + owner? | anh — đây là quyết định **phạm vi**, vượt thẩm quyền PM (`PRD §10.5` tự khai vậy) | Bước 5 (PRD §10.5, SDD §8.3, Risk-Register §4.1 `C-02-r`/`C-02-r2`) |
| **OQ-5** | `G5` — `SEC-022` TTL mặc định + `SEC-016` crypto-shred: quyết ngay, hay **chốt deadline + owner** (`SEC-022` cần anh **+ pháp chế**)? | anh + pháp chế | Bước 5 (Threat Model, Risk-Register §3.2) |

> [!NOTE]
> **Ngoài phạm vi run này, ghi lại để không bị hiểu là đã làm:**
> - **A2** — `docs/030-Specs/Spec-Phase-0-Spike-Protocol.md` (làm cho spike cho điểm được). Đây là **run kế tiếp**, kể cả khi `G1 = Go`.
> - **G6 / W1** — `status: live` ngoài enum `RULE-001`, 8 link chết, `Design-MOC.md` thiếu frontmatter. Nợ có sẵn từ trước, thuộc một run Shape B housekeeping riêng (`verdict.md §9.2`). Anh yêu cầu `G1=>G5`, không phải `G6`.
