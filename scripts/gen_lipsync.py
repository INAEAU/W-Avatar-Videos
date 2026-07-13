#!/usr/bin/env python3
"""Parse an espeak-ng --pho phoneme/duration dump into a per-frame mouth
openness timeline for the mascot's lip-sync animation, and compute rough
caption beat timings proportional to word position in the script."""
import json
import re
import sys

FPS = 30
PHO_PATH = "scripts/narration.pho"
OUT_LIPSYNC = "src/data/lipsync.json"
OUT_META = "src/data/audioMeta.json"

# Viseme categories -> mouth openness (0 closed .. 1 wide open) and shape id
VISEME_MAP = {
    # pause / silence
    "_": (0.02, "rest"),
    # bilabial closed
    "p": (0.04, "closed"), "b": (0.05, "closed"), "m": (0.05, "closed"),
    # labiodental
    "f": (0.18, "fv"), "v": (0.2, "fv"),
    # wide open vowels
    "A": (0.95, "open"), "a": (0.9, "open"), "AI": (0.85, "open"),
    "aI": (0.85, "open"), "AU": (0.8, "open"), "aU": (0.8, "open"),
    "{": (0.75, "open"), "aE": (0.75, "open"),
    # mid vowels
    "E": (0.55, "mid"), "e": (0.55, "mid"), "V": (0.5, "mid"),
    "3": (0.5, "mid"), "3r": (0.5, "mid"), "EI": (0.6, "mid"),
    # small/closed vowels
    "I": (0.3, "small"), "i": (0.3, "small"), "@": (0.28, "small"),
    "@U": (0.35, "round"), "oU": (0.35, "round"),
    # round vowels
    "O": (0.45, "round"), "o": (0.4, "round"), "U": (0.35, "round"),
    "u": (0.35, "round"), "Or": (0.45, "round"),
}
DEFAULT_CONSONANT = (0.22, "mid-consonant")


def classify(sym: str):
    sym = sym.strip()
    if sym in VISEME_MAP:
        return VISEME_MAP[sym]
    # strip trailing length/rhotic markers like r= or : that mbrola symbols use
    base = re.sub(r"[:=]", "", sym)
    if base in VISEME_MAP:
        return VISEME_MAP[base]
    return DEFAULT_CONSONANT


def parse_pho(path):
    segments = []  # (start_ms, end_ms, openness, shape)
    cursor = 0.0
    with open(path) as f:
        for raw in f:
            line = raw.rstrip("\n")
            if not line.strip():
                continue
            parts = line.split("\t")
            if len(parts) < 2:
                continue
            sym = parts[0].strip()
            try:
                dur = float(parts[1].strip())
            except ValueError:
                continue
            openness, shape = classify(sym)
            segments.append((cursor, cursor + dur, openness, shape))
            cursor += dur
    return segments, cursor


def main():
    segments, total_ms = parse_pho(PHO_PATH)
    total_frames = int(round(total_ms / 1000 * FPS))

    frames = []
    seg_idx = 0
    prev_value = 0.0
    for i in range(total_frames):
        t_ms = i / FPS * 1000
        while seg_idx + 1 < len(segments) and t_ms >= segments[seg_idx][1]:
            seg_idx += 1
        start, end, openness, shape = segments[seg_idx]
        # smooth toward target for natural inertia (attack faster than release)
        alpha = 0.55 if openness > prev_value else 0.35
        value = prev_value + (openness - prev_value) * alpha
        prev_value = value
        frames.append({"m": round(value, 3), "s": shape})

    import os
    os.makedirs("src/data", exist_ok=True)
    with open(OUT_LIPSYNC, "w") as f:
        json.dump(frames, f)

    with open(OUT_META, "w") as f:
        json.dump({
            "durationMs": total_ms,
            "durationFrames": total_frames,
            "fps": FPS,
        }, f, indent=2)

    print(f"Total duration: {total_ms/1000:.2f}s -> {total_frames} frames @ {FPS}fps")
    print(f"Wrote {len(frames)} lip-sync frames to {OUT_LIPSYNC}")


if __name__ == "__main__":
    main()
