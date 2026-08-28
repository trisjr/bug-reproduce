---
name: product-manager-toolkit
description: Bộ công cụ toàn diện cho Product Managers bao gồm RICE prioritization, phân tích phỏng vấn khách hàng, PRD templates, discovery frameworks, và chiến lược go-to-market. Sử dụng cho feature prioritization, tổng hợp nghiên cứu người dùng, tài liệu hóa requirement, và phát triển chiến lược sản phẩm.
---

# Product Manager Toolkit

Các công cụ và framework thiết yếu cho quản trị sản phẩm hiện đại (modern product management), từ giai đoạn khám phá (discovery) đến bàn giao (delivery).

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Workflow cốt lõi](#workflow-cốt-lõi)
3. [Các Script chính](#các-script-chính)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)
5. [Framework Ưu tiên (Prioritization)](#framework-ưu-tiên-prioritization)
6. [Best Practices](#best-practices)
7. [Các cạm bẫy thường gặp](#các-cạm-bẫy-thường-gặp-common-pitfalls-to-avoid)

## Khởi đầu nhanh (Quick Start)

### Cho Feature Prioritization
```bash
python scripts/rice_prioritizer.py sample_features.csv --capacity 15
```

### Cho Interview Analysis
```bash
python scripts/customer_interview_analyzer.py interview_transcript.txt
```

## Workflow cốt lõi (Core Workflows)

### 1. Quy trình Ưu tiên Tính năng (Feature Prioritization)
- **Thu thập yêu cầu**: Từ khách hàng, Sales, nợ kỹ thuật (Technical debt) và các sáng kiến chiến lược.
- **Chấm điểm RICE**: Tính toán điểm dựa trên Reach, Impact, Confidence và Effort.
- **Tạo Roadmap**: Lập kế hoạch năng lực (Capacity planning) hàng quý và thống nhất với Stakeholder.

### 2. Quy trình Khám phá Khách hàng (Customer Discovery)
- **Phỏng vấn (Interview)**: Tập trung vào vấn đề (problems), không phải giải pháp (solutions).
- **Phân tích Insight**: Trích xuất Pain points, mấu chốt Jobs to be done và cảm xúc của khách hàng.
- **Xác thực giải pháp (Validation)**: Kiểm chứng giả thuyết bằng Prototype.

### 3. Phát triển PRD (Product Requirement Document)
- **Chọn Template phù hợp**: Standard PRD, One-Page PRD, hoặc Agile Epic.
- **Cấu trúc**: Luôn bao gồm Problem → Solution → Success Metrics và Acceptance Criteria.

## Các Script chính (Key Scripts)

### `rice_prioritizer.py`
Triển khai framework RICE nâng cao để phân tích danh mục sản phẩm.
- Tính toán điểm RICE.
- Phân tích cân bằng (Quick wins vs Big bets).
- Đưa ra kế hoạch năng lực cho team.

### `customer_interview_analyzer.py`
Phân tích bản ghi phỏng vấn bằng NLP để trích xuất các insight hành động được.
- Nhận diện mức độ nghiêm trọng của Pain points.
- Phân loại yêu cầu tính năng và nhắc đến đối thủ cạnh tranh.

## Framework Ưu tiên (Prioritization)

### RICE Score
`Score = (Reach × Impact × Confidence) / Effort`
- **Reach**: Số người dùng bị ảnh hưởng.
- **Impact**: Mức độ tác động (Massive, High, Medium, Low, Minimal).
- **Confidence**: Độ tự tin vào dữ liệu (100%, 80%, 50%).
- **Effort**: Nỗ lực thực hiện (số người-tháng).

## Best Practices
- **Viết PRD xuất sắc**: Luôn bắt đầu bằng Problem, nêu rõ những gì nằm ngoài phạm vi (Out of scope).
- **Phỏng vấn khách hàng**: Hỏi "Tại sao" 5 lần để tìm ra nguyên nhân gốc rễ.
- **Quản lý Stakeholder**: Xác định mô hình RACI (Responsible, Accountable, Consulted, Informed) cho mỗi quyết định.

## Các cạm bẫy thường gặp (Common Pitfalls to Avoid)
- ❌ **Solution-First Thinking**: Nhảy vào làm giải pháp khi chưa hiểu thấu đáo vấn đề.
- ❌ **Feature Factory**: Ship tính năng liên tục mà không thực sự đo lường tác động.
- ❌ **Analysis Paralysis**: Nghiên cứu quá nhiều nhưng không bao giờ bàn giao sản phẩm.

## Tài liệu tham khảo
- "Inspired" by Marty Cagan.
- Intercom's Guide to Product Management.
- RICE Prioritization by Intercom.
- Opportunity Solution Tree by Teresa Torres.
