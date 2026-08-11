---
id: RULE-001
type: rule
status: approved
created: 2026-02-05
updated: 2026-03-03
---

# Quy tắc Cấu trúc Tài liệu (Documentation Structure Rule)

> [!IMPORTANT]
> Quy tắc này là **BẮT BUỘC** đối với tất cả các thao tác liên quan đến tài liệu. Mọi vi phạm sẽ dẫn đến cấu trúc dự án không chính xác.

## Mục lục
1. [Các quy tắc nghiêm ngặt (MUST Follow)](#các-quy-tắc-nghiêm-ngặt-must-follow)
2. [Luồng quyết định (Decision Flow)](#luồng-quyết-định-decision-flow)
3. [Ánh xạ loại tài liệu (Document Type Mapping)](#ánh-xạ-loại-tài-liệu-document-type-mapping)
4. [Cấu trúc thư mục bắt buộc (Required Folder Structure)](#cấu-trúc-thư-mục-bắt-buộc-required-folder-structure)
5. [Bản mẫu Frontmatter (Frontmatter Template)](#bản-mẫu-frontmatter-frontmatter-template)
6. [Quy tắc liên kết (Linking Rules)](#quy-tắc-liên-kết-linking-rules)
7. [Danh sách kiểm tra xác thực (Validation Checklist)](#danh-sách-kiểm-tra-xác-thực-validation-checklist)
8. [Tài liệu tham khảo](#tài-liệu-tham-khảo)

## Các quy tắc nghiêm ngặt (MUST Follow)

1. **BẮT BUỘC** lưu tất cả tài liệu vào thư mục `docs/` - KHÔNG BAO GIỜ tạo tài liệu ở project root hoặc các thư mục khác.
2. **BẮT BUỘC** sử dụng cấu trúc thư mục Dewey Decimal (010, 020, 030, etc.).
3. **BẮT BUỘC** bao gồm YAML frontmatter trong mọi tài liệu.
4. **BẮT BUỘC** cập nhật file MOC tương ứng sau khi tạo tài liệu mới.
5. **BẮT BUỘC** sử dụng standard markdown links `[Display Name](./relative-path/file.md)` để tham chiếu chéo. **KHÔNG** dùng wiki-links `[[...]]`.
6. **KHÔNG ĐƯỢC** tạo các cấu trúc thư mục tùy chỉnh như `01-product/`, `02-analysis/`.
7. **KHÔNG ĐƯỢC** tạo tài liệu mà không kiểm tra bảng Ánh xạ loại tài liệu (Document Type Mapping) trước.

## Luồng quyết định (Decision Flow)

```
┌─────────────────────────────────────────────────────────────┐
│ TRƯỚC KHI tạo bất kỳ tài liệu nào, hãy tự hỏi:              │
├─────────────────────────────────────────────────────────────┤
│ 1. Thư mục docs/ đã tồn tại chưa?                           │
│    CHƯA → Tạo cấu trúc thư mục (xem Cấu trúc bắt buộc)      │
│    RỒI  → Tiếp tục                                          │
├─────────────────────────────────────────────────────────────┤
│ 2. Đây là loại tài liệu gì?                                 │
│    → Tra cứu trong bảng Document Type Mapping               │
│    → Xác định chính xác thư mục đích và naming convention   │
├─────────────────────────────────────────────────────────────┤
│ 3. Thư mục đích đã tồn tại chưa?                            │
│    CHƯA → Tạo thư mục với tiền tố Dewey Decimal phù hợp     │
│    RỒI  → Tiếp tục                                          │
├─────────────────────────────────────────────────────────────┤
│ 4. Tạo tài liệu với:                                        │
│    → Naming convention chính xác                            │
│    → Frontmatter bắt buộc                                   │
│    → Wiki-links tới các tài liệu liên quan                  │
├─────────────────────────────────────────────────────────────┤
│ 5. SAU KHI tạo tài liệu:                                    │
│    → Cập nhật file MOC của thư mục cha                      │
│    → Cập nhật 000-Index.md nếu là tài liệu quan trọng       │
└─────────────────────────────────────────────────────────────┘
```

## Ánh xạ loại tài liệu (Document Type Mapping)

| Category | Document Type | Target Folder | Naming Convention |
| :--- | :--- | :--- | :--- |
| **010-Planning** | Roadmap | `docs/010-Planning/` | `Roadmap.md` |
| | OKRs | `docs/010-Planning/` | `OKRs.md` |
| | Sprint | `docs/010-Planning/Sprints/` | `Sprint-{NNN}.md` |
| | Project Charter | `docs/010-Planning/` | `Charter-{ProjectName}.md` |
| | WBS | `docs/010-Planning/Estimates/` | `WBS-{ProjectName}.xlsx` |
| | ETA / Timeline | `docs/010-Planning/Estimates/` | `ETA-{ProjectName}.xlsx` |
| | Risk Register | `docs/010-Planning/` | `Risk-Register.md` |
| | Budget / Cost Estimate | `docs/010-Planning/Estimates/` | `Budget-{ProjectName}.xlsx` |
| | Status Report | `docs/010-Planning/` | `Status-Report-{Date}.md` |
| | Retrospective | `docs/010-Planning/Sprints/` | `Retro-Sprint-{NNN}.md` |
| | Implementation Plan | `docs/010-Planning/Implementation-Plans/` | `Plan-{Feature}.md` |
| **020-Requirements** | PRD | `docs/020-Requirements/` | `PRD-{ProjectName}.md` |
| | BRD | `docs/020-Requirements/BRD/` | `BRD-{NNN}-{Title}.md` |
| | Use Case | `docs/020-Requirements/Use-Cases/` | `UC-{NN}-{Title}.md` |
| | SRS | `docs/020-Requirements/` | `SRS-{ProjectName}.md` |
| | NFR | `docs/020-Requirements/` | `NFR-{ProjectName}.md` |
| **022-User-Stories** | Epic | `docs/022-User-Stories/Epics/` | `Epic-{Title}.md` |
| | User Story | `docs/022-User-Stories/Backlog/` | `Story-{Title}.md` |
| | Active Story | `docs/022-User-Stories/Active-Sprint/` | `Story-{Title}.md` |
| **030-Specs** | ADR | `docs/030-Specs/Architecture/` | `ADR-{NNN}-{Title}.md` |
| | RFC | `docs/030-Specs/Architecture/` | `RFC-{NNN}-{Title}.md` |
| | SDD (System Design) | `docs/030-Specs/Architecture/` | `SDD-{ProjectName}.md` |
| | Technical Spec | `docs/030-Specs/` | `Spec-{Feature}.md` |
| | API Endpoint Spec | `docs/030-Specs/API/` | `Endpoint-{Name}.md` |
| | DB Schema | `docs/030-Specs/Schema/` | `DB-Entity-{Name}.md` |
| | Integration Spec | `docs/030-Specs/API/` | `Spec-Integration-{Name}.md` |
| | Security Spec / Threat Model | `docs/030-Specs/Security/` | `Spec-Security-{Name}.md` |
| | Data Flow Diagram | `docs/030-Specs/Architecture/` | `DFD-{Name}.md` |
| **035-QA** | Test Plan | `docs/035-QA/Test-Plans/` | `MTP-{Name}.md` |
| | Test Case | `docs/035-QA/Test-Cases/` | `TC-{Feature}-{NNN}.md` |
| | Bug Report | `docs/035-QA/Reports/` | `Bug-{NNN}-{Title}.md` |
| | Test Execution Report | `docs/035-QA/Reports/` | `Report-{Sprint}.md` |
| | Performance Test Report | `docs/035-QA/Performance/` | `Perf-{Scenario}.md` |
| **040-Design** | Design System | `docs/040-Design/Design-System/` | `{Component}.md` |
| | Wireframe | `docs/040-Design/Wireframes/` | `WF-{Screen}-{Device}.png` |
| | User Flow | `docs/040-Design/Specs/` | `UF-{Feature}.md` |
| | Prototype Spec | `docs/040-Design/Specs/` | `Proto-{Screen}.md` |
| **050-Research** | Research / Analysis | `docs/050-Research/` | `Analysis-{Topic}.md` |
| | Competitor Analysis | `docs/050-Research/Competitor-Analysis/` | `Competitor-{Name}.md` |
| | User Interview | `docs/050-Research/User-Interviews/` | `Interview-{Date}-{Topic}.md` |
| | Survey Report | `docs/050-Research/Surveys/` | `Survey-{Topic}.md` |
| | A/B Test Report | `docs/050-Research/` | `ABTest-{Experiment}.md` |
| **060-Manuals** | User Guide | `docs/060-Manuals/User-Guide/` | `{Topic}.md` |
| | Admin Guide | `docs/060-Manuals/Admin-Guide/` | `{Topic}.md` |
| | FAQ | `docs/060-Manuals/` | `FAQ-{Topic}.md` |
| **070-Deployment** | Release Notes | `docs/070-Deployment/Releases/` | `Release-{Version}.md` |
| | Deployment Guide | `docs/070-Deployment/` | `Deploy-{Environment}.md` |
| | Runbook | `docs/070-Deployment/Runbooks/` | `Runbook-{Service}.md` |
| | Rollback Plan | `docs/070-Deployment/` | `Rollback-{Version}.md` |
| | Change Log | `docs/070-Deployment/` | `CHANGELOG.md` |
| **080-Operations** | Incident Report | `docs/080-Operations/Incidents/` | `Incident-{NNN}-{Date}.md` |
| | Post-Mortem | `docs/080-Operations/Incidents/` | `PostMortem-{NNN}-{Date}.md` |
| | SLA Document | `docs/080-Operations/SLAs/` | `SLA-{Service}.md` |
| **090-Archive** | Deprecated Docs | `docs/090-Archive/` | `{Original-Name}.md` |
| **999-Resources** | Meeting Notes | `docs/999-Resources/Meeting-Notes/` | `{Type}-{Date}.md` |
| | Glossary | `docs/999-Resources/` | `Glossary.md` |
| | Template | `docs/999-Resources/Templates/` | `Template-{Type}.md` |

## Cấu trúc thư mục bắt buộc (Required Folder Structure)

```
docs/
├── 000-Index.md                        # "Trang chủ" - BẮT BUỘC phải có
│
├── 010-Planning/                       # Chiến lược, Lịch trình, Roadmaps
│   ├── Planning-MOC.md                 # REQUIRED MOC
│   ├── Roadmap.md
│   ├── OKRs.md
│   ├── Sprints/
│   ├── Estimates/                      # WBS, ETA, Budget
│   └── Implementation-Plans/
│
├── 020-Requirements/                   # Yêu cầu nghiệp vụ
│   ├── Requirements-MOC.md             # REQUIRED MOC
│   ├── BRD/
│   └── Use-Cases/
│
├── 022-User-Stories/                   # Agile Backlog
│   ├── Stories-MOC.md                  # REQUIRED MOC
│   ├── Epics/
│   ├── Active-Sprint/
│   └── Backlog/
│
├── 030-Specs/                          # Technical Specs
│   ├── Specs-MOC.md                    # REQUIRED MOC
│   ├── Architecture/
│   ├── API/
│   ├── Schema/
│   └── Security/
│
├── 035-QA/                             # Đảm bảo chất lượng
│   ├── QA-MOC.md                       # REQUIRED MOC
│   ├── Test-Plans/
│   ├── Test-Cases/
│   ├── Automation/
│   ├── Reports/
│   └── Performance/
│
├── 040-Design/                         # UI/UX & Frontend
│   ├── Design-MOC.md                   # REQUIRED MOC
│   ├── Wireframes/
│   ├── Design-System/
│   ├── Specs/
│   └── Assets/
│
├── 050-Research/                       # Khám phá & Phân tích
│   ├── Research-MOC.md                 # REQUIRED MOC
│   ├── Competitor-Analysis/
│   ├── User-Interviews/
│   └── Surveys/
│
├── 060-Manuals/                        # Tài liệu cho người dùng cuối
│   ├── Manuals-MOC.md                  # REQUIRED MOC
│   ├── User-Guide/
│   └── Admin-Guide/
│
├── 070-Deployment/                     # Phát hành & Triển khai
│   ├── Deployment-MOC.md              # REQUIRED MOC
│   ├── Releases/
│   └── Runbooks/
│
├── 080-Operations/                     # Vận hành & Sự cố
│   ├── Operations-MOC.md              # REQUIRED MOC
│   ├── Incidents/
│   └── SLAs/
│
├── 090-Archive/                        # Tài liệu cũ (không bao giờ xóa)
│
└── 999-Resources/                      # Bản mẫu, Script, Thuật ngữ
    ├── Templates/
    ├── Glossary.md
    └── Meeting-Notes/
```

## Bản mẫu Frontmatter (Frontmatter Template)

Mọi tài liệu BẮT BUỘC phải bao gồm phần frontmatter này:

```yaml
---
id: {TYPE}-{NNN}           # Định danh duy nhất (VD: PRD-001, UC-01)
type: {document_type}      # prd, brd, use-case, epic, story, spec, adr, etc.
status: draft|review|approved|deprecated
project: {project_name}    # Tùy chọn: cho tài liệu đa dự án
owner: "@{team_or_person}" # Tùy chọn: bên chịu trách nhiệm
tags: [tag1, tag2]         # Tùy chọn: để tìm kiếm/lọc
linked-to: "./relative-path/Related-Doc.md" # Tùy chọn: relative path tới tài liệu liên quan
created: YYYY-MM-DD
updated: YYYY-MM-DD        # Tùy chọn: ngày cập nhật cuối
---
```

## Quy tắc liên kết (Linking Rules)

> **Quy ước:** Sử dụng **standard markdown links** với **relative path** tính từ vị trí file hiện tại.
> - Cùng thư mục: `[File](./File.md)`
> - Thư mục con: `[File](./SubDir/File.md)`
> - Lùi cấp: `[File](../OtherDir/File.md)`

1. **PRD** → liên kết tới các Epics: `## Related Epics\n- [Epic-Feature1](../022-User-Stories/Epics/Epic-Feature1.md)`
2. **Epic** → liên kết tới PRD cha: `Implements: [PRD-ProjectName](../020-Requirements/PRD-ProjectName.md)`
3. **Use Case** → liên kết tới Epic: `Part of: [Epic-Feature](../022-User-Stories/Epics/Epic-Feature.md)`
4. **SDD** → liên kết tới PRD: `Implements: [PRD-ProjectName](../020-Requirements/PRD-ProjectName.md)`
5. **ADR** → liên kết tới SDD: `Related to: [SDD-ProjectName](./SDD-ProjectName.md)`
6. **Release Notes** → liên kết tới Sprint: `Sprint: [Sprint-{NNN}](../010-Planning/Sprints/Sprint-{NNN}.md)`
7. **Incident Report** → liên kết tới Post-Mortem: `Analysis: [PostMortem-{NNN}](./PostMortem-{NNN}.md)`
8. **Test Plan** → liên kết tới Spec: `Covers: [Spec-{Feature}](../030-Specs/Spec-{Feature}.md)`
9. **Bug Report** → liên kết tới Test Case: `Found in: [TC-{Feature}-{NNN}](../035-QA/Test-Cases/TC-{Feature}-{NNN}.md)`

## Danh sách kiểm tra xác thực (Validation Checklist)

Trước khi hoàn tất bất kỳ tài liệu nào, hãy xác nhận:

- [ ] Tài liệu nằm đúng thư mục `docs/XXX-Category/`
- [ ] Tên file tuân thủ naming convention từ bảng ánh xạ
- [ ] Frontmatter bao gồm đầy đủ các trường bắt buộc (id, type, status, created)
- [ ] Các standard markdown links (`[text](path)`) tới tài liệu liên quan đã được thêm vào
- [ ] File MOC của thư mục cha đã được cập nhật đường dẫn tới tài liệu mới
- [ ] 000-Index.md đã được cập nhật (đối với các tài liệu lớn như PRD, SDD)

## Tài liệu tham khảo
- [OS-Handbook.md](../../OS-Handbook.md)
- [README.md](../../README.md)
- [AGENTS.md](../../AGENTS.md)
