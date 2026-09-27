#!/usr/bin/env python3
# /// script
# requires-python = ">=3.9"
# dependencies = ["pillow", "numpy"]
# ///
"""One timeline file per project; every output is built from it.

    reel.py check   timeline.json                 validate files, frames, overlaps, stem lengths
    reel.py render  timeline.json -o out.mp4 [--preview]
    reel.py mix     timeline.json -o mix.wav      the enabled audio tracks as one PCM stem
    reel.py resolve timeline.json -o build.lua    Resolve console script (dofile it)
    reel.py place   INPUT -o out.mov --box X,Y,W,H --frames N [...]
    reel.py view    VIDEO START END [--words words.json] [--mark T ...] [-o out.png]
    reel.py qa      timeline.json OUT.mp4 [--dir qa/]

timeline.json (paths relative to the file; all times are integer output frames):

{
  "fps": 30, "width": 1080, "height": 1920,
  "frames": 1894,                                   optional; default = last clip end
  "resolve": {"project": "...", "timeline": "v7", "base": "v6",
              "drp": "out.drp", "render": {"dir": ".", "name": "v7"}},   optional
  "video": [                                        bottom track first
    {"name": "Camera", "keep": false, "clips": [
      {"file": "cam.mov", "in": 15, "start": 0, "frames": 174}]}],
  "audio": [
    {"name": "Dialogue", "enabled": true, "clips": [
      {"file": "cam.mov", "in": 15, "start": 0, "frames": 174,
       "gain_db": 0, "fade": 0.008}]}]
}

Video clips are fitted (contain, centred) to the frame and stacked upward, so
overlays should be full-frame RGBA made with `place`. Audio clips get `fade`
seconds of fade at both ends (default 8 ms: removes cut clicks, keeps
consonants; use 0 for a continuous stem). Other clip keys (id, cue, source, reason) are carried
along untouched. `keep: true` tells `resolve` to leave that track as it is in
the duplicated `base` timeline; `render` still uses its clips.
"""
import argparse
import json
import math
import subprocess
import sys
import tempfile
from functools import lru_cache
from pathlib import Path

IMAGE = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".bmp"}
RATE = 48000


# ---------------------------------------------------------------- timeline

def load(path):
    path = Path(path).resolve()
    t = json.loads(path.read_text())
    t["_dir"] = path.parent
    for kind in ("video", "audio"):
        for track in t.setdefault(kind, []):
            for c in track.setdefault("clips", []):
                c["_path"] = (path.parent / c["file"]).resolve()
                c.setdefault("in", 0)
    ends = [c["start"] + c["frames"] for k in ("video", "audio") for tr in t[k] for c in tr["clips"]]
    t.setdefault("frames", max(ends, default=0))
    return t


@lru_cache(None)
def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration:stream=codec_type,r_frame_rate,width,height,nb_frames",
                          "-of", "json", str(path)], capture_output=True, text=True)
    if out.returncode:
        return None
    j = json.loads(out.stdout)
    v = next((s for s in j.get("streams", []) if s["codec_type"] == "video"), None)
    num, den = (v or {}).get("r_frame_rate", "0/1").split("/")
    return {"duration": float(j.get("format", {}).get("duration", 0) or 0),
            "fps": float(num) / float(den or 1) if float(den or 1) else 0,
            "video": v is not None,
            "audio": any(s["codec_type"] == "audio" for s in j.get("streams", [])),
            "width": (v or {}).get("width"), "height": (v or {}).get("height")}


def check(t):
    """Errors make every output wrong; warnings need a look."""
    errors, warnings = [], []
    for key in ("fps", "width", "height", "frames"):
        if not isinstance(t.get(key), int) or t[key] <= 0:
            errors.append(f"{key} must be a positive integer")
    if errors:
        return errors, warnings
    fps = t["fps"]
    for kind in ("video", "audio"):
        for n, track in enumerate(t[kind], 1):
            label = f"{kind} {n} ({track.get('name', '')})"
            if track.get("keep") and not t.get("resolve", {}).get("base"):
                errors.append(f"{label}: keep needs resolve.base")
            last = None
            for c in sorted(track["clips"], key=lambda c: c.get("start", 0)):
                where = f"{label} {c.get('id', c['file'])}@{c.get('start')}"
                if not all(isinstance(c.get(k), int) for k in ("start", "frames", "in")):
                    errors.append(f"{where}: start, frames and in must be integer frames")
                    continue
                if c["frames"] <= 0 or c["start"] < 0 or c["in"] < 0:
                    errors.append(f"{where}: negative or empty")
                if last and c["start"] < last["start"] + last["frames"]:
                    errors.append(f"{where}: overlaps previous clip ending {last['start'] + last['frames']}")
                last = c
                if c["start"] + c["frames"] > t["frames"]:
                    errors.append(f"{where}: ends after the timeline ({t['frames']})")
                if not c["_path"].exists():
                    errors.append(f"{where}: missing {c['_path']}")
                    continue
                if c["_path"].suffix.lower() in IMAGE:
                    if kind == "audio":
                        errors.append(f"{where}: image on an audio track")
                    continue
                p = probe(c["_path"])
                if p is None:
                    errors.append(f"{where}: ffprobe cannot read it")
                    continue
                if kind == "audio" and not p["audio"]:
                    errors.append(f"{where}: no audio stream")
                if kind == "video" and not p["video"]:
                    errors.append(f"{where}: no video stream")
                short = (c["in"] + c["frames"]) / fps - p["duration"]
                if short > 1 / fps:
                    errors.append(f"{where}: source is {short:.3f}s shorter than in+frames")
        if kind == "audio":
            for track in t["audio"]:
                if track.get("enabled", True) and track["clips"]:
                    end = max(c["start"] + c["frames"] for c in track["clips"])
                    if end < t["frames"] and len(track["clips"]) == 1:
                        warnings.append(f"audio {track.get('name')}: stem ends at {end}, picture at {t['frames']}")
    if not any(tr.get("enabled", True) and tr["clips"] for tr in t["audio"]):
        warnings.append("no enabled audio")
    return errors, warnings


def require_valid(t):
    errors, warnings = check(t)
    for w in warnings:
        print("warning:", w, file=sys.stderr)
    if errors:
        sys.exit("timeline errors:\n  " + "\n  ".join(errors))


# ---------------------------------------------------------------- ffmpeg

def run(cmd):
    subprocess.run(cmd, check=True)


def clip_input(c, fps, audio=False):
    """-ss before -i is frame-accurate for decoding; -t bounds the read."""
    dur = f"{c['frames'] / fps + (0 if audio else 1 / fps):.6f}"
    if c["_path"].suffix.lower() in IMAGE:
        return ["-loop", "1", "-framerate", str(fps), "-t", dur, "-i", str(c["_path"])]
    return ["-ss", f"{c['in'] / fps:.6f}", "-t", dur, "-i", str(c["_path"])]


def audio_graph(t, first_input):
    """Inputs and filters for the enabled audio tracks, output label [aout]."""
    fps, total = t["fps"], t["frames"] / t["fps"]
    args, chains, labels, i = [], [], [], first_input
    for track in t["audio"]:
        if not track.get("enabled", True):
            continue
        for c in track["clips"]:
            args += clip_input(c, fps, audio=True)
            d = c["frames"] / fps
            f = min(c.get("fade", 0.008), d / 2)
            fades = f",afade=t=in:d={f:.4f},afade=t=out:st={d - f:.6f}:d={f:.4f}" if f > 0 else ""
            delay = round(c["start"] / fps * RATE)
            chains.append(f"[{i}:a]aresample={RATE},aformat=sample_fmts=fltp:channel_layouts=stereo,"
                          f"apad,atrim=end_sample={round(d * RATE)}{fades},"
                          f"volume={c.get('gain_db', 0)}dB,adelay={delay}S:all=1[a{i}]")
            labels.append(f"[a{i}]")
            i += 1
    if labels:
        chains.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,"
                      f"apad,atrim=end_sample={round(total * RATE)}[aout]")
    else:
        chains.append(f"anullsrc=r={RATE}:cl=stereo,atrim=end_sample={round(total * RATE)}[aout]")
    return args, chains


def cmd_render(t, out, preview=False):
    require_valid(t)
    fps, W, H, N = t["fps"], t["width"], t["height"], t["frames"]
    args, chains, tracks, i = [], [], [], 0
    for n, track in enumerate(t["video"]):
        parts, pos = [], 0
        for c in sorted(track["clips"], key=lambda c: c["start"]):
            if c["start"] > pos:
                parts.append(f"color=c=black@0:s={W}x{H}:r={fps},format=rgba,trim=end_frame={c['start'] - pos}")
            args += clip_input(c, fps)
            # tpad+trim guarantees exactly `frames` frames even when a decode comes up short
            parts.append(f"[{i}:v]fps={fps},scale={W}:{H}:force_original_aspect_ratio=decrease,"
                         f"format=rgba,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black@0,"
                         f"tpad=stop=-1:stop_mode=clone,trim=end_frame={c['frames']},setpts=PTS-STARTPTS")
            pos, i = c["start"] + c["frames"], i + 1
        if not parts:
            continue
        if pos < N:
            parts.append(f"color=c=black@0:s={W}x{H}:r={fps},format=rgba,trim=end_frame={N - pos}")
        names = []
        for k, p in enumerate(parts):
            chains.append(f"{p},setsar=1[t{n}p{k}]")
            names.append(f"[t{n}p{k}]")
        chains.append("".join(names) + f"concat=n={len(names)}:v=1:a=0,trim=end_frame={N}[t{n}]")
        tracks.append(f"[t{n}]")
    chains.append(f"color=c=black:s={W}x{H}:r={fps},trim=end_frame={N}[base]")
    below = "[base]"
    for k, lab in enumerate(tracks):
        chains.append(f"{below}{lab}overlay=format=auto:eof_action=pass[o{k}]")
        below = f"[o{k}]"
    size = f",scale={W // 2 // 2 * 2}:{H // 2 // 2 * 2}" if preview else ""
    chains.append(f"{below}format=yuv420p{size}[vout]")
    a_args, a_chains = audio_graph(t, i)
    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as f:
        f.write(";\n".join(chains + a_chains))
    enc = ["-preset", "veryfast", "-crf", "28"] if preview else ["-preset", "medium", "-crf", "18"]
    run(["ffmpeg", "-v", "error", "-nostats", "-y", *args, *a_args, "-filter_complex_script", f.name,
         "-map", "[vout]", "-map", "[aout]", "-r", str(fps), "-frames:v", str(N),
         "-c:v", "libx264", *enc, "-c:a", "aac", "-b:a", "192k", "-ar", str(RATE),
         "-movflags", "+faststart", str(out)])
    Path(f.name).unlink()
    print(out)


def cmd_mix(t, out):
    require_valid(t)
    args, chains = audio_graph(t, 0)
    run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", ";".join(chains),
         "-map", "[aout]", "-c:a", "pcm_s24le", "-ar", str(RATE), str(out)])
    print(out)


# ---------------------------------------------------------------- resolve

def lua(s):
    return "'" + str(s).replace("\\", "\\\\").replace("'", "\\'") + "'"


def still_movie(c, fps, cache):
    """Resolve gives appended stills a 5 s default length; a movie keeps the frame count."""
    cache.mkdir(parents=True, exist_ok=True)
    out = cache / f"{c['_path'].stem}-{c['frames']}f.mov"
    if not out.exists():
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(fps), "-i", str(c["_path"]),
             "-frames:v", str(c["frames"]), "-vf", "format=argb", "-c:v", "qtrle", str(out)])
    return out


def cmd_resolve(t, out):
    """Emit a Lua script for Workspace > Console: dofile('/abs/build.lua')."""
    require_valid(t)
    r = t.get("resolve") or sys.exit("timeline needs a resolve block (project, timeline)")
    fps, N = t["fps"], t["frames"]
    for track in t["audio"]:
        for c in track["clips"]:
            if c.get("gain_db", 0):
                sys.exit(f"audio {track.get('name')}: gain_db is not applied in Resolve; "
                         "bake it with `reel.py mix` and place the stem")
        if len(track["clips"]) > 1 and not track.get("keep"):
            print(f"warning: audio {track.get('name')} has cuts without fades in Resolve; "
                  "prefer one `reel.py mix` stem", file=sys.stderr)
    L = [f"local pm=resolve:GetProjectManager();local p=pm:GetCurrentProject()",
         f"assert(p and p:GetName()=={lua(r['project'])},'open project '..{lua(r['project'])})",
         "local mp=p:GetMediaPool()",
         "for i=1,p:GetTimelineCount() do assert(p:GetTimelineByIndex(i):GetName()~="
         f"{lua(r['timeline'])},'timeline exists: '..{lua(r['timeline'])}) end"]
    if r.get("base"):
        L += ["local base;for i=1,p:GetTimelineCount() do local x=p:GetTimelineByIndex(i);"
              f"if x:GetName()=={lua(r['base'])} then base=x end end;assert(base,'no base timeline')",
              f"local t=base:DuplicateTimeline({lua(r['timeline'])});assert(t and p:SetCurrentTimeline(t))"]
        for kind in ("video", "audio"):
            for n, track in enumerate(t[kind], 1):
                if not track.get("keep"):
                    L.append(f"if t:GetTrackCount('{kind}')>={n} then local x=t:GetItemListInTrack('{kind}',{n});"
                             f"if #x>0 then assert(t:DeleteClips(x,false)) end end")
    else:
        L += [f"assert(p:SetSettings({{timelineResolutionWidth='{t['width']}',"
              f"timelineResolutionHeight='{t['height']}',timelineFrameRate='{fps}'}}))",
              f"local t=mp:CreateEmptyTimeline({lua(r['timeline'])});assert(t and p:SetCurrentTimeline(t))"]
    # record frames are absolute: a new timeline starts at 01:00:00:00, an imported one may start at 0
    L += ["local media,T0={},t:GetStartFrame()",
          "local function add(file,s,e,rec,n,track,kind)",
          " media[file]=media[file] or mp:ImportMedia({file})[1];assert(media[file],file)",
          " local c=mp:AppendToTimeline({{mediaPoolItem=media[file],startFrame=s,endFrame=e,"
          "recordFrame=T0+rec,trackIndex=track,mediaType=kind}})[1]",
          " assert(c and c:GetStart()==T0+rec and c:GetDuration()==n,"
          "file..' at '..rec..' got '..(c and (c:GetStart()-T0)..'+'..c:GetDuration() or 'nil'))",
          "end"]
    cache = t["_dir"] / ".reel"
    for kind, mtype, extra in (("video", 1, ""), ("audio", 2, ",'stereo'")):
        for n, track in enumerate(t[kind], 1):
            L.append(f"while t:GetTrackCount('{kind}')<{n} do assert(t:AddTrack('{kind}'{extra})) end")
            if track.get("name"):
                L.append(f"t:SetTrackName('{kind}',{n},{lua(track['name'])})")
            if kind == "audio":
                L.append(f"assert(t:SetTrackEnable('audio',{n},{str(track.get('enabled', True)).lower()}))")
            if track.get("keep"):
                continue
            for c in track["clips"]:
                path = c["_path"]
                if path.suffix.lower() in IMAGE:
                    path, s = still_movie(c, fps, cache), 0
                    e = c["frames"]
                else:
                    # startFrame/endFrame count the source's own frames; pure audio files use timeline frames
                    src = probe(path)["fps"] if probe(path)["video"] else fps
                    s = round(c["in"] * src / fps)
                    e = s + round(c["frames"] * src / fps)
                L.append(f"add({lua(path)},{s},{e},{c['start']},{c['frames']},{n},{mtype})")
    L.append(f"assert(t:GetEndFrame()-T0=={N},'length '..(t:GetEndFrame()-T0))")
    L.append("assert(pm:SaveProject())")
    if r.get("drp"):
        L.append(f"assert(pm:ExportProject(p:GetName(),{lua((t['_dir'] / r['drp']).resolve())},true))")
    if r.get("render"):
        R = r["render"]
        L += ["assert(p:SetCurrentRenderFormatAndCodec('mp4','H264'))",
              f"assert(p:SetRenderSettings({{SelectAllFrames=true,TargetDir={lua((t['_dir'] / R['dir']).resolve())},"
              f"CustomName={lua(R['name'])},FormatWidth={t['width']},FormatHeight={t['height']},"
              "ExportVideo=true,ExportAudio=true,AudioSampleRate=48000,NetworkOptimization=true}))",
              "assert(pm:SaveProject());local job=p:AddRenderJob();assert(job and p:StartRendering({job}))",
              "print('RENDER STARTED',job)"]
    L.append(f"print('TIMELINE READY',{lua(r['timeline'])},t:GetTrackCount('video'),t:GetTrackCount('audio'))")
    Path(out).write_text("\n".join(L) + "\n")
    print(f"{out}\nIn Resolve: Workspace > Console > Lua, then dofile({lua(Path(out).resolve())})")


# ---------------------------------------------------------------- place

def cmd_place(a):
    """Full-frame transparent movie with INPUT fitted into --box."""
    x, y, w, h = map(int, a.box.split(","))
    W, H = map(int, a.size.split("x"))
    n, fps = a.frames, a.fps
    fit = "decrease" if a.fit == "contain" else "increase"
    vf = [f"setpts=(PTS-STARTPTS)/{a.speed}", f"fps={fps}",
          f"scale={w}:{h}:force_original_aspect_ratio={fit}", f"crop='min(iw,{w})':'min(ih,{h})'",
          "format=rgba", f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black@0",
          f"pad={W}:{H}:{x}:{y}:color=black@0", "tpad=stop=-1:stop_mode=clone"]
    if a.fade > 0:
        vf += [f"fade=t=in:st=0:d={a.fade}:alpha=1", f"fade=t=out:st={n / fps - a.fade}:d={a.fade}:alpha=1"]
    src = ["-loop", "1", "-framerate", str(fps)] if Path(a.input).suffix.lower() in IMAGE else ["-ss", str(a.in_)]
    run(["ffmpeg", "-v", "error", "-y", *src, "-i", a.input, "-vf", ",".join(vf) + ",format=argb",
         "-frames:v", str(n), "-an", "-c:v", "qtrle", a.output])
    print(a.output)


# ---------------------------------------------------------------- view

def load_words(path):
    j = json.loads(Path(path).read_text())
    if isinstance(j, dict):
        j = [w for s in j.get("segments", []) for w in s.get("words", [])] or j.get("words", [])
    return [w for w in j if "start" in w and "end" in w]


def view(video, start, end, out, words=None, marks=(), n=8):
    """Filmstrip + waveform + words for [start, end] seconds of VIDEO."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    start, end = max(0.0, start), max(start + 0.1, end)
    frames = []
    for k in range(n):
        ts = start + (end - start) * (k + 0.5) / n
        png = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{ts:.3f}", "-i", str(video), "-frames:v", "1",
                              "-vf", "scale=-2:300", "-f", "image2pipe", "-vcodec", "png", "-"],
                             capture_output=True).stdout
        if png:
            import io
            frames.append(Image.open(io.BytesIO(png)).convert("RGB"))
    fw = frames[0].width if frames else 170
    W = max(fw * n, 800)
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-t", f"{end - start:.3f}", "-i", str(video),
                          "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768 if pcm else np.zeros(1, np.float32)
    cols = np.array_split(x, W)
    peak = np.array([np.abs(c).max() if len(c) else 0 for c in cols])
    rms = np.array([np.sqrt((c ** 2).mean()) if len(c) else 0 for c in cols])
    db = 20 * np.log10(np.maximum(rms, 1e-6))
    img = Image.new("RGB", (W, 300 + 160 + 90), "#111")
    for k, f in enumerate(frames):
        img.paste(f, (k * fw, 0))
    d = ImageDraw.Draw(img)
    font = ImageFont.load_default(size=15)
    top, mid, amp = 300, 380, 75
    for c in range(W):
        if db[c] < -40:  # silence shading
            d.line([(c, top), (c, top + 160)], fill="#262a36")
        h = min(1.0, peak[c]) * amp
        d.line([(c, mid - h), (c, mid + h)], fill="#7fb3ff" if db[c] < -1 else "#ff5a4f")
    px = lambda s: (s - start) / (end - start) * W
    shown = [w for w in words or [] if w["end"] >= start and w["start"] <= end]
    for k, w in enumerate(shown):  # alternate rows so neighbouring words stay legible
        a, b = px(w["start"]), px(w["end"])
        d.rectangle([a, top + 150, b, top + 157], fill="#e0e0e0" if k % 2 else "#9a9a9a")
        d.text((a + 1, top + 162 + 18 * (k % 2)), str(w.get("word", w.get("text", ""))).strip(),
               fill="#e0e0e0", font=font)
    for m in marks:
        d.line([(px(m), 0), (px(m), top + 160)], fill="#ffd400", width=2)
    step = 0.5 if end - start <= 6 else 1.0
    s = math.ceil(start / step) * step
    while s <= end:
        d.line([(px(s), top + 202), (px(s), top + 212)], fill="#888")
        d.text((px(s) + 2, top + 214), f"{s:.1f}", fill="#888", font=font)
        s += step
    img.save(out)
    return out


# ---------------------------------------------------------------- qa

def cmd_qa(t, video, qa_dir, words=None):
    """Numbers and join images for the exact deliverable; listening and taste stay with people."""
    fps, N = t["fps"], t["frames"]
    qa_dir = Path(qa_dir)
    qa_dir.mkdir(parents=True, exist_ok=True)
    report = {"file": str(video), "problems": []}
    v = json.loads(subprocess.run(["ffprobe", "-v", "error", "-count_packets", "-show_entries",
                                   "stream=codec_type,width,height,r_frame_rate,nb_read_packets,duration",
                                   "-of", "json", str(video)], capture_output=True, text=True).stdout)["streams"]
    vs = next(s for s in v if s["codec_type"] == "video")
    aus = [s for s in v if s["codec_type"] == "audio"]
    num, den = map(int, vs["r_frame_rate"].split("/"))
    report.update(width=vs["width"], height=vs["height"], fps=num / den, frames=int(vs["nb_read_packets"]),
                  audio_seconds=float(aus[0]["duration"]) if aus else None)
    if (vs["width"], vs["height"]) != (t["width"], t["height"]):
        report["problems"].append(f"size {vs['width']}x{vs['height']} != {t['width']}x{t['height']}")
    if abs(num / den - fps) > 0.01:
        report["problems"].append(f"fps {num / den:.3f} != {fps}")
    if report["frames"] != N:
        report["problems"].append(f"{report['frames']} frames != timeline {N}")
    if not aus:
        report["problems"].append("no audio stream")
    elif abs(report["audio_seconds"] - N / fps) > 0.05:
        report["problems"].append(f"audio {report['audio_seconds']:.3f}s vs picture {N / fps:.3f}s")
    dec = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-f", "null", "-"], capture_output=True, text=True)
    if dec.stderr.strip():
        report["problems"].append("decode errors: " + dec.stderr.strip()[:300])
    ln = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(video), "-af",
                         "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    try:
        j = json.loads(ln[ln.rindex("{"):ln.rindex("}") + 1])
        report.update(lufs=float(j["input_i"]), true_peak_dbtp=float(j["input_tp"]))
        if report["true_peak_dbtp"] > -1:
            report["problems"].append(f"true peak {report['true_peak_dbtp']} dBTP above -1")
    except (ValueError, KeyError):
        report["problems"].append("loudness not measurable")
    w = load_words(words) if words else None
    joins = sorted({c["start"] for c in (t["video"][0]["clips"] if t["video"] else []) if c["start"] > 0})
    report["join_views"] = []
    for f in joins:
        s = f / fps
        report["join_views"].append(str(view(video, s - 1.5, s + 1.5, qa_dir / f"join-{f:05d}.png", w, [s])))
    (qa_dir / "qa.json").write_text(json.dumps(report, indent=2))
    print(json.dumps(report, indent=2))
    return report


# ---------------------------------------------------------------- cli

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("check"); s.add_argument("timeline")
    s = sub.add_parser("render"); s.add_argument("timeline"); s.add_argument("-o", required=True)
    s.add_argument("--preview", action="store_true", help="half size, fast encode")
    s = sub.add_parser("mix"); s.add_argument("timeline"); s.add_argument("-o", required=True)
    s = sub.add_parser("resolve"); s.add_argument("timeline"); s.add_argument("-o", required=True)
    s = sub.add_parser("place"); s.add_argument("input"); s.add_argument("-o", dest="output", required=True)
    s.add_argument("--box", required=True, help="X,Y,W,H inside the frame")
    s.add_argument("--frames", type=int, required=True)
    s.add_argument("--size", default="1080x1920"); s.add_argument("--fps", type=int, default=30)
    s.add_argument("--in", dest="in_", type=float, default=0.0, help="source seconds")
    s.add_argument("--speed", type=float, default=1.0)
    s.add_argument("--fit", choices=("contain", "cover"), default="contain")
    s.add_argument("--fade", type=float, default=0.1, help="alpha fade seconds, 0 for none")
    s = sub.add_parser("view"); s.add_argument("video"); s.add_argument("start", type=float)
    s.add_argument("end", type=float); s.add_argument("--words"); s.add_argument("--frames", type=int, default=8)
    s.add_argument("--mark", type=float, action="append", default=[]); s.add_argument("-o")
    s = sub.add_parser("qa"); s.add_argument("timeline"); s.add_argument("video")
    s.add_argument("--dir", default="qa"); s.add_argument("--words", help="words JSON of the final audio")
    a = ap.parse_args(argv)
    if a.cmd == "check":
        errors, warnings = check(load(a.timeline))
        print(json.dumps({"ok": not errors, "errors": errors, "warnings": warnings}, indent=2))
        return 1 if errors else 0
    if a.cmd == "render":
        cmd_render(load(a.timeline), a.o, a.preview)
    elif a.cmd == "mix":
        cmd_mix(load(a.timeline), a.o)
    elif a.cmd == "resolve":
        cmd_resolve(load(a.timeline), a.o)
    elif a.cmd == "place":
        cmd_place(a)
    elif a.cmd == "view":
        words = load_words(a.words) if a.words else None
        print(view(a.video, a.start, a.end, a.o or f"view-{a.start:.2f}-{a.end:.2f}.png", words, a.mark, a.frames))
    elif a.cmd == "qa":
        return 1 if cmd_qa(load(a.timeline), a.video, a.dir, a.words)["problems"] else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
