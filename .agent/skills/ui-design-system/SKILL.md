---
name: ui-design-system
description: Bộ công cụ UI design system dành cho Senior UI Designer bao gồm tạo design token, tài liệu hóa component, tính toán responsive design và các công cụ bàn giao cho developer. Sử dụng để tạo hệ thống thiết kế, duy trì tính nhất quán về mặt thị giác và thúc đẩy sự cộng tác giữa thiết kế và lập trình.
---

# UI Design System

Bộ công cụ chuyên nghiệp để tạo và duy trì các hệ thống thiết kế (design system) có khả năng mở rộng.

## Table of Contents
1. [Năng lực cốt lõi](#năng-lực-cốt-lõi)
2. [Các Script chính](#các-script-chính)
3. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Năng lực cốt lõi (Core Capabilities)
- Tạo các Design token (màu sắc, typography, khoảng cách/spacing).
- Kiến trúc hệ thống component.
- Tính toán cho Responsive thiết kế.
- Tuân thủ khả năng tiếp cận (Accessibility compliance).
- Tài liệu hóa việc bàn giao cho Developer (Developer handoff).

## Các Script chính (Key Scripts)

### design_token_generator.py
Tạo các token hoàn chỉnh cho hệ thống thiết kế từ các màu sắc thương hiệu.

**Cách sử dụng**: `python scripts/design_token_generator.py [brand_color] [style] [format]`
- Phong cách (Styles): modern, classic, playful.
- Định dạng (Formats): json, css, scss.

**Tính năng**:
- Tạo bảng màu (color palette) đầy đủ.
- Quy chuẩn hóa typography (Modular typography scale).
- Hệ thống lưới khoảng cách 8pt (8pt spacing grid system).
- Các token cho đổ bóng (shadow) và hiệu ứng chuyển động (animation).
- Các điểm gãy (breakpoints) cho responsive.
- Hỗ trợ nhiều định dạng export.

## Tài liệu tham khảo
- Google Material Design System.
- Atomic Design by Brad Frost.
- WCAG Accessibility Guidelines.
