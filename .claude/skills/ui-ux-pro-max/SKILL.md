---
name: ui-ux-pro-max
description: Trí tuệ nhân tạo chuyên sâu về thiết kế UI/UX. Bao gồm 50 phong cách, 21 bảng màu, 50 cặp font, 20 loại biểu đồ và 9 công nghệ stack.
---

# UI/UX Pro Max

Hướng dẫn thiết kế toàn diện cho ứng dụng web và di động. Bao gồm 67 phong cách, 96 bảng màu, 56 cặp font, 98 nguyên tắc UX và 25 loại biểu đồ trên 13 nền tảng công nghệ. Cơ sở dữ liệu có thể tìm kiếm với các đề xuất dựa trên mức độ ưu tiên.

## Table of Contents
1. [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
2. [Cách sử dụng Skill này](#cách-sử-dụng-skill-này)
3. [Quy trình ví dụ](#quy trình-ví-dụ)
4. [Các quy tắc chung cho UI chuyên nghiệp](#các-quy-tắc-chung-cho-ui-chuyên-nghiệp)
5. [Danh sách kiểm tra trước khi bàn giao](#danh-sách-kiểm-tra-trước-khi-bàn-giao-pre-delivery-checklist)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Điều kiện tiên quyết (Prerequisites)
Kiểm tra xem Python đã được cài đặt chưa:
```bash
python3 --version || python --version
```

## Cách sử dụng Skill này

Khi người dùng yêu cầu các công việc về UI/UX (thiết kế, xây dựng, tạo, triển khai, review, sửa lỗi, cải thiện), hãy làm theo workflow sau:

### Bước 1: Phân tích yêu cầu người dùng
Trích xuất thông tin chính:
- **Loại sản phẩm**: SaaS, thương mại điện tử, portfolio, dashboard, landing page...
- **Từ khóa phong cách**: tối giản (minimal), chuyên nghiệp, sang trọng, dark mode...
- **Ngành hàng**: y tế, fintech, game, giáo dục...
- **Tech Stack**: React, Vue, Next.js... mặc định là `html-tailwind`.

### Bước 2: Tạo Design System (BẮT BUỘC)
Luôn bắt đầu với flag `--design-system` để nhận các đề xuất toàn diện:
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system
```

### Bước 3: Tìm kiếm chi tiết (Khi cần thiết)
Sử dụng các tìm kiếm theo domain để lấy thêm chi tiết:
- `style`: Các hiệu ứng hình ảnh (glassmorphism, v.v.).
- `ux`: Best practices về trải nghiệm.
- `typography`: Các cặp font thay thế.
- `chart`: Đề xuất loại biểu đồ.

### Bước 4: Hướng dẫn theo Stack
Lấy các best practice đặc thù cho công nghệ đang dùng:
```bash
python3 .agent/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react
```

## Các quy tắc chung cho UI chuyên nghiệp

| Lĩnh vực | Nên làm (Do) | Không nên (Don't) |
|------|----|----- |
| **Icons** | Dùng SVG icons (Lucide, Heroicons) | Dùng emoji như 🎨 🚀 làm icon UI |
| **Tương tác** | Thêm `cursor-pointer` cho mọi thành phần có thể click | Để con trỏ mặc định trên các card tương tác |
| **Dark Mode** | Sử dụng độ tương phản đủ cao (slate-900 cho text trên nền sáng) | Dùng màu xám quá nhạt cho text nội dung |
| **Layout** | Floating navbar với khoảng cách `top-4` | Để navbar dính sát mép `top-0` (style lỗi thời) |

## Danh sách kiểm tra trước khi bàn giao (Pre-Delivery Checklist)

### Chất lượng thị giác
- [ ] Không dùng emoji làm icon (sử dụng SVG).
- [ ] Các icon nhất quán từ cùng một bộ set (Heroicons/Lucide).
- [ ] Hover states không làm nhảy layout (không đổi size/border-width gây dịch chuyển).

### Tương tác
- [ ] Mọi phần tử click được đều có `cursor-pointer`.
- [ ] Phản hồi hover rõ ràng (đổi màu, shadow, hoặc border).
- [ ] Transition mượt mà (150-300ms).

### Khả năng truy cập (Accessibility)
- [ ] Mọi hình ảnh đều có thuộc tính `alt`.
- [ ] Input của form có nhãn (label).
- [ ] Responsive tốt ở các kích thước màn hình 375px, 768px, 1024px, 1440px.

## Tài liệu tham khảo
- Google Material Design.
- Apple Human Interface Guidelines.
- Thư mục `scripts/` và `database/` trong skill này.
