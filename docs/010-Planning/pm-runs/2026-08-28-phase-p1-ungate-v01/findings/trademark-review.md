---
id: FINDINGS-TRADEMARK-LG6
type: findings-report
status: approved
phase: P1
tasks: "LG6"
driver: "Product Manager Role (@TrisJr)"
date: 2026-08-28
---

# 🔍 Báo Cáo Rà Soát Nhãn Hiệu (Trademark Review) — Tên Dự Án "Repro"

**Nhiệm vụ trọng tâm**: Task `LG6` theo [Timeline-Repro §6.1](../../../Estimates/Timeline-Repro.md) — Rà soát rủi ro trùng lặp nhãn hiệu tên "Repro" trước khi phát hành mã nguồn mở cộng đồng (`P3`) và thương mại hoá (`P5`).

---

## 1. Khảo Sát Nhãn Hiệu Trong Ngành Phần Mềm & Developer Tools

Phân loại Quốc tế về Nhãn hiệu (Nice Classification) áp dụng cho dự án Repro:
- **Class 9**: Phần mềm máy tính có thể tải xuống, SDK, công cụ dòng lệnh (CLI).
- **Class 42**: Dịch vụ phần mềm dạng dịch vụ (SaaS), dịch vụ lưu trữ dữ liệu đám mây, tư vấn kỹ thuật phần mềm.

### Hiện Trạng Thuật Ngữ
1. **Tính phổ thông của thuật ngữ (Descriptive / Generic Nature)**:
   - Trong văn hoá kỹ thuật phần mềm và phát triển mã nguồn mở toàn cầu, "repro" là từ viết tắt thông dụng của *"reproduction"* / *"reproduce"* (ví dụ: *"minimal repro"*, *"repro steps"*, *"can you provide a repro?"*).
   - Do tính chất mang ý nghĩa mô tả chức năng (descriptive mark), mức độ bảo hộ nhãn hiệu độc quyền thuần tuý chữ cái "Repro" là trung bình-thấp, nhưng đồng thời **rủi ro bị một bên thứ ba độc chiếm để cấm sử dụng từ "repro" trong cộng đồng phần mềm cũng rất thấp**.
2. **Khảo sát Các Thương Hiệu Tương Đồng**:
   - Tên "Repro" từng xuất hiện trong lĩnh vực in ấn (Reprographics), thiết bị sinh sản y tế (Reproduction), và một nền tảng Mobile App Marketing / Analytics tại Nhật Bản ("Repro Inc.").
   - Lĩnh vực hoạt động của dự án Repro của chúng ta là **Developer Tooling / Production Debugging**, hoàn toàn tách biệt về nhóm khách hàng mục tiêu và bản chất dịch vụ so với các nhãn hiệu trên, giảm thiểu tối đa rủi ro gây nhầm lẫn thương mại (Likelihood of Confusion).

---

## 2. Chiến Lược Bảo Vệ & Định Danh Thương Hiệu

Để bảo vệ định danh dự án trên các kênh phân phối chính thức mà không cần phát sinh chi phí đăng ký nhãn hiệu quốc tế đắt đỏ ở giai đoạn V0.1, em đề xuất 4 hành động cụ thể:

1. **Bảo vệ Scoped Package Namespace trên npm Registry**:
   - Sử dụng thống nhất namespace **`@repro/*`** (ví dụ `@repro/node`, `@repro/cli`, `@repro/core`).
   - Đã khóa và sở hữu namespace chính thức trên npmjs.com.
2. **Bảo vệ GitHub Organization & Domain Name**:
   - Tổ chức mã nguồn chính thức trên GitHub: `github.com/repro-dev` (hoặc `repro-io`).
   - Domain chính thức: `repro.dev`.
3. **Sử Dụng Khẩu Hiệu Kèm Theo (Brand Positioning Statement)**:
   - Gắn liền tên "Repro" với câu khẩu hiệu định vị độc nhất ($§36$): **"Production happened. Now replay it."** và **"Deterministic Production Bug Replay Engine"** để gia tăng tính phân biệt của thương hiệu.
4. **Trademark Notice Trong Giấy Phép Apache-2.0**:
   - Giấy phép Apache License 2.0 ([ADR-013](../../../030-Specs/Architecture/ADR-013-OSS-License-And-Contribution-Model.md)) quy định rõ tại Điều 6: Giấy phép này không cấp quyền sử dụng tên thương mại hoặc nhãn hiệu của tác giả, bảo vệ tên "Repro" khỏi việc bị các bên fork mã nguồn sử dụng sai lệch danh tính.

---

## 3. Kết Luận & Khuyến Nghị

- **Kết luận**: Tên gọi **"Repro" hoàn toàn khả thi và an toàn để tiếp tục sử dụng** cho các phase V0.1, V0.2 và chiến dịch phát hành OSS Launch (`P3`).
- **Hành động ở Phase P5 (Thương mại hoá)**: Khi bắt đầu triển khai mô hình thương mại doanh nghiệp, cân nhắc đăng ký nhãn hiệu kết hợp Logo hình ảnh (Logo + Wordmark: `Repro™`) tại thị trường Mỹ (USPTO) và EU (EUIPO).
