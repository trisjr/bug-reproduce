---
name: pdf
description: Bộ công cụ xử lý PDF toàn diện để trích xuất văn bản và bảng biểu, tạo PDF mới, gộp/chia tài liệu và xử lý các form. Sử dụng khi cần điền form PDF hoặc xử lý, tạo, hoặc phân tích các tài liệu PDF theo chương trình ở quy mô lớn.
---

# PDF Processing Guide

Hướng dẫn xử lý tài liệu PDF bao gồm trích xuất dữ liệu, tạo mới và thao tác nâng cao thông qua thư viện Python và công cụ dòng lệnh.

## Table of Contents
1. [Khởi đầu nhanh](#khởi-đầu-nhanh)
2. [Các thư viện Python](#các-thư-viện-python)
3. [Công cụ dòng lệnh](#công-cụ-dòng-lệnh)
4. [Các tác vụ phổ biến](#các-tác-vụ-phổ-biến)
5. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Khởi đầu nhanh (Quick Start)
Thao tác cơ bản với `pypdf`:
```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Các thư viện Python (Python Libraries)

- **pypdf**: Gộp (Merge), Chia nhỏ (Split), Xoay trang (Rotate) và trích xuất Metadata.
- **pdfplumber**: Trích xuất văn bản kèm Layout và trích xuất bảng biểu (Tables).
- **reportlab**: Chuyên dụng để tạo mới tài liệu PDF nhiều trang với định dạng phức tạp.

## Công cụ dòng lệnh (Command-Line Tools)

- **pdftotext**: Trích xuất văn bản nhanh chóng.
  - `-layout`: Bảo toàn định dạng gốc.
- **qpdf**: Gộp và chia trang PDF từ dòng lệnh một cách hiệu quả.

## Các tác vụ phổ biến (Common Tasks)
- **PDF Scanned (Ảnh quét)**: Sử dụng `pytesseract` và `pdf2image` để nhận diện chữ viết (OCR).
- **Watermark**: Dùng `pypdf` để chèn lớp phủ watermark.
- **Trích xuất hình ảnh**: Sử dụng `pdfimages` từ bộ công cụ `poppler-utils`.
- **Bảo mật**: Thiết mã hóa mật khẩu người dùng và chủ sở hữu.

## Tài liệu tham khảo
- [`reference.md`](reference.md) - Chi tiết kỹ thuật và API.
- [`forms.md`](forms.md) - Hướng dẫn điền và xử lý form PDF.
- Công cụ bổ trợ: poppler-utils, qpdf, pdftk.
