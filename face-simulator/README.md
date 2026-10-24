# Aesthetic Consult Simulator (prototype)

A browser tool for consultations: upload a client photo, then toggle simulated
treatments with strength sliders:

- Nose tip lift, nose bridge
- Nasolabial folds
- Thread lift (jowls, mid-face)
- Fine lines
- Eye bags

Includes a before/after split view, a morph animation, and export of a
before/after JPG and a morph video. All processing runs on the device; the
photo is never uploaded.

## How it works

- Face points come from MediaPipe Face Landmarker (478 points), loaded from
  `@mediapipe/tasks-vision@0.10.14`.
- Treatments are smooth local warps (nose, lift) plus masked skin smoothing
  and shadow fill (folds, eye bags, fine lines) in a WebGL shader.
- If no face is found (e.g. a full side profile), points can be placed by hand.

## Engine files (not committed, ~14 MB)

`index.html` expects these next to it:

- `vision_wasm_internal.wasm` from `@mediapipe/tasks-vision@0.10.14/wasm/`
- `face_landmarker.txt`, a base64 copy of
  `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`
  (`base64 -w0 face_landmarker.task > face_landmarker.txt`)

Simulations are illustrative only and not a guarantee of results.
