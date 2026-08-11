<!-- Knowledge Base -->
# Mẫu Rút Kinh Nghiệm (After Action Review - AAR)

## Mục lục
1. [Giới Thiệu](#1-giới-thiệu)
2. [Cấu Trúc Báo Cáo AAR](#2-cấu-trúc-báo-cáo-aar)
3. [Ví Dụ Thực Tế](#3-ví-dụ-thực-tế)
4. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Giới Thiệu
After Action Review (AAR) là một quy trình học tập có cấu trúc để phân tích **điều gì đã xảy ra**, **tại sao nó xảy ra**, và **làm thế nào để làm tốt hơn** trong tương lai.

## 2. Cấu Trúc Báo Cáo AAR
Khi một Sprint kết thúc hoặc một incident (sự cố) xảy ra, AI và Team cần điền vào các mục sau:

### A. Mục tiêu ban đầu (What was supposed to happen?)
- Mô tả kỳ vọng ban đầu về task/sprint.

### B. Kết quả thực tế (What actually happened?)
- Ghi lại các sự kiện đã diễn ra, số liệu thực tế, các lỗi phát sinh.

### C. Phân tích nguyên nhân (Why was there a difference?)
- Tại sao kết quả thực tế khác với dự kiến? (Do sai Spec, do model AI yếu, hay do hạ tầng?).

### D. Giải pháp cải tiến (What can be learned and improved?)
- Các hành động cụ thể để khắc phục hoặc phát huy trong lần tới.

## 3. Ví Dụ Thực Tế
- **Sự cố:** Agent xóa nhầm file cấu hình khi chạy `/opsx:apply`.
- **Nguyên nhân:** Regex filter trong tool có lỗi Logic.
- **Bài học:** Cần bổ sung unit test cho các regex pattern phức tạp trước khi bàn giao cho Agent.

---

## Tài Liệu Tham Khảo
1. [U.S. Army After Action Review (AAR) Guide](https://www.army.mil/)
2. [The Power of After Action Reviews - Harvard Business Review](https://hbr.org/2005/07/learning-in-the-thick-of-it)
