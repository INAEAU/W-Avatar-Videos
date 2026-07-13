#!/usr/bin/env python3
"""Build rough caption-beat timings by distributing paragraphs of the
narration script proportionally over the measured audio duration (word
count is a reasonable proxy since the TTS speaking rate is constant)."""
import json

FPS = 30
NARRATION_PATH = "scripts/narration.txt"
META_PATH = "src/data/audioMeta.json"
OUT_PATH = "src/data/captions.json"

# Short on-screen labels for each paragraph "beat" of the script.
LABELS = [
    "Meet Wally!",
    "What's an INCIDENT?",
    "What's a REQUEST?",
    "The easy rule",
    "How they're handled",
    "How they're measured",
    "You've got it!",
]

with open(NARRATION_PATH) as f:
    paragraphs = [p.strip() for p in f.read().split("\n\n") if p.strip()]

with open(META_PATH) as f:
    meta = json.load(f)

total_ms = meta["durationMs"]
word_counts = [len(p.split()) for p in paragraphs]
total_words = sum(word_counts)

captions = []
cursor_words = 0
cursor_ms = 0.0
for label, wc in zip(LABELS, word_counts):
    start_ms = cursor_ms
    cursor_words += wc
    end_ms = total_ms * (cursor_words / total_words)
    captions.append({
        "text": label,
        "startFrame": int(round(start_ms / 1000 * FPS)),
        "endFrame": int(round(end_ms / 1000 * FPS)),
    })
    cursor_ms = end_ms

with open(OUT_PATH, "w") as f:
    json.dump(captions, f, indent=2)

for c in captions:
    print(c)
