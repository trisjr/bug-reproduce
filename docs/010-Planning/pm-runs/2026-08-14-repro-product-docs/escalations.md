# Escalations: 2026-08-14-repro-product-docs

Ghi lại mọi lần PM phân xử ở tầng 2 (trong phạm vi `brief.md`) hoặc đẩy lên tầng 3 (hỏi anh) **sau** gate. Bốn hạng mục đã chốt tại gate nằm ở `run-plan.md §Gate`, không lặp lại ở đây.

---

## E-01 — `D-24` không truy vết được (tầng 2, PM tự quyết)

**Ai nêu**: writer `architect` phụ trách ADR-001..006, báo `STATUS: PARTIAL` vì đúng một hạng mục này.

**Vấn đề**: `outline.md §10` giao cho `ADR-003` phủ `D-04` *"(+`D-24` nhắc)"`. Nhưng `findings/architect.md` là **bản tóm tắt của PM về lens phân tích**, nó chỉ **pin định danh** `D-01`…`D-32` chứ không lưu toàn văn từng decision. Worker lens gốc đã kết thúc, không có cách nào đọc lại nội dung `D-24`.

**Worker đã làm gì**: chọn nội dung gần nhất *có căn cứ trong `RQ.md`* và đúng phạm vi ADR-003 — §20.9 (Database Schema Drift) — xử lý ở mục Decision #4 của ADR-003, **nhưng ghi rõ ánh xạ `D-24 ⇄ §20.9` là suy đoán và để `TBD` chờ PM xác nhận**. Worker nói thẳng: *"Em không bịa nội dung cho một định danh mình không đọc được."*

**PM quyết định**: **chấp nhận nguyên trạng, giữ `TBD`.**

Lý do:
1. Hành vi của worker đúng chuẩn chống ảo giác của lane — thà để `TBD` còn hơn lấp một định danh không đọc được bằng nội dung tự chế. Đây chính xác là điều `brief.md §A4` yêu cầu.
2. PM **cũng không** khôi phục được `D-24`. Ép một nội dung vào đó chỉ là chuyển hành vi bịa từ worker sang PM.
3. Tổn thất thực tế nhỏ: `D-24` được `outline.md` mô tả là mục *"nhắc"*, không phải decision chính của ADR-003 (`D-04` mới là chính, và `D-04` đã được phủ đầy đủ). Nội dung §20.9 mà worker chọn có căn cứ văn bản độc lập, nên ADR-003 không thiếu chất — chỉ thiếu **sợi truy vết** về một định danh nội bộ của run.

**Hệ quả cần biết**: nếu về sau anh cần truy vết đầy đủ `D-01`…`D-32`, phải chạy lại lens `architect` và lần này **lưu toàn văn** vào `findings/`, chứ không chỉ lưu định danh. Đây là bài học vận hành của run, ghi ở mục cuối.

**Không đổi tier, không đổi lane, không cần anh quyết.**

---

## E-02 — Sai section number trong prompt dispatch (tầng 2, worker sửa đúng)

**Ai nêu**: writer `architect` phụ trách ADR-007..011.

**Vấn đề**: prompt dispatch của PM ghi cụm *"UUID where practical"* thuộc **§12**. Worker grep `RQ.md` và tìm thấy chuỗi thật là *"UUID capture where practical"* ở **dòng 952 = §20.2** (mitigation của *Non-Determinism*). §12 là *External API Strategy* và không chứa cụm đó.

**PM quyết định**: **worker đúng, giữ theo `RQ.md` (§20.2).** PM đã Read lại `RQ.md:949-955` để xác minh độc lập — đúng nguyên văn `- UUID capture where practical` nằm trong phần Mitigation của §20.2.

Đây là kiểu correction PM cần: worker không im lặng chép theo prompt sai, cũng không dừng lại hỏi cho một việc verify được bằng grep. Worker vẫn giữ §12 làm neo cho vế *deterministic external inputs* — đúng, vì §12 thật sự nói về việc thay response ngoài bằng bản ghi.

**Hệ quả vận hành**: prompt dispatch do PM soạn **không phải nguồn sự thật**; `RQ.md` mới là. Ràng buộc `[ANTI-HALLUCINATION]` trong template dispatch đã hoạt động đúng như thiết kế.

---

## E-03 — Tool policy chặn writer ghi file thứ 7 (tầng 2, PM ghi hộ)

**Ai nêu**: writer `business-analyst` phụ trách BRD + 5 UC + Persona, báo `STATUS: PARTIAL`.

**Vấn đề**: writer ghi thành công 6/7 file. File thứ bảy — `docs/050-Research/Analysis-Target-Users.md` — bị **harness từ chối** ở tầng tool policy với lý do *"Subagents should return findings as text, not write report files"*. Đây là quy tắc của runtime, không liên quan tới ownership map của run: path này **có** nằm trong ownership đã duyệt tại gate. Tên file khớp mẫu `Analysis-*` nên bị nhận diện nhầm là report của subagent.

**Worker đã làm gì**: thử 2 lần, **không lách quy tắc**, và trả **toàn văn** nội dung file trong final message để PM persist.

**PM quyết định**: **PM tự ghi file từ toàn văn worker trả về.** Đây là việc PM được phép làm — `docs/050-Research/` nằm trong vùng deliverable đã duyệt tại gate, và nội dung là sản phẩm của worker chứ không phải PM tự sáng tác.

PM đã kiểm trước khi ghi:
- Đủ 7 H2 theo outline; mục 1 (mức độ bằng chứng) và mục 6 (điều chúng ta không biết) đều tồn tại — đây là hai mục bắt buộc chống việc đọc tài liệu này như kết quả nghiên cứu.
- Mọi dòng thuộc tính ở mục 3, 4, 5 đều mang nhãn `stated` hoặc `inferred`.
- Không có demographic / tên / tuổi / công ty / con số nào không có trong `RQ.md`.
- **Một chỉnh sửa kỹ thuật duy nhất của PM**: khôi phục các ký tự `>` của blockquote bị escape thành `&gt;` trong lúc truyền qua final message. Không đổi một chữ nội dung nào.

**Hệ quả vận hành**: với các file có tên khớp mẫu `Analysis-*` / `Report-*` / `*-findings`, tool policy có thể chặn writer. Lần sau nên lường trước — hoặc PM tự viết nhóm này, hoặc dặn writer trả toàn văn ngay từ đầu thay vì để phát hiện giữa chừng.

---

## E-04 — Link tới Security Spec tạm thời chưa phân giải (không phải lỗi, tự đóng)

**Ai nêu**: cùng writer trên, mục BLOCKER #2.

**Vấn đề**: writer phát hiện `docs/030-Specs/Security/Spec-Security-Repro-Threat-Model.md` **chưa tồn tại**, trong khi `PRD-Repro.md` (mục 3.4, 10.2, 11) và `NFR-Repro.md` (mục 5, 8) đã link tới — writer đếm được 7 link chưa phân giải và báo lên vì không có quyền sửa hai file đó.

**PM quyết định**: **không hành động, đây là trạng thái dự kiến của quy trình.**

Lý do: writer `security-auditor` **vẫn đang chạy** tại thời điểm writer này verify. Toàn bộ Bước 5 được thiết kế để writer cross-link tới file *chưa tồn tại lúc viết* — đó chính là lý do `outline.md` có mục *"Ràng buộc đóng băng — writer KHÔNG được tự đặt path hay id"*: path được chốt trước để mọi writer link đúng đích, bất kể ai viết xong trước.

**Điểm đáng ghi nhận**: writer đã xử lý đúng — **không** tạo link tới file chưa tồn tại trong 7 file của mình, mà diễn đạt lại nội dung threat model dưới dạng trích từ NFR mục 5. Cách này giữ 7 file của writer luôn có link phân giải được, kể cả trong trường hợp xấu nhất là Security Spec không bao giờ ra đời.

**Việc PM phải làm**: xác nhận lại ở Bước 6 (Connectivity) rằng file đã tồn tại và toàn bộ link phân giải. Nếu `security-auditor` thất bại, đây trở thành lỗi CRITICAL thật và PM phải xử lý ở đó — không phải bây giờ.

---

## E-05 — Anh chốt M1 và M2 (tầng 3, quyết định của anh)

**Ngày**: 2026-08-14, sau khi bộ 32 tài liệu đã hoàn tất và qua verify.

Hai mâu thuẫn nội tại của `RQ.md` được quyết định `G4` tại gate yêu cầu **ghi trung thực hai phía và chờ anh chốt**. Nay anh đã chốt cả hai.

### Quyết định D1 — M1: regression test generation **giữ ở V0.2**

| | |
|---|---|
| **Anh chốt** | Giữ nguyên `RQ.md §26` — regression test generation thuộc **V0.2**, không kéo về V0.1 |
| **Metric thay thế cho V0.1** | **Số bug đạt trạng thái *"Execution matched"*** (`RQ.md §10`) |
| **North Star §31** | Giữ nguyên làm metric **dài hạn**, **kích hoạt từ V0.2** khi tính năng regression generation tồn tại |

**Vì sao metric này đúng**: *"Execution matched"* là trạng thái mạnh nhất mà V0.1 **tự sinh ra được**, và nó đo đúng thứ V0.1 tồn tại để chứng minh — rằng execution được **tái hiện thật**, chứ không chỉ chạy xong. Nó cũng là chỉ số trực tiếp chống lại risk Critical `§20.3` (false replay equivalence), vốn là chỗ nguy hiểm nhất về mặt tin cậy.

**Hệ quả kéo theo**:
- `N-05` (Execution Match Rate, `RQ.md §23`) từ *"metric không có ngưỡng"* trở thành **chỉ số thành công chính của V0.1** ⇒ việc nó **không có ngưỡng** ở `§24` giờ là một khoảng hở **nặng hơn trước**, phải nêu rõ ở `NFR §3`.
- Persona C (QA Engineer) **chính thức xác định là "activated at V0.2"** — không còn treo theo M1.

### Quyết định D2 — M2: **authn + authz + audit vào OSS core**

| | |
|---|---|
| **Anh chốt** | Cả ba — **authentication, authorization (access control), và audit log** — nằm trong **OSS core**, không phải commercial layer |
| **Ghi đè** | `RQ.md §28`, phần xếp *Access control* và *Retention policies* vào commercial layer |
| **Giữ nguyên ở commercial layer** | Hosted storage · Team management · Analytics · AI analysis · Cloud integrations (`§28`) |

**Vì sao cả ba chứ không chỉ authn**: authn trả lời *bạn là ai*, authz quyết định *bạn xem được capsule nào*, audit ghi lại *ai đã pull gì*. Thiếu authz thì bản self-host vẫn là bản **ai đăng nhập cũng đọc được mọi capsule production** — mâu thuẫn M2 chưa được giải quyết. Thiếu audit thì tổ chức kiểm soát được nhưng **không chứng minh được**, trong khi `§20.17` yêu cầu audit log như mitigation cho risk 🟠 High.

**Hệ quả kéo theo**:
- `THREAT-008` chuyển từ `[GAP — RQ.md KHÔNG CÓ MITIGATION]` sang **có mitigation**, residual risk giảm.
- `SEC-016 / 018 / 020 / 021` được xác nhận là **MUST-V0.1 trong OSS core**.
- **`GAP-04` nặng thêm, không nhẹ đi.** Trước đây authz/audit *có thể* không được lấp ở bản OSS nên `GAP-04` còn mơ hồ. Nay chúng **chắc chắn phải có trong OSS core**, mà `§18` vẫn **không có một CLI verb nào** để vận hành chúng (cả 6 verb đều developer-side). Khoảng trống giao diện vận hành giờ là nợ tường minh, phải nêu rõ ở `Analysis-Target-Users §4.1` và `PRD`.
- `R-05`, `R-06`, `R-16` ở Risk Register được cập nhật mitigation.

### Cách thi hành — nguyên tắc PM áp cho toàn bộ worker

**KHÔNG xoá phần trích dẫn hai phía.** `RQ.md` vẫn tự nói ngược ở chính những chỗ đó; xoá bằng chứng đi thì về sau không ai hiểu vì sao tài liệu dẫn xuất lại chọn phía này. Cách làm đúng: **giữ nguyên bối cảnh hai phía kèm section number**, chỉ thay nhãn **"cần anh chốt"** bằng **"✅ ĐÃ CHỐT 2026-08-14"** cộng nội dung quyết định và hệ quả.

Phân công theo đúng ownership map cũ của run: PM giữ Charter / Roadmap / Risk-Register / Glossary; `business-analyst` giữ PRD / NFR / UC / Persona; `architect` giữ SDD / ADR; `security-auditor` giữ threat model. Ba worker chạy song song, ownership rời nhau tuyệt đối.

---

## E-06 — PM lập sót danh sách file khi thi hành D1 (tầng 2, tự phát hiện qua verify)

**Ai phát hiện**: PM, khi chạy verify vòng 2 sau lượt cập nhật M1/M2.

**Vấn đề**: khi lập danh sách file cần cập nhật cho quyết định **D1 (M1)**, PM dùng bản kê trong báo cáo của `context-auditor` — bản này liệt kê M1 xuất hiện ở `ADR-011`, M2 ở `ADR-002` và `ADR-009`. Nhưng **báo cáo của chính writer đã viết nhóm ADR-001..006** nói rõ hơn: *"M1 xuất hiện ở 3 ADR (002, 004, 006), M2 ở ADR-002"*.

⇒ PM sót **`ADR-004`** và **`ADR-006`**. Cả hai vẫn còn nguyên mục *"### Mâu thuẫn cần anh chốt"* sau khi lượt cập nhật đã chạy.

**Vì sao sót**: hai nguồn thông tin cùng đúng nhưng **khác độ phân giải**. Auditor liệt kê theo *chỗ có sức nặng* (nơi M1/M2 được trình bày đầy đủ hai phía kèm phương án); writer liệt kê theo *mọi chỗ đã ghi*. PM lấy nguồn có sức nặng làm danh sách thi hành — đó là lỗi loại nguồn, không phải lỗi đọc.

**Xử lý**: dispatch một `architect` mới cho đúng 2 file sót. Nhân dịp này giao thêm một việc thực chất ở `ADR-006` — nâng `N-05` và `U-04` lên đúng tầm quan trọng mới, vì `ADR-006` chính là file định nghĩa Execution Verification, mà *"Execution matched"* nay là chỉ số thành công của V0.1.

**Điều đáng ghi nhận**: lỗi này được bắt bởi **verify vòng 2 do PM tự chạy** (`grep -rn "cần anh chốt"` trên toàn kho), không phải bởi may mắn. Guardrail *"không tick thay worker khi chưa đọc `FILES_TOUCHED`"* và thói quen verify sau mỗi vòng đã hoạt động đúng.

---

## Bài học vận hành của run này

| # | Bài học | Áp dụng lần sau |
|---|---|---|
| 1 | **`findings/*.md` chỉ pin định danh thì định danh đó thành nợ.** Một định danh không có toàn văn là một chỗ writer buộc phải hoặc bịa hoặc để `TBD`. | Khi ghi `findings/`, lưu **toàn văn** những mục sẽ được `outline.md` giao đích danh cho writer, không chỉ lưu bảng định danh. |
| 1b | **Khi thi hành một quyết định trải khắp nhiều file, danh sách file phải lấy từ `grep`, không lấy từ báo cáo.** Báo cáo của auditor và của writer cùng đúng nhưng khác độ phân giải — auditor kê *chỗ có sức nặng*, writer kê *mọi chỗ đã ghi*. | Trước khi dispatch lượt cập nhật, chạy `grep -rn "<nhãn>"` trên toàn kho để lập danh sách, rồi mới đối chiếu với báo cáo. Xem E-06. |
| 2 | **Section number trong prompt PM có thể sai.** | Giữ nguyên ràng buộc bắt writer verify bằng Read/Grep thay vì tin prompt — nó đã bắt được lỗi thật. |
| 3 | **`.agent/roles/*.md` là symlink, Glob không match.** | Mọi prompt dispatch phải nói rõ *"Read trực tiếp đường dẫn, đừng Glob"* — đã áp dụng cho toàn bộ writer của Bước 5, không worker nào báo thiếu role file nữa. |
