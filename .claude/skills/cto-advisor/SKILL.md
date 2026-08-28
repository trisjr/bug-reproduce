---
name: cto-advisor
description: Technical leadership guidance for engineering teams, architecture decisions, and technology strategy. Includes tech debt analyzer, team scaling calculator, engineering metrics frameworks, technology evaluation tools, and ADR templates. Use when assessing technical debt, scaling engineering teams, evaluating technologies, making architecture decisions, establishing engineering metrics, or when user mentions CTO, tech debt, technical debt, team scaling, architecture decisions, technology evaluation, engineering metrics, DORA metrics, or technology strategy.
---

# CTO Advisor

Bộ công cụ và framework chiến lược dành cho lãnh đạo công nghệ, tập trung vào việc mở rộng quy mô đội ngũ, kiến trúc hệ thống và xây dựng văn hóa kỹ thuật xuất sắc (Engineering Excellence).

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Trách nhiệm cốt lõi](#trách-nhiệm-cốt-lõi)
3. [Quản trị Kiến trúc (Architecture Governance)](#quản-trị-kiến-trúc-architecture-governance)
4. [Quản lý nhà cung cấp (Vendor Management)](#quản-lý-nhà-cung-cấp-vendor-management)
5. [Engineering Excellence & Metrics](#engineering-excellence--metrics)
6. [Nhịp độ hoạt động (Cadence)](#nhịp-độ-hoạt-động-cadence)
7. [Quản trị rủi ro & Khủng hoảng](#quản-trị-rủi-ro--khủng-hoảng)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)

### Công cụ chính:

- **Đánh giá Nợ kỹ thuật (Technical Debt)**: `python scripts/tech_debt_analyzer.py` - Phân tích kiến trúc hệ thống và đưa ra kế hoạch giảm thiểu nợ kỹ thuật theo thứ tự ưu tiên.
- **Lập kế hoạch Mở rộng (Team Scaling)**: `python scripts/team_scaling_calculator.py` - Tính toán kế hoạch tuyển dụng và cấu trúc team tối ưu cho sự tăng trưởng.
- **Quyết định Kiến trúc**: Sử dụng ADR (Architecture Decision Records) templates trong thư mục `references/`.

## Trách nhiệm cốt lõi

### 1. Chiến lược Công nghệ
- **Tầm nhìn & Roadmap**: Xác định tầm nhìn công nghệ 3-5 năm và lộ trình hàng quý.
- **Quản lý Đổi mới (Innovation)**: Phân bổ 20% thời gian cho đổi mới sáng tạo và R&D.
- **Chiến lược Nợ kỹ thuật**: Cân bằng giữa việc xây dựng tính năng mới và duy trì sức khỏe hệ thống.

### 2. Lãnh đạo Đội ngũ
- **Mở rộng quy mô Eng**: Duy trì các tỷ lệ vàng (Manager:Engineer = 1:8, Senior:Mid:Junior = 3:4:2).
- **Văn hóa Kỹ thuật**: Thiết lập các tiêu chuẩn code (coding standards), chương trình học tập và giá trị cốt lõi của kỹ sư.

## Quản trị Kiến trúc (Architecture Governance)
- **ADR**: Ghi lại bối cảnh, các phương án đã cân nhắc, lý do đưa ra quyết định và hệ quả.
- **Tiêu chuẩn Công nghệ**: Lựa chọn ngôn ngữ, framework bản, database và yêu cầu bảo mật.

## Engineering Excellence & Metrics

### Chỉ số DORA (DORA Metrics)
- **Deployment Frequency**: Tần suất triển khai (Mục tiêu: > 1 lần/ngày).
- **Lead Time for Changes**: Thời gian từ khi bắt đầu code đến khi lên Production (Mục tiêu: < 1 ngày).
- **MTTR (Mean Time to Recovery)**: Thời gian phục hồi sau sự cố (Mục tiêu: < 1 giờ).
- **Change Failure Rate**: Tỷ lệ triển khai thất bại (Mục tiêu: < 15%).

### Chỉ số Chất lượng & Sức khỏe Team
- **Test Coverage**: > 80%.
- **Technical Debt**: < 10% tổng khối lượng công việc.
- **Team Satisfaction**: Duy trì sự hài lòng và mức độ gắn kết cao.

## Tài liệu tham khảo
- "The Manager's Path" by Camille Fournier.
- "Accelerate: The Science of Lean Software and DevOps" by Nicole Forsgren.
- "Team Topologies" by Matthew Skelton & Manuel Pais.
- C4 Model for Architecture Visualization.
- SPACE framework for developer productivity.
