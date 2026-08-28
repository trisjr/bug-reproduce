# Product Requirements Document (PRD) Templates

## Standard PRD Template

### 1. Executive Summary
**Mục đích**: Bản tổng quan một trang cho ban điều hành và stakeholders.

#### Các thành phần:
- **Problem Statement** (Câu phát biểu vấn đề - 2-3 câu)
- **Proposed Solution** (Giải pháp đề xuất - 2-3 câu)
- **Business Impact** (Tác động kinh doanh - 3 gạch đầu dòng)
- **Timeline** (Các mốc quan trọng cấp cao)
- **Resources Required** (Quy mô team và ngân sách)
- **Success Metrics** (3-5 KPIs)

### 2. Problem Definition

#### 2.1 Customer Problem
- **Who**: Persona người dùng mục tiêu
- **What**: Vấn đề hoặc nhu cầu cụ thể
- **When**: Ngữ cảnh và tần suất
- **Where**: Môi trường và các điểm chạm (touchpoints)
- **Why**: Phân tích nguyên nhân gốc rễ (Root cause analysis)
- **Impact**: Chi phí nếu không giải quyết

#### 2.2 Market Opportunity
- **Market Size**: TAM, SAM, SOM
- **Growth Rate**: Tỷ lệ tăng trưởng hàng năm
- **Competition**: Các giải pháp hiện tại và khoảng trống (gaps)
- **Timing**: Tại sao là bây giờ?

#### 2.3 Business Case
- **Revenue Potential**: Tác động dự kiến doanh thu
- **Cost Savings**: Tăng hiệu quả
- **Strategic Value**: Sự phù hợp với mục tiêu công ty
- **Risk Assessment**: Điều gì xảy ra nếu chúng ta không làm?

### 3. Solution Overview

#### 3.1 Proposed Solution
- **High-Level Description**: Chúng ta đang xây dựng cái gì
- **Key Capabilities**: Chức năng cốt lõi
- **User Journey**: End-to-end flow
- **Differentiation**: Giá trị đề xuất độc nhất (Unique value proposition)

#### 3.2 In Scope
- Feature 1: Mô tả và độ ưu tiên
- Feature 2: Mô tả và độ ưu tiên
- Feature 3: Mô tả và độ ưu tiên

#### 3.3 Out of Scope
- Nêu rõ những gì chúng ta KHÔNG làm
- Các cân nhắc trong tương lai
- Sự phụ thuộc vào các team khác

#### 3.4 MVP Definition
- **Core Features**: Tập hợp feature khả dụng tối thiểu
- **Success Criteria**: Định nghĩa thế nào là "hoạt động"
- **Timeline**: Ngày giao MVP
- **Learning Goals**: Những gì chúng ta muốn validate

### 4. User Stories & Requirements

#### 4.1 User Stories
```
As a [persona]
I want to [action]
So that [outcome/benefit]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

#### 4.2 Functional Requirements
| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| FR1 | User can... | P0 | Critical cho MVP |
| FR2 | System should... | P1 | Quan trọng |
| FR3 | Feature must... | P2 | Nice to have |

#### 4.3 Non-Functional Requirements
- **Performance**: Thời gian phản hồi, lưu lượng
- **Scalability**: Mục tiêu tăng trưởng user/data
- **Security**: Authentication, authorization, bảo vệ dữ liệu
- **Reliability**: Mục tiêu uptime, tỷ lệ lỗi
- **Usability**: Tiêu chuẩn accessibility, hỗ trợ thiết bị
- **Compliance**: Yêu cầu về tuân thủ quy định

### 5. Design & User Experience

#### 5.1 Design Principles
- Principle 1: Mô tả
- Principle 2: Mô tả
- Principle 3: Mô tả

#### 5.2 Wireframes/Mockups
- Link tới file Figma/Sketch
- Các màn hình và luồng chính
- Các mẫu tương tác (Interaction patterns)

#### 5.3 Information Architecture
- Cấu trúc điều hướng (Navigation structure)
- Tổ chức dữ liệu
- Phân cấp nội dung

### 6. Technical Specifications

#### 6.1 Architecture Overview
- Sơ đồ kiến trúc hệ thống
- Technology stack
- Các điểm tích hợp (Integration points)
- Luồng dữ liệu (Data flow)

#### 6.2 API Design
- Endpoints và methods
- Định dạng Request/response
- Phương pháp Authentication
- Rate limiting

#### 6.3 Database Design
- Data model
- Các thực thể chính và mối quan hệ
- Chiến lược Migration

#### 6.4 Security Considerations
- Phương pháp Authentication
- Mô hình Authorization
- Mã hóa dữ liệu (Data encryption)
- Xử lý PII

### 7. Go-to-Market Strategy

#### 7.1 Launch Plan
- **Soft Launch**: Beta users, timeline
- **Full Launch**: Tất cả users, timeline
- **Marketing**: Chiến dịch và kênh
- **Support**: Tài liệu và đào tạo

#### 7.2 Pricing Strategy
- Mô hình giá (Pricing model)
- Phân tích cạnh tranh
- Giá trị đề xuất (Value proposition)

#### 7.3 Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Adoption Rate | X% | Daily Active Users |
| User Satisfaction | X/10 | NPS Score |
| Revenue Impact | $X | Monthly Recurring Revenue |
| Performance | <Xms | P95 Response Time |

### 8. Risks & Mitigations

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Technical debt | Medium | High | Phân bổ 20% cho refactoring |
| User adoption | Low | High | Chương trình Beta với các vòng lặp phản hồi |
| Scope creep | High | Medium | Review stakeholder hàng tuần |

### 9. Timeline & Milestones

| Milestone | Date | Deliverables | Success Criteria |
|-----------|------|--------------|-----------------|
| Design Complete | Tuần 2 | Mockups, IA | Stakeholder phê duyệt |
| MVP Development | Tuần 6 | Core features | Hoàn thành tất cả P0 |
| Beta Launch | Tuần 8 | Release giới hạn | 100 beta users |
| Full Launch | Tuần 12 | General availability | Tỷ lệ lỗi <1% |

### 10. Team & Resources

#### 10.1 Team Structure
- **Product Manager**: [Tên]
- **Engineering Lead**: [Tên]
- **Design Lead**: [Tên]
- **Engineers**: X FTEs
- **QA**: X FTEs

#### 10.2 Budget
- Development: $X
- Infrastructure: $X
- Marketing: $X
- Total: $X

### 11. Appendix
- Dữ liệu nghiên cứu người dùng (User Research Data)
- Phân tích cạnh tranh (Competitive Analysis)
- Sơ đồ kỹ thuật (Technical Diagrams)
- Tài liệu pháp lý/tuân thủ (Legal/Compliance Docs)

---

## Agile Epic Template

### Epic: [Tên Epic]

#### Overview
**Epic ID**: EPIC-XXX
**Theme**: [Product Theme]
**Quarter**: QX 20XX
**Status**: Discovery | In Progress | Complete

#### Problem Statement
[2-3 câu mô tả vấn đề]

#### Goals & Objectives
1. Mục tiêu 1
2. Mục tiêu 2
3. Mục tiêu 3

#### Success Metrics
- Metric 1: Target
- Metric 2: Target
- Metric 3: Target

#### User Stories
| Story ID | Title | Priority | Points | Status |
|----------|-------|----------|--------|--------|
| US-001 | As a... | P0 | 5 | To Do |
| US-002 | As a... | P1 | 3 | To Do |

#### Dependencies
- Dependency 1: Team/System
- Dependency 2: Team/System

#### Acceptance Criteria
- [ ] Hoàn thành tất cả user story P0
- [ ] Đạt mục tiêu performance
- [ ] Đã qua review bảo mật
- [ ] Tài liệu đã cập nhật

---

## One-Page PRD Template

### [Feature Name] - One-Page PRD

**Date**: [Ngày]
**Author**: [Tên PM]
**Status**: Draft | In Review | Approved

#### Problem
*Vấn đề gì chúng ta đang giải quyết? Cho ai?*
[2-3 câu]

#### Solution
*Chúng ta đang xây dựng cái gì?*
[2-3 câu]

#### Why Now?
*Điều gì thúc đẩy sự khẩn cấp?*
- Lý do 1
- Lý do 2
- Lý do 3

#### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| KPI 1 | X | Y |
| KPI 2 | X | Y |

#### Scope
**In**: Feature 1, Feature 2, Feature 3
**Out**: Feature A, Feature B

#### User Flow
```
Step 1 → Step 2 → Step 3 → Success!
```

#### Risks
1. Rủi ro 1 → Giảm thiểu
2. Rủi ro 2 → Giảm thiểu

#### Timeline
- Design: Tuần 1-2
- Development: Tuần 3-6
- Testing: Tuần 7
- Launch: Tuần 8

#### Resources
- Engineering: X developers
- Design: X designer
- QA: X tester

#### Open Questions
1. Câu hỏi 1?
2. Câu hỏi 2?

---

## Feature Brief Template (Lightweight)

### Feature: [Tên]

#### Context
*Tại sao chúng ta cân nhắc điều này?*

#### Hypothesis
*Chúng tôi tin rằng [xây dựng feature này]
Cho [những user này]
Sẽ [đạt được outcome này]
Chúng tôi biết mình đúng khi [chúng tôi thấy metric này]*

#### Proposed Solution
*Cách tiếp cận cấp cao*

#### Effort Estimate
- **Size**: XS | S | M | L | XL
- **Confidence**: High | Medium | Low

#### Next Steps
1. [ ] User research
2. [ ] Design exploration
3. [ ] Technical spike
4. [ ] Stakeholder review
