<!-- Knowledge Base -->
# Quản Trị Dự Án (Project Governance)

## Mục lục
1. [Khung Quản Trị (Framework)](#1-khung-quản-trị-framework)
2. [Vai Trò & Trách Nhiệm (RACI)](#2-vai-trò--trách-nhiệm-raci)
3. [Quy Trình Quản Lý Thay Đổi](#3-quy-trình-quản-lý-thay-đổi)
4. [Quản Lý Rủi Ro](#4-quản-lý-rủi-ro)
5. [Tài Liệu Tham Khảo](#tài-liệu-tham-khảo)

---

## 1. Khung Quản Trị (Framework)
Dự án áp dụng mô hình **Hybrid Agile** sử dụng AI, kết hợp tính kỷ luật của **PMP (PMBOK 7)** và tính linh hoạt của **Scrum**.
- **Value Delivery System:** Mọi task được tạo ra phải chứng minh được giá trị mang lại cho người dùng cuối hoặc hệ thống.
- **Continuous Integration:** Tích hợp liên tục kết quả công việc của AI Agent vào dòng chảy chung của dự án.

## 2. Vai Trò & Trách Nhiệm (RACI Matrix)
- **Accountable (A):** Product Owner (PO) chịu trách nhiệm cuối cùng về kết quả.
- **Responsible (R):** AI Agent (Dev/BA/Architect) thực thi nhiệm vụ.
- **Consulted (C):** Các chuyên gia (SME) tư vấn các vấn đề phức tạp.
- **Informed (I):** Stakeholders được thông báo về tiến độ.

## 3. Quy Trình Quản Lý Thay Đổi (Change Management)
Mọi thay đổi về Specs/Requirements sau khi đã Baseline (chốt) phải đi qua các bước:
1. **Yêu cầu (Request):** Ghi nhận thay đổi qua `/opsx:new`.
2. **Phân tích (Impact Analysis):** AI thực hiện đánh giá ảnh hưởng về thời gian, ngân sách và kỹ thuật.
3. **Phê duyệt (Approval):** PO hoặc PM chốt phương án.
4. **Thực thi (Implementation):** Cập nhật vào SSOT.

## 4. Quản Lý Rủi Ro (Risk Management)
- **Identification:** Nhận diện rủi ro sớm (ví dụ: API giới hạn rate limit, model AI bị hallucinate).
- **Mitigation:** Luôn có phương án dự phòng (Fallback mechanism).
- **Monitoring:** Theo dõi rủi ro thông qua Risk Log định kỳ mỗi Sprint.

---

## Tài Liệu Tham Khảo
1. [Project Management Institute (PMI) - PMBOK Guide 7th Edition](https://www.pmi.org/pmbok-guide-standards/foundational/pmbok)
2. [Agile Practice Guide - PMI](https://www.pmi.org/pmbok-guide-standards/practice-guides/agile)
3. [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html)
