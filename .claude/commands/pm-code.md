---
description: PM tiếp nhận yêu cầu code, triage ra tier, điều phối specialist agent thực thi end-to-end với đúng một gate phê duyệt
---

Điều phối một yêu cầu **thay đổi source code** đi hết vòng đời: tiếp nhận → phân loại → phân tích → lập plan → thực thi → xác minh, bằng cách dispatch các specialist agent và tự mình giữ vai trò Product Manager.

> [!IMPORTANT]
> **Bước 0 — Nạp `.agent/workflows/pm-core.md` TRƯỚC KHI làm bất cứ việc gì.** File đó chứa 4 nguyên tắc bất biến, quy ước run-state, khung triage, thủ tục GATE, Worker Contract, Dispatch Prompt Template, Escalation Protocol và Guardrails. File này chỉ định nghĩa phần **riêng của lane code**. Thiếu pm-core là chạy sai.

**Input**: Đối số sau `/pm-code` là yêu cầu hoặc đề bài của khách hàng (dạng văn xuôi tự do). Nếu bỏ trống, dùng **tool AskUserQuestion** (câu hỏi mở) để hỏi: *"Yêu cầu của khách hàng là gì? Anh mô tả càng cụ thể càng tốt."* KHÔNG được đoán.

**Sai lane?** Nếu yêu cầu hóa ra không đụng tới source code — chuẩn hóa tài liệu, viết spec/PRD/manual, audit knowledge base — thì đây là việc của `/pm-doc`. Dừng lại, báo anh, đừng cố uốn nó vào OpenSpec.

---

## Các bước thực hiện (Steps)

### Bước 1 — Intake & Triage

1. Lấy ngày hiện tại: `date +%F`. Đặt `run-id` = `<YYYY-MM-DD>-<slug-kebab-case-của-yêu-cầu>`.
2. Tạo `docs/010-Planning/pm-runs/<run-id>/brief.md` theo schema tại `docs/010-Planning/pm-runs/README.md`. Ghi `Lane: code`.
3. Chấm **4 câu hỏi triage** của lane code:

   | # | Câu hỏi |
   |---|---------|
   | Q1 | Yêu cầu chạm nhiều hơn một domain (BE / FE / Design / Infra / Data)? |
   | Q2 | Cần quyết định kiến trúc, hoặc thay đổi contract (API, DB schema, spec đã publish)? |
   | Q3 | Yêu cầu mơ hồ — chưa có acceptance criteria rõ ràng, hoặc có nhiều cách hiểu? |
   | Q4 | Ước lượng vượt 5 file hoặc vượt 1 ngày công? |

   > **Q4 là tie-breaker, không phải câu hỏi độc lập.** Q4 chỉ được tính điểm khi **Q1 hoặc Q2 đã trả lời Có**. Lý do: khối lượng lớn mà gói trong một domain và không đổi contract thì đó là việc *nhiều*, không phải việc *phức tạp* — nó cần một implementer làm lâu, chứ không cần analysis fan-out và verify agent riêng. Vẫn ghi đáp án thật của Q4 vào `brief.md` kèm ghi chú "không tính điểm (Q1=Không, Q2=Không)" để về sau truy được vì sao ra tier đó.

4. Ánh xạ điểm sang tier theo bảng trong `pm-core.md`, với đường đi cụ thể của lane code:

   | Tier | Đường đi |
   |------|----------|
   | **T0** | PM tự code. 0 spawn. Bỏ qua Bước 2 và 4; vẫn đi qua Bước 5 theo lane T0. |
   | **T1** | `/opsx:ff` + 1 implementer. Bỏ qua Bước 2. |
   | **T2** | Analysis fan-out → implement → verify bởi agent khác. Đủ 6 bước. |
   | **T3** | Full OpenSpec path: đủ 6 bước + delta specs + design + archive. |

5. Áp dụng *quy tắc phân vân* trong `pm-core.md`: lưỡng lự thì chọn tier thấp hơn, và ghi lại điều kiện escalate.

### Bước 2 — Analysis fan-out (chỉ T2, T3)

Đây là nơi song song thực sự sinh lời: mọi worker ở bước này **read-only**, không có va chạm ghi file.

1. Chọn lens phân tích theo tín hiệu trong yêu cầu — chỉ chọn lens thực sự cần, mỗi lens thừa là một lần nạp lại toàn bộ context tốn kém:

   | Tín hiệu trong yêu cầu | Agent |
   |------------------------|-------|
   | Mơ hồ, thiếu acceptance criteria, cần user story | `business-analyst` |
   | Có UI, màn hình, luồng người dùng, cần wireframe | `product-designer` |
   | Đổi contract / schema / tích hợp hệ thống / NFR | `architect` |
   | Cần dữ liệu thị trường, so sánh thư viện, benchmark | `researcher` |
   | Chạm auth, PII, thanh toán, phân quyền | `security-auditor` |
   | Chạm CI/CD, deployment, hạ tầng | `devops-engineer` |

2. **Dispatch tất cả lens đã chọn trong MỘT message** (nhiều tool use song song). Không dispatch tuần tự.
3. Mỗi prompt dispatch phải theo *Dispatch Prompt Template*, và cấp ownership **đúng một file duy nhất**: `docs/010-Planning/pm-runs/<run-id>/findings/<role>.md`. Ngoài file đó, worker **read-only tuyệt đối** — không chạm source code, không chạm `brief.md`, không chạm findings của lens khác.
4. Lens tự ghi kết luận vào file findings của mình (mục *Kết luận của worker*), rồi báo `FILES_TOUCHED`. PM **không transcribe lại** — chỉ đọc file đó và append mục *PM đọc được gì* + *Mâu thuẫn với lens khác*. Mỗi lens một file nên các tập ownership vẫn rời nhau tuyệt đối, chạy song song an toàn.
5. Nếu hai lens mâu thuẫn nhau, BẠN phân xử và ghi phán quyết vào `brief.md` mục *Assumptions*. Nếu không đủ cơ sở phân xử, đưa mâu thuẫn đó vào gate ở Bước 3 cho anh quyết.

### Bước 3 — GATE (bắt buộc, đúng một lần)

Theo đúng thủ tục GATE trong `pm-core.md`. Riêng lane code, phần *File ownership map* phải cắt theo **module / thư mục feature**, và ghi rõ `tasks.md` thuộc về PM, không cấp cho worker nào.

### Bước 4 — Planning artifacts (T1, T2, T3)

- **T1, T2**: chạy `/opsx:ff` để scaffold change và sinh đủ artifact tới mức apply-ready.
- **T3**: như trên, cộng thêm delta specs trong `openspec/changes/<name>/specs/` và `design.md`.
- **KHÔNG chạy `/opsx:new`.** `ff` đã bao trùm nó (`new` chỉ scaffold rồi dừng). Chạy cả hai là bước thừa.
- **KHÔNG chạy `/opsx:explore` như một phase.** Theo chính định nghĩa của nó, explore là *một vị thế, không phải workflow, không có output bắt buộc*. Bước 1 và Bước 2 đã thay thế nó bằng phase có output cụ thể.

### Bước 5 — Implementation

**Lane T0 — PM tự implement.** Không dispatch ai. Ownership = toàn bộ scope đã duyệt ở gate. Bỏ qua mục 1–6 bên dưới, làm trực tiếp rồi sang Bước 6. Đây chính là lý do T0 tồn tại: phần việc nhỏ hơn overhead nạp context của một subagent (~23.6k token).

**Lane T1, T2, T3 — dispatch implementer** (mặc định `software-engineer`; `devops-engineer` cho việc hạ tầng/CI):

1. **Cắt `tasks.md` thành lô trước khi dispatch bất cứ ai.** Mỗi lô ≈ **3–5 file** hoặc một nhóm task gắn kết (ví dụ: "entity + migration", "endpoint + DTO + test", "một màn hình FE"). **Không bao giờ giao cả `tasks.md` cho một implementer** — đó là cách sinh ra agent chạy 400–620 turn, và chi phí một agent tăng theo `turns^1.74` (xem Guardrails trong `pm-core.md`). Cắt cùng khối lượng đó thành 4 lô rẻ hơn ~58%.
2. **Cấp ngân sách tool call cho từng lô** theo *Ngân sách mỗi dispatch* trong `pm-core.md`: **60 + 15 cho mỗi spec phải mutation-test**. Ghi con số đó vào `[TASK]`, kèm cả ba stop rule cứng (full BE suite tối đa 1 lần/lô; hai lần fix hỏng liên tiếp cùng một test → `BLOCKED`; **không `PARTIAL` giữa mutation test — restore trước đã**) và câu "ngân sách không bao giờ là lý do hạ chuẩn kiểm chứng".

   > Số file **không** phải trần. Đo run `2026-08-22-google-account-set-password`: lô đắt nhất chỉ chạm ~3 file — đúng chuẩn "3–5 file" — vẫn chạy 105 tool call / 171 turn / 18.9M token. Số file dùng để *cắt*; ngân sách tool call mới là thứ *chặn*.

3. Trích **toàn văn task của ĐÚNG lô đó** vào prompt — không đưa cho worker đường dẫn plan file rồi bắt nó tự đọc, và cũng không đưa task của lô khác.
4. Dispatch theo file ownership map đã duyệt:
   - Các lô **tuần tự** là mặc định: worker xong lô 1 → trả về Worker Contract → PM tick → dispatch worker MỚI cho lô 2. Không giao thêm việc cho worker đang chạy.
   - Nhiều implementer **song song** → chỉ khi ownership rời nhau và đã qua gate. Dispatch trong một message.
   - Worker trả `PARTIAL` vì chạm ngân sách → dán nguyên văn **handoff note** của nó vào `[SCENE]` của worker kế tiếp. Đây là đường đi bình thường, không phải sự cố.
5. `tasks.md` do PM độc quyền tick, sau khi đã đối chiếu `FILES_TOUCHED` với ownership đã cấp.
6. **Sau mỗi 4 lô: chạy full BE suite, RỒI checkpoint `/compact`** — theo thứ tự đó, theo mục *Chi phí của chính PM* trong `pm-core.md`. Chạy suite ở đây là cách bù cho luật "worker chỉ được chạy full suite 1 lần": nó bắt các regression chéo lô mà `jest <path>` của worker không thấy. Đặt ngay trước `/compact` để output to đùng đó bị vứt đi thay vì nằm lại trong context PM. Run-state đã giữ đủ trạng thái để resume — đó là lý do nó tồn tại.

### Bước 6 — Verification & Close

1. **Verify phải do agent KHÁC agent đã implement.** Mặc định `quality-assurance`.
   - **T0, T1**: PM tự đối chiếu acceptance criteria. Không spawn.
   - **T2, T3**: dispatch `quality-assurance` chạy theo tiêu chí của `/opsx:verify` (Completeness / Correctness / Coherence).

2. **Verify cũng phải cắt lô — nó KHÔNG được miễn trần.** Đây là chỗ tốn kém nhất và lâu nay không có gì chặn: trần cũ đếm theo file *được ghi*, mà verify read-only nên trần rỗng nghĩa. Đo run `2026-08-22-google-account-set-password`: một lô verify duy nhất chạy 90 tool call / 164 turn / **26.5M token — 19% chi phí toàn run**, đắt hơn mọi lô implementation.
   - Cắt thành **các pass rời nhau**, mỗi pass một dispatch riêng với ngân sách tool call riêng. Mặc định cắt theo 3 tiêu chí (Completeness / Correctness / Coherence); change chạm nhiều tầng thì cắt theo tầng (BE / FE / specs). Chọn cách nào cho ra các pass **thật sự rời nhau** — cắt mà hai pass cùng đọc lại một bộ file thì đó là nhân đôi chi phí, không phải cắt.
   - Các pass read-only nên **dispatch song song trong MỘT message**: không có va chạm ghi, và mỗi pass giữ được context sạch.
   - Mỗi pass sở hữu **đúng một file** `docs/010-Planning/pm-runs/<run-id>/verdict-<pass>.md`. PM tổng hợp thành `verdict.md`, không để hai pass cùng ghi một file.
   - **Full test suite chạy đúng MỘT lần cho cả Bước 6**, do PM chạy trước rồi dán kết quả vào `[CONTEXT]` của các pass. Để mỗi pass tự chạy lại cả suite là trả tiền cho cùng một output nhiều lần.

3. Ghi kết quả vào `docs/010-Planning/pm-runs/<run-id>/verdict.md`.
4. Có lỗi CRITICAL → quay lại Bước 5 với worker mới, kèm nguyên văn lỗi. Không tự vá rồi tuyên bố xong.
5. **T3**: sau khi verdict sạch, chạy `/opsx:archive`.
6. Chạy **close-step đo chi phí** trong `pm-core.md`, ghi `cost.md`.
7. Báo cáo tổng kết cho anh theo mục *Output* trong `pm-core.md`.

---

## Guardrails riêng lane code

Ngoài Guardrails chung trong `pm-core.md`:

- Tier T3 cần các lệnh `openspec archive|sync|validate` nằm trong allowlist của `.claude/settings.local.json`. Thiếu là run sẽ treo ở permission prompt giữa chừng.
- Không tick `tasks.md` thay worker khi chưa đọc `FILES_TOUCHED`.
- Không tự sửa code của worker rồi tuyên bố verdict sạch — sửa thì phải dispatch worker mới và verify lại.
