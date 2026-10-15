# CeleVenus logo motion sting

An 8-second brand sting for the CeleVenus logomark: the calligraphy "C" plus the CELEVENUS wordmark (no "Wellness & Aesthetic Clinic" line).

**`celevenus_logo_motion_8s.mp4`**: 1920×1080, 60 fps, about -16 LUFS.

The earlier 12-second cut (16:9 and 9:16) is kept as `v1_12s_*.mp4`.

## Storyboard (120 BPM, A minor)

| Time | Picture | Sound |
| --- | --- | --- |
| 0.0 – 0.5 s | Fade up from black, gold bokeh | Soft pad, riser starts |
| 0.25 – 1.6 s | Glowing gold pens trace the calligraphy C | Whooshes, whisper-quiet arpeggio |
| 2.0 s | Swirl turns solid with a gold bloom | Shimmer chime |
| 2.2 – 3.6 s | Letters fly in from every side (L and N zoom in from the camera) and converge into the word | Each letter's whoosh travels across the stereo field, with a tick and a rising note on arrival |
| 3.5 – 4.0 s | The V drops from above | Snare roll, riser, reverse cymbal |
| 4.0 s | The V slams into place: flash, shockwave, shake | Impact and crash, one bar of groove |
| 4.15 – 6 s | Light sweep, rays, beat pulses | Groove with sparkles |
| 6.0 – 7.3 s | The logo beats like a heart, lub-dub twice, with rose ripples | Music drops out to a held chord and heartbeat thumps |
| 7.4 – 8.0 s | Fade to black | Fade out |

All music and sound effects are synthesized from scratch in `make_audio.py`, so there are no third-party licences to worry about.

## Rebuild

```bash
./build.sh            # needs node + playwright (Chromium), python3 + numpy + scipy, ffmpeg
./build.sh vertical   # also builds a 1080x1920 version
```

To preview the animation live, open `logo_motion.html` in a browser (add `?w=1080&h=1920` for the vertical layout).
Timings are at the top of the `<script>` in `logo_motion.html` and in the arrangement section of `make_audio.py`. If you change one, change the other to match.
Loudness is trimmed with `MASTER_DB` in `make_audio.py`.
