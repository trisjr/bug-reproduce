# Findings — devops-engineer

## Kết luận của worker
- **Kiến trúc Module B7a (`src/spike/bench/` & `test/spike/bench/`)**:
  - Đo 3 thành phần overhead theo $MTP\ \S3.1$: Latency endpoint delta in-process (đọc header `x-spike-duration-ms` và nhãn `x-spike-path` từ app $S\text{-}1$), CPU delta (`cpu.stat` cgroup v2), Memory RSS/peak delta (`memory.peak`).
  - Tách 2 path riêng biệt ($MTP\ \S3.2$): `P-discard` (request thành công 200/201, buffer rồi discard) và `P-persist` (request lỗi 402, buffer $\rightarrow$ redact $\rightarrow$ serialize $\rightarrow$ persist).
  - Quy trình chạy xen kẽ A/B theo thứ tự `OFF / ON / OFF / ON` (`D-11`), tự động gọi `resetOrders()` (TRUNCATE table) trước mỗi chặng để khử drift seq-scan.
  - Tải production-like: 100% traffic, đa số thành công, cấu hình tỷ lệ lỗi tất định 5% (SKU-GPU-004), sampling OFF.
- **Resource Gates theo D-12**:
  - Giám sát cgroup v2 của `spike-app`: `cpu.stat.nr_throttled` (nếu > 0 $\rightarrow$ UNINTERPRETABLE), `memory.events.oom_kill` (nếu > 0 $\rightarrow$ abort), cảnh báo `memory.peak >= 0.9 * mem_limit` (288 MB / 320 MB).
  - Probe bảo toàn foreign container: 4/4 `tnm_*` phải giữ trạng thái `running`.
- **JSON Schema Output**: Máy đọc được, đầy đủ metadata, conditions, resource_gates, stages, summary, verdict.

## PM đọc được gì
- Việc đo latency in-process qua header `x-spike-duration-ms` triệt tiêu hoàn toàn nhiễu SSH port-forwarding của Colima.
- Phân tách 2 path `P-discard` vs `P-persist` là chìa khóa để đánh giá overhead chính xác theo $MTP\ \S3.2$.
- Cơ chế `resetOrders()` giải quyết triệt để vấn đề seq-scan table growth làm phình overhead recorder giả tạo.

## Mâu thuẫn với lens khác
- Không có mâu thuẫn. Thống nhất với `quality-assurance` về tiêu chí gating và schema output.
