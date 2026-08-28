# Delta Spec: Repro V0.1 Core Engine

## 1. Scope & Modules
- `@repro/core`: Gói dùng chung chứa TypeScript interfaces, JSON schemas, cryptographic utilities, Key Custody REST client, và Capsule reader/writer.
- `@repro/node`: SDK cài đặt phía ứng dụng khách hàng (`npm install @repro/node`), bắt giữ 8 nhóm tương tác bằng kỹ thuật monkey patching, bộ nhớ đệm vòng bounded ring buffer, và pipeline khử định danh format-preserving.
- `@repro/replay`: Engine phát lại cục bộ tất định, nạp capsule, khởi tạo synthetic request, cung cấp mock response cho Database & External HTTP, tịnh tiến Virtual Clock, và áp dụng lá chắn chống tác dụng phụ Fail-Closed 2 tầng.
- `@repro/diff`: Engine so khớp tương đương 2 tầng và phân lập nguyên nhân phân kỳ 6 bước, xuất báo cáo đối chiếu trực quan.
- `@repro/cli`: CLI chuẩn hóa với 6 verb nhà phát triển và các lệnh quản trị an ninh.

## 2. Invariant Contracts
- `N-05`: Execution Match Rate $R_{em} \ge 90.0\%$ trên Supported Execution Classes.
- `SEC-008`: Bounded buffer query result truncation tại tối đa $100\text{ rows} / 64\text{ KB}$.
- `SEC-027`: Digest HMAC verification TRƯỚC KHI nạp hoặc giải nén capsule.
- `SEC-037`: `@repro/node` có 0 external production dependencies.
- `E9`: Replay runtime cấm tuyệt đối việc fallback gọi ra mạng thật khi không tìm thấy recorded interaction.
- `§20.16`: Chuẩn hóa ngôn từ hợp đồng: `✓ Captured execution no longer reproduces`.
