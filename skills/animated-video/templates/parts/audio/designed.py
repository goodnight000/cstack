# Designed (synthesised) sound effects. Each function returns a stereo float array at dsp.SR;
# mix with dsp.put() and save with dsp.write(). `python3 audio/designed.py` renders one of each to
# audio/designed/ with its length, level and spectral centroid, for checking by ear.
# The pitched ones default to F minor (notes like 'F5', the pentatonic in data_chatter, the chord in
# unscramble); pass other notes to sit them in your score's key. Label them synthetic in the cue
# sheet: they were measured, and need listening in context before you trust their levels.
import numpy as np
from dsp import *

TAU = 2 * np.pi


def _rng(seed):
    return np.random.default_rng(seed)


def _sweep(f0, f1, dur, shape=1.0):
    """Phase of a tone gliding f0 -> f1 (exponential in pitch)."""
    t = secs(dur)
    f = f0 * (f1 / f0) ** ((t / dur) ** shape)
    return TAU * np.cumsum(f) / SR, t


def sub_drop(dur=2.2):
    """A deep falling hit, for titles and big numbers."""
    ph, t = _sweep(120, 36, 0.5)
    ph = np.concatenate([ph, ph[-1] + TAU * 36 * secs(dur - 0.5)])
    t = secs(dur)[: len(ph)]
    y = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.18 * np.sin(3 * ph)) * np.exp(-t / 0.55)
    y += lp(noise(len(t), 11), 700) * np.exp(-t / 0.12) * 0.7
    return reverb(stereo(soft(fade(y, 0.002, 0.2), 1.5)), decay=1.8, wet=0.15, bright=1800)


def thud(f=70, dur=0.5):
    """A short soft thump: something landing or locking into place."""
    ph, t = _sweep(f * 2.6, f, 0.06)
    ph = np.concatenate([ph, ph[-1] + TAU * f * secs(dur - 0.06)])
    t = secs(dur)[: len(ph)]
    y = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.exp(-t / 0.11) + hp(lp(noise(len(t), 12), 3000), 500) * np.exp(-t / 0.012) * 0.5
    return stereo(fade(soft(y, 1.3), 0.001, 0.05))


def whoosh(dur=0.6, lo=300, hi=5000, pan0=-0.7, pan1=0.7, seed=3, peak=0.55):
    """Air rushing past: a band of noise sweeping up then down, moving across the stereo field."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    env = np.sin(np.pi * np.clip(x, 0, 1)) ** 2 * np.where(x < peak, 1, 1) * np.exp(-np.maximum(0, x - peak) * 2.5)
    src = noise(n, seed)
    # three overlapping bands crossfaded by position give a moving centre frequency
    mids = np.geomspace(lo, hi, 4)
    pos = np.sin(np.pi * x) * 3
    y = sum(bp(src, m * 0.6, m * 1.6) * np.clip(1 - np.abs(pos - i), 0, 1) for i, m in enumerate(mids))
    p = pan0 + (pan1 - pan0) * x
    a = (p + 1) * np.pi / 4
    return fade(np.stack([y * env * np.cos(a), y * env * np.sin(a)], 1), 0.01, 0.03)


def riser(dur=1.6, f0='F3', f1='F5', seed=4):
    """A rising tone with quickening tremolo that cuts off at its peak."""
    ph, t = _sweep(hz(f0), hz(f1), dur, 1.6)
    x = t / dur
    trem = 0.6 + 0.4 * np.sin(TAU * np.cumsum(4 + 22 * x ** 2) / SR)
    y = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * trem * x ** 2
    y = stereo(y) * 0.6 + bp(np.stack([noise(len(t), seed), noise(len(t), seed + 1)], 1), 1500, 9000) * (x ** 3)[:, None] * 0.5
    return fade(y, 0.02, 0.012)


def slow_down(dur=1.8):
    """Time stretching: a tone sinks and its flutter slows to a crawl."""
    ph, t = _sweep(hz('F5'), hz('F2'), dur, 0.7)
    x = t / dur
    trem = 0.55 + 0.45 * np.sin(TAU * np.cumsum(26 * (1 - x) ** 2 + 1.5) / SR)
    y = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph)) * trem * (1 - x ** 3)
    return reverb(stereo(fade(lp(y, 2500), 0.01, 0.1)) * 0.7, decay=1.6, wet=0.25, bright=2500)


def light_zip(dur=0.55, pan0=-0.8, pan1=0.8):
    """Something bright flying past: a tone whose pitch drops as it goes by."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    f = hz('C7') * (1 - 0.3 / (1 + np.exp(-(x - 0.45) * 22)))
    ph = TAU * np.cumsum(f) / SR
    env = np.exp(-((x - 0.45) / 0.2) ** 2)
    y = (np.sin(ph) + 0.5 * np.sin(1.5 * ph) + 0.3 * np.sin(2 * ph)) * env * 0.5 + bp(noise(n, 8), 3000, 12000) * env ** 2 * 0.6
    a = (pan0 + (pan1 - pan0) * x + 1) * np.pi / 4
    return reverb(np.stack([y * np.cos(a), y * np.sin(a)], 1), decay=1.0, wet=0.2, bright=8000)


def light_tone(dur=4.0, note='F5', seed=5):
    """A pure, glassy held tone for a recurring light or idea. Fade or pitch it in the mix."""
    t = secs(dur)
    f = hz(note)
    y = sum(a * np.sin(TAU * f * r * t + 1.5 * np.sin(TAU * (0.31 + 0.07 * i) * t + i)) for i, (r, a) in enumerate([(1, 1), (1.5, 0.5), (2, 0.35), (3, 0.12)]))
    y = stereo(y * (0.8 + 0.2 * np.sin(TAU * 5.3 * t)))
    return fade(reverb(y * 0.35, decay=2.5, wet=0.5, bright=9000)[: len(t)], 0.08, 0.3)


def blip(note='C5', dur=0.3, vel=1.0):
    """A hop: one soft round note."""
    t = secs(dur)
    f = hz(note)
    y = np.sin(TAU * f * t + 1.1 * np.sin(TAU * f * t) * np.exp(-t / 0.05)) * np.exp(-t / 0.07) + 0.3 * np.sin(TAU * 2 * f * t) * np.exp(-t / 0.03)
    return reverb(stereo(fade(y, 0.002, 0.03)) * vel, decay=0.9, wet=0.22, bright=6000)


def glass_ping(note='C7', dur=2.6):
    """A fine glass ting with a long ring."""
    t = secs(dur)
    f = hz(note)
    y = sum(a * np.sin(TAU * f * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.7), (2.32, 0.4, 0.35), (4.25, 0.2, 0.18), (6.6, 0.1, 0.1)] if f * r < SR / 2.2)
    y += hp(noise(len(t), 9), 6000) * np.exp(-t / 0.004) * 0.4
    return reverb(stereo(fade(y, 0.001, 0.1)) * 0.6, decay=2.2, wet=0.3, bright=10000)


def chime(note='C5', dur=3.0):
    """A soft bell; play three in a row for a motif."""
    t = secs(dur)
    f = hz(note)
    y = sum(a * np.sin(TAU * f * r * t) * np.exp(-t / (dur * 0.25 * d)) for r, a, d in [(1, 1, 1), (2, 0.45, 0.6), (2.76, 0.3, 0.45), (5.4, 0.16, 0.25)] if f * r < SR / 2.2)
    return reverb(stereo(fade(y, 0.002, 0.2)) * 0.6, decay=2.6, wet=0.35, bright=6000)


def data_chatter(dur=1.5, rate=45, seed=20, lo='F5', spread=24, shape='flat'):
    """Bits being handled: a stream of tiny pitched ticks. shape: 'flat' | 'up' | 'down' in density."""
    n = int(dur * SR)
    out = np.zeros((n + SR // 4, 2))
    r = _rng(seed)
    t = 0.0
    scale = [0, 3, 5, 7, 10]  # F minor pentatonic
    while t < dur:
        x = t / dur
        dens = rate * (1 if shape == 'flat' else (0.25 + 0.75 * x) if shape == 'up' else (1 - 0.75 * x))
        step = r.integers(0, spread)
        f = hz(lo) * 2 ** ((12 * (step // 5) + scale[step % 5]) / 12)
        g = int(r.uniform(0.004, 0.012) * SR)
        tt = np.arange(g) / SR
        grain = np.sin(TAU * f * tt) * np.hanning(g) * r.uniform(0.4, 1)
        put(out, stereo(grain, r.uniform(-0.8, 0.8)), t)
        t += r.exponential(1 / dens)
    return fade(lp(out[:n], 9000), 0.01, 0.05) * 0.5


def tick(pitch=1.0):
    """One clock tick."""
    t = secs(0.09)
    y = np.sin(TAU * 2100 * pitch * t) * np.exp(-t / 0.006) + 0.6 * np.sin(TAU * 820 * pitch * t) * np.exp(-t / 0.014) + hp(noise(len(t), 13), 3000) * np.exp(-t / 0.002) * 0.5
    return reverb(stereo(fade(y, 0.0005, 0.01)) * 0.7, decay=0.5, wet=0.12, bright=5000)


def counter(dur=2.0, r0=8, r1=40, p0=0.8, p1=1.6):
    """A number running up: ticks that quicken and rise, then stop dead."""
    out = np.zeros((int(dur * SR) + SR // 2, 2))
    t, i = 0.0, 0
    while t < dur:
        x = t / dur
        put(out, tick(p0 * (p1 / p0) ** x) * (0.5 + 0.5 * x), t)
        t += 1 / (r0 * (r1 / r0) ** x)
        i += 1
    return out


def scramble(dur=1.4, seed=30, reverse=False):
    """Encryption sweeping over the data: stepped, crunchy, pitch-random digital noise."""
    n = int(dur * SR)
    r = _rng(seed)
    t = np.arange(n) / SR
    steps = int(dur * 38) + 1
    f = np.repeat(r.choice([hz('F4'), hz('Ab4'), hz('Bb4'), hz('C5'), hz('Eb5'), hz('F5'), hz('Ab5'), hz('C6')], steps), n // steps + 1)[:n]
    sq = np.sign(np.sin(TAU * np.cumsum(f) / SR))
    held = np.repeat(r.standard_normal(n // 60 + 1), 60)[:n]  # sample-and-hold noise = bit-crushed hiss
    x = t / dur
    y = (sq * 0.5 + held * 0.5) * np.sin(TAU * 31 * t) * np.sin(np.pi * x) ** 0.7
    y = bp(y, 400, 3000) * (1 - x) + bp(y, 3000, 11000) * x  # the band climbs as the wave passes
    y = stereo(y, 0) * 0.5
    y[:, 0] *= 1 - 0.6 * x; y[:, 1] *= 0.4 + 0.6 * x  # sweeps left to right
    return fade(y[::-1] if reverse else y, 0.01, 0.04)


def unscramble(dur=1.6):
    """Decryption: the digital noise clears into a clean chord."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    chord = sum(np.sin(TAU * hz(nn) * t) for nn in ['F4', 'A4', 'C5', 'F5']) / 4
    y = scramble(dur, seed=31, reverse=True) * (1 - x)[:, None] ** 1.5 * 1.3 + stereo(chord) * (x ** 2)[:, None] * 0.5
    return reverb(fade(y, 0.01, 0.25), decay=2.2, wet=0.3, bright=6000)


def glitch(dur=0.45, seed=40):
    """A connection failing: a stuttering, sinking buzz with crackle."""
    n = int(dur * SR)
    r = _rng(seed)
    t = np.arange(n) / SR
    ph, _ = _sweep(260, 90, dur, 0.6)
    gate = np.repeat((r.random(n // 900 + 1) > 0.35).astype(float), 900)[:n]
    y = np.sign(np.sin(ph)) * gate * 0.5 + hp(noise(n, seed), 2500) * np.repeat((r.random(n // 300 + 1) > 0.7).astype(float), 300)[:n] * 0.7
    return fade(stereo(lp(y, 6000)) * (1 - t / dur)[:, None] ** 0.6 * 0.6, 0.002, 0.03)


def alert_low(note='Bb2', dur=0.42):
    """Something missing: a low, soft, slightly sour double tone. Not a cartoon buzzer."""
    t = secs(dur)
    f = hz(note)
    y = sum(2 * ((f * d * t) % 1) - 1 for d in (1, 1.059, 2.0)) / 3
    y = lp(y, 900, 4) * np.minimum(1, t / 0.012) * np.exp(-t / 0.16)
    return reverb(stereo(fade(y, 0.002, 0.05)) * 0.9, decay=0.9, wet=0.2, bright=2000)


def radio_pulse(dur=0.4, carrier=330, am=27, seed=50):
    """One radio wavefront leaving an antenna."""
    ph, t = _sweep(carrier * 1.25, carrier * 0.85, dur)
    x = t / dur
    y = np.sin(ph) * (0.5 + 0.5 * np.sin(TAU * am * t)) * np.sin(np.pi * x) ** 1.5
    y = y * 0.7 + bp(noise(len(t), seed), 900, 3500) * np.sin(np.pi * x) ** 3 * 0.25 * (0.5 + 0.5 * np.sin(TAU * am * 2 * t))
    return fade(stereo(y), 0.01, 0.04) * 0.7


def convert(up=True, dur=0.38):
    """Radio becoming light (up) or light becoming radio (down): a fast chirp with a bright edge."""
    ph, t = _sweep(280, 4200, dur, 1.5) if up else _sweep(4200, 280, dur, 0.7)
    x = t / dur
    y = np.sin(ph + 0.8 * np.sin(ph * 0.5)) * (x ** 1.5 if up else (1 - x) ** 1.2)
    ping = np.zeros_like(y)
    if up:
        tp = secs(0.9)
        tail = stereo(np.sin(TAU * hz('C6') * tp) * np.exp(-tp / 0.2) * 0.6)
        out = np.zeros((len(y) + len(tp), 2)); out[: len(y)] += stereo(fade(y, 0.005, 0.004)) * 0.5; out[len(y):] += tail
    else:
        tp = secs(0.5)
        low = stereo(np.sin(TAU * 330 * tp) * (0.5 + 0.5 * np.sin(TAU * 27 * tp)) * np.exp(-tp / 0.15) * 0.6)
        out = np.zeros((len(y) + len(tp), 2)); out[: len(y)] += stereo(fade(y, 0.004, 0.01)) * 0.5; out[len(y) - 400: len(y) - 400 + len(tp)] += low
    return reverb(out, decay=1.2, wet=0.2, bright=8000)


def power_up(dur=0.9):
    """A charge that rises and lands with a push (a boost, a machine switching on)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    ph, _ = _sweep(hz('F2'), hz('F4'), dur, 1.3)
    saw = sum(np.sin(k * ph) / k for k in range(1, 9))
    y = saw * x ** 1.5 * (0.7 + 0.3 * np.sin(TAU * np.cumsum(6 + 30 * x) / SR))
    y = stereo(lp(y, 600 + 5000 * 1, 2)) * 0.45
    out = np.zeros((n + SR, 2))
    out[:n] += fade(y, 0.02, 0.01)
    put(out, thud(55, 0.6) * 0.9, dur - 0.01)
    put(out, light_tone(0.9, 'F5')[: int(0.9 * SR)] * 0.8, dur - 0.01)
    return reverb(out, decay=1.5, wet=0.2, bright=6000)


def send_whoop(dur=0.16):
    """A message sending: a quick soft upward whoop (our own, not Apple's)."""
    ph, t = _sweep(480, 1150, dur, 0.8)
    x = t / dur
    y = (np.sin(ph) + 0.25 * np.sin(2 * ph)) * np.sin(np.pi * x) ** 0.8 + hp(noise(len(t), 60), 4000) * np.sin(np.pi * x) ** 2 * 0.12
    return reverb(stereo(fade(y, 0.004, 0.02)) * 0.6, decay=0.6, wet=0.15, bright=7000)


def receive_tone():
    """A message arriving: two soft bell notes (our own, not Apple's)."""
    out = np.zeros((int(2.6 * SR), 2))
    for i, n in enumerate(['C6', 'F6']):
        t = secs(1.6)
        f = hz(n)
        y = (np.sin(TAU * f * t) + 0.3 * np.sin(TAU * 2 * f * t) * np.exp(-t / 0.1) + 0.12 * np.sin(TAU * 3.01 * f * t) * np.exp(-t / 0.06)) * np.exp(-t / 0.32)
        put(out, stereo(fade(y, 0.002, 0.1)) * (0.6 if i == 0 else 0.5), i * 0.13)
    return reverb(out, decay=1.5, wet=0.25, bright=8000)


def dive(dur=1.3, seed=70):
    """Diving into something: a rising rush with a swept resonance, like a tunnel closing in."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    src = np.stack([noise(n, seed), noise(n, seed + 1)], 1)
    y = np.zeros((n, 2))
    for i, m in enumerate(np.geomspace(200, 9000, 6)):
        y += bp(src, m * 0.8, m * 1.25, 2) * np.clip(1 - np.abs(x * 5 - i), 0, 1)[:, None]
    ph, _ = _sweep(hz('F3'), hz('C6'), dur, 2.0)
    y = y * (x ** 1.5)[:, None] * 0.8 + stereo(np.sin(ph) + 0.5 * np.sin(2 * ph)) * (x ** 2.5)[:, None] * 0.3
    # a short comb gives the glassy, tubular colour
    d = int(0.0021 * SR)
    y[d:] += y[:-d] * 0.6
    return fade(y * 0.6, 0.02, 0.02)


def sputnik(n=3, gap=0.3):
    """A satellite: thin, warbling beeps."""
    out = np.zeros((int((n * gap + 1.2) * SR), 2))
    for i in range(n):
        t = secs(0.12)
        y = np.sin(TAU * 1480 * t + 0.6 * np.sin(TAU * 41 * t)) * np.sin(np.pi * t / 0.12) ** 0.4
        put(out, stereo(fade(bp(y, 900, 2400), 0.004, 0.01), 0.3) * 0.5, i * gap)
    out[: int(n * gap * SR)] += bp(np.stack([noise(int(n * gap * SR), 80), noise(int(n * gap * SR), 81)], 1), 2000, 6000) * 0.015
    return reverb(out, decay=1.4, wet=0.3, bright=5000)


MORSE = dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', '.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --.. ----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.'.split()))


def telegraph(text='GLORY', unit=0.075, seed=90):
    """A telegraph sounder tapping out `text` in Morse: a clack down and a lighter clack up per mark."""
    def clack(up, r):
        t = secs(0.07)
        body = np.sin(TAU * (1250 if up else 880) * t) * np.exp(-t / 0.006) + 0.7 * np.sin(TAU * (2900 if up else 2300) * t) * np.exp(-t / 0.003)
        return stereo(fade(body + hp(noise(len(t), r), 2000) * np.exp(-t / 0.0015) * 0.8, 0.0003, 0.01), -0.1) * (0.6 if up else 1.0)
    r = _rng(seed)
    marks, t = [], 0.0
    for ch in text.upper():
        if ch == ' ':
            t += unit * 4
            continue
        for sym in MORSE[ch]:
            d = unit * (3 if sym == '-' else 1)
            marks.append((t, d))
            t += d + unit
        t += unit * 2
    out = np.zeros((int((t + 0.6) * SR), 2))
    for s, d in marks:
        j = r.uniform(-0.006, 0.006)  # a human hand on the key
        put(out, clack(False, int(s * 1000)), s + j)
        put(out, clack(True, int(s * 1000) + 1), s + d + j)
    return reverb(bp(out, 500, 6000), decay=0.7, wet=0.25, bright=3500) * 0.8


def sonar(note='Eb6', dur=3.2):
    """One sonar ping fading into the deep."""
    t = secs(0.5)
    y = np.sin(TAU * hz(note) * t) * np.minimum(1, t / 0.003) * np.exp(-t / 0.09)
    return reverb(stereo(y) * 0.5, decay=dur, wet=0.9, bright=4500, pre=0.09, dry=1.0)[: int(dur * SR)]


def bubbles(dur=1.2, count=26, seed=100):
    """A rush of bubbles."""
    out = np.zeros((int((dur + 0.3) * SR), 2))
    r = _rng(seed)
    for _ in range(count):
        d = r.uniform(0.02, 0.07)
        ph, t = _sweep(r.uniform(350, 900), r.uniform(900, 2400), d, 0.6)
        put(out, stereo(np.sin(ph) * np.sin(np.pi * t / d) ** 0.5, r.uniform(-0.7, 0.7)) * r.uniform(0.2, 0.7), r.uniform(0, dur) ** 1.4 / dur ** 0.4)
    return lp(out, 3500) * 0.6


def pop(f=520):
    """A soft pop: a bubble or small card appearing."""
    ph, t = _sweep(f * 1.9, f, 0.05, 0.5)
    return stereo(fade(np.sin(ph) * np.exp(-t / 0.018), 0.001, 0.01)) * 0.6


def laser_cut(dur=0.34, seed=110):
    """A cut line sweeping through the data."""
    ph, t = _sweep(5200, 900, dur, 0.5)
    x = t / dur
    y = (np.sign(np.sin(ph)) * 0.35 + np.sin(ph * 0.5) * 0.4) * np.sin(np.pi * x) ** 0.6 + hp(noise(len(t), seed), 5000) * np.sin(np.pi * x) * 0.25
    a = (-0.8 + 1.6 * x + 1) * np.pi / 4
    return fade(np.stack([y * np.cos(a), y * np.sin(a)], 1) * 0.5, 0.004, 0.03)


def swarm(dur=1.8, seed=120):
    """Hundreds of small things taking off at once: a soft fluttering rush."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    src = np.stack([noise(n, seed), noise(n, seed + 1)], 1)
    flut = 0.55 + 0.45 * np.sin(TAU * np.cumsum(17 + 16 * np.sin(TAU * 0.9 * t)) / SR)
    y = bp(src, 700, 6000) * flut[:, None] * (np.sin(np.pi * x ** 0.6) ** 1.5)[:, None]
    return fade(y * 0.5 + data_chatter(dur, rate=120, seed=seed, lo='F6', spread=10)[:n] * 0.5, 0.02, 0.2)


def crackle(dur=6.0, seed=130):
    """Old-recording crackle, to mark the past."""
    n = int(dur * SR)
    r = _rng(seed)
    y = np.zeros(n)
    idx = r.integers(0, n, int(dur * 26))
    y[idx] = r.standard_normal(len(idx)) * r.random(len(idx)) ** 3
    y = bp(y, 900, 7000) * 6 + bp(noise(n, seed + 1), 300, 3000) * 0.012
    return fade(stereo(y, -0.1) * 0.5 + stereo(np.roll(y, 37), 0.2) * 0.3, 0.2, 0.4)


def wind(dur=6.0, seed=140):
    """Wind over open water."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    src = np.stack([noise(n, seed), noise(n, seed + 1)], 1)
    g = 0.5 + 0.3 * np.sin(TAU * 0.13 * t) + 0.2 * np.sin(TAU * 0.31 * t + 1)
    return fade((bp(src, 180, 700) * 0.8 + bp(src, 700, 2200) * 0.25 * (0.5 + 0.5 * np.sin(TAU * 0.21 * t))[:, None]) * g[:, None] * 0.25, 0.6, 0.8)


ALL = {
    'sub_drop': sub_drop, 'thud': thud, 'whoosh': whoosh, 'riser': riser, 'slow_down': slow_down, 'light_zip': light_zip, 'light_tone': light_tone,
    'blip': blip, 'glass_ping': glass_ping, 'chime': chime, 'data_chatter': data_chatter, 'tick': tick, 'counter': counter, 'scramble': scramble,
    'unscramble': unscramble, 'glitch': glitch, 'alert_low': alert_low, 'radio_pulse': radio_pulse, 'convert': convert, 'power_up': power_up,
    'send_whoop': send_whoop, 'receive_tone': receive_tone, 'dive': dive, 'sputnik': sputnik, 'telegraph': telegraph, 'sonar': sonar, 'bubbles': bubbles,
    'pop': pop, 'laser_cut': laser_cut, 'swarm': swarm, 'crackle': crackle, 'wind': wind,
}

if __name__ == '__main__':
    for name, fn in ALL.items():
        x = fn()
        assert np.isfinite(x).all(), name
        m = x.mean(1)
        S = np.abs(np.fft.rfft(m)) ** 2
        cen = (np.fft.rfftfreq(len(m), 1 / SR) * S).sum() / S.sum()
        write(os.path.join(HERE, 'designed', name + '.wav'), x)
        print(f'{name:14s} {len(x) / SR:5.2f}s  peak {20 * np.log10(np.abs(x).max() + 1e-9):6.1f} dB  rms {10 * np.log10((x ** 2).mean() + 1e-12):6.1f} dB  centroid {cen:6.0f} Hz')
