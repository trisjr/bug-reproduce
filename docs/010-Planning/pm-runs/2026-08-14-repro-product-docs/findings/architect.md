# Findings — architect

**Lens**: kiến trúc & quyết định kỹ thuật. Read-only, `FILES_TOUCHED: none`. `STATUS: DONE`.
**Phạm vi đã đọc**: toàn bộ `RQ.md` (1994 dòng), `Template-SDD.md`, `Template-Spec.md` (là stub 11 dòng), RULE-001, role memory architect, và `brief.md` của run này.

## Kết luận của worker

**32 điểm quyết định kiến trúc** (`D-01`…`D-32`), phân tầng *nền tảng* (đổi là đổi cả sản phẩm) vs *chiến thuật* (đổi được sau). Mỗi điểm có: section nguồn, alternatives phân biệt rạch ròi `[stated]` (RQ.md nêu và loại tường minh) vs `[inferred]` (worker suy ra), consequences cả hai chiều gồm phần §20 tự thừa nhận, và khuyến nghị có xứng làm ADR riêng hay nên nằm ở mục nào của SDD.

**Tập ADR đề xuất: 16, chia 2 tier.**

*Tier 1 — 11 ADR nền tảng, là tập tối thiểu để SDD có chân đứng:*

| ADR | Tên | Decision phủ |
|---|---|---|
| ADR-001 | Reproduce production execution instead of production environment | D-01 |
| ADR-002 | Repro Capsule as the portable artifact and format contract | D-02, D-03, D-26, D-27 |
| ADR-003 | Record/replay database query results instead of database snapshots | D-04 |
| ADR-004 | Record/replay external inputs at the dependency boundary (HTTP + feature flags) | D-05, D-29 |
| ADR-005 | Default-deny write side effects during replay | D-06 |
| ADR-006 | Execution verification by execution equivalence, with precise replay semantics | D-07, D-18 |
| ADR-007 | In-process SDK interception instead of proxy, sidecar or container runtime | D-09 |
| ADR-008 | Async, bounded, sampled, failure-triggered capture pipeline | D-11 |
| ADR-009 | Private/self-hosted capture and storage topology | D-12, D-13, D-27 |
| ADR-010 | Bounded determinism scope: clock replay in, scheduler/race replay out | D-10 |
| ADR-011 | Execution Diff as a first-class outcome of a failed reproduction | D-08 |

*Tier 2 — 5 ADR, cắt được nếu muốn gọn:* ADR-012 (service boundary = replay boundary), ADR-013 (CLI-first, no dashboard), ADR-014 (AI là layer phía trên), ADR-015 (OSS core vs pluggable layer — module seam, **không** bàn license/pricing), ADR-016 (narrow stack Node.js + PostgreSQL + HTTP).

14 decision còn lại worker chủ động **không** làm ADR, ánh xạ vào mục SDD cụ thể — đây là kỷ luật tốt, tránh lạm phát ADR.

**SDD skeleton**: giữ 7 H1 của `Template-SDD.md` làm xương sống, lồng 47 H2 riêng của Repro, mỗi heading có một dòng nội dung + section RQ.md nguồn. Ánh xạ template thông minh: §4 "Data Schema & Persistence" → **Capsule format** (Repro V0.1 không có application DB, "persistence" ở đây là capsule + capsule store); §5 "API Design" → **CLI contract + SDK surface + Capsule Store API**. Phủ đủ 9 chủ đề PM yêu cầu.

**19 hạng mục NFR** (`N-01`…`N-19`), tách ba loại rạch ròi: 4 con số §24 là **ngưỡng validation cho spike**, 5 metric §23 **không có ngưỡng**, 10 ràng buộc **định tính**. Và loại ra 5 con số bị nhầm là NFR.

**23 technical unknown** (`U-01`…`U-23`) kèm disposition `[CHỐT]` / `[TBD]` / `[SPIKE]`.

## PM đọc được gì

### 1. Xác nhận chéo mâu thuẫn regression test — hai lens độc lập cùng tìm ra

Worker `architect` gọi nó là **I-02**, worker `business-analyst` gọi nó là **B-A / FR-056**. Hai lens **không nói chuyện với nhau**, đọc cùng một văn bản, độc lập kết luận giống nhau, và **cùng chỉ ra hệ quả giống nhau**: §31 North Star Metric không đo được bằng chính V0.1.

Đây là mức bằng chứng cao nhất em có thể có trong run này. Không còn khả năng "một worker đọc sai". → **đưa lên gate**.

### 2. Bốn mâu thuẫn nội tại — PM phân xử ba, đẩy một lên gate

| # | Mâu thuẫn | Bằng chứng hai phía | PM xử lý |
|---|---|---|---|
| **I-01** | **Redis có trong MVP không?** | *Có*: §5 (execution chain có "Cache Reads", "Redis → Result B"), §13 ("Cache read" ở nhóm READ), §17 (Recorder box liệt kê **Redis**), §22 (spike test app có Redis). *Không*: §18 MVP capture list **không có** Redis; §26 đặt Redis ở **V0.3**. | **Tầng 2 — PM chốt: Redis KHÔNG thuộc V0.1 capture.** Lý do: §18 ("MVP capabilities") và §26 ("V0.3") là hai **phát biểu phạm vi tường minh**, còn §5/§17 là **sơ đồ minh hoạ kiến trúc chung** và §22 là **dependency của test app** (test app *có* Redis không đồng nghĩa Repro *capture* Redis ở V0.1). Phát biểu phạm vi thắng sơ đồ. Ghi vào ADR-016 + SDD §3.2 là *đã biết và đã quyết*, kèm ghi chú rằng §17 của RQ.md cần sửa cho khớp. |
| **I-02** | **Regression test generation: V0.1 hay V0.2?** | *V0.1*: §25 Killer Demo in `✓ Regression case generated`, §30 journey, §31 North Star. *V0.2*: §26. | **→ GATE.** Vượt `brief.md` vì nó đổi định nghĩa thành công của sản phẩm. |
| **I-03** | **P95 capsule size có ngưỡng không?** | §23 yêu cầu đo *cả* Average *và* P95; §24 chỉ đặt ngưỡng `< 10 MB average`. | **Tầng 2 — PM chốt**: ghi cả hai vào bảng NFR, `N-03` có ngưỡng (average, từ §24), `N-09` **ngưỡng TBD** (P95, §23 đòi đo nhưng §24 không đặt ngưỡng). Không bịa một con số P95. Ghi rõ đây là chỗ hở của RQ.md. |
| **I-04** | **Lazy loading vs capsule self-contained?** | §6 "only the information necessary" + §40 "portable" ⇒ tự chứa. §20.12 mitigation lại có **"lazy loading"** ⇒ tham chiếu ra ngoài. | **Tầng 2 — PM chốt: capsule self-contained là bất biến ở V0.1**; "lazy loading" hiểu là *lazy loading khi ĐỌC capsule* (không nạp hết vào memory), **không phải** lazy fetch dữ liệu từ production. Cách đọc này giữ được cả §6/§40 và §20.12 mà không mâu thuẫn. Ghi vào ADR-002 §Consequences như một *diễn giải có chủ ý*, không giấu. |

### 3. `U-06` Capsule Store là khối việc lớn nhất bị ẩn — ảnh hưởng ước lượng MVP

Worker nói thẳng: `repro pull` (§8) và `repro list` (§18) **hàm ý tồn tại một store ở xa có API và auth**, §28 xếp "Basic Self-hosting" vào OSS core, §20.6 vẽ "Private Storage" — nhưng **RQ.md không có một dòng đặc tả nào**: không API, không auth, không storage backend, không mô hình triển khai.

Và nó va vào chính guardrail của RQ.md: §20.15 liệt kê **"Artifact storage"** như một biểu hiện của scope explosion, §20.14 cảnh báo "significant infrastructure" hại adoption — trong khi §8/§18/§28 lại đòi phải có store.

Worker khuyến nghị PM xác nhận phạm vi vì *"nếu chấp nhận capsule là file chuyển tay cho V0.1 thì MVP nhỏ hơn nhiều so với có store"*.

**PM đánh giá**: đây là quan sát đúng và quan trọng, **nhưng nó không chặn lane tài liệu**. Tài liệu đúng đắn ở đây là *ghi rõ hai phương án và ghi rõ đây là quyết định chưa chốt*, không phải chọn hộ. → PM chốt (tầng 2): ADR-009 ghi Decision ở mức **tối thiểu** (capsule store = object/file storage + một index, không phải một service đầy đủ) và mở một mục `TBD` tường minh cho API/auth, trích §38.12. Ghi thêm vào PRD §Open Questions vì nó ảnh hưởng ước lượng.

### 4. Sáu unknown chặn chính tính năng lõi — đây là chỗ dễ viết tài liệu rỗng nhất

Worker chỉ ra những chỗ RQ.md để hở mà một SDD nghiêm túc **phải** hoặc trả lời hoặc khai là chưa biết:

- **`U-04` — "execution path" ở §10 được đo bằng gì.** Worker gọi đây là *unknown lớn nhất của cả tài liệu*. §10 dùng đúng ký hiệu `A → B → C` nhưng **RQ.md không định nghĩa A, B, C là gì**, cũng không định nghĩa "sufficiently equivalent". Nó chặn ADR-006 — mà ADR-006 chính là mitigation cho risk Critical §20.3. **Trùng khớp `ACG-01` của BA lens** (lens thứ hai độc lập tìm ra cùng chỗ hở).
- **`U-02` — định danh DB query để match lúc replay.** Bằng chứng văn bản duy nhất là §6 đặt tên `query-001.json`, `query-002.json` — hàm ý match **theo thứ tự**. Worker chỉ ra điều này *rất giòn trong đúng use case chính*: dev sửa code (§8 bước 4–5) thì sequence lệch ngay. Worker gọi đây là unknown **rủi ro hiện thực cao nhất**.
- **`U-08` — `verify` phân biệt "diverged vì đã fix" với "diverged vì môi trường lệch" thế nào.** Sau khi fix, execution path **đương nhiên** khác — đó là dấu hiệu *thành công*. Nhưng D-07 định nghĩa "diverged" là dấu hiệu *xấu*. Cùng một tín hiệu, hai nghĩa trái ngược. RQ.md không hề nói `replay` và `verify` cần hai bộ tiêu chí equivalence khác nhau. **Đây là chỗ em đánh giá worker đóng góp giá trị lớn nhất** — nó không có trong RQ.md và không suy ra được nếu chỉ đọc lướt.
- **`U-09` — nghịch lý capture trigger.** §20.7 nói "capture only failed/high-value executions", nhưng một execution chỉ được biết là failed **sau khi** nó kết thúc ⇒ phải buffer **mọi** execution rồi hủy khi thành công ⇒ ngân sách `< 5%` (§24) áp cho **100% traffic**, không phải cho vài request lỗi. Và sampling giảm overhead thì đồng thời giảm xác suất bắt được đúng execution lỗi. RQ.md không thừa nhận điểm này.
- **`U-11` — code local phát ra query/HTTP call không có trong capsule thì làm gì.** Worker nhấn: đây **không phải trường hợp biên** mà là trường hợp *thường gặp nhất*, vì use case chính là dev sửa code rồi replay lại. RQ.md hoàn toàn không nêu.
- **`U-10` — diff mode có gọi dependency local thật không.** §9 hiển thị `Local → tax = 12.43` — giá trị *thật* của môi trường local, nghĩa là API local **đã bị gọi**. Nhưng §11/§12 nói replay layer trả recorded result nên local API lẽ ra **không** được gọi. RQ.md tự nói ngược. Worker cảnh báo: nếu diff mode chạy dependency thật thì D-06 (default-deny write) **phải áp dụng cả ở mode này**, không thì đây là lỗ hổng side-effect.

**PM chốt cách xử lý (tầng 2, áp cho toàn bộ nhóm này)**: writer được phép — và **bắt buộc** — ghi `TBD` kèm *phương án đề xuất có nhãn "cần validate"* và *chỉ rõ nó chặn cái gì*. Tuyệt đối không viết Decision dứt khoát cho `U-04` và `U-02` như thể đã chốt. Đây là điểm khác biệt giữa một SDD trung thực và một SDD trông đầy đặn mà rỗng — và là rủi ro số một của lane tài liệu (`brief.md` A4).

### 5. Worker chống lại một gợi ý của PM, và đúng

PM gợi ý gộp ADR-011 (Execution Diff) vào ADR-006 nếu muốn gọn còn 8 ADR. Worker **không khuyến nghị**, lập luận: diff là một *execution mode khác*, không phải cách trình bày kết quả verification — và dẫn `U-10` làm bằng chứng (diff có thể phải gọi dependency thật, verification thì không). **PM đồng ý với worker**, giữ ADR-011 tách riêng nếu chọn phương án ≥11 ADR.

### 6. Ba con số phải chặn không cho lọt vào PRD như KPI

Worker cảnh báo `§31` có ví dụ `2,431 / 1,827 / 1,203 bugs mỗi tháng` — RQ.md ghi rõ đó là **"Example"**, minh hoạ *cách đọc* North Star Metric. **Không phải target.** Tương tự: `60–90 giây` (§25) là ràng buộc UX cho demo, `Hours/Days → Minutes` (§32) là outcome metric không test được, `"within minutes"` (§38.14) là một **câu hỏi** chứ không phải cam kết.

PM ghi nhận: đây là loại lỗi rất dễ xảy ra khi chuyển văn xuôi thành PRD — con số minh hoạ biến thành KPI chỉ vì nó là con số duy nhất trong section. Sẽ đưa vào ràng buộc dispatch của cả hai writer.

## Mâu thuẫn với lens khác

**Không có mâu thuẫn. Có ba điểm xác nhận chéo, đều làm PM tự tin hơn:**

| Chủ đề | `architect` | Lens kia | Kết luận |
|---|---|---|---|
| Regression test V0.1 vs V0.2 | `I-02` | `business-analyst`: `B-A`/`FR-056` | **Xác nhận chéo độc lập** → gate |
| "sufficiently equivalent" §10 không định nghĩa được | `U-04` | `business-analyst`: `ACG-01` | **Xác nhận chéo độc lập** → cả hai coi là chỗ hở của mitigation cho risk Critical §20.3 |
| Redis trong MVP | `I-01` | `business-analyst`: `FR-016` | **Xác nhận chéo** → PM chốt tầng 2 (xem trên) |

**Phân định ranh giới lens — worker tự làm, đúng và đáng ghi nhận:** worker chủ động **không** làm threat model, không làm redaction policy, chỉ xử lý redaction ở góc *vị trí trong pipeline* (`D-13`) và *trade-off fidelity vs privacy* (`U-15`). Nhờ vậy `findings/architect.md` và `findings/security-auditor.md` **không trùng nhau**, và `U-15` (redaction làm hỏng replay fidelity → Execution Verification báo diverge vì lý do do chính Repro gây ra) là một phát hiện **chỉ lens kiến trúc mới thấy được** — security lens độc lập cũng chạm tới cùng vấn đề từ phía khác (mục 3.1 của nó: "dev sẽ mất niềm tin rồi tự tắt redaction"). Hai lens gặp nhau ở cùng một kết luận từ hai hướng.

## Ghi chú vận hành

Worker này **không** gặp lỗi role file như BA lens — nó `Read` trực tiếp `.agent/roles/architect.md` (symlink) thành công, và trả về danh sách file đã đọc bằng **đường dẫn tuyệt đối**. Xác nhận giả thuyết ở `findings/business-analyst.md`: vấn đề là Glob không match symlink, không phải file thiếu.

Worker cũng tự đọc `brief.md` của run này (không được yêu cầu) và căn chỉnh theo assumption `A2` — đặt toàn bộ ADR ở `status: draft` + Decision status **Proposed**. Đúng ý PM.
