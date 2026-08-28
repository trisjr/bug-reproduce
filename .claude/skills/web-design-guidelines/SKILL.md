---
name: web-design-guidelines
description: Review code UI để đảm bảo tuân thủ các Hướng dẫn Giao diện Web (Web Interface Guidelines). Sử dụng khi được yêu cầu "review UI", "kiểm tra accessibility", "audit thiết kế", "review UX", hoặc "kiểm tra trang web theo best practices".
metadata:
  author: vercel
  version: "1.0.0"
---

# Web Interface Guidelines

Review các file để đảm bảo tuân thủ các Hướng dẫn Giao diện Web.

## Table of Contents
1. [Cách thức hoạt động](#cách-thức-hoạt-động)
2. [Nguồn tài liệu hướng dẫn](#nguồn-tài-liệu-hướng-dẫn)
3. [Cách sử dụng](#cách-sử- dụng)
4. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Cách thức hoạt động

1. Truy xuất các hướng dẫn mới nhất từ URL nguồn bên dưới.
2. Đọc các file được chỉ định (hoặc yêu cầu người dùng cung cấp file/pattern).
3. Kiểm tra so với tất cả các quy tắc trong tài liệu hướng dẫn đã tải.
4. Xuất kết quả theo định dạng ngắn gọn `file:line`.

## Nguồn tài liệu hướng dẫn

Luôn lấy hướng dẫn mới nhất trước khi thực hiện review:
```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```
Sử dụng công cụ truy xuất web để lấy các quy tắc mới nhất. Nội dung tải về sẽ bao gồm tất cả các quy tắc và hướng dẫn định dạng đầu ra.

## Cách sử dụng

Khi người dùng cung cấp đối số là file hoặc pattern:
1. Tải hướng dẫn từ URL nguồn ở trên.
2. Đọc các file được chỉ định.
3. Áp dụng tất cả quy tắc từ hướng dẫn đã tải.
4. Xuất kết quả theo định dạng quy định trong hướng dẫn.

Nếu không có file nào được chỉ định, hãy hỏi người dùng xem họ muốn review file nào.

## Tài liệu tham khảo
- [Vercel Web Interface Guidelines Repository](https://github.com/vercel-labs/web-interface-guidelines).
- WCAG Accessibility Standards.
- Web Vitals Performance Metrics.
