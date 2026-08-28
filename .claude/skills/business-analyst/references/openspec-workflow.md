# OpenSpec Workflow for Business Analysts

## Overview
OpenSpec là quy trình "Spec-Driven Development". Là BA, bạn chịu trách nhiệm tạo và duy trì "Source of Truth" (Specs) trước khi Code được viết.

## Workflow Chi Tiết

### Phase 1: Proposal (Khởi tạo)
Tạo file Proposal để thống nhất hướng đi với team.
*   **File location**: `openspec/changes/<change-id>/proposal.md`
*   **Content**: High-level requirements, Goals, Scope (Dựa trên PRD).

### Phase 2: Specifications (Chi tiết hóa)
Sau khi Proposal được duyệt, hãy viết Specs chi tiết. Specs trong OpenSpec thường được tổ chức theo cấu trúc Markdown.

*   **File location**: `openspec/changes/<change-id>/specs/**/*.md`
*   **Requirement**:
    *   Mỗi file spec nên focus vào một Domain/Feature cụ thể.
    *   Sử dụng ngôn ngữ rõ ràng, tránh mơ hồ.
    *   **MUST**: Mỗi requirement phải đi kèm ít nhất một Scenario ví dụ minh họa.

### Phase 3: Validation (Kiểm tra)
Trước khi hand-over cho Dev:
1.  **Peer Review**: Review chéo với PO/Leader.
2.  **Tech Review**: Confirm với Tech Lead về tính khả thi.
3.  **Consistency Check**: Đảm bảo Specs khớp với Design (Figma) và Proposal ban đầu.

## Mapping PRD to OpenSpec

| PRD Section | OpenSpec Component | Note |
|---|---|---|
| User Segments | Actors (in Specs) | Định nghĩa rõ ai thực hiện hành động |
| Functional Reqs | Use Cases / Scenarios | Mô tả hành vi hệ thống |
| Business Rules | Constraints / Logic Policies | Các điều kiện ràng buộc |
| API Structure | Schemas / Data Models | (Thường do Dev/Architect hỗ trợ) |

## Best Practices
*   **Single Source of Truth**: Nếu có thay đổi, update Spec TRƯỚC, update ticket ClickUp SAU.
*   **Version Control**: OpenSpec nằm trong Git, hãy học cách dùng Git cơ bản (Pull, Commit, Push markdown files).
