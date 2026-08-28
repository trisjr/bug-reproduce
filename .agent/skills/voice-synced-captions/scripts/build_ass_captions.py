#!/usr/bin/env python3
"""
build_ass_captions.py — Build an .ass subtitle file with animated,
voice-synced caption styles from word-level timestamps.

Usage:
    python3 build_ass_captions.py words.json output.ass --style pop
    python3 build_ass_captions.py words.json output.ass --style karaoke \
        --video-width 1080 --video-height 1920 --max-words-per-line 4

Input JSON format (word-level timestamps, e.g. from Whisper word_timestamps=True):
    [
      {"word": "Hom", "start": 0.12, "end": 0.34},
      {"word": "nay", "start": 0.34, "end": 0.58},
      ...
    ]

Styles: karaoke | pop | highlight | typewriter | slide
See references/ass-tag-guide.md in this skill for the tag syntax behind each style,
and for two advanced styles (emphasis shake, speaker color) not yet automated here.
"""

import argparse
import json
import sys


def fmt_time(seconds: float) -> str:
    """Format seconds as ASS timestamp H:MM:SS.CC (centiseconds)."""
    if seconds < 0:
        seconds = 0
    total_centi = round(seconds * 100)
    h = total_centi // 360000
    rem = total_centi % 360000
    m = rem // 6000
    rem = rem % 6000
    s = rem // 100
    cs = rem % 100
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def group_words(words, max_words_per_line=4):
    """Greedy grouping of consecutive words into display chunks."""
    chunks = []
    current = []
    for w in words:
        current.append(w)
        ends_sentence = w["word"].strip().endswith((".", "!", "?", ",", "…"))
        if len(current) >= max_words_per_line or ends_sentence:
            chunks.append(current)
            current = []
    if current:
        chunks.append(current)
    return chunks


HEADER_TEMPLATE = """[Script Info]
ScriptType: v4.00+
PlayResX: {width}
PlayResY: {height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font},{fontsize},{primary},{accent},&H00000000&,&H00000000&,-1,0,0,0,100,100,0,0,1,{outline},0,{alignment},60,60,{marginv},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def build_karaoke(chunks, accent_hex):
    lines = []
    for chunk in chunks:
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        parts = []
        prev_end = start
        for w in chunk:
            gap_cs = max(0, round((w["start"] - prev_end) * 100))
            if gap_cs > 0:
                parts.append(f"{{\\kf{gap_cs}}}")
            dur_cs = max(1, round((w["end"] - w["start"]) * 100))
            parts.append(f"{{\\kf{dur_cs}}}{w['word']} ")
            prev_end = w["end"]
        text = "".join(parts).strip()
        lines.append(
            f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{text}"
        )
    return lines


def build_pop(chunks, accent_hex):
    lines = []
    for chunk in chunks:
        for w in chunk:
            start, end = w["start"], w["end"]
            word = w["word"].upper()
            tags = (
                "{\\fscx100\\fscy100"
                "\\t(0,80,\\fscx130\\fscy130)"
                "\\t(80,160,\\fscx100\\fscy100)}"
            )
            lines.append(
                f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{tags}{word}"
            )
    return lines


def build_highlight(chunks, accent_hex):
    lines = []
    for chunk in chunks:
        words_text = [w["word"] for w in chunk]
        for i, w in enumerate(chunk):
            start, end = w["start"], w["end"]
            display = []
            for j, wt in enumerate(words_text):
                if j == i:
                    display.append(f"{{\\c{accent_hex}}}{wt}{{\\c&HFFFFFF&}}")
                else:
                    display.append(wt)
            text = " ".join(display)
            lines.append(
                f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{text}"
            )
    return lines


def build_typewriter(chunks, accent_hex):
    lines = []
    for chunk in chunks:
        for i, w in enumerate(chunk):
            start = w["start"]
            end = chunk[i + 1]["start"] if i + 1 < len(chunk) else chunk[-1]["end"]
            text = " ".join(x["word"] for x in chunk[: i + 1])
            lines.append(
                f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{text}"
            )
    return lines


def build_slide(chunks, accent_hex, width, height):
    lines = []
    cy = int(height * 0.82)
    for chunk in chunks:
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        text = " ".join(w["word"] for w in chunk)
        cx = width // 2
        tags = f"{{\\fad(200,200)\\move({cx},{cy + 40},{cx},{cy},0,200)}}"
        lines.append(
            f"Dialogue: 0,{fmt_time(start)},{fmt_time(end)},Default,,0,0,0,,{tags}{text}"
        )
    return lines


STYLE_BUILDERS = {
    "karaoke": build_karaoke,
    "pop": build_pop,
    "highlight": build_highlight,
    "typewriter": build_typewriter,
    "slide": None,  # handled separately (needs width/height)
}


def main():
    ap = argparse.ArgumentParser(description="Build .ass captions from word timestamps")
    ap.add_argument("words_json", help="Path to JSON file with word-level timestamps")
    ap.add_argument("output_ass", help="Path to write the .ass file")
    ap.add_argument(
        "--style",
        required=True,
        choices=["karaoke", "pop", "highlight", "typewriter", "slide"],
    )
    ap.add_argument("--video-width", type=int, default=1080)
    ap.add_argument("--video-height", type=int, default=1920)
    ap.add_argument("--max-words-per-line", type=int, default=4)
    ap.add_argument("--font", default="Montserrat Bold")
    ap.add_argument("--fontsize", type=int, default=90)
    ap.add_argument("--primary-color", default="&HFFFFFF&", help="ASS &HBBGGRR& format")
    ap.add_argument("--accent-color", default="&H00D7FF&", help="ASS &HBBGGRR& format")
    ap.add_argument("--outline", type=int, default=4)
    ap.add_argument("--alignment", type=int, default=5, help="ASS numpad alignment, 5=center-middle, 2=bottom-center")
    ap.add_argument("--marginv", type=int, default=300)
    args = ap.parse_args()

    with open(args.words_json, "r", encoding="utf-8") as f:
        words = json.load(f)

    if not words:
        print("No words in input JSON.", file=sys.stderr)
        sys.exit(1)

    chunks = group_words(words, args.max_words_per_line)

    if args.style == "slide":
        lines = build_slide(chunks, args.accent_color, args.video_width, args.video_height)
    else:
        builder = STYLE_BUILDERS[args.style]
        lines = builder(chunks, args.accent_color)

    header = HEADER_TEMPLATE.format(
        width=args.video_width,
        height=args.video_height,
        font=args.font,
        fontsize=args.fontsize,
        primary=args.primary_color,
        accent=args.accent_color,
        outline=args.outline,
        alignment=args.alignment,
        marginv=args.marginv,
    )

    with open(args.output_ass, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(lines))
        f.write("\n")

    print(f"Wrote {len(lines)} caption events ({args.style} style) to {args.output_ass}")


if __name__ == "__main__":
    main()
