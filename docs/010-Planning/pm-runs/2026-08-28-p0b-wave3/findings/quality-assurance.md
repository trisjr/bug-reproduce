# Findings — quality-assurance

## Kết luận của worker
- **Ma trận kiểm thử B5 (Replay Runtime)**:
  - Kiểm thử 12/12 test $T1$–$T12$ với nguồn sự thật duy nhất là Canary Sink (`src/spike/infra/canary/`), nghiệm thu `escaped_side_effects = 0`.
  - Tái hiện an toàn 10/10 scenario fixtures từ $B8$ (`test/spike/scenarios/`) với $K=3$ lần chạy.
- **Ma trận kiểm thử B6 (Verification & Diff Engine)**:
  - Cổng `inconclusive` tầng 1: kiểm tra lọc denominator $D=7$ khi ngoài class (`inClass === false/null`) hoặc có drift.
  - Rubric nhị phân tầng 2: kiểm tra 3 điều kiện (độ dài, từng unit exact với quan hệ tương đương, hai neo $U_0$ và $U_\infty$).
  - First Divergence Point & Diff: kiểm tra trích xuất diff có cấu trúc và thủ tục quy trách nhiệm 6 bước (không gộp thầm `unattributed` vào `code`).
- **Ma trận kiểm thử B7a (Benchmark Harness)**:
  - Smoke test harness, validate schema JSON/CSV đầy đủ trường bắt buộc.
  - Kiểm thử fail-fast khi vi phạm các cổng tài nguyên `D-12` (`oom_kill`, `memory.peak`, `nr_throttled`).
- **Rà soát Exit Criteria**: Toàn bộ exit criteria của B5, B6, B7a theo `Timeline §4` đều có phương án kiểm chứng tự động cụ thể, rõ ràng.

## PM đọc được gì
- Kế hoạch QA bao phủ toàn diện từ unit tests, integration tests đến verification trên 10 scenario fixtures thật.
- Các điều kiện fail-closed và pass criteria đều tường minh, không có vùng xám.

## Mâu thuẫn với lens khác
- Không có mâu thuẫn. Bốn lens hoàn toàn hội tụ về thiết kế kỹ thuật và phương pháp kiểm chứng cho Wave 3.
