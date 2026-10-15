# CeleVenus logo motion sting

A 12-second brand sting for the CeleVenus logomark: the calligraphy "C" plus the CELEVENUS wordmark (no "Wellness & Aesthetic Clinic" line).

| File | Use |
| --- | --- |
| `celevenus_logo_motion_16x9.mp4` | 1920×1080, 60 fps: YouTube, website, clinic TV screens |
| `celevenus_logo_motion_9x16.mp4` | 1080×1920, 60 fps: Instagram Reels, TikTok, Stories |

## Storyboard (120 BPM, A minor)

| Time | Picture | Sound |
| --- | --- | --- |
| 0.0 – 0.9 s | Fade up from black, drifting gold bokeh | Pad swells, riser starts |
| 0.6 – 2.5 s | Glowing gold pens trace the calligraphy C | Whooshes, soft arpeggio |
| 3.0 s | Swirl turns solid with a gold bloom | Shimmer chime |
| 3.75 – 5.5 s | C·E·L·E·_·E·N·U·S drop in one per 8th note and bounce into place | A thud and a rising note on each landing, snare roll, riser |
| 6.0 s | The V slams into the gap: flash, shockwave, camera shake | Impact and crash, then the full beat comes in |
| 6.25 – 7.2 s | Light sweep across the logo, light rays | Sparkle glissando |
| 6 – 10 s | Logo pulses on the beat, glints | Four-on-the-floor groove |
| 10.0 s | Final shine and glint | Final Am chord hit, reverb tail |
| 11.35 – 12 s | Fade to black | Fade out |

All music and sound effects are synthesized from scratch in `make_audio.py`, so there are no third-party licences to worry about.

## Rebuild

```bash
./build.sh            # needs node + playwright (Chromium), python3 + numpy + scipy, ffmpeg
```

To preview the animation live, open `logo_motion.html` in a browser (add `?w=1080&h=1920` for the vertical layout).
Timings live at the top of the `<script>` in `logo_motion.html` and in the arrangement section of `make_audio.py`. If you change one, change the other to match.
