# Findings — security-auditor

## Kết luận của worker
- **Cơ chế Default-Deny Write fail-closed 2 lớp (L1/L2)**:
  - **L1 (Sink Classifier & Dispatcher)**: Phân tích AST SQL (chặn INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, TRUNCATE ở T1; CTE write `WITH x AS (UPDATE ...)` ở T2; SELECT gọi function có side-effect ở T3; CALL/EXEC ở T4; multi-statement ở T5). HTTP Classifier áp dụng quy tắc R3: chỉ cho phép READ nếu khớp entry READ trong capsule theo `identityOf()`; chặn GET có side-effect (T6); khi thiếu recording ném `MISSING_RECORDING` (T10 / SEC-034), không fall-through.
  - **L2 (Isolation Layer)**: Patch `net.Socket` và `http.request` chặn socket TCP thô (T7) và custom transport SDK (T9). Cách ly mạng bằng Docker network `--internal`.
- **Ma trận 12 test T1–T12 ($MTP\ \S5.3$ & $THREAT\text{-}018$)**:
  - Đo bằng nguồn sự thật độc lập **Canary Sink** (`src/spike/infra/canary/`), nghiệm thu bằng chỉ số `escaped_side_effects = 0`.
  - Quyết định `D-2` cho T8: `T8-a` (không `--permission`) FAIL (ghi nhận leak ra Canary - khoảng hở đã đo được ở tầng runtime); `T8-b` (probe có `--permission`) PASS (`ERR_ACCESS_DENIED`, 0 leak ra Canary - kiểm chứng ứng viên L2 tầng process). CẤM làm nhẹ test T8 theo $MTP\ \S5.4$.
  - T11 (Anti-spoofing host): Chỉ dùng URL/host trong capsule làm lookup key trong RAM, không mở kết nối mạng.
  - T12 (Loopback protection): Canary sink lắng nghe trên loopback ports để đo residual risk.
- **Thiết kế Test Runner**: `test/spike/replay/t1-t12-matrix.test.js` kết nối canary client để xác thực `escaped_side_effects === 0`.

## PM đọc được gì
- Khẳng định 12/12 test $T1$–$T12$ là rào chắn an toàn tối cao cho B5, xác minh độc lập bằng Canary log.
- `D-2` được áp dụng chuẩn xác cho T8 (giữ nguyên T8-a FAIL có kiểm soát và T8-b PASS với `--permission`).
- T11 và T12 được bảo vệ chặt chẽ chống tấn công qua capsule injection và loopback leakage.

## Mâu thuẫn với lens khác
- Không có mâu thuẫn. Thống nhất hoàn toàn với `architect` và `quality-assurance`.
