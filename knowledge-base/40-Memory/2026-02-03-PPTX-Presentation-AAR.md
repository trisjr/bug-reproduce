<!-- Knowledge Base -->
# After Action Review (AAR): Tái cấu trúc bộ Slides TNMCORE-OS Handbook

## Mục lục
1. [Mục tiêu ban đầu](#1-mục-tiêu-ban-đầu)
2. [Kết quả thực tế](#2-kết-quả-thực-tế)
3. [Phân tích lỗi & Nguyên nhân](#3-phân-tích-lỗi--nguyên-nhân)
4. [Bài học & Giải pháp cải tiến](#4-bài-học--giải-pháp-cải-tiến)
5. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Mục tiêu ban đầu
- Tái cấu trúc bộ Slides từ thiết kế cũ sang phong cách **"Terminal Blueprint"** (Lấy cảm hứng từ NotebookLM).
- Đảm bảo tính nhất quán về Design System (Color, Typography, Layout).
- Chuyển đổi thành công sang file `.pptx` mà không gặp lỗi render.

## 2. Kết quả thực tế
- File PowerPoint được tạo thành công: `TNMCORE-OS-Handbook-NotebookLM.pptx`.
- Toàn bộ 15 Slide đều hiển thị đúng nội dung từ Handbook.
- Layout 2 cột (Main Card + Tree view) được mô phỏng chính xác bằng HTML/CSS.
- Đã sửa lỗi overflow trên các slide có nội dung dài (Slide 3, 13).

## 3. Phân tích lỗi & Nguyên nhân (Why was there a difference?)
Trong quá trình thực hiện, hệ thống gặp các lỗi nghiêm trọng sau:

| Loại lỗi | Nguyên nhân | Hậu quả |
|----------|-------------|---------|
| **Overflow** | Nội dung Handbook quá dài, Font size lớn (14pt) + Padding dày. | Task build bị crash do nội dung vượt quá kích thước 720pt x 405pt. |
| **Unwrapped Text** | Text nằm trực tiếp trong thẻ `<div>` hoặc dùng ký hiệu tự do (`-`, `*`, `⇅`). | Thư viện `html2pptx` bỏ qua hoặc báo lỗi validate. |
| **Unsupported CSS** | Dùng `linear-gradient` cho hiệu ứng Grid và `border` trực tiếp lên thẻ `<p>`. | Không render được background hoặc mất định dạng viền. |
| **Asset Path** | File HTML nằm trong sub-folder `slides/` nhưng gọi ảnh sai đường dẫn. | Lỗi `ENOENT` (File not found). |

## 4. Bài học & Giải pháp cải tiến (What can be learned?)

### A. Quy tắc thiết kế cho PPTX (HTML-Based)
- **Cấu trúc Semantic (Bắt buộc):**
    - Luôn bọc text trong `<p>`, `<h1>`-`<h6>`, `<ul>`/`<li>`.
    - **Cấm dùng ký tự thủ công:** Tuyệt đối không dùng dấu gạch đầu dòng thủ công (vd: `- Content`) trong thẻ `<p>`. Phải dùng cấu trúc `<ul>/<li>`. Dấu `-` ở đầu thẻ `<p>` sẽ gây lỗi validation.
- **Quản lý Hình khối & Viền:**
    - Background, Border, Shadows chỉ được phép áp dụng trên thẻ `<div>`.
    - **Cấm border trên text:** Tuyệt đối không khai báo `border` trong style của các thẻ văn bản (`p`, `h1`, ...). Nếu cần viền cho văn bản, hãy bọc nó trong một thẻ `<div>` có border.
- **CSS Hạn chế:** Tránh Gradients (dùng màu Solid). Nếu cần Grid, hãy dùng các thẻ `<div>` tạo đường kẻ mảnh thay vì CSS background-image gradient.

### B. Kinh nghiệm cho AI Agent & Task Management
- **Phân tách Slide theo Hierarchy:** Luôn đọc kỹ mục lục (TOC) của Handbook/Tài liệu SQL để chia slide theo cấu trúc chương/mục con. Không nên gộp quá nhiều mục vào một slide để tránh lỗi Overflow.
- **Tiêu chuẩn Kích thước:** Title nên dùng 24-38pt, Nội dung dùng 8.5-11pt để đảm bảo an toàn về không gian (Safe Area).
- **Cá nhân hóa:** Phụ thuộc vào yêu cầu User để cập nhật Footer (vd: "Authorized by...").
- **Context Discovery:** Trước khi sửa slide, hãy kiểm tra file `design_tokens.css` để đảm bảo dùng đúng biến màu sắc hệ thống.

---

## Tài Liệu Tham Khảo
1. [TNMCORE-OS PPTX Generation Workflow](../../.agent/workflows/pptx-generation.md)
2. [PptxGenJS Documentation](https://gitbrent.github.io/PptxGenJS/)
3. [NotebookLM Design Inspiration](https://notebooklm.google.com/)
