---
name: xlsx
description: "Phân tích, chỉnh sửa và tạo bảng tính toàn diện với hỗ trợ công thức, định dạng, phân tích dữ liệu và trực quan hóa. Sử dụng khi Claude cần làm việc với bảng tính (.xlsx, .xlsm, .csv, .tsv, v.v.) để: (1) Tạo bảng tính mới với công thức và định dạng, (2) Đọc hoặc phân tích dữ liệu, (3) Chỉnh sửa bảng tính hiện có trong khi vẫn bảo toàn công thức, (4) Phân tích dữ liệu và trực quan hóa trong bảng tính, hoặc (5) Tính toán lại công thức."
---

# XLSX Creation, Editing, and Analysis

Skill này hướng dẫn việc làm việc với các bảng tính Excel (.xlsx) một cách chuyên nghiệp, tập trung vào tính động (dynamic) thông qua công thức và định dạng chuẩn.

## Table of Contents
1. [Tiêu chuẩn chất lượng](#tiêu-chuẩn-chất-lượng)
2. [Model tài chính & Mã màu](#model-tài-chính--mã-màu)
3. [Phân tích dữ liệu](#phân-tích-dữ-liệu-1)
4. [Nguyên tắc sử dụng Công thức](#nguyên-tắc-sử-dụng-công-thức)
5. [Tính toán lại (Recalculation)](#tính-toán-lại-recalculation)
6. [Tài liệu tham khảo](#tài-liệu-tham-khảo-1)

## Tiêu chuẩn chất lượng (Quality Standards)
- **Lỗi công thức bằng 0**: Đảm bảo tuyệt đối không có các lỗi như #REF!, #DIV/0!, #VALUE!.
- **Bảo toàn Template**: Tuân thủ chính xác định dạng, style và các quy ước hiện có của file khi thực hiện sửa đổi.

## Model tài chính & Mã màu (Financial Models)
- **Xanh dương (Blue)**: Các dữ liệu đầu vào (Inputs) được hardcoded.
- **Đen (Black)**: TẤT CẢ các công thức và tính toán.
- **Xanh lá (Green)**: Liên kết dữ liệu từ các worksheet khác trong cùng một workbook.
- **Đỏ (Red)**: Các liên kết ngoài (External links) dẫn tới file khác.
- **Nền Vàng (Yellow)**: Các giả định (Assumptions) quan trọng cần lưu ý.

## Phân tích dữ liệu (Data Analysis)
Sử dụng thư viện **pandas** trong Python cho các tác vụ phân tích, thống kê và trực quan hóa:
```python
import pandas as pd
df = pd.read_excel('data.xlsx')
```

## Nguyên tắc sử dụng Công thức
**BẮT BUỘC**: Sử dụng công thức Excel thay vì tính toán giá trị trong Python rồi hardcode kết quả vào ô. Điều này giúp bảng tính luôn mang tính cập nhật.
- ✅ **Đúng**: `sheet['B10'] = '=SUM(B2:B9)'`

## Tính toán lại (Recalculation)
Khi sử dụng `openpyxl`, các công thức có thể không tự động cập nhật giá trị. Hãy dùng script hỗ trợ:
```bash
python recalc.py <excel_file>
```

## Tài liệu tham khảo
- [`recalc.py`](recalc.py) - Script hỗ trợ tính toán lại workbook.
- Thư viện: pandas, openpyxl.
- Công cụ: LibreOffice (yêu cầu để chạy script tính toán lại).