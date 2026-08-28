---
description: Cắt một bản release — dựng release notes + CHANGELOG, đồng bộ tài liệu đã lỗi thời, tag và publish GitHub Release
author: trisjr
---

# 🚀 Workflow: Release

Quy trình cắt release đầy đủ: từ khảo sát trạng thái repo → viết tài liệu phát hành → merge → tag → publish GitHub Release → báo cáo.

**Đầu vào**: `$ARGUMENTS` — version muốn phát hành (vd `v0.1.0`, `0.2.0`, `patch`). Nếu trống, tự suy ra ở Bước 1 rồi **hỏi anh xác nhận**.

> [!NOTE]
> File này tồn tại song song ở `.claude/commands/release.md` và `.agent/workflows/release.md` dưới dạng
> **hai bản sao y hệt** theo quy ước mirror của repo. Sửa một bên thì **phải** đồng bộ bên còn lại.
> Kiểm: `diff .agent/workflows/release.md .claude/commands/release.md`.
>
> Nội dung dưới đây cố ý **không phụ thuộc runtime của một agent cụ thể** — chỉ dùng lệnh shell,
> `git`, `gh` và thao tác đọc/ghi file. Bất kỳ coding agent nào có shell + file I/O đều chạy được.

> **⚡ Hợp đồng hiệu năng:** Gom read-only `git`/`gh` vào **một** lệnh shell rồi suy luận cục bộ trên output. Không tách `status`, `log`, `tag -l`, `gh pr list`, `gh release list` thành nhiều lượt gọi.

> **📌 Ngôn ngữ (BẮT BUỘC):**
> - **Tài liệu trong repo** (`docs/070-Deployment/**`) → **Tiếng Việt**, giữ nguyên thuật ngữ IT.
> - **Commit message, PR title, PR body, git tag message, GitHub Release notes** → **100% Tiếng Anh** (đây là mặt tiền công khai, phải khớp giọng README).
> - Commit format: `<type>(<scope>): <description>` — một dòng, lowercase, không có `Co-authored`.
> - Branch format: `docs/<github-username>/release-<version>`.

---

## Bước 1 — Khảo sát trạng thái (một lệnh gộp)

```bash
git status --short; git branch --show-current; git log --oneline -15; git tag -l; \
gh release list 2>&1; gh repo view --json name,visibility,defaultBranchRef,url; \
gh pr list --state merged --limit 10; gh run list --limit 5
```

Từ output, tự trả lời:

| Câu hỏi | Ý nghĩa |
|---|---|
| Đã có tag nào chưa? | Không có tag → đây là **release đầu tiên**, `CHANGELOG.md` phải tạo mới |
| Working tree sạch chưa? | Bẩn → dừng, hỏi anh xử lý trước |
| Đang ở branch nào? | Không ở `main` → `git checkout main && git pull --ff-only` |
| PR nào đã merge từ tag trước? | Đây chính là nguyên liệu viết release notes |
| CI gần nhất pass chưa? | Fail → dừng, báo cáo |

**Suy ra version** (nếu `$ARGUMENTS` trống): đọc `package.json` → `version`; đối chiếu SemVer với phạm vi thay đổi kể từ tag trước. **Luôn hỏi anh xác nhận trước khi tag.**

---

## Bước 2 — Đọc bối cảnh dự án

Đọc (gộp thành ít lượt nhất có thể):

1. **Nguồn sự thật về chất lượng** — verdict/QA report của phase gần nhất (`docs/010-Planning/pm-runs/*/verdict.md`). Lấy **số liệu thật**, không bịa.
2. **Template** — `docs/999-Resources/Templates/Template-Release-Notes.md`. Bám đúng khung `1. Release Info` → `5. Deployment Steps`.
3. **README.md** — để giọng văn release notes tiếng Anh khớp với mặt tiền dự án.
4. **`docs/070-Deployment/Deployment-MOC.md`** và **`docs/000-Index.md`** — tìm **các khẳng định đã lỗi thời** (xem Bước 4.3).
5. **Roadmap** (`docs/010-Planning/Roadmap.md`) — lấy ranh giới scope để viết mục *Known Limitations* cho trung thực.

---

## Bước 3 — Chạy kiểm chứng THẬT

```bash
node --version && npm test 2>&1 | tail -12
```

> [!IMPORTANT]
> **Không được chép số liệu từ tài liệu cũ vào release notes.** Mọi con số (số test, tỉ lệ pass) phải là kết quả vừa chạy. Nếu lệch với verdict cũ → ghi số **mới** và nêu rõ khác biệt. Test fail → **dừng**, báo cáo, không tag.

---

## Bước 4 — Viết tài liệu phát hành

Tạo branch trước: `git checkout -b docs/<username>/release-<version>`

### 4.1. `docs/070-Deployment/Releases/Release-<VERSION>.md` *(Tiếng Việt)*

Bám `Template-Release-Notes`, có YAML frontmatter (`id`, `type: release-notes`, `status: released`, `version`, `created`, `updated`). 6 mục:

1. **Release Info** — version, date, git tag, environment, distribution, gate, owner.
2. **What's New** — Features (bảng package/module + capability), Improvements, Verification (bảng số liệu thật).
3. **Bug Fixes** — release đầu tiên thì ghi rõ *"chưa có baseline đã phát hành nào để sửa lỗi"*, đừng để trống.
4. **Known Issues & Limitations** — **mục quan trọng nhất, không được bỏ.** Xem hộp bên dưới.
5. **Deployment Steps** — lấy nguồn từ spec (SDD/ADR), **không viết lại**; nêu thứ tự triển khai và cách rollback.
6. **Liên kết** — GitHub Release, CHANGELOG, verdict, test plan, roadmap, SECURITY.md.

> [!WARNING]
> **Known Limitations phải trung thực đến mức khó chịu.** Tách rõ hai loại:
> - **Ranh giới có chủ đích** (theo roadmap/scope) — ghi kèm nguồn quyết định.
> - **Khoảng cách giữa tài liệu và thực tế** — vd README viết `npm install @repro/node` nhưng package chưa publish lên registry; hoặc chưa có bước build; hoặc còn phụ thuộc service tự vận hành. **Bắt buộc nêu.** Người đọc release notes mà cài không được là lỗi của release notes.

### 4.2. `docs/070-Deployment/CHANGELOG.md` *(Tiếng Việt)*

Chuẩn [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [SemVer](https://semver.org/spec/v2.0.0.html). Vị trí theo `RULE-001` §Document Type Mapping.

- Nếu **chưa tồn tại** → tạo mới, kèm ghi chú: file này chỉ ghi thay đổi **phần mềm**; lịch sử **tài liệu** nằm ở `docs/010-Planning/pm-runs/`.
- Nếu **đã tồn tại** → chèn section version mới **ngay dưới** `## [Unreleased]`, làm rỗng `[Unreleased]`, cập nhật link compare ở cuối file.
- Nhóm mục: `Added` · `Changed` · `Fixed` · `Security` · `Known limitations`.

### 4.3. Đồng bộ tài liệu đã lỗi thời — **đừng bỏ qua bước này**

Release làm **sai** những khẳng định trong tài liệu cũ. Rà và sửa:

| File | Khẳng định điển hình cần sửa |
|---|---|
| `docs/070-Deployment/Deployment-MOC.md` | *"Chưa có tài liệu triển khai nào"*, *"`Releases/` và `CHANGELOG.md` chưa tạo"*, `status: draft` |
| `docs/000-Index.md` | Nhãn kiểu *"sẵn sàng cho P3"* ở dòng `070-Deployment/` |
| `README.md` | Roadmap ghi *"Built & Verified"* → cân nhắc *"Released"* + link tag |

> [!NOTE]
> **Giữ nguyên ghi chú lịch sử, chỉ bổ sung.** Nếu MOC có mục *"Ghi chú lịch sử"* giải thích vì sao trước đây link chết bị gỡ — **không xoá**, mà **thêm một đoạn** ghi rằng ngày phát hành `<version>` các file đó đã được tạo thật và link được khôi phục. Xoá lịch sử là làm mất dấu vết kiểm toán.

**Chốt lại:** mọi link tương đối vừa thêm phải được kiểm tra tồn tại thật:

```bash
ls docs/030-Specs/Architecture/ docs/030-Specs/Security/ docs/035-QA/Test-Plans/
```

---

## Bước 5 — Commit & PR

Chain thành **một** lệnh:

```bash
git add <chỉ các file vừa sửa> && \
git commit -q -m "docs(release): add <version> release notes, changelog and refresh deployment moc" && \
git push -u origin docs/<username>/release-<version>
```

> **CẤM `git add .`** — chỉ add đúng file đã đụng tới.

PR body: viết ra file tạm rồi `gh pr create --body-file`, dùng template của `pr-templates` (Context & Solution / Key Changes / Testing & Evidence / Impact & Risks / Pre-Merge Checklist). Nêu rõ PR này là **tiền đề để tag**.

### ⛔ Gate merge — dừng lại ở đây

> [!IMPORTANT]
> `gh pr merge` **có thể bị lớp permission của agent chặn** (auto-approve policy, sandbox, hoặc rule cấm ghi lên remote). Đừng vòng tránh bằng cách khác. Khi bị chặn:
> 1. Báo anh: PR URL + lý do bị chặn.
> 2. **Dừng workflow**, chờ anh merge tay.
> 3. Anh xác nhận xong → tiếp Bước 6.
>
> Đây cũng chính là **gate phê duyệt duy nhất** của workflow — anh nhìn tài liệu phát hành trước khi nó bị đóng băng vào tag.

---

## Bước 6 — Tag *(chỉ sau khi PR đã merge)*

> [!WARNING]
> **Thứ tự này không được đảo.** Tag **sau** khi docs đã vào `main`, để bản thân tag chứa luôn release notes. Tag trước → tag trỏ vào commit không có notes, và mọi link `blob/<version>/docs/...` trong GitHub Release sẽ 404.

```bash
git checkout main && git fetch --all --prune && git pull --ff-only && git log --oneline -3
npm test 2>&1 | tail -9      # chạy lại trên ĐÚNG commit sắp tag
```

Tag có annotation (không dùng lightweight tag), message **Tiếng Anh**, gồm: tên release, một câu mô tả, số liệu kiểm chứng, đường dẫn tới release notes.

```bash
git tag -a <version> -m "<message>" && git push origin <version>
```

---

## Bước 7 — Publish GitHub Release

Soạn notes **Tiếng Anh** ra file tạm (đây là bản dành cho người ngoài, không phải bản dịch máy móc của file tiếng Việt — viết lại theo giọng README):

- Hook mở đầu — tagline của dự án.
- What's in — bảng package/tính năng.
- Security & privacy — nếu dự án có ràng buộc bảo mật.
- Verification — bảng số liệu **vừa chạy**.
- Known limitations — bản rút gọn từ §4 tài liệu tiếng Việt, giữ nguyên độ trung thực.
- What's next — trích roadmap.
- Documentation — link `blob/<version>/...` (dùng tag, **không dùng `main`**, để link bất biến).

```bash
gh release create <version> --title "<version> — <Theme>" \
  --notes-file <file> --latest --verify-tag
```

`--verify-tag` bắt buộc: nó chặn việc vô tình tạo release trên tag không tồn tại.

---

## Bước 8 — Xác minh & báo cáo

```bash
gh release view <version> --json tagName,name,isDraft,isPrerelease,url; \
gh release list; git status --short; git tag -l
```

Kiểm tra render thật của trang release (alert block `[!IMPORTANT]`, bảng):

```bash
curl -sL <release-url> | grep -o 'markdown-alert-important' | head -1
```

**Báo cáo cho anh** gồm đúng các mục sau:

1. **Link release** + trạng thái (`Latest`, không draft/prerelease).
2. **Bảng các bước đã làm** — commit hash, PR, tag, kết quả test.
3. **File mới/đã sửa** trên `main`.
4. **Việc không tự làm được** — vd `gh pr merge` bị chặn, ai đã làm thay.
5. **Việc cố ý KHÔNG làm** — vd không publish npm (`private: true`), không tạo release CI workflow, không bump version dev, không xoá branch đã merge. Nêu **lý do**.
6. **Gợi ý cân nhắc** — thay đổi nằm ngoài phạm vi release (vd cập nhật README roadmap, dọn branch cũ), để anh quyết, **không tự làm**.

---

## 🚫 Ranh giới — tuyệt đối không tự ý làm

| Không làm | Vì sao |
|---|---|
| `npm publish` | Publish registry là hành động **không thể thu hồi** và hướng ra ngoài. Phải có lệnh minh thị của anh. |
| Xoá / ép ghi đè tag đã push | Tag là hợp đồng bất biến với người dùng. |
| `git push --force` lên `main` | — |
| Xoá branch trên `origin` | Repo này giữ lịch sử branch; chỉ dọn khi anh yêu cầu. |
| Bump version trong `package.json` sang `-dev` | Nằm ngoài phạm vi "cắt release". |
| Bịa số liệu kiểm chứng | Mọi con số phải từ lần chạy thật ở Bước 3/6. |
| Bỏ qua mục Known Limitations | Release notes giấu giới hạn là release notes gây hại. |
