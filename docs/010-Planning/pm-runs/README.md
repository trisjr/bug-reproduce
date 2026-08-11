---
id: PM-RUNS
type: reference
status: draft
created: 2026-08-07
---

# PM Runs — Run-state của `/pm-run`

Mỗi lần chạy `/pm-run` sinh ra một thư mục `<YYYY-MM-DD>-<slug>/` tại đây. Đây là **sổ tay điều phối của PM**, không phải deliverable — deliverable nằm ở `openspec/changes/`, `docs/`, hoặc source code tùy tier.

Định nghĩa workflow: `.agent/workflows/pm-run.md`.

## Cấu trúc một run

```
<YYYY-MM-DD>-<slug>/
├── brief.md          Bắt buộc — input gốc, chấm triage, tier, assumptions
├── run-plan.md       Bắt buộc từ T1 — phase, agent assignment, file ownership
├── findings/         Chỉ T2, T3 — output analysis fan-out, mỗi lens một file
│   └── <role>.md
├── escalations.md    Tạo khi có escalation đầu tiên, không tạo sẵn
└── verdict.md        Bắt buộc từ T2 — kết quả verification
```

Tier thấp sinh ít file hơn. T0 chỉ có `brief.md`.

## Schema từng file

### `brief.md`

```markdown
# Brief: <run-id>

## Yêu cầu gốc
<nguyên văn input của khách hàng — không diễn giải lại, không rút gọn>

## Triage
| # | Câu hỏi | Đáp án | Lý do |
|---|---------|--------|-------|
| Q1 | Chạm > 1 domain? | Có/Không | ... |
| Q2 | Đổi kiến trúc / contract? | Có/Không | ... |
| Q3 | Mơ hồ, thiếu AC? | Có/Không | ... |
| Q4 | > 5 file hoặc > 1 ngày công? | Có/Không | ... |

**Điểm**: N/4 → **Tier**: T<n>
**Chọn tier thấp do phân vân**: Có/Không — nếu Có, ghi rõ tier còn lại là gì và
điều kiện nào sẽ kích hoạt escalate lên.

## Assumptions
- <giả định đang đi theo> → **sai thì hỏng ở đâu**: <hệ quả>

## Open questions
- <câu chưa có lời giải, ai sẽ trả lời, chặn phase nào>
```

### `run-plan.md`

```markdown
# Run Plan: <run-id>

## Phases
| # | Phase | Agent | Song song? | Input | Output |
|---|-------|-------|-----------|-------|--------|

## File ownership map
| Agent | Sở hữu (được ghi) | Cấm chạm |
|-------|-------------------|----------|

> Các tập ownership PHẢI rời nhau tuyệt đối. Không cắt rời được → chỉ dùng 1 implementer.
> `tasks.md` luôn thuộc về PM, không cấp cho worker nào.

## Artifact sẽ tạo/sửa ngoài run-state
- <đường dẫn> — <mục đích>

## Gate
- Trình ngày: <YYYY-MM-DD>
- Kết quả: Duyệt / Duyệt kèm điều chỉnh / Từ chối
- Điều chỉnh của anh: <nếu có>
```

### `findings/<role>.md`

Dán nguyên văn `SUMMARY` của worker, cộng thêm phần PM tự ghi:

```markdown
# Findings — <role>

## Kết luận của worker
<nguyên văn SUMMARY>

## PM đọc được gì
- <điều ảnh hưởng tới run plan>

## Mâu thuẫn với lens khác
- <nếu có — nêu rõ mâu thuẫn với ai, và PM phân xử thế nào, hoặc đã đẩy lên gate>
```

### `escalations.md`

Append-only. Không sửa entry cũ, chỉ thêm entry mới.

```markdown
# Escalations: <run-id>

## E1 — <tiêu đề ngắn>
- **Tầng**: 2 (PM tự quyết) | 3 (hỏi user)
- **Worker**: <agent> tại phase <n>
- **QUESTION**: <nguyên văn>
- **OPTIONS**: A… / B… / C…
- **RECOMMEND của worker**: <…>
- **Quyết định**: <…> — **lý do**: <…>
- **Hành động**: dispatch worker mới với câu trả lời inline / đổi tier / cắt scope
```

### `verdict.md`

```markdown
# Verdict: <run-id>

| Khía cạnh | Trạng thái |
|-----------|-----------|
| Completeness | X/Y task, N requirement |
| Correctness | M/N requirement được bao phủ |
| Coherence | Tuân thủ / Có vấn đề |

## CRITICAL
- <phải sửa trước khi đóng run>

## WARNING
- <nên sửa>

## SUGGESTION
- <có thể cải thiện>

**Người verify**: <agent> — phải KHÁC agent đã implement.
**Kết luận**: Đóng được / Quay lại Bước 5
```

## Quy ước

- Run-state được **commit vào repo**. Nó là dấu vết quyết định, có giá trị truy vết về sau — đặc biệt phần `escalations.md`.
- Không xóa run cũ. Run thất bại cũng giữ lại, vì lý do thất bại chính là dữ liệu.
- Không nhét secret, token, hay dữ liệu khách hàng nhạy cảm vào bất kỳ file nào ở đây.
