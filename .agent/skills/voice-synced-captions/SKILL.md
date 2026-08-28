---
name: voice-synced-captions
description: Use whenever generating burned-in subtitles/captions for short-form video (TikTok/Reels/Shorts style), or any time the user asks for "hiệu ứng chữ", "phụ đề động", animated captions, karaoke captions, word-by-word captions, or captions that sync to the voice/emphasis. Always consult this skill before hardcoding a plain .srt-style caption — plain static captions read as low-effort for short-form content. Covers the catalog of animated caption styles (karaoke fill, pop/bounce word, keyword highlight, typewriter, emphasis shake, speaker color, slide/fade), how to pick one, and a ready-to-run script that builds a real .ass subtitle file from word-level timestamps for FFmpeg to burn in.
---

# Voice-Synced Captions (hiệu ứng chữ theo giọng nói)

Kỹ năng này giúp AI chọn đúng **kiểu hiệu ứng chữ động** cho video ngắn và **thực sự render ra được** (không chỉ mô tả suông) — output cuối là file `.ass` để FFmpeg burn cứng vào video.

## Vì sao không dùng `.srt` thường

`.srt` chỉ hiện/ẩn cả câu theo mốc thời gian — không tạo được hiệu ứng theo từng từ. Toàn bộ style trong skill này bắt buộc dùng định dạng **`.ass` (Advanced SubStation Alpha)** vì nó hỗ trợ animation tag (`\t`, `\k`, `\move`, đổi màu theo ký tự...). Input bắt buộc: **word-level timestamps** (mốc bắt đầu/kết thúc của từng từ, không phải từng câu) — lấy từ Whisper (`word_timestamps=True`) hoặc bất kỳ ASR nào trả về timing từng từ.

## Bảng chọn style theo nội dung

| Loại nội dung / mục đích | Style nên dùng | Vì sao |
|---|---|---|
| Video giải thích, học kiến thức, tutorial | **Karaoke fill** | Người xem theo dõi được đang nghe tới đâu, không rối mắt |
| Video trend TikTok, review, storytime, năng lượng cao | **Pop/bounce từng từ** | Style phổ biến nhất hiện nay (kiểu Hormozi/Opus Clip), giữ chân người xem |
| Video cần nhấn thông điệp/từ khóa bán hàng | **Highlight từ khóa** | Cả câu hiện sẵn (dễ đọc lướt), nhưng từ khóa nổi bật đúng lúc nói tới |
| Video hồi hộp, dạng kể chuyện, tiết lộ bí mật | **Typewriter** | Tạo cảm giác chờ đợi, hợp nội dung "tiết lộ dần" |
| Câu có từ được nói to/nhấn mạnh rõ | **Shake/scale mạnh tại từ nhấn** | Đồng bộ hiệu ứng với cảm xúc thật của giọng nói, không phải ngẫu nhiên |
| Video 2 người đối thoại/phỏng vấn | **Đổi màu theo người nói** | Phân biệt ai đang nói mà không cần chèn tên |
| Nội dung nghiêm túc, thương hiệu cao cấp, phỏng vấn dài | **Slide/fade theo dòng** (không animate từng từ) | Animate quá nhiều theo từng từ trông "rẻ tiền" với nội dung nghiêm túc |

**Nguyên tắc:** mỗi video chỉ nên dùng **1 style xuyên suốt** (trừ khi cố ý đổi style theo đoạn để tạo nhịp). Không trộn nhiều style hiệu ứng khác nhau trong cùng 1 video — trông lộn xộn.

## Nguyên tắc dàn chữ (áp dụng mọi style)

- **1–4 từ / dòng hiển thị** cho short-form dọc (9:16) — nhiều hơn sẽ tràn màn hình hoặc chữ quá nhỏ.
- Font **bold, có viền outline dày** (`\bord` ≥ 3) để đọc được trên mọi nền video.
- Vị trí: căn giữa theo chiều ngang, đặt ở **1/3 dưới hoặc giữa khung hình** — tránh vùng an toàn bị UI nền tảng (like/comment/share) che ở cạnh phải và dưới cùng.
- Màu chữ chính: trắng; màu nhấn/active: vàng hoặc màu theo thương hiệu (không dùng đỏ trừ khi content cảnh báo/gấp).
- Case: **UPPERCASE hoặc Title Case** đọc nhanh hơn lowercase thường trên màn hình nhỏ.

## Quy trình

1. Lấy **word-level timestamps** từ ASR (Whisper `word_timestamps=True`, hoặc service ASR khác có trả timing từng từ).
2. Chọn style theo bảng trên (dựa vào loại nội dung, hoặc theo `caption_style` mà người dùng/EDL chỉ định).
3. (Tùy chọn, cho style "shake theo nhấn giọng") Phân tích biên độ âm thanh (RMS) để tìm từ nào được nói to hơn trung bình → đánh dấu `emphasis: true`.
4. Chạy `scripts/build_ass_captions.py` để build file `.ass` thật từ JSON word-timestamps.
5. Burn vào video:
   ```bash
   ffmpeg -i input.mp4 -vf "ass=captions.ass" -c:a copy output.mp4
   ```

## Input JSON cần chuẩn bị (từ bước ASR)

```json
[
  {"word": "Hôm", "start": 0.12, "end": 0.34},
  {"word": "nay", "start": 0.34, "end": 0.58},
  {"word": "mình", "start": 0.58, "end": 0.81}
]
```

`scripts/build_ass_captions.py` tự nhóm các từ thành dòng hiển thị (2–4 từ/dòng) — không cần nhóm sẵn.

## Chạy script

```bash
python3 scripts/build_ass_captions.py words.json output.ass --style pop --video-width 1080 --video-height 1920
```

`--style` nhận: `karaoke`, `pop`, `highlight`, `typewriter`, `slide`. Chi tiết cú pháp tag `.ass` dùng trong từng style, cách chỉnh màu/font/kích thước, và cách làm 2 style nâng cao chưa có sẵn trong script (**shake theo nhấn giọng**, **đổi màu theo người nói**) — xem `references/ass-tag-guide.md`.

## Schema để gắn vào EDL (cho pipeline video-node-tool)

```json
{
  "captions": {
    "style": "pop | karaoke | highlight | typewriter | slide",
    "words_json": "path/to/words.json",
    "accent_color": "&H00D7FF&",
    "reason": "nội dung review sản phẩm, năng lượng cao -> pop/bounce"
  }
}
```
