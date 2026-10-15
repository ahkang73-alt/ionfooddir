"""Synthesize the CeleVenus logo sting soundtrack (music + SFX), 12 s, 120 BPM, A minor.

Timeline matches logo_motion.html:
  0.6-2.5  gold pen traces the calligraphy C  -> whoosh, riser, arp
  3.0      swirl solidifies                    -> shimmer chime
  3.75-5.5 letters C E L E E N U S land on 8ths -> thud + rising notes, snare roll, riser
  6.0      the V slams down (DROP)             -> impact, crash, full groove
  6.25     light sweep                         -> sparkle glissando
  10.0     final hit                           -> Am chord + crash, reverb tail
Usage: python3 make_audio.py out.wav
"""
import sys
import wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, sawtooth

SR = 44100
DUR = 12.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

BUS = {k: np.zeros((N, 2)) for k in ('drums', 'music', 'sfx', 'verb')}


def T(n):
    return np.arange(n) / SR


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def pan2(x, p):
    a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def place(sig, t, g=1.0, p=0.0, bus='music', send=0.0):
    if sig.ndim == 1:
        sig = pan2(sig, p)
    i = int(round(t * SR))
    if i >= N:
        return
    j = min(N, i + len(sig))
    s = sig[:j - i] * g
    BUS[bus][i:j] += s
    if send:
        BUS['verb'][i:j] += s * send


def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x, axis=0)


def svf(x, fc, q=0.8, mode='bp'):
    """Chamberlin state-variable filter with per-sample cutoff (for sweeps)."""
    y = np.zeros_like(x)
    f = 2 * np.sin(np.pi * np.minimum(fc, SR / 6.5) / SR)
    damp = 1.0 / q
    low = band = 0.0
    for i in range(len(x)):
        high = x[i] - low - damp * band
        band += f[i] * high
        low += f[i] * band
        y[i] = band if mode == 'bp' else (low if mode == 'lp' else high)
    return y


def noise(n):
    return rng.standard_normal(n)


# ---------------- instruments ----------------
def kick(punch=1.0, dur=0.5):
    t = T(int(SR * dur))
    f = 46 + 140 * punch * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    s += noise(len(t)) * np.exp(-t * 260) * 0.22
    return np.tanh(s * 1.7)


def clap():
    n = int(SR * 0.4)
    t = T(n)
    env = sum(np.where(t >= d, np.exp(-(t - d).clip(0) * 95), 0) for d in (0, 0.011, 0.023))
    env = env + np.where(t >= 0.03, np.exp(-(t - 0.03).clip(0) * 13), 0) * 0.55
    return filt(noise(n) * env, 'bandpass', [850, 4200]) * 1.6


def snare(v=1.0):
    n = int(SR * 0.25)
    t = T(n)
    tone = np.sin(2 * np.pi * 185 * t) * np.exp(-t * 30) * 0.5
    nz = filt(noise(n), 'bandpass', [1200, 8000]) * np.exp(-t * 22)
    return (tone + nz) * v


def hat(open_=False):
    n = int(SR * (0.35 if open_ else 0.08))
    t = T(n)
    metal = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (3140, 4270, 5510, 6820, 8130)) * 0.12
    s = filt(noise(n) + metal, 'highpass', 7000) * np.exp(-t * (9 if open_ else 55))
    return s


def pluck(m, dur=0.4, bright=1.0, decay=5.0):
    t = T(int(SR * dur))
    f = hz(m)
    s = np.zeros_like(t)
    for k in range(1, 14):
        if f * k > 16000:
            break
        s += np.sin(2 * np.pi * f * k * t + k) / k * np.exp(-t * (decay + k * 2.2 / bright))
    return s * np.minimum(1, t * 800)


def bell(m, dur=2.5, decay=2.2):
    t = T(int(SR * dur))
    f = hz(m)
    s = np.zeros_like(t)
    for ratio, amp, d in ((1, 1, 1), (2.0, 0.5, 1.6), (2.76, 0.35, 2.4), (5.4, 0.18, 4), (8.93, 0.08, 6)):
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * decay * d)
    return s * np.minimum(1, t * 2000)


def pad(ms, dur, cutoff=1800, att=0.4, rel=0.6):
    n = int(SR * (dur + rel))
    t = T(n)
    out = np.zeros((n, 2))
    for m in ms:
        for ch, det in ((0, -0.08), (1, 0.08)):
            for d2 in (-1, 1):
                f = hz(m + det * d2 * 0.9 + det)
                out[:, ch] += sawtooth(2 * np.pi * f * t + rng.random() * 6.28) * 0.2
    out = filt(out, 'lowpass', cutoff, 2)
    env = np.minimum(1, t / att) * np.where(t > dur, np.exp(-(t - dur) * 5), 1)
    return out * env[:, None] / len(ms)


def bass(m, dur):
    t = T(int(SR * dur))
    f = hz(m)
    s = sawtooth(2 * np.pi * f * t) * 0.6 + np.sin(2 * np.pi * f * t) * 0.8 + np.sin(np.pi * f * t) * 0.5
    s = filt(s, 'lowpass', 420, 2)
    return s * np.minimum(1, t * 300) * np.exp(-t * 3) * np.minimum(1, (dur - t) * 200)


def whoosh(dur, f0, f1, peak=0.5, q=1.6):
    n = int(SR * dur)
    x = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** x
    env = np.where(x < peak, (x / peak) ** 2, ((1 - x) / (1 - peak)) ** 1.5)
    s = svf(noise(n), fc, q) * env
    return s


def riser(dur, f0=250, f1=9000, tone=True):
    n = int(SR * dur)
    x = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** (x ** 1.5)
    s = svf(noise(n), fc, 1.4) * x ** 2.2
    if tone:
        f = 110 * 2 ** (x ** 1.4 * 3)
        s += sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.06 * x ** 2
    return s


def reverse_cymbal(dur):
    n = int(SR * dur)
    x = np.linspace(0, 1, n)
    return filt(noise(n), 'highpass', 5000) * x ** 3


def crash(dur=2.5):
    t = T(int(SR * dur))
    return filt(noise(len(t)), 'highpass', 3500) * np.exp(-t * 2.2) * 0.7


def impact(big=1.0):
    t = T(int(SR * 3.0))
    f = 62 * np.exp(-t * 0.9) + 24
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    body = filt(noise(len(t)), 'lowpass', 2500) * np.exp(-t * 7)
    click = noise(len(t)) * np.exp(-t * 120) * 0.5
    return np.tanh((sub * 1.2 + body * 0.8 * big + click) * 1.4)


def thud():
    t = T(int(SR * 0.3))
    f = 150 * np.exp(-t * 20) + 70
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    s += filt(noise(len(t)), 'bandpass', [1500, 6000]) * np.exp(-t * 90) * 0.35  # tick
    return s


# ---------------- arrangement ----------------
AM, F, G = (57, 60, 64), (53, 57, 60), (55, 59, 62)
DROP, FINAL = 6.0, 10.0
LAND = [3.75, 4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5]   # C E L E . E N U S (V lands on DROP)
GLINTS = [6.55, 7.45, 8.3, 9.1, 10.0, 10.25]

# intro pads (filter opening as tension builds)
place(pad(AM, 2.0, cutoff=900, att=1.2), 0.0, 0.55)
place(pad(F, 2.0, cutoff=1300, att=0.3), 2.0, 0.6)
place(pad(G, 1.95, cutoff=2200, att=0.3, rel=0.15), 4.0, 0.65)
# groove pads
place(pad(AM, 2.0, cutoff=2600, att=0.05), 6.0, 0.7)
place(pad(F, 1.0, cutoff=2600, att=0.05), 8.0, 0.7)
place(pad(G, 1.0, cutoff=2600, att=0.05), 9.0, 0.7)
place(pad(AM + (69,), 1.6, cutoff=2400, att=0.02, rel=1.2), FINAL, 0.8, send=0.5)


def chord_at(t):
    if t < 2:
        return AM
    if t < 4:
        return F
    if t < 6:
        return G
    if t < 8:
        return AM
    if t < 9:
        return F
    return G


# 16th-note arpeggio: soft in the intro, muted while the letters land, back on the drop
ARP = [0, 1, 2, 3, 2, 4, 3, 2]
step = 0.125
for k in range(int(1.0 / step), int(FINAL / step)):
    t = k * step
    if 3.5 <= t < DROP:
        continue
    c = chord_at(t)
    tones = [c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[1] + 24]
    m = tones[ARP[k % 8]]
    g = 0.10 + 0.12 * min(1, (t - 1.0) / 2.5) if t < DROP else 0.2
    place(pluck(m, 0.35, bright=0.6 if t < DROP else 1.2), t, g, p=0.35 * np.sin(k * 0.9), send=0.3)

# chord stabs + bass in the groove
for t, c in ((6.0, AM), (6.75, AM), (7.5, AM), (8.0, F), (8.75, F), (9.25, G), (9.5, G)):
    for m in c:
        place(pluck(m + 12, 0.5, bright=1.4, decay=4), t, 0.16, p=0.0, send=0.35)
for k in range(int(DROP / 0.25), int(FINAL / 0.25)):
    t = k * 0.25
    root = chord_at(t)[0] - 12
    place(bass(root + (12 if k % 4 == 3 else 0), 0.24), t, 0.55)
place(bass(45, 1.8), FINAL, 0.7)

# drums
for t in (2.0, 2.5, 3.0):
    place(kick(0.7), t, 0.45, bus='drums')
for k in range(8):
    place(hat(), 2.0 + k * 0.25, 0.10, p=0.3, bus='drums')
for k in range(int(4.0 / 0.125), int(5.875 / 0.125)):
    place(hat(), k * 0.125, 0.07 + 0.06 * (k * 0.125 - 4) / 2, p=0.3, bus='drums')
for t in (4.0, 5.0):
    place(kick(0.8), t, 0.5, bus='drums')
# snare roll into the drop
roll = [5.0, 5.25, 5.5, 5.625, 5.75, 5.8125, 5.875]
for i, t in enumerate(roll):
    place(snare(), t, 0.15 + 0.06 * i, p=0.1, bus='drums', send=0.25)
# groove
for k in range(8):
    t = DROP + k * 0.5
    place(kick(1.0), t, 0.8, bus='drums')
    place(hat(True), t + 0.25, 0.16, p=-0.25, bus='drums')
    if k % 2 == 1:
        place(clap(), t, 0.42, bus='drums', send=0.3)
for k in range(int(DROP / 0.125), int(FINAL / 0.125)):
    if k % 2:
        place(hat(), k * 0.125, 0.09, p=0.35, bus='drums')
for t in (9.625, 9.75, 9.875):
    place(snare(), t, 0.25, bus='drums', send=0.25)

# ---------------- SFX ----------------
place(whoosh(2.2, 200, 4500, peak=0.45), 0.5, 0.35, p=-0.4, bus='sfx', send=0.4)
place(whoosh(1.4, 600, 7000, peak=0.6, q=2.0), 1.3, 0.22, p=0.5, bus='sfx', send=0.4)
place(riser(2.4, 300, 6000), 0.6, 0.18, bus='sfx', send=0.3)
# swirl solidifies: shimmer chime
for i, m in enumerate((81, 88, 93, 96)):
    place(bell(m, 3.0, 1.6), 3.0 + i * 0.045, 0.13, p=-0.5 + i * 0.33, bus='sfx', send=0.6)
place(impact(0.3), 3.0, 0.25, bus='sfx', send=0.3)
# letters land: thud + rising notes (A minor pentatonic)
notes = [69, 72, 74, 76, 79, 81, 84, 86]
for i, t in enumerate(LAND):
    pan = -0.6 + i * 0.17
    place(whoosh(0.3, 1500, 6000, peak=0.8, q=2.5), t - 0.3, 0.07, p=pan, bus='sfx')
    place(thud(), t, 0.55, p=pan * 0.5, bus='sfx')
    place(pluck(notes[i], 0.6, bright=1.5, decay=3.5), t, 0.26, p=pan, bus='sfx', send=0.4)
# build into the drop
place(riser(1.5, 400, 11000), 4.4, 0.3, bus='sfx', send=0.2)
place(reverse_cymbal(1.5), 4.5, 0.4, bus='sfx')
place(whoosh(0.45, 300, 3000, peak=0.9, q=1.2), 5.55, 0.45, bus='sfx')  # the V falling
# DROP: the V slams down
place(impact(1.0), DROP, 0.95, bus='sfx', send=0.45)
place(crash(), DROP, 0.5, p=0.15, bus='sfx', send=0.4)
for m in (45, 57, 64, 69):
    place(bell(m, 2.5, 1.0), DROP, 0.07, bus='sfx', send=0.4)
# light sweep: sparkle glissando
for i, m in enumerate((81, 84, 86, 88, 91, 93, 96, 98, 100, 103)):
    place(bell(m, 1.2, 4.0), 6.28 + i * 0.07, 0.05, p=-0.8 + i * 0.18, bus='sfx', send=0.6)
# glints
for i, t in enumerate(GLINTS):
    place(bell(100 if i % 2 else 105, 1.5, 3.0), t + 0.1, 0.06, p=(-0.5 if i % 2 else 0.5), bus='sfx', send=0.7)
# final hit
place(kick(1.0), FINAL, 0.8, bus='drums')
place(impact(0.6), FINAL, 0.6, bus='sfx', send=0.5)
place(crash(3.0), FINAL, 0.45, p=-0.15, bus='sfx', send=0.5)
for m in (69, 76, 81, 88):
    place(bell(m, 3.0, 0.9), FINAL, 0.07, bus='sfx', send=0.6)
place(whoosh(1.2, 400, 6000, peak=0.5), 9.55, 0.2, p=0.5, bus='sfx', send=0.3)

# ---------------- mix ----------------
# sidechain the music bus to the groove kicks
sc = np.ones(N)
for t in [DROP + k * 0.5 for k in range(8)] + [FINAL]:
    i = int(t * SR)
    n = min(N - i, int(SR * 0.45))
    sc[i:i + n] *= 1 - 0.55 * np.exp(-T(n) * 9)
music = BUS['music'] * sc[:, None]

# synthetic hall reverb
ir_n = int(SR * 2.6)
ti = T(ir_n)
ir = np.stack([noise(ir_n), noise(ir_n)], 1) * np.exp(-ti * 2.6)[:, None]
ir = filt(ir, 'lowpass', 6500)
ir[:int(SR * 0.02)] = 0
ir /= np.sqrt((ir ** 2).sum(0))
verb = np.stack([fftconvolve(BUS['verb'][:, c], ir[:, c])[:N] for c in range(2)], 1) * 0.55

mix = BUS['drums'] + music + BUS['sfx'] + verb
mix = filt(mix, 'highpass', 25)
mix /= np.abs(mix).max()
drive = 1.8
mix = np.tanh(mix * drive) / np.tanh(drive)          # gentle saturation / limiting
fade_in = np.minimum(1, T(N) / 0.02)
fade_out = np.clip((DUR - T(N)) / 0.65, 0, 1) ** 1.5
mix *= (fade_in * fade_out)[:, None]
mix *= 10 ** (-1 / 20) / np.abs(mix).max()

out = sys.argv[1] if len(sys.argv) > 1 else 'soundtrack.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
