# FFmpeg — Cách dựng từng loại chuyển cảnh

Dùng file này khi cần build lệnh `ffmpeg` thật từ một entry trong EDL (xem schema trong SKILL.md).

## 1. `xfade` filter — nền tảng cho hầu hết transition

FFmpeg (>= 4.3) có filter `xfade` dựng sẵn hàng chục kiểu chuyển cảnh giữa 2 input video cùng độ phân giải/fps. Cú pháp cơ bản:

```bash
ffmpeg -i clip_a.mp4 -i clip_b.mp4 -filter_complex \
"[0:v][1:v]xfade=transition=TYPE:duration=D:offset=O[v]" \
-map "[v]" -map 0:a -c:v libx264 -crf 18 output.mp4
```

- `TYPE`: tên transition (bảng bên dưới)
- `duration=D`: thời lượng transition tính bằng giây (ví dụ 0.5)
- `offset=O`: thời điểm bắt đầu transition trong clip_a, tính bằng giây (thường = độ dài clip_a − D)

### Bảng map "kỹ thuật trong SKILL.md" → `type` của xfade

| Kỹ thuật (SKILL.md) | xfade type gợi ý |
|---|---|
| Mask wipe chéo (kỹ thuật 1, từ video CapCut) | `diagtl`, `diagtr`, `diagbl`, `diagbr` (chọn theo hướng kéo mask) |
| Crossfade / Dissolve (kỹ thuật 2) | `fade` (chuẩn) hoặc `dissolve` (dạng hạt/noise) |
| Wipe ngang/dọc đơn giản | `wipeleft`, `wiperight`, `wipeup`, `wipedown` |
| Wipe mượt hơn (blur biên) | `smoothleft`, `smoothright`, `smoothup`, `smoothdown` |
| Mở/đóng theo hình tròn hoặc chữ nhật | `circleopen`, `circleclose`, `rectcrop` |
| Trượt cảnh (slide) | `slideleft`, `slideright`, `slideup`, `slidedown` |
| Zoom punch (kỹ thuật 3) | `zoomin` (built-in) — nếu cần zoom mạnh hơn, tự dựng bằng `scale`+`crop` theo easing (xem mục 3) |
| Pixelize / mosaic (hiệu ứng trend) | `pixelize` |
| Fade qua màu đen/trắng | `fadeblack`, `fadewhite` |
| Nhiễu hạt kiểu phim cũ | `dissolve`, `hblur` |

Danh sách đầy đủ ~50 type: chạy `ffmpeg -h filter=xfade` để xem bản mới nhất trên máy đang dùng — danh sách có thể khác nhau theo phiên bản FFmpeg.

### Ví dụ cụ thể — đúng hiệu ứng trong video demo (mask chéo)

```bash
ffmpeg -i scene_01.mp4 -i scene_02.mp4 -filter_complex \
"[0:v][1:v]xfade=transition=diagtl:duration=0.6:offset=4.4[v]; \
 [0:a][1:a]acrossfade=d=0.6[a]" \
-map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac output.mp4
```

(`offset=4.4` giả sử scene_01 dài 5s và transition dài 0.6s → offset = 5 − 0.6 = 4.4)

## 2. Nối nhiều clip có transition (EDL nhiều đoạn)

Với N clip, chain nhiều `xfade` liên tiếp, mỗi cặp dùng offset tính lũy kế theo độ dài các clip trước:

```bash
ffmpeg -i c1.mp4 -i c2.mp4 -i c3.mp4 -filter_complex \
"[0:v][1:v]xfade=transition=fade:duration=0.4:offset=3.6[v01]; \
 [v01][2:v]xfade=transition=diagtl:duration=0.5:offset=7.1[v]" \
-map "[v]" -c:v libx264 -crf 18 output.mp4
```

Logic build offset trong code: `offset_i = sum(duration của các clip trước đó đã trừ phần overlap) - transition_duration_i`.

## 3. Zoom punch tự dựng (khi cần mạnh hơn `zoomin` mặc định)

```bash
ffmpeg -i clip.mp4 -vf \
"zoompan=z='min(zoom+0.04,1.5)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'" \
output.mp4
```

Áp filter này chỉ vào 4–6 frame cuối clip A và đầu clip B rồi ghép lại (dùng `trim` + `concat`), thay vì cả clip.

## 4. Whip pan giả lập (motion blur ngang tại điểm cắt)

```bash
ffmpeg -i clip.mp4 -vf "tblend=all_mode=average,framestep=2" output.mp4
```

Áp trong khoảng 0.1–0.15s ngay trước/sau điểm cắt để tạo vệt mờ ngang giả lập máy quay lia nhanh.

## 5. Speed ramp — 5 kiểu đường cong (segment-based, khớp cách CapCut/Jianying dựng curve)

FFmpeg không có filter "vẽ đường cong tốc độ" trực tiếp như app điện thoại. Cách thực tế và đáng tin cậy nhất: **chia clip thành nhiều đoạn (segment) theo đúng các điểm neo (keyframe) của đường cong**, mỗi đoạn dùng `setpts=PTS/factor` với factor không đổi (factor > 1 = nhanh hơn, factor < 1 = chậm hơn), rồi `concat` lại. Nhiều đoạn nhỏ + factor mượt giữa các đoạn liền kề sẽ xấp xỉ đúng hình dạng đường cong gốc.

Với đoạn có factor < 1 (làm chậm), **luôn thêm `minterpolate`** để bù khung hình (tương đương "智能补帧 — Smart Frame Interpolation" trong app gốc), nếu không cảnh chậm sẽ bị giật/lag vì không đủ frame gốc:

```bash
# slow segment: bù khung hình mượt trước khi setpts
ffmpeg -i seg.mp4 -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc,setpts=2.5*PTS" seg_slow.mp4
```

### Khung lệnh chung (N đoạn → concat)

```bash
# 1) cắt từng đoạn theo mốc thời gian của curve
ffmpeg -i clip.mp4 -ss 0.0 -to 1.2 -c copy seg1.mp4
ffmpeg -i clip.mp4 -ss 1.2 -to 2.0 -c copy seg2.mp4
ffmpeg -i clip.mp4 -ss 2.0 -to 3.4 -c copy seg3.mp4

# 2) áp speed factor riêng từng đoạn (setpts = PTS / factor)
ffmpeg -i seg1.mp4 -vf "setpts=PTS/1.0" s1.mp4      # 1x
ffmpeg -i seg2.mp4 -vf "minterpolate=fps=60,setpts=PTS/0.2" s2.mp4   # 0.2x (chậm)
ffmpeg -i seg3.mp4 -vf "setpts=PTS/1.0" s3.mp4      # về 1x

# 3) ghép lại
ffmpeg -i s1.mp4 -i s2.mp4 -i s3.mp4 -filter_complex \
"[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]" -map "[v]" output.mp4
```

Code build EDL→FFmpeg nên generate segment list tự động từ mảng control points `[{t, speed_factor}]` của mỗi curve thay vì viết tay từng lệnh.

### Control points gợi ý cho từng curve (% thời lượng clip, speed factor)

| Curve | Control points (thời điểm % → speed factor) |
|---|---|
| **bullet_time** | 0%→1x, 35%→1x, 45%→**0.15x**, 55%→**0.15x**, 65%→1x, 100%→1x |
| **hero_moment** | 0%→1x, 20%→**2x**, 35%→**2x**, 50%→**0.2x**, 65%→**2x**, 80%→**2x**, 100%→1x |
| **flash_in** | 0%→**4x**, 15%→**4x**, 40%→1x (ease), 100%→1x |
| **jump_cut** | Lặp lại chu kỳ ~12–15% thời lượng: `1x → 0.3x → 1x → 0.3x → ...` liên tục hết clip (biên độ đều nhau, không ease dài) |
| **montage** | 0%→1x, 10%→1x, 30%→**3x**, 45%→**0.15x**, 55%→**0.15x**, 70%→**1.5x**, 100%→**1.5x** |

`speed_factor` áp trực tiếp vào `setpts=PTS/factor`. Đoạn nào factor < 0.5 (chậm nhiều) **bắt buộc** đi kèm `minterpolate` để không bị giật. Đoạn factor > 2 (nhanh nhiều) không cần minterpolate nhưng nên thêm nhẹ `tblend=all_mode=average` ở 2–3 frame biên đoạn để chuyển tốc độ không bị "khựng" đột ngột giữa 2 đoạn liền kề.

Ý tưởng: giữ tốc độ bình thường đến giây thứ 2, sau đó tăng dần hệ số `setpts` (làm chậm video) đến hết clip. Điều chỉnh hệ số `0.5` để ramp nhanh/chậm hơn.

## 6. Match cut theo chuyển động — gợi ý pipeline cho AI

FFmpeg không tự tìm "điểm khớp chuyển động" — bước này cần làm ở lớp phân tích trước khi tạo EDL:

1. Lấy vài frame cuối clip A và vài frame đầu clip B (`ffmpeg -ss ... -t ... -vf fps=10`).
2. Tính optical flow đơn giản giữa các frame liên tiếp (hướng + tốc độ chuyển động chủ thể) — dùng OpenCV `calcOpticalFlowFarneback` hoặc model motion nhẹ.
3. So khớp hướng/tốc độ chuyển động ở cuối A với đầu B. Nếu lệch dưới ngưỡng (ví dụ góc lệch < 20°, tốc độ lệch < 30%) → coi là match cut hợp lệ, `transition.type = "match_cut"`, `duration_sec = 0` (hard cut đúng frame, không hiệu ứng).
4. Nếu không tìm được điểm khớp trong khoảng cho phép (ví dụ ±0.5s quanh điểm cắt dự kiến) → fallback về `dissolve` hoặc `none`.

## 7. Light leak / Glitch overlay

Cần asset overlay có sẵn (video ánh sáng tràn/nhiễu, nền đen, blend "screen" hoặc "add"):

```bash
ffmpeg -i base.mp4 -i light_leak.mp4 -filter_complex \
"[1:v]scale=1080:1920,format=rgba,colorchannelmixer=aa=0.6[leak]; \
 [0:v][leak]overlay=shortest=1:enable='between(t,4.2,4.8)'[v]" \
-map "[v]" -map 0:a output.mp4
```

Asset `light_leak.mp4`/glitch cần chuẩn bị sẵn trong thư viện overlay (tương tự cách hệ thống đã có lưu asset AI-generated trên cloud storage).
