---
trigger: always_on
---

# Tool Usage Rules (Tool-First Execution)

Khi thao tác trên codebase, Agent **BẮT BUỘC** ưu tiên sử dụng các native tool của Claude (Read, Glob, Grep, Edit, Write) thay vì shell command. Lý do: các tool này cho kết quả có cấu trúc, an toàn (không phá vỡ nội dung file do escaping/quoting), có kiểm soát trạng thái file, và dễ audit lại.

## 1. Đọc & Tìm kiếm (Read & Search)

| Nhu cầu | **PHẢI dùng** | **KHÔNG dùng** |
|---|---|---|
| Đọc nội dung file | `Read` | `cat`, `head`, `tail`, `sed -n`, `less` |
| Tìm file theo tên/pattern | `Glob` | `find`, `ls -R` |
| Tìm nội dung trong code | `Grep` | `grep`, `rg`, `ag` |

## 2. Tạo & Chỉnh sửa file (Create & Modify)

- **BẮT BUỘC**: Mọi thao tác tạo mới hoặc chỉnh sửa nội dung file phải đi qua `Write` (tạo mới / ghi đè toàn bộ) hoặc `Edit` (sửa một phần).
- **KHÔNG ĐƯỢC**: Dùng `sed -i`, `awk`, heredoc (`cat > file <<EOF`), `echo >>`, hoặc viết script (`.js`, `.py`, `.sh`) chỉ để update nội dung file.
- **BẮT BUỘC**: Luôn `Read` file trước khi `Edit` để nắm chính xác nội dung hiện tại (anti-hallucination), không sửa dựa trên phỏng đoán.
- **KHÔNG ĐƯỢC**: Ghi đè một file đang tồn tại bằng `Write` khi chưa đọc nó — nguy cơ mất dữ liệu.

## 3. Phạm vi hợp lệ của Bash (When Bash is correct)

Rule này **không phải** lệnh cấm Bash. Vẫn dùng Bash cho các việc thực sự cần shell:

- Version control: `git status`, `git diff`, `git commit`, `git push`.
- Package & build: `pnpm install`, `pnpm build`, `pnpm test`, `pnpm lint`.
- Chạy process / service: dev server, migration (`typeorm`), CLI tool (`gh`, `docker`).
- Thao tác filesystem không liên quan nội dung: `mkdir`, `mv`, `rm`, `chmod`.
- Kiểm tra môi trường: `node -v`, `which`, `env`.

> [!NOTE]
> Nguyên tắc phân định: **nội dung file → dùng tool; hành vi hệ thống → dùng Bash.**

## 4. Script hợp lệ vs Script lạm dụng

- **Hợp lệ**: Script là một sản phẩm giao nộp (deliverable) phục vụ automation lặp lại — tuân thủ `scripts-management.md` (đặt trong `/scripts`).
- **Lạm dụng**: Script dùng một lần chỉ để tránh việc gọi `Edit`/`Write` nhiều lần. Trường hợp này phải gọi tool trực tiếp, kể cả khi phải gọi nhiều lần.

## 5. Xử lý số lượng lớn (Bulk Changes)

- Với thay đổi trải rộng nhiều file: dùng `Grep` để lập danh sách chính xác các vị trí cần sửa, sau đó `Edit` lần lượt (dùng `replace_all` khi pattern chắc chắn duy nhất trong file).
- Nếu khối lượng quá lớn cho một context, delegate cho sub-agent — **không** hạ tiêu chuẩn bằng cách chuyển sang `sed`.

---

_Author: trisjr_
