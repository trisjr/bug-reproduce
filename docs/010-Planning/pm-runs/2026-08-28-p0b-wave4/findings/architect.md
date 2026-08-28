# Findings — architect

## Kết luận của worker

1. **Kiến trúc Harness `B7b` (Fidelity Benchmark & Composite Metric $B7\text{-}12$)**:
   - `B7b` là module mở rộng của `src/spike/bench/` (kế thừa `B7a`), chịu trách nhiệm chạy thực nghiệm đo độ trung thực (fidelity) trên toàn bộ 10 scenario fixtures ($B8$) với $K=3$ lần replay độc lập ($10 \times 3 = 30$ replays) cộng thêm probe $SC\text{-}11$.
   - **Tích hợp Replay & Verification**: `B7b` trực tiếp khởi tạo `SpikeReplayRuntime` ($B5$) để thực thi replay local của từng scenario capsule, sau đó đưa kết quả thực thi local và capsule gốc vào `verifyExecution()` ($B6$) để trích xuất verdict nhị phân (`matched` / `diverged`), First Divergence Point và nhãn quy trách nhiệm (nếu có).
   - **Tính toán 6 Metric Cốt lõi của Phase 0 ($MTP\ \S3.1/\S3.2$)**:
     1. **Replay Success Rate ($R_{sr}$)**: Tỷ lệ % replays hoàn tất không bị crash runtime hay lỗi hạ tầng trên tập denominator $D=7$ in-class ($21$ lần replay).
     2. **Execution Match Rate ($R_{em}$)**: Tỷ lệ % replays đạt verdict `matched` từ rubric $B6$ trên tập denominator $D=7$ ($21$ lần replay).
     3. **Capture Overhead**: Tích hợp delta latency (in-process header), delta CPU, delta Memory RSS/peak cho 2 path $P\text{-discard}$ và $P\text{-persist}$ từ $B7a$.
     4. **Capsule Size**: Tính Average và **P95** capsule size ($C\text{-}04$, $MTP\ \S3.1$).
     5. **Replay Time**: Tính Average và P95 thời gian thực thi replay.
     6. **Escaped Side Effects**: Xác nhận = 0 qua canary sink listener log ($MTP\ \S3.1$, $ADR\text{-}005$).
   - **Đánh giá Composite Metric $B7\text{-}12$**:
     - Tự động so sánh với 4 giả thuyết ban đầu của `RQ.md §24`:
       - $R_{em} \ge 80\%$ (ngưỡng $D=7$ là $\ge 6/7 \approx 85.7\%$).
       - Latency Overhead $< 5\%$.
       - Average Capsule Size $< 10$ MB.
       - Replay Time $< 30$ seconds.
     - Xuất cấu trúc dữ liệu tổng hợp máy đọc được (JSON/CSV) theo đúng schema $MTP\ \S3.1/\S3.2$.

## PM đọc được gì

- `B7b` cần bổ sung file `src/spike/bench/fidelity.js` và `src/spike/bench/composite.js` (hoặc mở rộng `orchestrator.js` và `reporter.js`) để kết nối luồng $B8 \rightarrow B5 \rightarrow B6 \rightarrow B7b$.
- Cần có test suite tự động hóa `test/spike/bench/fidelity.test.js` để kiểm chứng logic tính toán composite metric, phân vị P95, và handling cổng `inconclusive`.

## Mâu thuẫn với lens khác

- Không có mâu thuẫn. Các lens đều thống nhất `B7b` là chốt chặn cuối cùng kiểm tra toàn bộ pipeline Replay & Verification trước khi bước vào Phase `P0-C`.
