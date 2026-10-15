#!/usr/bin/env bash
# Rebuild the 8s logo video: synthesize audio, render frames, mux.
# Pass "vertical" to also build a 1080x1920 version.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
TMP="$(mktemp -d)"

python3 make_audio.py "$TMP/soundtrack.wav"
node render.js video 1920 1080 60 "$TMP/v.mp4"
ffmpeg -y -loglevel error -i "$TMP/v.mp4" -i "$TMP/soundtrack.wav" \
  -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart celevenus_logo_motion_8s.mp4

if [[ "${1:-}" == "vertical" ]]; then
  node render.js video 1080 1920 60 "$TMP/vv.mp4"
  ffmpeg -y -loglevel error -i "$TMP/vv.mp4" -i "$TMP/soundtrack.wav" \
    -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart celevenus_logo_motion_8s_9x16.mp4
fi
rm -rf "$TMP"
echo "done"
