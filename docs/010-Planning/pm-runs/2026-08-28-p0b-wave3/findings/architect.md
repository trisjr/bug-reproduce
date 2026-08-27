# Findings — architect

## Kết luận của worker
- **B5 (Replay Runtime)**:
  - Nạp artifact từ `src/spike/capsule/` ($B4$) qua `readCapsule()` hoặc `parseArtifact()` của $B0'$.
  - Cơ chế Dispatch & Intercept cho 5 nhóm: `db-query` (wrap pg.Pool, phân loại `directionOf`, chặn write, trả recorded rows), `outbound-http` (intercept http/fetch, trả recorded response), `clock` (phát lại tuần tự theo FIFO cursor $U\text{-}13$), `feature-flag` (match name trả flag value), `runtime-metadata`/`git-commit`.
  - Matching dùng `identityOf()` và `normalize()` của $B0'$, xử lý FIFO queue cho các interaction trùng identity key.
  - Fail-closed: Khi gặp interaction không có trong capsule, ném lỗi `MISSING_RECORDING` ($SEC\text{-}034$), tuyệt đối không fall-through ra DB hay mạng thật.
  - Default-Deny Write 2 lớp: L1 Sink Classifier (chặn SQL write, trả `BLOCKED_WRITE_SIDE_EFFECT`), L2 isolation.
- **B6 (Verification & Diff Engine)**:
  - Cổng `inconclusive` tầng 1 đứng TRƯỚC rubric ($Spec\ \S3.5$): loại bỏ execution khỏi denominator ($D=7$) nếu `inClass === false/null` hoặc thiếu metadata bắt buộc.
  - Rubric tầng 2 ($Spec\ \S3.4$) với 3 điều kiện nhị phân: (i) Độ dài bằng nhau sau normalization; (ii) Từng đơn vị khớp trên tập field exact sau normalization (áp dụng quan hệ tương đương cho canonical form, redaction marker, set equality cho nhóm đồng thời $G_1$ theo $U\text{-}20$); (iii) Hai neo $U_0$ và $U_\infty$ khớp nhau (so danh tính loại $outcomeIdentity$, không so stack trace).
  - Trích xuất Execution Diff hạng nhất ($ADR\text{-}011$) với First Divergence Point và thủ tục quy trách nhiệm 6 bước: `redaction` $\rightarrow$ `incomplete-capture` $\rightarrow$ `truncated` $\rightarrow$ `version-drift` $\rightarrow$ `out-of-scope-determinism` $\rightarrow$ `code` $\rightarrow$ `unattributed` (CẤM gộp thầm `unattributed` vào `code`).

## PM đọc được gì
- Thiết kế của `architect` hoàn toàn khớp với $B0'$, $B3$, $B4$ đã hiện thực ở Wave 2 và các Spec approved ($Spec\ \S3$, $ADR\text{-}005$, $ADR\text{-}006$, $ADR\text{-}011$).
- Nhấn mạnh cơ chế FIFO occurrence queue cho các câu query lặp lại cùng identity trong cùng 1 request — đây là điểm mấu chốt tránh mismatch khi replay.
- Cổng `inconclusive` tầng 1 được tách biệt rõ ràng khỏi rubric tầng 2, bảo toàn luật denominator $D=7$.

## Mâu thuẫn với lens khác
- Không có mâu thuẫn. Thống nhất hoàn toàn với `security-auditor` về cơ chế fail-closed `MISSING_RECORDING` và `quality-assurance` về cấu trúc 2 tầng của verification.
