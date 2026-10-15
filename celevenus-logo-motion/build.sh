#!/usr/bin/env bash
# Rebuild both logo videos: render frames, synthesize audio, mux.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
TMP="$(mktemp -d)"

python3 make_audio.py "$TMP/soundtrack.wav"
node render.js video 1920 1080 60 "$TMP/v169.mp4"
node render.js video 1080 1920 60 "$TMP/v916.mp4"

for v in 169:16x9 916:9x16; do
  ffmpeg -y -loglevel error -i "$TMP/v${v%%:*}.mp4" -i "$TMP/soundtrack.wav" \
    -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "celevenus_logo_motion_${v##*:}.mp4"
done
rm -rf "$TMP"
echo "done"
