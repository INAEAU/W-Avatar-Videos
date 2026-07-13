#!/usr/bin/env python3
"""Build a per-frame mouth-openness timeline from Festival's per-utterance
.segs (phoneme, cumulative-end-time) dumps, concatenated in the same order
the parts were joined into the final narration.wav. The final audio is a
pitch-preserving time-stretch of the raw synthesis, so all timestamps are
scaled by (final duration / raw duration) before sampling per frame."""
import glob
import json
import os
import re
import subprocess

FPS = 30
PARTS_DIR = "scripts/festival_parts"
FINAL_AUDIO = "public/audio/narration.wav"
OUT_LIPSYNC = "src/data/lipsync.json"
OUT_META = "src/data/audioMeta.json"

# Festival's US phoneset (radio/arctic, lowercase ARPAbet-like) -> (openness, shape)
VISEME_MAP = {
    "pau": (0.02, "rest"), "h#": (0.02, "rest"),
    # bilabial closed
    "p": (0.04, "closed"), "b": (0.05, "closed"), "m": (0.05, "closed"),
    # labiodental
    "f": (0.18, "fv"), "v": (0.2, "fv"),
    # open vowels / diphthongs
    "aa": (0.95, "open"), "ae": (0.85, "open"), "ay": (0.85, "open"),
    "aw": (0.8, "open"), "ah": (0.55, "mid"),
    # mid vowels
    "eh": (0.55, "mid"), "er": (0.5, "mid"), "axr": (0.5, "mid"),
    "ey": (0.6, "mid"), "ax": (0.28, "small"), "ax-h": (0.2, "small"),
    # small/closed vowels
    "ih": (0.3, "small"), "ix": (0.28, "small"), "iy": (0.32, "small"),
    # round vowels
    "ao": (0.45, "round"), "ow": (0.4, "round"), "oy": (0.5, "round"),
    "uh": (0.32, "round"), "uw": (0.35, "round"), "ux": (0.35, "round"),
    "w": (0.3, "round"),
}
DEFAULT_CONSONANT = (0.22, "mid-consonant")


def classify(sym: str):
    sym = sym.strip().lower()
    if sym in VISEME_MAP:
        return VISEME_MAP[sym]
    base = re.sub(r"[0-9]", "", sym)
    if base in VISEME_MAP:
        return VISEME_MAP[base]
    return DEFAULT_CONSONANT


def parse_segs(path):
    """Return list of (end_time_seconds, phone) for one utterance."""
    out = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line == "#":
                continue
            parts = line.split()
            if len(parts) < 3:
                continue
            end_time = float(parts[0])
            phone = parts[2]
            out.append((end_time, phone))
    return out


def main():
    part_files = sorted(
        glob.glob(os.path.join(PARTS_DIR, "part*.segs")),
        key=lambda p: int(re.search(r"part(\d+)\.segs", p).group(1)),
    )

    raw_segments = []  # (start_s, end_s, openness, shape) in the UNSTRETCHED timeline
    offset = 0.0
    for path in part_files:
        entries = parse_segs(path)
        prev_end = 0.0
        for end_time, phone in entries:
            openness, shape = classify(phone)
            raw_segments.append((offset + prev_end, offset + end_time, openness, shape))
            prev_end = end_time
        offset += prev_end

    raw_total = offset

    final_duration = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", FINAL_AUDIO,
    ]).decode().strip())

    stretch = final_duration / raw_total
    segments = [(s * stretch, e * stretch, o, sh) for s, e, o, sh in raw_segments]

    total_frames = int(round(final_duration * FPS))

    frames = []
    seg_idx = 0
    prev_value = 0.0
    for i in range(total_frames):
        t = i / FPS
        while seg_idx + 1 < len(segments) and t >= segments[seg_idx][1]:
            seg_idx += 1
        _, _, openness, shape = segments[seg_idx]
        alpha = 0.55 if openness > prev_value else 0.35
        value = prev_value + (openness - prev_value) * alpha
        prev_value = value
        frames.append({"m": round(value, 3), "s": shape})

    os.makedirs("src/data", exist_ok=True)
    with open(OUT_LIPSYNC, "w") as f:
        json.dump(frames, f)

    with open(OUT_META, "w") as f:
        json.dump({
            "durationMs": final_duration * 1000,
            "durationFrames": total_frames,
            "fps": FPS,
        }, f, indent=2)

    print(f"Raw synth: {raw_total:.2f}s -> stretched to {final_duration:.2f}s "
          f"(x{stretch:.4f}) -> {total_frames} frames @ {FPS}fps")
    print(f"Wrote {len(frames)} lip-sync frames to {OUT_LIPSYNC}")


if __name__ == "__main__":
    main()
