"""Synthesises the background music and sound effects for the Halloween invite.

Everything is generated from scratch with numpy, so there are no licensing
worries when the clinic shares the video. Run: python3 scripts/make_audio.py
"""
import os
import wave

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "audio")
rng = np.random.default_rng(31)


def save(name, x, peak=0.89):
    x = np.asarray(x, dtype=np.float64)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    m = np.max(np.abs(x))
    if m > 0:
        x = x / m * peak
    data = (x * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    """One-pole low-pass (vectorised via FFT filtering for speed)."""
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X = np.fft.rfft(x)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n)


def bandpass(x, lo, hi):
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X = np.fft.rfft(x)
    X *= 1 / np.sqrt(1 + (f / hi) ** 4) * (1 - 1 / np.sqrt(1 + (f / lo) ** 4))
    return np.fft.irfft(X, n)


def highpass(x, cutoff):
    n = len(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    X = np.fft.rfft(x, axis=0)
    g = 1 - 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * (g[:, None] if X.ndim == 2 else g), n, axis=0)


def reverb(x, seconds=1.8, wet=0.25, predelay=0.02):
    n_ir = int(seconds * SR)
    t = np.arange(n_ir) / SR
    irs = []
    for _ in range(2):
        ir = rng.standard_normal(n_ir) * np.exp(-t * 6.9 / seconds)
        ir = lowpass(ir, 5000)
        ir[: int(predelay * SR)] = 0
        irs.append(ir / np.sqrt(np.sum(ir**2)))
    mono = x if x.ndim == 1 else x.mean(axis=1)
    size = 1 << int(np.ceil(np.log2(len(mono) + n_ir)))
    M = np.fft.rfft(mono, size)
    out = []
    for ir in irs:
        y = np.fft.irfft(M * np.fft.rfft(ir, size), size)[: len(mono)]
        out.append(y)
    wet_sig = np.stack(out, axis=1) * 0.35
    dry = x if x.ndim == 2 else np.stack([x, x], axis=1)
    return dry * (1 - wet) + wet_sig * wet * 2.2


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-t / decay_tau)


# ----------------------------------------------------------------- instruments

def music_box(freq, dur=1.6, vel=1.0):
    t = t_axis(dur)
    partials = [(1, 1.0, 0.9), (2.0, 0.25, 0.5), (3.01, 0.18, 0.35), (5.4, 0.07, 0.18)]
    x = sum(a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d) for r, a, d in partials)
    x *= np.clip(t / 0.002, 0, 1)
    return x * vel


def pluck(freq, dur=0.6, vel=1.0, bright=0.5):
    """Vectorised Karplus-Strong pizzicato."""
    n = int(dur * SR)
    N = int(SR / freq)
    buf = lowpass(rng.uniform(-1, 1, N * 4), 400 + 3000 * bright)[:N]
    out = np.zeros(n + N)
    out[:N] = buf
    i = N
    while i < n:
        seg = out[i - N : i]
        nxt = 0.5 * (seg + np.roll(seg, 1)) * 0.995
        L = min(N, n - i)
        out[i : i + L] = nxt[:L]
        i += N
    x = out[:n] * np.exp(-np.arange(n) / SR / (dur * 0.35))
    # add a little sine body so it works on phone speakers
    t = t_axis(dur)
    x += 0.6 * np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.18)
    return x * vel


def pad(freqs, dur, vel=1.0):
    t = t_axis(dur)
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            x += np.sin(2 * np.pi * ff * t) + 0.3 * np.sin(2 * np.pi * 2 * ff * t)
    trem = 1 + 0.15 * np.sin(2 * np.pi * 4.5 * t)
    e = np.clip(t / 0.35, 0, 1) * np.clip((dur - t) / 0.4, 0, 1)
    return x * trem * e * vel / (len(freqs) * 3)


def theremin(notes, total_dur):
    """notes: list of (start, dur, midi). Continuous gliding sine with vibrato."""
    t = t_axis(total_dur)
    f = np.zeros_like(t)
    amp = np.zeros_like(t)
    for s, d, m in notes:
        i0, i1 = int(s * SR), int((s + d) * SR)
        f[i0:i1] = mtof(m)
        amp[i0:i1] = 1
    # glide between notes
    last = f[np.argmax(f > 0)] if np.any(f > 0) else 440
    k = 1 - np.exp(-1 / (0.06 * SR))
    for i in range(len(f)):
        target = f[i] if f[i] > 0 else last
        last = last + (target - last) * k
        f[i] = last
    vib = 1 + 0.012 * np.sin(2 * np.pi * 5.6 * t) * np.clip(t / 2, 0, 1)
    phase = 2 * np.pi * np.cumsum(f * vib) / SR
    amp = lowpass(amp, 6)
    x = (np.sin(phase) + 0.12 * np.sin(2 * phase) + 0.05 * np.sin(3 * phase)) * np.clip(amp, 0, 1)
    return x


def kick():
    t = t_axis(0.35)
    f = 50 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)


def snap():
    n = int(0.12 * SR)
    x = bandpass(rng.standard_normal(n), 1500, 4500)
    return x * env_ad(n, 0.001, 0.025)


def shaker():
    n = int(0.08 * SR)
    x = bandpass(rng.standard_normal(n), 5000, 12000)
    return x * env_ad(n, 0.006, 0.02)


def woodblock():
    t = t_axis(0.15)
    return (np.sin(2 * np.pi * 900 * t) + 0.5 * np.sin(2 * np.pi * 1450 * t)) * np.exp(-t / 0.03)


# ----------------------------------------------------------------- music score
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
TOTAL = 60.0


def swing(beat):
    frac = beat % 1
    return beat - frac + (0.64 if abs(frac - 0.5) < 1e-6 else frac)


CHORDS = {
    "Dm": ([62, 65, 69], 50, 57),
    "Bb": ([58, 62, 65], 46, 53),
    "A7": ([57, 61, 64, 67], 45, 52),
    "Gm": ([55, 58, 62], 43, 50),
    "C": ([55, 60, 64], 48, 55),
    "F": ([57, 60, 65], 41, 48),
}

MELODY_A = [
    [(0, .5, 74), (.5, .5, 77), (1, .5, 81), (1.5, .5, 80), (2, 1, 81), (3, .5, 77), (3.5, .5, 74)],
    [(0, .5, 76), (.5, .5, 77), (1, 1, 76), (2, .5, 73), (2.5, .5, 74), (3, 1, 69)],
    [(0, .5, 74), (.5, .5, 77), (1, .5, 82), (1.5, .5, 81), (2, 1, 77), (3, 1, 74)],
    [(0, .5, 73), (.5, .5, 76), (1, .5, 79), (1.5, .5, 76), (2, 2, 81)],
    [(0, .5, 79), (.5, .5, 82), (1, 1, 81), (2, .5, 79), (2.5, .5, 77), (3, 1, 76)],
    [(0, .5, 77), (.5, .5, 81), (1, 1, 86), (2, 1, 81), (3, 1, 77)],
    [(0, .5, 76), (.5, .5, 79), (1, .5, 82), (1.5, .5, 81), (2, .5, 79), (2.5, .5, 76), (3, 1, 73)],
    [(0, 1.5, 74), (1.5, .5, 69), (2, 2, 74)],
]
CHORDS_A = ["Dm", "Dm", "Bb", "A7", "Gm", "Dm", "A7", "Dm"]
CHORDS_B = ["Gm", "Gm", "Dm", "Dm", "Bb", "C", "A7", "A7"]
THEREMIN_B = [  # bar-relative (bar, beat, dur, midi)
    (0, 0, 2, 67), (0, 2, 2, 70), (1, 0, 4, 69),
    (2, 0, 2, 65), (2, 2, 2, 69), (3, 0, 4, 74),
    (4, 0, 2, 74), (4, 2, 1, 72), (4, 3, 1, 70), (5, 0, 4, 72),
    (6, 0, 4, 73), (7, 0, 2, 76), (7, 2, 2, 69),
]


def build_music():
    n = int(TOTAL * SR)
    mus = np.zeros((n, 2))

    def add(x, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i >= n:
            return
        x = x[: n - i]
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        mus[i : i + len(x), 0] += x * gain * l * 1.41
        mus[i : i + len(x), 1] += x * gain * r * 1.41

    def bar_t(b, beat=0.0):
        return b * BAR + swing(beat) * BEAT

    # --- intro (bars 0-1): spooky music-box arpeggio over a pad
    arp = [62, 65, 69, 74, 73, 69, 65, 61]
    for b in range(2):
        add(pad(CHORDS["Dm" if b == 0 else "A7"][0], BAR, 0.8), bar_t(b), 0.22)
        add(pluck(mtof(CHORDS["Dm" if b == 0 else "A7"][1]), 1.2), bar_t(b), 0.55)
        for k in range(8):
            add(music_box(mtof(arp[k] + 12), 1.4, 0.7 + 0.3 * (k % 2 == 0)), bar_t(b, k * 0.5), 0.33, 0.3)

    def groove(bar, chord, perc_level):
        notes, root, fifth = CHORDS[chord]
        add(pad(notes, BAR, 1.0), bar_t(bar), 0.16)
        for beat, m in ((0, root), (1, fifth), (2, root), (3, fifth)):
            add(pluck(mtof(m), 0.55, 1.0 if beat in (0, 2) else 0.8), bar_t(bar, beat), 0.6, -0.15)
        add(pluck(mtof(fifth), 0.3, 0.5), bar_t(bar, 3.5), 0.45, -0.15)
        if perc_level >= 1:
            for e in range(8):
                add(shaker(), bar_t(bar, e * 0.5), 0.10 * perc_level, 0.4)
        if perc_level >= 2:
            add(kick(), bar_t(bar, 0), 0.55)
            add(kick(), bar_t(bar, 2), 0.45)
            add(snap(), bar_t(bar, 1), 0.28, -0.3)
            add(snap(), bar_t(bar, 3), 0.28, -0.3)
            add(woodblock(), bar_t(bar, 3.5), 0.10, 0.5)

    # --- section A (bars 2-9), A' (bars 10-17)
    for sec_start, perc, double in ((2, 1, False), (10, 2, True)):
        for i in range(8):
            b = sec_start + i
            groove(b, CHORDS_A[i], perc)
            for beat, dur, m in MELODY_A[i]:
                add(music_box(mtof(m), 1.4), bar_t(b, beat), 0.42, 0.1)
                if double:
                    add(pluck(mtof(m - 12), 0.5, 0.7, 0.8), bar_t(b, beat), 0.22, 0.35)

    # --- section B (bars 18-25): theremin lead
    th_notes = []
    for bar, beat, dur, m in THEREMIN_B:
        th_notes.append((bar_t(18 + bar, beat) - 18 * BAR, dur * BEAT - 0.04, m))
    for i in range(8):
        b = 18 + i
        groove(b, CHORDS_B[i], 2)
        chord = CHORDS[CHORDS_B[i]][0]
        for k, m in enumerate([chord[0] + 24, chord[1] + 24, chord[2] + 24, chord[1] + 24]):
            add(music_box(mtof(m), 0.9, 0.6), bar_t(b, 0.5 + k), 0.16, 0.5)
    add(theremin(th_notes, 8 * BAR + 1), 18 * BAR, 0.30, -0.1)

    # --- outro (bars 26-27) then the final "ta-da" at bar 28 (56 s)
    for i, chord in enumerate(["Dm", "A7"]):
        b = 26 + i
        groove(b, chord, 2)
        for beat, dur, m in MELODY_A[i if i == 0 else 3]:
            add(music_box(mtof(m), 1.4), bar_t(b, beat), 0.42, 0.1)
    end = 28 * BAR
    add(pad([62, 66, 69, 74], 3.8, 1.2), end, 0.26)  # bright D-major finish
    add(pluck(mtof(38), 2.5), end, 0.8)
    add(pluck(mtof(50), 2.5), end, 0.5)
    add(kick(), end, 0.7)
    for k, m in enumerate([74, 78, 81, 86, 90, 93]):
        add(music_box(mtof(m), 2.5, 0.9), end + k * 0.06, 0.3, -0.4 + k * 0.16)
    add(snap(), end, 0.3)

    mus = highpass(mus, 55)
    mus = reverb(mus, 1.6, 0.22)
    # gentle overall fade at the very end
    t = np.arange(n) / SR
    mus *= np.clip((TOTAL - t) / 1.5, 0, 1)[:, None]
    mus *= np.clip(t / 0.3, 0, 1)[:, None]
    # soft clip
    mus = np.tanh(mus / np.max(np.abs(mus)) * 1.3)
    return mus


# ----------------------------------------------------------------- sound fx

def sfx_whoosh():
    dur = 1.4
    t = t_axis(dur)
    x = rng.standard_normal(len(t))
    out = np.zeros_like(x)
    # sweep a band-pass by processing short overlapping windows
    win = 2048
    hop = 512
    w = np.hanning(win)
    for i in range(0, len(x) - win, hop):
        p = i / len(x)
        centre = 300 + 3200 * np.sin(np.pi * p) ** 2
        seg = bandpass(x[i : i + win] * w, centre * 0.6, centre * 1.6)
        out[i : i + win] += seg * w
    e = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    pan = np.linspace(-0.9, 0.9, len(t))
    mono = out * e
    return np.stack([mono * (1 - pan) / 2, mono * (1 + pan) / 2], axis=1)


def sfx_sparkle():
    dur = 1.6
    n = int(dur * SR)
    out = np.zeros(n)
    notes = [86, 90, 93, 98, 102, 105, 98, 102, 105, 110]
    for k, m in enumerate(notes):
        x = music_box(mtof(m), 0.9, 0.6 + 0.4 * rng.random())
        i = int(k * 0.065 * SR)
        L = min(len(x), n - i)
        out[i : i + L] += x[:L]
    shimmer = bandpass(rng.standard_normal(n), 7000, 14000) * np.exp(-t_axis(dur) / 0.4) * 0.15
    return reverb(out + shimmer, 1.2, 0.35)


def sfx_chime():
    dur = 3.0
    t = t_axis(dur)
    x = np.zeros_like(t)
    for m, delay in ((74, 0), (81, 0.12), (86, 0.24), (90, 0.36)):
        i = int(delay * SR)
        tb = t[: len(t) - i]
        bell = sum(a * np.sin(2 * np.pi * mtof(m) * r * tb) * np.exp(-tb / d)
                   for r, a, d in ((1, 1, 1.4), (2.76, 0.35, 0.6), (5.4, 0.15, 0.3), (0.5, 0.2, 1.8)))
        x[i:] += bell * np.clip(tb / 0.003, 0, 1)
    return reverb(x, 2.0, 0.35)


def sfx_pop():
    t = t_axis(0.25)
    f = 900 * np.exp(-t / 0.03) + 250
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
    x += bandpass(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t / 0.006) * 0.4
    return x


def sfx_boing():
    t = t_axis(0.9)
    f = 180 + 160 * np.sin(2 * np.pi * 9 * t) * np.exp(-t / 0.3) + 120 * np.exp(-t / 0.15)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = np.tanh(2 * x) * np.exp(-t / 0.3) * np.clip(t / 0.005, 0, 1)
    return x


def sfx_ding():
    t = t_axis(1.6)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d)
            for f, a, d in ((1318.5, 1, 0.6), (2637, 0.3, 0.25), (3951, 0.12, 0.12), (1975.5, 0.4, 0.5)))
    return reverb(x * np.clip(t / 0.002, 0, 1), 1.0, 0.25)


def sfx_bats():
    dur = 1.6
    t = t_axis(dur)
    noise = bandpass(rng.standard_normal(len(t)), 600, 3500)
    flap = (0.5 + 0.5 * np.sin(2 * np.pi * 14 * t + 2 * np.sin(2 * np.pi * 1.3 * t))) ** 3
    squeak = np.zeros_like(t)
    for s in (0.25, 0.7, 1.05):
        i = int(s * SR)
        tt = t[: int(0.09 * SR)]
        f = 5200 + 1800 * np.sin(np.pi * tt / 0.09)
        sq = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / 0.09)
        squeak[i : i + len(sq)] += sq * 0.25
    e = np.sin(np.pi * t / dur)
    pan = np.linspace(0.8, -0.8, len(t))
    mono = (noise * flap * 0.8 + squeak) * e
    return np.stack([mono * (1 - pan) / 2, mono * (1 + pan) / 2], axis=1)


def sfx_bubbles():
    dur = 2.4
    n = int(dur * SR)
    out = np.zeros(n)
    for _ in range(14):
        s = rng.uniform(0, dur - 0.15)
        tt = t_axis(0.12)
        f0 = rng.uniform(250, 600)
        f = f0 * (1 + 2.5 * tt / 0.12)
        b = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt / 0.035)
        i = int(s * SR)
        out[i : i + len(b)] += b * rng.uniform(0.4, 1)
    return reverb(out, 0.8, 0.2)


def sfx_wind():
    dur = 6.0
    t = t_axis(dur)
    x = rng.standard_normal(len(t))
    howl = bandpass(x, 300, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t))
    # ghostly "ooo" glide
    f = 420 + 160 * np.sin(2 * np.pi * 0.4 * t) + 60 * np.sin(2 * np.pi * 0.13 * t)
    ooo = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    rumble = lowpass(rng.standard_normal(len(t)), 90) * 3 * np.exp(-((t - 1.2) / 0.8) ** 2)
    e = np.clip(t / 1.0, 0, 1) * np.clip((dur - t) / 2.0, 0, 1)
    return reverb((howl * 0.7 + ooo + rumble) * e, 2.0, 0.3)


def sfx_tada():
    dur = 3.0
    n = int(dur * SR)
    out = np.zeros(n)
    for k, m in enumerate([74, 78, 81, 86]):
        x = music_box(mtof(m), 2.6, 1.0)
        i = int(k * 0.05 * SR)
        L = min(len(x), n - i)
        out[i : i + L] += x[:L]
    sp = sfx_sparkle().mean(axis=1)[:n]
    out[: len(sp)] += sp * 0.5
    return reverb(out, 1.8, 0.3)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    save("music.wav", build_music(), 0.9)
    save("whoosh.wav", sfx_whoosh())
    save("sparkle.wav", sfx_sparkle())
    save("chime.wav", sfx_chime())
    save("pop.wav", sfx_pop())
    save("boing.wav", sfx_boing())
    save("ding.wav", sfx_ding())
    save("bats.wav", sfx_bats())
    save("bubbles.wav", sfx_bubbles())
    save("wind.wav", sfx_wind())
    save("tada.wav", sfx_tada())
    print("audio written to", os.path.abspath(OUT))
