# Repro Spike Infra — Topology & Evidence Harness (P0-B / Wave 2)

> ⚠️ **THROWAWAY (Spec-Spike-Protocol §0.3)**. Không phải hạ tầng sản phẩm V0.1.

---

## 1. Kiến trúc Topology

Hạ tầng spike mô phỏng môi trường production-like theo **topological fidelity** (topology thật, dữ liệu synthetic G2).

1. **Mạng ngoài (`repro-spike-net`, `10.83.0.0/24`)**: Long-lived external network mang label `repro.spike.persistent=true`. Không bị xoá bởi `destroy.sh` để canary có thể tái chiếm các DNS aliases (`spike-postgres`, `spike-redis`, `spike-httpstub`, `spike-app`).
2. **Mạng internal (`repro-spike-internal-net`, `10.83.1.0/24`, `--internal`)**: Mạng thứ hai dành cho Replay (`B5`) — chặn egress ra ngoài ở tầng kernel/netns mà không làm mù canary.
3. **Container `spike-app` & `spike-httpstub`**: Chạy cùng image `repro-spike-app:${SPIKE_RUN_ID}`, phân biệt qua `SPIKE_ENTRYPOINT` (`app`, `app-recorded`, `httpstub`, `seed`).
4. **Container `spike-postgres` & `spike-redis`**: Data tier với named volumes có gắn nhãn per-run.

---

## 2. Các quy tắc & Hợp đồng quan trọng

### Nợ W-3 (Seam B1 → B0)
- `B3` recorder **hook trực tiếp ở tầng driver** và đưa giá trị thô vào `normalize()`.
- ⛔ **CẤM đọc `interaction-log.js`** để tránh thừa hưởng normalization thứ hai của `B1`.
- `B3` loại bỏ các marker nội bộ (`cache`, `marker`) của `B1`.
- `direction` được derive từ hàm thuần dùng chung `directionOf(kind, target)` đặt trong `src/spike/contract/normalize.js` (B0').

### Nợ W-7 & Quy tắc R7 (Single Statement Counting)
- Statement log của PostgreSQL được đếm bằng pattern `/LOG:\s+statement:/`.
- Dòng `STATEMENT:` lặp lại sau `ERROR:` được giữ cho detail/audit và không bị đếm đôi (Quy tắc `R7`).

### Cổng tài nguyên Fail-Closed (D-12)
- Theo dõi `memory.peak`, `memory.events.oom_kill`, `cpu.stat.nr_throttled` của container.
- Cảnh báo tại `memory.peak ≥ 0.9 × mem_limit`.
- Probe 4/4 container của dự án khác (`tnm_*`) bảo đảm trạng thái `running` được duy trì xuyên suốt.
