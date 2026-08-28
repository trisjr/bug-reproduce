# Cú pháp `.ass` cho từng style caption

Định dạng màu trong `.ass` là `&HBBGGRR&` (đảo ngược RGB, không phải `&HRRGGBB&`). Ví dụ trắng = `&HFFFFFF&`, vàng = `&H00D7FF&` (BGR của FFD700), đỏ = `&H0000FF&`.

## Cấu trúc file `.ass` tối thiểu

```
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Montserrat Bold,90,&HFFFFFF&,&H00D7FF&,&H000000&,&H00000000&,-1,0,1,4,0,5,60,60,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.12,0:00:00.58,Default,,0,0,0,,{...tags...}Text here
```

`Alignment: 5` = giữa màn hình (numpad layout: 5 = center-middle). Dùng `2` nếu muốn caption ở dưới thay vì giữa.

## Style 1 — Karaoke fill (`\kf`)

Dùng tag `\kf<centiseconds>` trước mỗi từ trong CÙNG MỘT dòng thoại — libass sẽ tự động "quét" màu từ `PrimaryColour` sang `SecondaryColour` đúng theo thời lượng:

```
Dialogue: 0,0:00:00.00,0:00:01.20,Default,,0,0,0,,{\kf12}Hôm {\kf24}nay {\kf23}mình {\kf35}review
```

Số sau `\kf` là **centiseconds** (1/100 giây) — ví dụ từ dài 0.24s → `\kf24`. Toàn bộ cụm từ nằm trong 1 Dialogue event duy nhất (không tách event theo từ).

## Style 2 — Pop/bounce từng từ (`\t` transform + `\fscx`/`\fscy`)

Mỗi từ là **1 Dialogue event riêng**, chỉ hiện đúng trong khoảng thời gian của từ đó. Dùng `\t(t1,t2,tags)` để animate scale từ 100% → 130% → 100% ngay khi từ xuất hiện. Thời gian trong `\t` là **mili-giây tính từ Start của chính Dialogue event đó**, không phải thời gian tuyệt đối:

```
Dialogue: 0,0:00:00.12,0:00:00.34,Default,,0,0,0,,{\fscx100\fscy100\t(0,80,\fscx130\fscy130)\t(80,160,\fscx100\fscy100)}nay
```

Để câu không "biến mất" hoàn toàn khi 1 từ đang active (chỉ 1 từ hiện tại 1 thời điểm là hợp lý cho pop style — style này CHỦ ĐÍCH chỉ hiện từng từ một, không hiện cả câu).

## Style 3 — Highlight từ khóa (cả câu hiện, 1 từ đổi màu)

Với mỗi từ trong câu, tạo 1 Dialogue event có **Start/End = thời gian của từ đó**, nhưng **Text = TOÀN BỘ câu**, chỉ bọc riêng từ đang active bằng `{\c&H00D7FF&}...{\c&HFFFFFF&}`:

```
Dialogue: 0,0:00:00.58,0:00:00.81,Default,,0,0,0,,Hôm nay {\c&H00D7FF&}mình{\c&HFFFFFF&} review sản phẩm
```

Lặp lại 1 event/từ, đổi vị trí bọc màu theo đúng từ đang active ở mỗi event. Kết quả: câu luôn hiện đủ, màu "chạy" qua từng từ theo giọng nói.

## Style 4 — Typewriter (hiện dần từng từ, không mất chữ cũ)

Mỗi event Text = câu tính đến từ hiện tại (cộng dồn), Start = lúc từ đó bắt đầu, End = lúc từ **cuối cùng** của cụm kết thúc (event sau đè lên event trước bằng cách có Start nối tiếp):

```
Dialogue: 0,0:00:00.12,0:00:00.34,Default,,0,0,0,,Hôm
Dialogue: 0,0:00:00.34,0:00:00.58,Default,,0,0,0,,Hôm nay
Dialogue: 0,0:00:00.58,0:00:00.81,Default,,0,0,0,,Hôm nay mình
```

## Style 5 — Slide/fade theo dòng (`\fad` + `\move`)

Không animate theo từ — cả dòng fade in/out hoặc trượt lên khi xuất hiện, dùng cho nội dung nghiêm túc:

```
Dialogue: 0,0:00:03.00,0:00:05.50,Default,,0,0,0,,{\fad(200,200)\move(540,1750,540,1650,0,200)}Nội dung nghiêm túc ở đây
```

`\fad(200,200)` = fade in/out 200ms. `\move(x1,y1,x2,y2,t1,t2)` = trượt từ (x1,y1) đến (x2,y2) trong khoảng t1→t2 ms kể từ Start.

---

## Mở rộng nâng cao (chưa có sẵn trong `scripts/build_ass_captions.py`, cần tự thêm)

### Shake/scale mạnh khi giọng nhấn (emphasis)

Cần bước phân tích âm thanh trước: cắt audio theo timestamp từng từ, tính RMS (root-mean-square) độ lớn âm lượng mỗi đoạn (`librosa.feature.rms` hoặc đơn giản hơn là `numpy` trên waveform cắt bằng `pydub`), so với RMS trung bình cả câu. Từ nào lớn hơn ngưỡng (ví dụ > 1.4× trung bình) → gắn `emphasis: true` trong JSON, rồi ở style pop/bounce dùng scale animate mạnh hơn (`\fscx150\fscy150` thay vì `130`) và thêm rung nhẹ vị trí bằng nhiều `\t` xen kẽ `\frz` (xoay ±3 độ qua lại 2-3 lần trong khoảng 150ms).

### Đổi màu theo người nói (speaker color)

Cần diarization (phân tách người nói) trước — có thể lấy từ service ASR hỗ trợ diarization (ví dụ AssemblyAI, hoặc pyannote.audio nếu tự host). Mỗi từ trong JSON input thêm field `"speaker": "A"` hoặc `"B"`. Khi build `.ass`, định nghĩa 2 Style riêng (`Speaker_A`, `Speaker_B`) với `PrimaryColour` khác nhau trong `[V4+ Styles]`, rồi chọn Style tương ứng theo field `speaker` khi tạo mỗi Dialogue event, thay vì luôn dùng `Default`.

## Font gợi ý cho short-form

Cần font **Bold/Black weight**, rõ ở kích thước nhỏ trên mobile: Montserrat Bold/Black, Inter Black, Archivo Black, Roboto Black, hoặc font hệ thống tương đương có sẵn trên máy render. Với tiếng Việt có dấu, kiểm tra font có hỗ trợ đủ dấu tiếng Việt (Unicode Vietnamese) trước khi dùng — không phải font Black/Bold nào cũng có bộ dấu đầy đủ.
