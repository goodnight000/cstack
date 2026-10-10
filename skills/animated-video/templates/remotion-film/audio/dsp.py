# Small synthesis toolkit for designed sound effects and a score. numpy + scipy (+ ffmpeg for read/loudness).
# Everything is stereo float arrays of shape (n, 2) at SR unless a name says mono.
import json, os, subprocess, wave
import numpy as np
import scipy.signal as sg

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SEMIS = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}


def hz(n):
    """'Ab3' -> frequency. A number passes through."""
    if not isinstance(n, str):
        return float(n)
    return 440.0 * 2 ** ((SEMIS[n[:-1]] + (int(n[-1]) - 4) * 12 - 9) / 12)


def db(x):
    return 10 ** (x / 20)


def secs(d):
    return np.arange(int(round(d * SR))) / SR


def stereo(m, p=0.0):
    """Mono -> stereo with equal-power pan p in -1..1."""
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)], 1)


def _sos(kind, fc, order):
    fc = np.clip(fc, 12, SR * 0.47)
    return sg.butter(order, fc, kind, fs=SR, output='sos')


def lp(x, fc, order=2):
    return sg.sosfilt(_sos('low', fc, order), x, axis=0)


def hp(x, fc, order=2):
    return sg.sosfilt(_sos('high', fc, order), x, axis=0)


def bp(x, lo, hi, order=2):
    return sg.sosfilt(_sos('band', [lo, hi], order), x, axis=0)


def curve(times, keys):
    """Piecewise-linear automation: keys [(t, v), ...] sampled at `times`."""
    k = sorted(keys)
    return np.interp(times, [a for a, _ in k], [b for _, b in k])


def fade(x, a=0.005, r=0.02):
    x = x.copy()
    na, nr = min(len(x), int(a * SR)), min(len(x), int(r * SR))
    ramp = lambda n: 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, n))
    if na:
        x[:na] *= ramp(na)[:, None] if x.ndim == 2 else ramp(na)
    if nr:
        x[-nr:] *= ramp(nr)[::-1, None] if x.ndim == 2 else ramp(nr)[::-1]
    return x


def put(buf, x, at, gain=1.0):
    """Mix x into buf starting at `at` seconds (clipped to the buffer)."""
    i = int(round(at * SR))
    if i < 0:
        x, i = x[-i:], 0
    n = min(len(x), len(buf) - i)
    if n > 0:
        buf[i:i + n] += x[:n] * gain


def noise(n, seed):
    return np.random.default_rng(seed).standard_normal(n)


def reverb(x, decay=3.0, wet=0.3, bright=5000, seed=7, pre=0.02, dry=1.0):
    """Convolution reverb with a synthetic impulse: decaying, low-passed, decorrelated noise."""
    n = int(decay * 1.6 * SR)
    t = np.arange(n) / SR
    ir = np.stack([noise(n, seed), noise(n, seed + 1)], 1) * np.exp(-6.9 * t / decay)[:, None]
    ir = lp(ir, bright)
    ir[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))[:, None]
    ir /= np.sqrt((ir ** 2).sum(0)).mean()
    tail = np.stack([sg.fftconvolve(x[:, c], ir[:, c]) for c in (0, 1)], 1)
    out = np.zeros((len(x) + n + int(pre * SR), 2))
    out[: len(x)] += x * dry
    out[int(pre * SR): int(pre * SR) + len(tail)] += tail * wet
    return out


def echo(x, time, fb=0.35, wet=0.4, taps=6, cut=3500):
    """Ping-pong delay; each repeat is darker."""
    d = int(time * SR)
    out = np.zeros((len(x) + d * taps, 2))
    out[: len(x)] += x
    tap = x
    for i in range(1, taps + 1):
        tap = lp(tap[:, ::-1], cut) * fb if i > 1 else lp(tap[:, ::-1], cut) * wet
        out[d * i: d * i + len(tap)] += tap
    return out


def soft(x, drive=1.0):
    """Soft clip toward +/-1."""
    return np.tanh(x * drive) / np.tanh(drive)


def write(path, x, peak=None):
    """Save 16-bit stereo WAV. `peak` (dBFS) normalises first."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if x.ndim == 1:
        x = stereo(x)
    if peak is not None:
        x = x * db(peak) / max(1e-9, np.abs(x).max())
    x = np.clip(x, -1, 1)
    d = (np.random.default_rng(1).random(x.shape) - np.random.default_rng(2).random(x.shape)) / 32768  # TPDF dither
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x + d, -1, 1) * 32767).astype('<i2').tobytes())


def read(path):
    """Load any audio file as stereo float at SR (decoded by ffmpeg)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, '<f4').reshape(-1, 2).astype(np.float64)


def loudness(path):
    """Integrated LUFS, loudness range and true peak, measured by ffmpeg's ebur128."""
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = err[err.rfind('Summary:'):]
    val = lambda key: float(tail.split(key)[1].split()[0])
    return {'I': val('I:'), 'LRA': val('LRA:'), 'peak': val('Peak:')}


# ---- timing: the same src/words.json the film is timed from (align.py), loaded on first use ----
_words = None
_norm = lambda s: ''.join(c for c in s.lower() if c.isalnum() or c == "'")


def words():
    global _words
    if _words is None:
        _words = json.load(open(os.path.join(ROOT, 'src', 'words.json')))
    return _words


def cue(phrase, nth=None):
    """Start time (s) of the nth occurrence of a phrase in the narration. Mirrors cue() in src/lib.ts:
    a phrase said more than once needs an explicit nth."""
    W, p = words(), [_norm(w) for w in phrase.split()]
    hits = [W[i]['s'] for i in range(len(W) - len(p) + 1) if all(_norm(W[i + j]['w']) == x for j, x in enumerate(p))]
    if nth is None and len(hits) > 1:
        raise KeyError(f'cue "{phrase}" is said {len(hits)} times; pass nth')
    if (nth or 0) >= len(hits):
        raise KeyError(f'cue not found: {phrase}')
    return hits[nth or 0]


def cue_end(phrase, nth=None):
    """End time (s) of the phrase's last word."""
    W, s = words(), cue(phrase, nth)
    i = next(k for k, w in enumerate(W) if w['s'] == s)
    return W[i + len(phrase.split()) - 1]['e']
