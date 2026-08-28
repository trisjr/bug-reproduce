---
description: PM tiếp nhận yêu cầu tài liệu (viết mới hoặc chuẩn hóa kho docs), triage ra tier, điều phối specialist agent với đúng một gate phê duyệt
---

Điều phối một yêu cầu **về tài liệu** đi hết vòng đời: tiếp nhận → phân loại → phân tích → lập plan → soạn thảo → xác minh → đăng ký, bằng cách dispatch các specialist agent và tự mình giữ vai trò Product Manager.

> [!IMPORTANT]
> **Bước 0 — Nạp hai file TRƯỚC KHI làm bất cứ việc gì:**
> 1. `.agent/workflows/pm-core.md` — 4 nguyên tắc bất biến, quy ước run-state, khung triage, thủ tục GATE, Worker Contract, Dispatch Prompt Template, Escalation Protocol, Guardrails chung.
> 2. `knowledge-base/99-Templates/Documents-Template.md` (**RULE-001**) — đây là **contract của lane này**: Document Type Mapping, cấu trúc thư mục Dewey, frontmatter bắt buộc, linking rules, validation checklist.
>
> File này chỉ định nghĩa phần riêng của lane tài liệu. Thiếu một trong hai file trên là chạy sai.

**Input**: Đối số sau `/pm-doc` là yêu cầu của khách hàng (dạng văn xuôi tự do). Nếu bỏ trống, dùng **tool AskUserQuestion** (câu hỏi mở) để hỏi: *"Yêu cầu tài liệu của anh là gì? Anh mô tả càng cụ thể càng tốt — viết mới hay chuẩn hóa cái đang có?"* KHÔNG được đoán.

**Sai lane?** Nếu yêu cầu thực chất là thay đổi source code, đó là việc của `/pm-code`. Dừng lại, báo anh. Viết tài liệu *mô tả* code thì vẫn thuộc lane này; sửa code cho khớp tài liệu thì không.

---

## Hai shape của yêu cầu tài liệu

Xác định shape **ngay tại Bước 1**, trước khi chấm triage. Hai shape đi hai đường khác nhau và nhầm shape là hỏng plan.

| | **Shape A — Authoring** | **Shape B — Normalization sweep** |
|---|---|---|
| Dấu hiệu | "viết PRD cho…", "soạn runbook…", "làm user guide…" | "chuẩn hóa tài liệu…", "rà lại docs…", "thống nhất thuật ngữ…", "dọn kho docs" |
| Bản chất | Tạo mới 1 hoặc vài tài liệu | Sửa hàng loạt tài liệu đã tồn tại |
| Việc đặc thù | Tra Document Type Mapping → chọn đích + template | **Phase inventory bắt buộc** trước khi plan |
| Rủi ro chính | Đặt sai thư mục, thiếu frontmatter, không link MOC | Sửa nửa vời → kho docs mâu thuẫn với chính nó |
| Tier điển hình | T0–T2 | Gần như luôn ≥ T2, vì tự thân đã vượt 5 file |

Yêu cầu lai (viết mới + dọn cái cũ liên quan) → xử theo **Shape B**, coi phần viết mới là một hạng mục trong sweep.

---

## Các bước thực hiện (Steps)

### Bước 1 — Intake & Triage

1. Lấy ngày hiện tại: `date +%F`. Đặt `run-id` = `<YYYY-MM-DD>-<slug-kebab-case-của-yêu-cầu>`.
2. Tạo `docs/010-Planning/pm-runs/<run-id>/brief.md` theo schema tại `docs/010-Planning/pm-runs/README.md`. Ghi `Lane: doc` và **`Shape: A | B`** kèm lý do.
3. Chấm **4 câu hỏi triage** của lane doc:

   | # | Câu hỏi |
   |---|---------|
   | Q1 | Yêu cầu chạm nhiều hơn một tầng tài liệu (Planning / Requirements / Stories / Specs / QA / Design / Research / Manuals / Deployment / Operations / Marketing)? |
   | Q2 | Cần sửa tài liệu đang ở `status: approved`, hoặc đổi taxonomy / naming convention / template dùng chung? |
   | Q3 | Yêu cầu mơ hồ — chưa rõ độc giả đích, phạm vi, hoặc thế nào là "xong"? |
   | Q4 | Ước lượng vượt 5 file hoặc vượt 1 ngày công? |

   > Q2 là "đổi contract" của lane này. Tài liệu `approved` đã có người đọc và trích dẫn — sửa nó có ripple effect y như đổi API.

   > **Q4 là tie-breaker, không phải câu hỏi độc lập.** Q4 chỉ được tính điểm khi **Q1 hoặc Q2 đã trả lời Có**. Lý do: nhiều file mà cùng một tầng tài liệu và không đụng taxonomy thì đó là việc *nhiều*, không phải việc *phức tạp* — cần một writer làm lâu, chứ không cần analysis fan-out. Vẫn ghi đáp án thật của Q4 vào `brief.md` kèm ghi chú "không tính điểm". **Ngoại lệ: Shape B luôn tính điểm Q4** — sweep chuẩn hóa tự thân đã là cross-cutting, và phase inventory là bắt buộc bất kể Q1/Q2.

4. Ánh xạ điểm sang tier theo bảng trong `pm-core.md`, với đường đi cụ thể của lane doc:

   | Tier | Đường đi |
   |------|----------|
   | **T0** | PM tự viết/sửa. 0 spawn. Bỏ qua Bước 2 và 4; vẫn làm Bước 6 close-step. |
   | **T1** | 1 writer duy nhất. Bỏ qua Bước 2, nhưng vẫn viết `outline.md` ở Bước 4. |
   | **T2** | Analysis (hoặc inventory) fan-out → soạn thảo → verify bởi `context-auditor`. Đủ 6 bước. |
   | **T3** | Như T2 + sweep nhiều writer song song + cập nhật `000-Index.md` + rà toàn bộ MOC liên quan. |

5. Áp dụng *quy tắc phân vân* trong `pm-core.md`: lưỡng lự thì chọn tier thấp hơn, ghi rõ điều kiện escalate.

### Bước 2 — Analysis / Inventory fan-out (chỉ T2, T3)

Mọi worker ở bước này **read-only**, không có va chạm ghi file.

**Shape B — inventory là bắt buộc và chạy trước mọi lens khác.** Không biết đang có gì thì không plan được sweep. Dispatch `context-auditor` với nhiệm vụ liệt kê: đường dẫn từng file trong phạm vi, `id`/`type`/`status`/`updated` của nó, MOC nào đang trỏ tới, link chết, nội dung trùng lặp, thuật ngữ không nhất quán. Nó **tự ghi** vào `findings/inventory.md` (file duy nhất nó được cấp) — bảng inventory thường dài hàng trăm dòng, bắt PM chép lại là nhân đôi nguyên khối dữ liệu đó trong context.

Sau đó (hoặc ngay từ đầu với Shape A) chọn lens phân tích theo tín hiệu — chỉ chọn lens thực sự cần:

| Tín hiệu trong yêu cầu | Agent |
|------------------------|-------|
| Kho tài liệu hiện có: link chết, trùng lặp, orphan, lệch thuật ngữ | `context-auditor` |
| Yêu cầu nghiệp vụ, user story, acceptance criteria, PRD/BRD/SRS | `business-analyst` |
| ADR, SDD, API spec, DB schema, tài liệu tích hợp | `architect` |
| Design system, user flow, wireframe spec | `product-designer` |
| Cần dữ liệu ngoài: đối thủ, thị trường, so sánh công nghệ | `researcher` |
| Test plan, test case, tài liệu QA | `quality-assurance` |
| Runbook, deploy guide, release notes, SLA | `devops-engineer` |
| Threat model, security spec, tài liệu tuân thủ | `security-auditor` |

**Dispatch tất cả lens đã chọn trong MỘT message**. Mỗi lens được cấp ownership **đúng một file**: `findings/<role>.md`; ngoài file đó là **read-only tuyệt đối** — không chạm `docs/`, không chạm `brief.md`, không chạm `outline.md`, không chạm findings của lens khác. Lens tự ghi mục *Kết luận của worker*; PM **không transcribe lại**, chỉ append *PM đọc được gì* + *Mâu thuẫn với lens khác*. Hai lens mâu thuẫn → BẠN phân xử, ghi vào `brief.md` mục *Assumptions*; không đủ cơ sở → đẩy lên gate.

### Bước 3 — GATE (bắt buộc, đúng một lần)

Theo đúng thủ tục GATE trong `pm-core.md`, cộng thêm hai mục riêng của lane doc:

- **Bảng đích tài liệu**: mỗi hạng mục ghi rõ `loại tài liệu → thư mục đích → tên file` tra từ **Document Type Mapping** của RULE-001. Không tự chế đường dẫn.
- **File ownership map** phải tuân thủ ràng buộc: **mọi file MOC và `000-Index.md` thuộc về PM, không cấp cho worker nào.** Đây là điểm hội tụ của mọi writer — cấp cho hai người là cầm chắc ghi đè lẫn nhau. Writer chỉ sở hữu file nội dung của mình.

### Bước 4 — Doc plan (T1, T2, T3)

Thay cho `/opsx:ff` bên lane code. Viết `docs/010-Planning/pm-runs/<run-id>/outline.md`:

```markdown
# Doc Plan: <run-id>

## Hạng mục
| # | Tài liệu | Loại (RULE-001) | Đích | Template | Trạng thái đích | Writer | Xong |
|---|----------|-----------------|------|----------|-----------------|--------|------|
| 1 | ... | prd | docs/020-Requirements/PRD-X.md | Documents-Template | draft | business-analyst | [ ] |

## Outline từng tài liệu
### <tài liệu 1>
- **Độc giả đích**: <ai đọc, để làm gì>
- **Cấu trúc**: <danh sách heading cấp 1-2>
- **Nguồn sự thật**: <file/code/finding nào là căn cứ — writer không được bịa>
- **Tiêu chí xong**: <đo được, không phải "viết đầy đủ">

## Wiki-link phải tạo
| Từ | Tới | Quan hệ (RULE-001 §Linking Rules) |

## MOC cần cập nhật
| MOC | Mục thêm/sửa |
```

- **`outline.md` do PM độc quyền chỉnh sửa** — writer báo xong trong `SUMMARY`, PM tick. Đây là chốt chặn chống ghi đè, tương đương `tasks.md` bên lane code.
- **Outline phải có "Nguồn sự thật" cho từng tài liệu.** Đây là chống ảo giác đặc thù của lane doc: viết văn xuôi thì bịa rất dễ và rất khó phát hiện, khác hẳn code — code sai thì compiler hoặc test bắt được, prose sai thì trôi thẳng vào kho tri thức.
- **T3**: bổ sung mục *Ripple* — tài liệu nào đang trích dẫn phạm vi này và sẽ lệch sau khi sửa.

### Bước 5 — Soạn thảo

**Lane T0 — PM tự viết.** Không dispatch ai. Bỏ qua mục 1–5 bên dưới, làm trực tiếp rồi sang Bước 6.

**Lane T1, T2, T3 — dispatch writer** theo cột *Writer* trong `outline.md`:

1. **Một dispatch = một tài liệu** (Shape A), hoặc **một lô ≈3–5 file** (Shape B). Không giao cả `outline.md` hay cả sweep cho một writer — chi phí một agent tăng theo `turns^1.74` (xem Guardrails trong `pm-core.md`), nên một writer ôm 10 tài liệu đắt hơn nhiều lần bốn writer mỗi người vài tài liệu.

   > Số tài liệu / số file dùng để **cắt** lô. Thứ **chặn** là ngân sách tool call trong *Ngân sách mỗi dispatch* (`pm-core.md`) — mặc định 60 mỗi dispatch, và lane doc không có phụ cấp mutation-test. Cấp con số đó trong `[TASK]`; writer chạm trần thì trả `PARTIAL` kèm handoff note. Ngân sách **không bao giờ** là lý do hạ chuẩn: một tài liệu viết vội cho lọt trần đắt hơn một lần `PARTIAL`.
2. Trích **toàn văn** outline của **đúng tài liệu / lô đó** vào prompt — không đưa đường dẫn `outline.md` rồi bắt worker tự đọc, và không đưa outline của hạng mục khác.
3. Dispatch theo file ownership map đã duyệt:
   - Các lô **tuần tự** là mặc định: writer xong lô → trả về Worker Contract → PM tick `outline.md` → dispatch writer MỚI cho lô kế. Không giao thêm việc cho writer đang chạy.
   - Nhiều writer **song song** → chỉ khi ownership rời nhau. Với Shape B, cắt theo file hoặc theo thư mục con, không bao giờ cắt theo "chủ đề" vì chủ đề chồng lấn file.
4. Mọi prompt dispatch phải kèm ràng buộc bắt buộc của lane doc:
   - Tuân thủ **RULE-001**: đúng thư mục, đúng naming convention, frontmatter đủ `id / type / status / created`.
   - Sửa file đã có → **bump `updated: <YYYY-MM-DD>`**. Đây là contract, quên là coi như chưa xong.
   - **Không chạm file MOC hay `000-Index.md`** — PM giữ.
   - Wiki-link theo `[[Document-Name]]` như RULE-001 §Linking Rules quy định.
   - Không bịa số liệu, ngày tháng, tên người, quyết định lịch sử. Không có nguồn → viết `TBD` và báo `PARTIAL`.
5. Sau mỗi worker trả về, đối chiếu `FILES_TOUCHED` với ownership rồi mới tick `outline.md`.

### Bước 6 — Verification & Close

Đây là bước lane doc dễ bị làm ẩu nhất: tài liệu viết xong mà không ai trỏ tới thì coi như không tồn tại.

1. **Verify — phải do agent KHÁC agent đã viết.** Mặc định `context-auditor`, vì remit của nó đúng các failure mode của tài liệu: link chết, trùng nội dung, lệch thuật ngữ, file orphan.
   - **T0, T1**: PM tự chạy *Validation Checklist* của RULE-001 trên từng file.
   - **T2, T3**: dispatch `context-auditor` với 4 tiêu chí:
      - **Completeness** — đủ hạng mục trong `outline.md`, frontmatter đủ trường, `updated` đã bump.
      - **Correctness** — nội dung khớp *Nguồn sự thật* đã khai trong outline, không có khẳng định không có căn cứ.
      - **Coherence** — không mâu thuẫn tài liệu liền kề, không trùng lặp nội dung đã có, thuật ngữ nhất quán trong nội bộ phạm vi. `docs/999-Resources/Glossary.md` hiện mới là stub (~12 dòng) nên **không đủ làm chuẩn đối chiếu**; gặp thuật ngữ mới đáng chuẩn hóa thì đề xuất bổ sung vào Glossary như một hạng mục của run, đừng coi việc nó im lặng là đã đạt.
      - **Connectivity** — mọi wiki-link phân giải được, không file nào orphan.
   - Thêm `quality-assurance` **chỉ khi** yêu cầu có acceptance criteria kiểm chứng được (ví dụ test plan, test case).
2. Ghi kết quả vào `docs/010-Planning/pm-runs/<run-id>/verdict.md`.
3. Có lỗi CRITICAL → quay lại Bước 5 với worker mới, kèm nguyên văn lỗi. Không tự vá rồi tuyên bố xong.
4. **Close-step — PM tự làm, bắt buộc mọi tier.** Đây là tương đương `/opsx:archive` của lane doc:
   - Cập nhật **MOC của thư mục cha** cho từng tài liệu mới/đổi tên.
   - Cập nhật `docs/000-Index.md` nếu là tài liệu lớn (PRD, SDD, MTP, Roadmap).
   - Tài liệu bị thay thế → chuyển `docs/090-Archive/` và đặt `status: deprecated`, **không xóa**. Thư mục này chưa tồn tại trong repo — lần đầu cần dùng thì tạo mới theo đúng RULE-001, đừng dựng thư mục khác thay thế.
   - Chạy lại *Validation Checklist* của RULE-001 lần cuối trên toàn bộ danh sách.
5. Báo cáo tổng kết cho anh theo mục *Output* trong `pm-core.md`, kèm danh sách MOC đã cập nhật.

---

## Guardrails riêng lane doc

Ngoài Guardrails chung trong `pm-core.md`:

- **Không tạo thư mục top-level ngoài hệ Dewey của RULE-001.** Không có chỗ cho tài liệu → hỏi anh, không tự chế thư mục mới.
- **Không xóa tài liệu.** Lỗi thời thì `status: deprecated` + chuyển `090-Archive/`. Lý do tài liệu cũ sai cũng là dữ liệu.
- **Không sửa run-state của run cũ** trong `docs/010-Planning/pm-runs/`. Nó là dấu vết quyết định tại thời điểm chạy, không phải tài liệu cần chuẩn hóa. Sweep Shape B phải loại thư mục này khỏi phạm vi ngay tại gate.
- **File MOC và `000-Index.md` không bao giờ cấp cho worker.** PM giữ độc quyền — đây là điểm hội tụ của mọi writer.
- **Không tick `outline.md` thay worker khi chưa đọc `FILES_TOUCHED`.**
- **Không coi "đã viết xong file" là xong.** Chưa đăng ký MOC thì run chưa đóng được.
- **Shape B: không sửa nửa vời.** Đã chuẩn hóa một quy ước thì phải quét hết phạm vi đã duyệt ở gate. Không đủ sức làm hết → cắt scope **tại gate**, không cắt ngầm giữa chừng.
