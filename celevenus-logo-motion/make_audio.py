"""Synthesize the CeleVenus logo sting soundtrack (music + SFX), 8 s, 120 BPM, A minor.

Timeline matches logo_motion.html:
  0.25-1.6  gold pen traces the calligraphy C        -> whooshes, riser, soft arp
  2.0       swirl solidifies                          -> shimmer chime
  2.2-3.6   letters fly in from every direction       -> panned whooshes, landing ticks + rising notes
  3.5-4.0   build                                     -> snare roll, riser, reverse cymbal
  4.0       the V slams down (DROP)                   -> impact, crash, one bar of groove
  6.0-7.2   music drops out, logo beats like a heart  -> lub-dub x2 over a held chord
Usage: python3 make_audio.py out.wav
"""
import sys
import wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, sawtooth

SR = 44100
DUR = 8.0
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


def pan_sweep(x, p0, p1):
    a = (np.linspace(p0, p1, len(x)) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


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


def heartbeat(strength=1.0):
    t = T(int(SR * 0.6))
    f = 55 + 95 * np.exp(-t * 20)          # enough body to be heard on phone speakers
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
    s += filt(noise(len(t)), 'lowpass', 400) * np.exp(-t * 40) * 0.5
    return np.tanh(s * 2.2) * strength


def thud():
    t = T(int(SR * 0.3))
    f = 150 * np.exp(-t * 20) + 70
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    s += filt(noise(len(t)), 'bandpass', [1500, 6000]) * np.exp(-t * 90) * 0.35  # tick
    return s


# ---------------- arrangement ----------------
AM, F, G = (57, 60, 64), (53, 57, 60), (55, 59, 62)
DROP, GROOVE_END = 4.0, 6.0
FLIGHT = 0.55
LAND = [2.75, 2.875, 3.0, 3.125, 3.25, 3.375, 3.5, 3.625]       # C E L E . E N U S (V lands on DROP)
FLY_PAN = [(-0.95, -0.3), (-0.3, -0.2), (0, 0), (0.1, 0.0), (0.8, 0.15), (0, 0), (0.7, 0.25), (0.95, 0.4)]
FROM_CAMERA = (2, 5)                                            # L and N zoom in from the front
HEART = [(6.0, 1.0), (6.2, 0.7), (6.85, 1.0), (7.05, 0.7)]
GLINTS = [4.5, 5.15, 5.6, 6.0, 6.85]


def chord_at(t):
    if t < 2:
        return AM
    if t < 3:
        return F
    if t < 4:
        return G
    if t < 5:
        return AM
    if t < 5.5:
        return F
    return G


# pads: quiet at the start, opening up as the logo builds
place(pad(AM, 2.0, cutoff=700, att=1.0), 0.0, 0.4)
place(pad(F, 1.0, cutoff=1300, att=0.2), 2.0, 0.45)
place(pad(G, 0.95, cutoff=2400, att=0.2, rel=0.1), 3.0, 0.5)
place(pad(AM, 1.0, cutoff=2600, att=0.03), 4.0, 0.55)
place(pad(F, 0.5, cutoff=2600, att=0.03), 5.0, 0.55)
place(pad(G, 0.5, cutoff=2600, att=0.03), 5.5, 0.55)
place(pad(AM + (69,), 1.4, cutoff=1500, att=0.02, rel=1.0), GROOVE_END, 0.45, send=0.6)  # held chord under the heartbeat

# 16th arp: whisper in the intro, rests while letters fly, full in the groove
ARP = [0, 1, 2, 3, 2, 4, 3, 2]
for k in range(int(0.5 / 0.125), int(GROOVE_END / 0.125)):
    t = k * 0.125
    if 2.1 <= t < DROP:
        continue
    c = chord_at(t)
    tones = [c[0] + 12, c[1] + 12, c[2] + 12, c[0] + 24, c[1] + 24]
    g = 0.05 + 0.07 * min(1, (t - 0.5) / 1.5) if t < DROP else 0.17
    place(pluck(tones[ARP[k % 8]], 0.35, bright=0.6 if t < DROP else 1.2), t, g, p=0.4 * np.sin(k * 0.9), send=0.3)

# groove bar: stabs, bass
for t, c in ((4.0, AM), (4.75, AM), (5.0, F), (5.5, G), (5.75, G)):
    for m in c:
        place(pluck(m + 12, 0.5, bright=1.4, decay=4), t, 0.14, send=0.35)
for k in range(int(DROP / 0.25), int(GROOVE_END / 0.25)):
    t = k * 0.25
    place(bass(chord_at(t)[0] - 12 + (12 if k % 4 == 3 else 0), 0.24), t, 0.5)

# drums
for t in (1.0, 1.5):
    place(kick(0.6), t, 0.3, bus='drums')
for k in range(4):
    place(hat(), 1.0 + k * 0.25, 0.06, p=0.3, bus='drums')
place(kick(0.8), 2.0, 0.4, bus='drums')
for k in range(int(2.0 / 0.125), int(3.875 / 0.125)):
    t = k * 0.125
    place(hat(), t, 0.05 + 0.05 * (t - 2.0) / 1.9, p=0.3, bus='drums')
for i, t in enumerate((3.5, 3.625, 3.75, 3.8125, 3.875, 3.90625, 3.9375)):
    place(snare(), t, 0.1 + 0.05 * i, p=0.1, bus='drums', send=0.25)
for k in range(4):
    t = DROP + k * 0.5
    place(kick(1.0), t, 0.75, bus='drums')
    place(hat(True), t + 0.25, 0.13, p=-0.25, bus='drums')
    if k % 2 == 1:
        place(clap(), t, 0.38, bus='drums', send=0.3)
for k in range(int(DROP / 0.125), int(GROOVE_END / 0.125)):
    if k % 2:
        place(hat(), k * 0.125, 0.08, p=0.35, bus='drums')
for t in (5.625, 5.75, 5.875):
    place(snare(), t, 0.22, bus='drums', send=0.25)

# ---------------- SFX ----------------
place(whoosh(1.5, 200, 4500, peak=0.45), 0.2, 0.28, p=-0.4, bus='sfx', send=0.4)
place(whoosh(1.0, 600, 7000, peak=0.6, q=2.0), 0.75, 0.18, p=0.5, bus='sfx', send=0.4)
place(riser(1.75, 300, 6000), 0.25, 0.14, bus='sfx', send=0.3)
# swirl solidifies
for i, m in enumerate((81, 88, 93, 96)):
    place(bell(m, 2.5, 1.8), 2.0 + i * 0.04, 0.11, p=-0.5 + i * 0.33, bus='sfx', send=0.6)
place(impact(0.3), 2.0, 0.2, bus='sfx', send=0.3)
# letters fly in from all sides: whoosh travels with each letter, tick + rising note on arrival
notes = [69, 72, 74, 76, 79, 81, 84, 86]
for i, t in enumerate(LAND):
    p0, p1 = FLY_PAN[i]
    if i in FROM_CAMERA:
        w = svf(noise(int(SR * FLIGHT)), 300 * (20 ** np.linspace(0, 1, int(SR * FLIGHT))), 2.0) * np.linspace(0, 1, int(SR * FLIGHT)) ** 2
    else:
        w = whoosh(FLIGHT, 900, 6500, peak=0.85, q=2.2)
    BUS['sfx'][int((t - FLIGHT) * SR):int((t - FLIGHT) * SR) + len(w)] += pan_sweep(w, p0, p1) * 0.12
    place(thud(), t, 0.42, p=p1 * 0.6, bus='sfx')
    place(pluck(notes[i], 0.6, bright=1.5, decay=3.5), t, 0.22, p=p1, bus='sfx', send=0.4)
# build into the drop
place(riser(1.1, 400, 11000), 2.9, 0.24, bus='sfx', send=0.2)
place(reverse_cymbal(1.0), 3.0, 0.3, bus='sfx')
place(whoosh(0.42, 300, 3000, peak=0.9, q=1.2), 3.58, 0.38, bus='sfx')   # the V falling
# DROP: the V slams down
place(impact(1.0), DROP, 0.9, bus='sfx', send=0.45)
place(crash(2.0), DROP, 0.42, p=0.15, bus='sfx', send=0.4)
for m in (45, 57, 64, 69):
    place(bell(m, 2.0, 1.0), DROP, 0.06, bus='sfx', send=0.4)
# light sweep sparkle + glints
for i, m in enumerate((81, 84, 86, 88, 91, 93, 96, 98, 100, 103)):
    place(bell(m, 1.0, 4.0), 4.18 + i * 0.06, 0.04, p=-0.8 + i * 0.18, bus='sfx', send=0.6)
for i, t in enumerate(GLINTS):
    place(bell(100 if i % 2 else 105, 1.2, 3.0), t + 0.08, 0.05, p=(-0.5 if i % 2 else 0.5), bus='sfx', send=0.7)
# ending: groove cuts, the logo beats like a heart
for t, a in HEART:
    place(heartbeat(a), t, 0.9, bus='drums', send=0.15)
place(bell(81, 2.0, 1.2), GROOVE_END, 0.06, bus='sfx', send=0.7)

# ---------------- mix ----------------
MASTER_DB = -1.5   # final trim so the sting sits around -16 LUFS (not too loud)
# sidechain the music bus to the groove kicks
sc = np.ones(N)
for t in [DROP + k * 0.5 for k in range(4)] + [h[0] for h in HEART]:
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
drive = 1.15
mix = np.tanh(mix * drive) / np.tanh(drive)          # gentle saturation / limiting
fade_in = np.minimum(1, T(N) / 0.02)
fade_out = np.clip((DUR - T(N)) / 0.6, 0, 1) ** 1.5
mix *= (fade_in * fade_out)[:, None]
mix *= 10 ** (-1.5 / 20) / np.abs(mix).max()
mix *= 10 ** (MASTER_DB / 20)

out = sys.argv[1] if len(sys.argv) > 1 else 'soundtrack.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
