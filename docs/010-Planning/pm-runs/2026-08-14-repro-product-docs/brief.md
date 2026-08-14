# Brief: 2026-08-14-repro-product-docs

**Lane**: doc
**Shape**: **A — Authoring** — yêu cầu là tạo mới một bộ 8 loại tài liệu từ một nguồn duy nhất (`docs/999-Resources/RQ.md`), không phải sửa hàng loạt tài liệu đã tồn tại. Kho `docs/` hiện tại chỉ là scaffold (MOC + template), không có tài liệu sản phẩm nào để chuẩn hóa. Phần dọn dẹp MOC phát sinh nằm trong file **PM sở hữu** nên không biến run này thành Shape B.

## Yêu cầu gốc

> Phân tích @docs/999-Resources/RQ.md và chuẩn bị các tài liệu như:
> - Idea Brief
> - Problem Statement
> - Target User / Persona
> - Use Cases
> - Scope / MVP
> - PRD
> - Technical Design / Architecture
> - ADR cho các quyết định quan trọng

## Triage

| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| Q1 | Chạm nhiều hơn một tầng tài liệu? | **Có** | Chạm tối thiểu 4 tầng: `010-Planning` (Idea Brief → Charter, Scope/MVP → Roadmap), `020-Requirements` (Problem Statement → BRD, Use Cases, PRD), `030-Specs` (Technical Design → SDD, ADR), `050-Research` (Target User / Persona). |
| Q2 | Sửa tài liệu `approved`, hoặc đổi taxonomy / naming convention / template dùng chung? | **Không** | `RULE-001` (`status: approved`) chỉ được **đọc** làm contract, không sửa. Không đổi taxonomy: 4 hạng mục anh nêu (Idea Brief, Problem Statement, Persona, Scope/MVP) **không có tên riêng trong Document Type Mapping** nhưng đều **ánh xạ được vào loại đã có** — đây là diễn giải mapping, không phải mở rộng nó. Cần chốt ánh xạ tại gate. Điểm này gần biên: nếu tại gate anh yêu cầu tài liệu độc lập cho "Idea Brief"/"Scope-MVP" thì mới thành đổi taxonomy và Q2 chuyển thành Có → tier lên T3 đầy (vẫn T3, không đổi kết quả). |
| Q3 | Yêu cầu mơ hồ — chưa rõ độc giả đích, phạm vi, hoặc thế nào là "xong"? | **Có** | Danh sách tài liệu rất rõ, nhưng nguồn sự thật `RQ.md §38` **tự khai 16 câu hỏi chưa được trả lời** — trong đó có những câu PRD và ADR bắt buộc phải có đáp án để viết được (stack khởi điểm, V0.1 có chỉ hỗ trợ failed execution hay không, self-hosting ngay ngày đầu, replay boundary cho microservices, mô hình OSS). Ngoài ra không rõ số lượng ADR và số lượng Use Case mong đợi. |
| Q4 | Ước lượng vượt 5 file hoặc vượt 1 ngày công? | **Có** | Đếm sơ bộ: 1 Charter + 1 BRD + 1 Persona Analysis + ~6 Use Case + 1 PRD + 1 Roadmap + 1 SDD + ~8 ADR + 5–7 MOC + `000-Index.md` → khoảng 26–28 file. |

**Điểm**: 3/4 → **Tier**: **T3**

**Chọn tier thấp do phân vân**: **Không**. 3 điểm rơi đúng dải T3 và khối lượng thật (≈26 file, cần nhiều writer song song, cần tạo `000-Index.md` chưa tồn tại, cần rà toàn bộ MOC) khớp đặc trưng T3. Hạ xuống T2 sẽ bỏ mất bước rà MOC toàn cục — chính là chỗ kho docs này đang hỏng (xem *Quan sát*).

## Quan sát về hiện trạng repo (căn cứ cho close-step)

- `docs/000-Index.md` **chưa tồn tại** dù `RULE-001` quy định BẮT BUỘC phải có.
- `docs/030-Specs/Specs-MOC.md` là file **rỗng 0 dòng** — không có cả frontmatter.
- `docs/020-Requirements/Requirements-MOC.md` trỏ tới `PRD-TNMCORE-OS.md` — **link chết**.
- `docs/022-User-Stories/Stories-MOC.md` trỏ tới `Story-Request-OTP.md` và `Story-Verify-OTP.md` — **link chết**.
- `docs/999-Resources/Glossary.md` chỉ có 3 thuật ngữ, toàn bộ về OTP — **không liên quan Repro**, và không đủ làm chuẩn đối chiếu thuật ngữ.
- `docs/010-Planning/Roadmap.md` và `OKRs.md` là stub `*(Content to be added)*`.
- `src/` và `test/` **rỗng** — chưa có code. Mọi tài liệu kỹ thuật là thiết kế trước khi hiện thực, không phải mô tả code đang có.
- Tồn tại run cũ `docs/010-Planning/pm-runs/2026-08-11-repro-product-architecture-docs/` **rỗng hoàn toàn** (chỉ có `findings/` trống, không có `brief.md`) — một run bị bỏ dở. Theo guardrail, **không sửa và không xóa** nó.

Các mục link chết và MOC rỗng nằm trong file **PM sở hữu độc quyền**, nên được xử lý ở close-step (Bước 6) mà không cấp cho worker nào.

## Assumptions

- **A1 — `RQ.md` là nguồn sự thật duy nhất và đủ dùng.** Không có user interview, không có số liệu thị trường, không có code. → **sai thì hỏng ở đâu**: Persona và các con số trong PRD sẽ là *giả thuyết được khai báo*, không phải phát hiện được kiểm chứng. Xử lý: mọi tài liệu ghi rõ nguồn là proposal, mọi con số gắn nhãn hypothesis, không tài liệu nào được trình bày như đã validate.
- **A2 — Các khuyến nghị mà `RQ.md` đã tự nêu được coi là quyết định tạm thời.** Ví dụ: stack khởi điểm Node.js + PostgreSQL + HTTP (§18), self-hosting là yêu cầu (§16, §28), AI là layer phía trên chứ không phải lõi (§27). → **sai thì hỏng ở đâu**: ADR sẽ ghi sai bối cảnh quyết định. Xử lý: mọi ADR mở ở `status: draft` với Decision status **Proposed**, không phải Accepted — chưa có ai duyệt thật.
- **A3 — 16 câu hỏi ở `RQ.md §38` không chặn việc soạn tài liệu.** Chúng được đưa nguyên vào một mục *Open Questions* trong PRD thay vì bị trả lời hộ. → **sai thì hỏng ở đâu**: nếu anh cần đáp án chốt ngay thì PRD chưa dùng được để xuống story. Xử lý: đây là hạng mục đưa lên gate.
- **A4 — Không bịa nội dung để lấp chỗ trống.** Bất kỳ trường nào `RQ.md` không nói (ngày tháng cụ thể, tên người, ngân sách, velocity, kết quả đo thật) sẽ ghi `TBD`. → **sai thì hỏng ở đâu**: tài liệu sẽ có nhiều `TBD`, trông "chưa xong". Đó là đánh đổi có chủ ý và đúng hơn là bịa.
- **A5 — `RULE-001` thắng khi mâu thuẫn với command.** `.claude/commands/pm-doc.md` yêu cầu wiki-link `[[Document-Name]]`, nhưng `RULE-001` §Linking Rules (updated 2026-03-03) quy định **standard markdown link với relative path** và ghi rõ **KHÔNG dùng wiki-links**. `RULE-001` là contract của lane và mới hơn → **dùng standard markdown link**. → **sai thì hỏng ở đâu**: nếu anh thực sự muốn wiki-link cho Obsidian thì toàn bộ link phải viết lại. Đây là hạng mục đưa lên gate.

## Open questions (đưa lên gate ở Bước 3)

1. **Ánh xạ 4 hạng mục không có tên trong Document Type Mapping** — "Idea Brief", "Problem Statement", "Target User / Persona", "Scope / MVP" đặt ở đâu? PM có đề xuất, cần anh chốt.
2. **Số lượng ADR** — có ~12 quyết định đáng tầm ADR trong `RQ.md`. Làm hết hay chọn nhóm nền tảng?
3. **Có làm thêm `Risk-Register.md` và `NFR-Repro.md` không?** `RQ.md` dành §20–21 cho 18 risk và rải NFR định lượng khắp §23–24. Hai loại này **có chỗ chính thức trong Document Type Mapping** nhưng anh không nêu tên. Nhét hết vào PRD sẽ làm PRD loãng.
4. **Wiki-link vs markdown link** — xem A5.
5. Ai là người duyệt để chuyển tài liệu từ `draft` sang `approved`? Mặc định PM đặt tất cả ở `draft`.

## Phạm vi bị loại trừ ngay từ đầu

- **Không** sửa `docs/010-Planning/pm-runs/` của run cũ.
- **Không** sửa `knowledge-base/99-Templates/Documents-Template.md` (RULE-001, `approved`).
- **Không** viết code vào `src/` hay `test/` — đó là lane `/pm-code`.
- **Không** tạo User Story / Epic ở `022-User-Stories/` — anh không yêu cầu; PRD sẽ để lại điểm nối cho bước sau.
- **`docs/010-Planning/OKRs.md` cố ý giữ nguyên stub.** `RQ.md §31–32` là North Star Metric và supporting metrics — chúng thuộc mục *Success Metrics* của PRD, không phải OKR có Objective/Key Result với chủ sở hữu và kỳ hạn. Chưa có tổ chức, chưa có kỳ, chưa có chủ sở hữu → viết OKR bây giờ là bịa. Đây là **quyết định**, không phải bỏ sót.

## Hạng mục phát sinh do PM tự nhận (không cấp cho worker)

Run này khai sinh toàn bộ từ vựng của sản phẩm — `Repro Capsule`, `Execution Replay`, `Execution Diff`, `Execution Verification`, `Replay Boundary`, `Recorder`, `Replay Runtime`… — trong khi `docs/999-Resources/Glossary.md` hiện chỉ có 3 thuật ngữ về OTP. Theo yêu cầu của lane, thuật ngữ mới đáng chuẩn hóa phải được đề xuất bổ sung vào Glossary như một hạng mục của run. `Glossary.md` là file dùng chung ở `999-Resources` → **PM giữ, xử lý ở close-step** cùng với MOC, để hai writer không đụng nhau.

## Điều chỉnh sau vòng review hướng đi (trước Bước 2)

- **Bỏ `context-auditor` khỏi Bước 2.** Mục *Quan sát* ở trên đã chính là bản inventory: PM tự liệt kê đủ link chết, MOC rỗng, `000-Index` thiếu, Glossary/Roadmap stub, run bị bỏ dở. Cho `context-auditor` chạy lại để suy ra đúng bấy nhiêu là vi phạm guardrail *không spawn khi phần việc nhỏ hơn overhead nạp context*. Lens này giữ lại cho **Bước 6 verify**, nơi nó bắt buộc phải có.
- **Bước 2 còn 3 lens**, mỗi lens một mandate trích xuất **khác nhau** để không nhận về ba bản tóm tắt của cùng một đề xuất 2000 dòng.
