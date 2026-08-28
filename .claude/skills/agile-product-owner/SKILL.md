---
name: agile-product-owner
description: Bộ công cụ quản trị sản phẩm Agile dành cho Senior Product Owner bao gồm tạo user story tuân thủ INVEST, lập kế hoạch sprint, quản lý backlog và theo dõi velocity. Sử dụng cho việc viết story, lập kế hoạch sprint, truyền thông với stakeholder và các nghi thức agile.
---

# Agile Product Owner

Cấp độ nâng cao của quản trị sản phẩm Agile với sự hỗ trợ của tự động hóa và các framework chuẩn mực.

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Các Script chính](#các-script-chính)
3. [Quy tắc INVEST](#quy-tắc-invest)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Năng lực cốt lõi (Core Capabilities)

- **INVEST-Compliant User Story Generation**: Tạo các User Story độc lập, có giá trị và có thể kiểm thử.
- **Sprint Planning & Backlog Management**: Tối ưu hóa việc sắp xếp task cho mỗi chu kỳ Sprint.
- **Backlog Prioritization**: Sử dụng dữ liệu và framework để xếp hạng mức độ quan trọng.
- **Velocity Analysis & Forecasting**: Dự báo tiến độ dựa trên tốc độ hoàn thành thực tế của team.
- **Stakeholder Communication**: Tạo báo cáo và cập nhật tiến độ sản phẩm một cách trực quan.

## Các Script chính (Key Scripts)

### user_story_generator.py
Tự động hóa việc tạo User Stories từ các Epic hoặc yêu cầu thô.
- **Cách sử dụng**: `python scripts/user_story_generator.py "Tên yêu cầu"`
- Đảm bảo cấu trúc: "As a [role], I want [action], so that [value]".
- Tự động gợi ý các tiêu chí nghiệm thu (Acceptance Criteria).

## Quy tắc INVEST cho User Story
- **I**ndependent: Độc lập.
- **N**egotiable: Có thể thương lượng.
- **V**aluable: Có giá trị.
- **E**stimable: Có thể ước lượng.
- **S**mall: Đủ nhỏ.
- **T**estable: Có thể kiểm thử.

## Tài liệu tham khảo
- Agile Manifesto (agilemanifesto.org).
- User Story Mapping by Jeff Patton.
- INVEST Principle for Agile Software Development.
