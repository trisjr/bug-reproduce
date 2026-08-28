---
name: docx
description: "Tạo, chỉnh sửa và phân tích tài liệu toàn diện với hỗ trợ tracked changes, comment, bảo toàn định dạng và trích xuất văn bản. Sử dụng khi Claude cần làm việc với các tài liệu chuyên nghiệp (file .docx) để: (1) Tạo tài liệu mới, (2) Sửa đổi hoặc chỉnh sửa nội dung, (3) Làm việc với tracked changes, (4) Thêm comment, hoặc bất kỳ tác vụ tài liệu nào khác"
---

# DOCX Creation, Editing, and Analysis

Skill này hướng dẫn việc tạo, chỉnh sửa và phân tích các tài liệu Microsoft Word (.docx) thông qua các công cụ và workflow chuyên dụng.

## Table of Contents
1. [Tổng quan](#tổng-quan)
2. [Cây quyết định Workflow](#cây-quyết-định-workflow)
3. [Đọc và phân tích nội dung](#đọc-và-phân-tích-nội-dung)
4. [Tạo tài liệu Word mới](#tạo-tài-liệu-word-mới)
5. [Chỉnh sửa tài liệu hiện có](#chỉnh-sửa-tài-liệu-hiện-có)
6. [Workflow Redlining (Review)](#workflow-redlining-review)
7. [Chuyển đổi tài liệu](#chuyển-đổi-tài-liệu)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Tổng quan (Overview)
File .docx thực chất là một kho lưu trữ ZIP chứa các file XML. Bạn có thể tương tác với chúng bằng cách trích xuất văn bản đơn giản hoặc can thiệp trực tiếp vào cấu trúc XML thô (Raw XML) cho các định dạng phức tạp.

## Cây quyết định Workflow (Decision Tree)
- **Đọc/Phân tích**: Dùng "Trích xuất văn bản" hoặc "Truy cập XML thô".
- **Tạo mới**: Dùng workflow "Tạo tài liệu Word mới" với **docx-js**.
- **Chỉnh sửa**: 
    - Thay đổi đơn giản: Dùng workflow "Chỉnh sửa OOXML cơ bản".
    - Tài liệu chuyên nghiệp (Pháp lý, Kinh doanh...): **BẮT BUỘC** dùng **"Redlining workflow"**.

## Đọc và phân tích nội dung (Reading and Analyzing)

### Trích xuất văn bản
Sử dụng **pandoc** để chuyển đổi sang markdown:
```bash
pandoc --track-changes=all path-to-file.docx -o output.md
```

### Truy cập XML thô
Cần thiết khi xử lý comment, media nhúng hoặc metadata:
- Giải nén: `python ooxml/scripts/unpack.py <office_file> <output_directory>`
- File quan trọng: `word/document.xml`, `word/comments.xml`, `word/media/`.

## Tạo tài liệu Word mới
Sử dụng thư viện **docx-js** (Node.js).
- **QUAN TRỌNG**: Đọc kỹ file [`docx-js.md`](docx-js.md) trước khi triển khai.
- Sử dụng các component: `Document`, `Paragraph`, `TextRun`.

## Chỉnh sửa tài liệu hiện có
Sử dụng **Document library** (Python) để thao tác OOXML.
- **QUAN TRỌNG**: Đọc kỹ file [`ooxml.md`](ooxml.md).
- Giải nén → Chạy script Python chỉnh sửa XML → Đóng gói lại (Pack).

## Workflow Redlining (Review)
Cho phép lập kế hoạch và thực hiện các tracked changes. Chỉ đánh dấu phần văn bản thực sự thay đổi để đảm bảo tính chuyên nghiệp và dễ review.

## Chuyển đổi tài liệu
- **DOCX → PDF**: `soffice --headless --convert-to pdf document.docx`
- **PDF → Image**: `pdftoppm -jpeg -r 150 document.pdf page`

## Tài liệu tham khảo
- [`docx-js.md`](docx-js.md) - Hướng dẫn tạo tài liệu bằng code.
- [`ooxml.md`](ooxml.md) - Hướng dẫn thao tác XML thô.
- ISO/IEC 29500 (OOXML Standard).
- Công cụ: pandoc, libreoffice, poppler-utils.