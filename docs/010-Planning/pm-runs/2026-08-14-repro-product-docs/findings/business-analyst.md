# Findings — business-analyst

**Lens**: nghiệp vụ & yêu cầu. Read-only, `FILES_TOUCHED: none`. `STATUS: DONE`.
**Phạm vi đã đọc**: toàn bộ `docs/999-Resources/RQ.md` (1995 dòng, 3 lượt), `Template-PRD.md`, `Template-SRS.md`, RULE-001, role memory BA.

## Kết luận của worker

Trích xuất được **82 functional requirement có số hiệu** (`FR-001`…`FR-082`), phân loại In-MVP theo §18 + §21, Post-MVP theo §26, Out-of-scope theo §19:

- **Capture** (FR-001→FR-016): SDK `npm install @repro/node` + `repro.init()`, capture HTTP request, stack trace, DB query/result, external HTTP response, feature flag, clock, Git commit, runtime/dependency/schema version; async + bounded buffer + sampling + capture limits.
- **Capsule** (FR-017→FR-026): artifact portable theo cấu trúc §6, compression/dedup/content-hashing, encryption at rest, automatic redaction, PII anonymization, retention/deletion, audit log, access control.
- **Replay** (FR-027→FR-038): pull theo id, replay HTTP request, intercept DB read → recorded result, intercept outbound HTTP → recorded response, replay clock + feature flag, phân loại READ/WRITE, **default-deny writes**, replay boundary tường minh.
- **Analysis** (FR-039→FR-046): execution verification phân biệt *"Replay completed"* với *"Execution matched"*, so execution path, execution diff theo cặp Production/Local, code + schema drift detection, verify before/after fix với ngôn từ giới hạn kết luận.
- **CLI** (FR-047→FR-053): `list`, `pull`, `inspect`, `replay`, `diff`, `verify`; CLI là primary interface.
- **Deployment** (FR-054→FR-055): self-hosting; kiến trúc mặc định Production → Private Recorder → Encrypted Capsule → Private Storage, **không** mặc định gửi lên public SaaS.
- **Post-MVP / Out-of-scope** (FR-056→FR-082): regression test generation, `--checkout`, `repro explain` (AI), GitHub + Actions, browser replay, Next.js, Python/Go, Redis, Kafka, background jobs, distributed tracing, multi-service replay, DB snapshot, race-condition replay, AI fix/PR, environment cloning, K8s orchestration, billing, dashboard.

**5 Use Case candidate** (cắt theo mục tiêu người dùng, không theo CLI command):

| UC | Tên | Primary actor |
|---|---|---|
| UC-01 | Instrument service và capture một failed production execution | SRE/DevOps hoặc Engineer sở hữu service |
| UC-02 | Pull và replay capsule để reproduce bug trên code local | Software Engineer |
| UC-03 | Đọc execution diff để hiểu production khác local ở đâu | Software Engineer |
| UC-04 | Verify fix trên captured execution | Software Engineer |
| UC-05 | Duyệt và inspect capsule khả dụng | Software Engineer, QA Engineer |

Mỗi UC có main flow đánh số + 4–6 alternative/exception flow + pre/postcondition + FR bao phủ. Worker **cố ý không** tách code/version mismatch (§15) thành UC riêng, lập luận: không ai *muốn* "xử lý mismatch" — nó là điều kiện phát sinh giữa đường khi đang theo đuổi mục tiêu replay, nên thuộc alternative flow của UC-02. **PM đồng ý** với lập luận này.

**12 acceptance-criteria gap** (`ACG-01`…`ACG-12`) và **6 requirements gap** (`GAP-01`…`GAP-06`).

## PM đọc được gì

### 1. Có một mâu thuẫn nội tại thật trong RQ.md, không phải worker đọc sai

`RQ.md §26` đặt **regression test generation** ở **V0.2**. Nhưng ba chỗ khác của cùng tài liệu đều giả định nó **đã có**:
- `§25.6` Killer Demo — chính là demo bán MVP — in `✓ Regression case generated`
- `§30` "With Repro" journey kết thúc bằng `Regression test`
- `§31` **North Star Metric** đếm *"converted into regression tests"*

Hệ quả nếu giữ §26: **North Star Metric của V0.1 không đo được bằng chính V0.1.** Đây không phải lỗi biên tập nhỏ — nó là lỗi ở tầng "làm sao biết sản phẩm thành công". Bắt buộc đưa lên gate, PM không tự quyết được vì nó thay đổi định nghĩa thành công của sản phẩm (Escalation tầng 3).

### 2. Persona gần như toàn bộ là suy luận — và worker sửa lại tiền đề của PM

PM giao việc với giả định "RQ.md §Target users nêu 3 nhóm". Worker kiểm tra và **sửa lại**: RQ.md **không có section Target users**. Ba nhóm chỉ xuất hiện đúng **một lần**, ở **dòng 7 frontmatter**. Trong 1988 dòng còn lại, từ "QA" và "SRE" **không xuất hiện lần nào**; chỉ "developer" là dày.

PM đã Read lại `RQ.md:7` — **worker đúng**. Đây là kiểu correction PM cần, không phải worker làm quá.

Hệ quả trực tiếp lên tài liệu persona:
- Persona **Software Engineer**: bằng chứng dày, phần lớn `stated`.
- Persona **SRE/DevOps**: `inferred` nhưng neo vững vào §16, §20.5–20.7, §20.17, §28 — toàn bộ mối quan tâm capture-side/compliance chỉ hợp lý khi gán cho vai này.
- Persona **QA Engineer**: **mỏng nhất**, `inferred` nặng, và toàn bộ nội dung của nó neo vào regression test — tức **Post-MVP V0.2**. Kết luận của worker: *với scope V0.1, QA Engineer chưa phải persona của MVP.*

→ Tài liệu persona **không được** viết 3 co-primary persona ngang hàng. PM chốt: **Software Engineer là primary, SRE/DevOps là secondary (capture-side owner), QA Engineer là "activated at V0.2"** — và nói thẳng lý do trong tài liệu. Quyết định này nằm trong phạm vi `brief.md` (assumption A1 đã khai persona là giả thuyết) → **Escalation tầng 2, PM tự quyết**, không cần hỏi anh.

### 3. Ba câu hỏi chặn mà §38 không có

RQ.md §38 tự liệt kê 16 câu. Worker tìm thêm 3 câu **chặn nặng hơn một số câu trong §38**:

| # | Câu | PM xử lý |
|---|---|---|
| **B-A** | Regression generation ở V0.1 hay V0.2? | → **gate** (xem mục 1) |
| **B-B** | Cơ chế nào chuyển capsule từ production về storage? (`GAP-01`) | Tầng 2 — PM chốt theo đề xuất worker: Recorder tự upload capsule đã encrypt lên private storage do tổ chức cấu hình; `repro pull` đọc từ storage đó; **không** có lệnh push phía CLI. Chống lưng: §17 sơ đồ, §20.6, và §18 CLI không có lệnh push ⇒ push không phải việc của developer. Ghi vào SDD như *quyết định thiết kế*, không phải TBD. |
| **B-C** | Hành vi khi capsule thiếu input mà app local yêu cầu? (`UC-02/A5`) | Tầng 2 — PM chốt: coi là **divergence + incomplete capture**, không crash, và **tuyệt đối không fallback sang gọi hệ thống thật ở local**. Chống lưng: §33.6 Safe by default, §13/§20.4 default-deny, §33.5 "Determinism over magic", §20.3. Đây là exception flow bắt buộc của UC-02. |

### 4. §38 phân loại xong — không còn là 16 câu treo lơ lửng

- **Blocking**: Q5 (chỉ capture failed execution?), Q6 (manual recording?), Q9 (replay boundary ở đâu?). Mỗi câu có default kèm section chống lưng.
- **Q4 (initial stack) coi như ĐÃ ĐƯỢC TRẢ LỜI** — §18 ghi thẳng "Start with: Node.js + PostgreSQL + HTTP", §22 test app, §26 V0.1, §20.14 `@repro/node`. PM đồng ý đóng Q4, không để nó lơ lửng trong PRD.
- **Q10–Q12** (data nào capture được, redact gì, self-hosting ngày đầu?) → nhường security lens.
- **Q1–Q3, Q7–Q8, Q13–Q16** → record-only, đưa vào PRD §Open Questions.

PM chốt default cho 3 câu blocking (tầng 2, đều có neo văn bản mạnh):
- **Q5** → V0.1 **chỉ capture failed executions**. Neo: §20.7 *"capture only failed/high-value executions"*, §18 Capture có "stack trace" (chỉ tồn tại khi failure), §37.
- **Q6** → **không** có manual recording ở V0.1, ghi vào Non-Goals. Neo: §18 CLI không có lệnh record, §26 V0.1 chỉ "Production capture", §20.15 product boundary.
- **Q9** → **replay boundary = service boundary của service đang điều tra**; service đó chạy code local thật, mọi dependency replay từ recorded response. Neo: §14 *"service boundaries can become replay boundaries"*, §20.11, §26 V0.3 đặt multi-service replay ở tương lai ⇒ V0.1 là single-service.

### 5. Hai gap là nợ kỹ thuật của chính RQ.md, phải khai chứ không lấp

- **`ACG-07` — "Supported Execution Class" chưa hề được định nghĩa.** §20.1 (risk Critical #1) mitigation ghi *"Limit the MVP to a clearly defined class of deterministic request/response executions"* — nhưng "clearly defined class" đó **không tồn tại ở đâu trong RQ.md**. Không có nó thì: FR-011 không spec được, denominator của §24 không xác định, UC-02/A5 không có spec.
- **`ACG-01` — "sufficiently equivalent" (§10) không có định nghĩa.** Đây là tiêu chí của feature chống risk Critical §20.3 (false replay equivalence) — feature quan trọng nhất về mặt tin cậy lại là feature không đo được. Chưa rõ "execution path" nghĩa là gì cụ thể (function call? code line? span?), so bao nhiêu field, exact hay tolerant.

Hai mục này PM **không lấp bằng cách bịa định nghĩa**. Chúng vào SDD/PRD dưới dạng *mục cần định nghĩa, kèm phương án đề xuất và ghi rõ phải validate qua technical spike §22*. Đây là chỗ dễ nhất để một bộ tài liệu trông đẹp mà rỗng.

### 6. §24 không được dùng nguyên xi làm acceptance criteria

Bốn ngưỡng (≥80% reproduced, <5% latency overhead, <10MB capsule, <30s replay) **tự bị RQ.md §24 vô hiệu hoá**: *"These numbers should be treated as initial hypotheses, not final product commitments"*, và §22–23 định vị chúng là metric của **technical spike**, không phải AC sản phẩm. Từng ngưỡng còn thiếu định nghĩa đo (percentile nào, denominator nào, trước/sau compression, có tính `pull` và boot app không).

→ Trong PRD, 4 số này đi vào mục **Validation Hypotheses**, **không** đi vào mục Acceptance Criteria. Dùng chúng như cam kết sản phẩm là misrepresentation.

## Mâu thuẫn với lens khác

Chưa có — `architect` và `security-auditor` còn đang chạy khi ghi findings này. Ba điểm cần đối chiếu chéo khi hai lens kia trả về:

1. **`FR-025` access control**: §20.5 + §21 coi strict access control là MVP=Yes, nhưng §28 xếp "Access control" vào **commercial layer**. Chờ `security-auditor`.
2. **`FR-016` Redis**: §18 Capture list **không** có Redis, nhưng §5 vẽ Redis trong execution chain và §22 đưa Redis vào dependency của spike test app; §26 đặt Redis ở V0.3. Chờ `architect`.
3. **`ACG-12` — §18 vs §21**: §21 Risk Matrix nói MVP=Yes cho Sensitive data / Security exposure / Compliance / Capsule size / Production overhead, nhưng §18 "MVP capabilities" **không liệt kê** redaction, encryption, retention, self-hosting. Worker đã dùng §21 làm tie-breaker. Chờ `security-auditor` xác nhận — nếu security lens cũng độc lập kết luận rằng redaction/encryption là bắt buộc từ V0.1 thì tie-breaker này được chống lưng bởi hai lens và PM chốt luôn.

## Ghi chú vận hành

Worker báo `.agent/roles/business-analyst.md` **không tồn tại** (đã Glob `**/business-analyst*`) và dùng role memory thay thế.

**PM đã điều tra ra nguyên nhân thật**: toàn bộ 12 file trong `.agent/roles/` là **symlink trỏ ra ngoài repo** (`business-analyst.md -> /Users/trisjr/Projects/Tenomad/TNMCore-OS/.agent/roles/business-analyst.md`). PM đã verify cả 12 symlink đều **resolve được và đọc được** bằng `Read`. Vấn đề là **Glob không match symlink**, nên worker kết luận sai là file không tồn tại.

Đây không phải lỗi repo và cũng không phải worker cẩu thả. Hệ quả vận hành cho các lần dispatch sau trong run này: **yêu cầu worker `Read` trực tiếp `.agent/roles/<role>.md`, và nói rõ đó là symlink nên đừng dùng Glob để tìm.** Đã áp dụng cho prompt của cả hai writer ở Bước 5.

Không ảnh hưởng chất lượng output lần này — worker vẫn tuân thủ đúng chuẩn BA (AC kiểm chứng được, bắt buộc có unhappy path, traceability matrix).

## Đã xác minh độc lập (PM tự grep, không tin worker vô điều kiện)

| Khẳng định của worker | Cách PM kiểm | Kết quả |
|---|---|---|
| "QA" chỉ xuất hiện 1 lần, ở dòng 7 | `grep -n "QA\|Quality Assurance" RQ.md` | **Đúng** — duy nhất dòng 7 |
| "SRE" chỉ xuất hiện 1 lần, ở dòng 7 | `grep -n "SRE" RQ.md` | **Đúng** — duy nhất dòng 7 |
| "developer" xuất hiện dày | `grep -oic "developer" RQ.md` | **Đúng** — 34 lần |
| `.agent/roles/business-analyst.md` không tồn tại | `ls -la` + `Read` | **Sai** — tồn tại, là symlink readable (xem trên) |
