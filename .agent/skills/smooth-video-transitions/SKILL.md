---
name: smooth-video-transitions
description: Use whenever editing, cutting, or assembling video clips — especially when generating an Edit Decision List (EDL) for FFmpeg, or any time the user asks for "chuyển cảnh mượt", smooth transitions, cinematic cuts, or a scene-to-scene edit. Always consult this skill before choosing HOW two clips connect (hard cut vs. transition vs. mask wipe vs. speed ramp), not just what content goes in each clip. Covers a catalog of transition techniques (crossfade, wipes, mask/overlay wipes, whip pan, zoom punch, match cut, speed ramp, light leak, glitch) with the reasoning for when each fits, plus ready-to-use FFmpeg implementations so an AI editor can output transitions that actually execute correctly.
---

# Smooth Video Transitions

Kỹ năng này giúp AI (hoặc người dùng) chọn **đúng loại chuyển cảnh** giữa 2 clip và **thực thi được bằng FFmpeg**, thay vì chỉ cắt cứng (hard cut) giữa mọi cảnh. Mục tiêu: chuyển cảnh phải phục vụ nội dung/nhịp điệu, không phải chọn ngẫu nhiên hiệu ứng cho đẹp.

## Quy trình quyết định (áp dụng mỗi khi ghép 2 clip)

1. **Đọc nội dung 2 clip cạnh nhau**: cùng chủ thể/góc quay khác? cùng chuyển động? đổi bối cảnh hoàn toàn? có nhạc/beat đi kèm không?
2. **Chọn nhóm kỹ thuật** theo bảng quyết định bên dưới.
3. **Map ra tham số FFmpeg cụ thể** (loại transition, duration, offset) — xem `references/ffmpeg-transitions.md`.
4. **Ghi vào EDL** theo schema ở cuối file này để bước render FFmpeg đọc và thực thi tự động.

### Bảng quyết định nhanh

| Tình huống 2 clip | Chuyển cảnh nên dùng | Vì sao |
|---|---|---|
| Cùng cảnh, cùng chủ thể, quay 2 góc/2 lần khác nhau (như video demo: rửa nho quay lại 2 lần) | **Mask wipe chéo (diagonal wipe) trên overlay 2 track** | Tạo cảm giác "cùng một khoảnh khắc nhưng đổi góc nhìn", rất mượt vì nội dung 2 lớp gần giống nhau |
| Đổi bối cảnh/chủ đề hoàn toàn, không liên quan chuyển động | **Crossfade/dissolve** hoặc **fade qua màu (đen/trắng)** nếu đổi mood mạnh | Dissolve trung tính, không đòi hỏi 2 clip phải "khớp" nhau |
| Chủ thể đang chuyển động cùng hướng ở cuối clip A và đầu clip B | **Match cut theo chuyển động** (cắt cứng đúng frame chuyển động khớp) | Không cần hiệu ứng gì cả — cắt đúng thời điểm chuyển động là "chuyển cảnh mượt" tự nhiên nhất |
| Muốn tạo nhịp nhanh, năng lượng cao (nhạc TikTok trending) | **Whip pan / zoom punch / speed ramp** đúng vào beat nhạc | Chuyển động máy quay giả lập che đi điểm cắt, đồng bộ với beat tạo cảm giác "đúng nhịp" |
| Clip A kết ở tốc độ thường, cần nhấn nhá cao trào trước khi sang clip B | **Speed ramp (ease-out chậm dần → cắt)** | Làm chậm lại đúng lúc cao trào rồi cắt, tạo điểm nhấn |
| Nội dung vui, trend, cần hiệu ứng "giật gân" | **Glitch / RGB split / light leak overlay** | Dùng cho nội dung giải trí, không dùng cho nội dung nghiêm túc/thương hiệu cao cấp |
| Không chắc, hoặc 2 clip không có điểm chung rõ ràng | **Hard cut** (không hiệu ứng) | Mặc định an toàn — thêm hiệu ứng bừa bãi làm video trông rẻ tiền hơn là mượt hơn |

**Nguyên tắc quan trọng nhất: hard cut vẫn là lựa chọn mặc định tốt.** Chỉ thêm transition khi nó giải quyết một vấn đề cụ thể (che điểm cắt xấu, tạo nhịp, nhấn cảm xúc) — không phải vì "cho đẹp". Lạm dụng transition (đặc biệt glitch/zoom) trên mọi clip là dấu hiệu điển hình của video "amateur".

## Kỹ thuật 1 — Mask wipe chéo trên 2 lớp overlay (từ video gốc)

Đây là kỹ thuật thấy trong video hướng dẫn CapCut/Jianying gốc: dùng **2 bản của cùng một đoạn quay** (hoặc 2 góc quay khác nhau của cùng khoảnh khắc), xếp chồng track, rồi dùng **mask hình chữ nhật/đường chéo (linear mask)** kéo từ góc này sang góc kia để "vén" lớp trên lộ ra lớp dưới.

- Track 1 (dưới): clip A, chạy hết video.
- Track 2 (trên): clip B (bản/góc quay khác), đặt overlay, mask "linear" (hoặc "rectangle") kéo từ 0% → 100% theo đường chéo trong khoảng 0.3–0.8s.
- Kết quả: cảm giác 2 hình ảnh "lướt" qua nhau rất mượt vì cả 2 lớp có nội dung tương đồng (không bị giật vì khác biệt hình ảnh quá lớn).

FFmpeg tương đương: dùng `xfade` với transition `diagtl`/`diagtr`/`diagbl`/`diagbr` (chéo 4 hướng) — xem chi tiết lệnh ở `references/ffmpeg-transitions.md`. Đây gần như chính là hiệu ứng mask chéo làm thủ công trong CapCut, nhưng FFmpeg đã có sẵn filter dựng nó tự động, không cần overlay + mask thủ công.

## Kỹ thuật 2 — Crossfade / Dissolve

Hòa tan 2 clip chồng lên nhau theo alpha. Dùng khi đổi bối cảnh, đổi timeline (time-lapse), hoặc chuyển mood nhẹ nhàng. Duration khuyến nghị: 0.3–0.6s cho nội dung nhịp nhanh, 0.8–1.5s cho nội dung chậm/cảm xúc.

## Kỹ thuật 3 — Whip pan / Zoom punch

Giả lập máy quay lia nhanh (motion blur ngang) hoặc zoom giật vào giữa điểm cắt để che đi sự khác biệt giữa 2 clip. Rất hợp nội dung năng lượng cao, đồng bộ đúng vào beat nhạc. Cần thêm blur trong 2–4 frame cuối clip A và 2–4 frame đầu clip B để hiệu ứng không bị "giả".

## Kỹ thuật 4 — Match cut theo chuyển động

Không phải hiệu ứng — là **kỹ thuật chọn điểm cắt**. Nếu chủ thể đang di chuyển (tay vung, đầu quay, xe chạy...) ở cuối clip A theo hướng nào đó, cắt sang clip B tại đúng frame có chuyển động tương tự (cùng hướng/cùng tốc độ). Đây là kỹ thuật "mượt" mạnh nhất vì mắt người không kịp nhận ra điểm cắt. AI cần phân tích motion vector hoặc optical flow ở vài frame cuối/đầu mỗi clip để tìm điểm khớp — xem gợi ý ở `references/ffmpeg-transitions.md`.

## Kỹ thuật 5 — Speed ramp (5 kiểu đường cong tốc độ)

Không phải mọi speed ramp giống nhau — mỗi hình dạng đường cong tạo cảm giác khác nhau. Chọn đúng curve theo mục đích:

| Curve | Hình dạng | Dùng khi | EDL `curve` value |
|---|---|---|---|
| **Bullet Time** (子弹时间) | Thường → lõm chậm (0.1x) → thường | Cần "đóng băng" 1 khoảnh khắc cao trào, cảm giác điện ảnh | `bullet_time` |
| **Hero Moment** (英雄时刻) | Nhanh dần lên đỉnh → lõm chậm giữa → nhanh lên lại | Đẩy cảm xúc nhân vật ở khoảnh khắc quan trọng | `hero_moment` |
| **Flash-in** (闪进变速) | Bắt đầu nhanh → giảm dần về 1x rồi giữ nguyên | Mở đầu clip/video bằng cú hích nhanh rồi vào nhịp thường — hợp làm **chuyển cảnh vào đầu clip B** | `flash_in` |
| **Jump-cut** (跳接变速) | Zigzag nhanh–chậm lặp lại liên tục | Cảnh hành động, bắt beat nhạc, tạo nhịp "giật" chủ đích | `jump_cut` |
| **Montage** (蒙太奇) | Tăng nhanh lên đỉnh → lõm chậm sâu → tăng nhẹ lên plateau | Chuyển nhịp nhanh–chậm tự nhiên trong 1 clip, tạo cảm giác "đảo chiều" | `montage` |

Nguyên tắc chọn: nếu clip A **kết ở cao trào và cần nhấn nhá** trước khi cắt sang clip B → `bullet_time` hoặc `hero_moment`. Nếu clip B **mở đầu 1 đoạn/cả video** → `flash_in`. Nếu cả chuỗi clip đi theo nhạc năng lượng cao (action, drift, dance) → `jump_cut`. Nếu muốn cảm giác điện ảnh, chuyển nhịp mượt trong nội bộ 1 clip dài → `montage`.

Công thức `setpts` cho từng curve (FFmpeg) — xem `references/ffmpeg-transitions.md` mục 5.

## Kỹ thuật 6 — Light leak / Glitch / RGB split overlay

Overlay một lớp hiệu ứng có sẵn (video ánh sáng tràn, nhiễu glitch) đúng vào điểm cắt, blend mode "screen" hoặc "add". Chỉ hợp nội dung trẻ trung/trend, tránh dùng cho nội dung nghiêm túc hoặc thương hiệu cao cấp.

## Schema EDL cho transition (để hệ thống FFmpeg tự thực thi)

Khi AI sinh Edit Decision List, mỗi điểm nối giữa 2 clip nên có một object `transition` như sau:

```json
{
  "clip_a": "scene_01.mp4",
  "clip_b": "scene_02.mp4",
  "transition": {
    "type": "diagtl | dissolve | wipeleft | zoom_punch | whip_pan | match_cut | speed_ramp | none",
    "duration_sec": 0.5,
    "curve": "bullet_time | hero_moment | flash_in | jump_cut | montage",
    "reason": "cùng chủ thể, đổi góc quay — dùng mask chéo để giữ mượt"
  }
}
```

Trường `curve` chỉ áp dụng (và bắt buộc) khi `type = "speed_ramp"`; bỏ qua với các type khác.

`type: "none"` (hard cut) phải là giá trị hợp lệ và **là mặc định** khi không có lý do rõ ràng để dùng transition khác. Trường `reason` bắt buộc có với mọi transition khác `none`, để review/debug được quyết định của AI.

Xem `references/ffmpeg-transitions.md` để lấy danh sách đầy đủ transition `xfade` có sẵn trong FFmpeg và cách build lệnh `filter_complex` từ EDL trên.
