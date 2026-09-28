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
    reel.py review  VIDEO [--plan PLAN.md] [--timeline timeline.json] [--dir review/]

timeline.json (paths relative to the file; all times are integer output frames):

{
  "fps": 30, "width": 1080, "height": 1920,
  "frames": 1894,                                   optional; default = last clip end
  "plan": "PLAN.md",                                optional; turns on plan-row checks
  "resolve": {"project": "...", "timeline": "v7", "base": "v6",
              "drp": "out.drp", "render": {"dir": ".", "name": "v7"}},   optional
  "video": [                                        bottom track first
    {"name": "Camera", "keep": false, "clips": [
      {"file": "cam.mov", "in": 15, "start": 0, "frames": 174,
       "id": "3", "reason": "she admits the risk", "crop": [0, 200, 2160, 3840]}]}],
  "audio": [
    {"name": "Dialogue", "role": "speech", "enabled": true, "clips": [
      {"file": "cam.mov", "in": 15, "start": 0, "frames": 174,
       "gain_db": 0, "fade": 0.008}]}]
}

Video clips are fitted (contain, centred) to the frame and stacked upward, so
overlays should be full-frame RGBA made with `place`. Audio clips get `fade`
seconds of fade at both ends (default 8 ms: removes cut clicks, keeps
consonants; use 0 for a continuous stem; `fade_in`/`fade_out` override one end,
e.g. a longer tail for an L-cut). `crop` [x, y, w, h] in displayed source
pixels reframes a video clip (a punch-in); check warns when it upscales.
With `plan`, every clip needs a `reason` (its own or its track's) and any `id`
must name a row of the plan. Audio track `role` (speech, music, effects,
ambience) lets `review` measure speech against music. `speed` (default 1) plays a clip
faster or slower with pitch kept: `in` is still the source position in
timeline frames, `frames` the output length, so the clip reads frames*speed of
source. It is rendered once into .reel/ and every output uses that file, so
FFmpeg and Resolve land on the same frames. Other clip keys (id, cue, source, reason) are carried
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
                          "format=duration:stream=codec_type,r_frame_rate,width,height,pix_fmt:"
                          "stream_side_data=rotation",
                          "-of", "json", str(path)], capture_output=True, text=True)
    if out.returncode:
        return None
    j = json.loads(out.stdout)
    v = next((s for s in j.get("streams", []) if s["codec_type"] == "video"), None)
    num, den = (v or {}).get("r_frame_rate", "0/1").split("/")
    turned = any(abs(int(d.get("rotation", 0))) == 90 for d in (v or {}).get("side_data_list", []))
    w, h = (v or {}).get("width"), (v or {}).get("height")
    return {"duration": float(j.get("format", {}).get("duration", 0) or 0),
            "fps": float(num) / float(den or 1) if float(den or 1) else 0,
            "video": v is not None,
            "audio": any(s["codec_type"] == "audio" for s in j.get("streams", [])),
            "width": h if turned else w, "height": w if turned else h,
            "alpha": "a" in (v or {}).get("pix_fmt", "").replace("gray", "")}


def check(t):
    """Errors make every output wrong; warnings need a look."""
    errors, warnings = [], []
    for key in ("fps", "width", "height", "frames"):
        if not isinstance(t.get(key), int) or t[key] <= 0:
            errors.append(f"{key} must be a positive integer")
    if errors:
        return errors, warnings
    fps = t["fps"]
    rows = None
    if t.get("plan"):
        plan = t["_dir"] / t["plan"]
        rows = {r["id"] for r in plan_rows(plan)} if plan.exists() else set()
        if not rows:
            errors.append(f"plan {plan}: no rows found (table columns start with | id | start |)")
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
                speed = c.get("speed", 1)
                if not isinstance(speed, (int, float)) or not 0.5 <= speed <= 100:
                    errors.append(f"{where}: speed must be a number from 0.5 to 100")
                    continue
                if rows is not None:
                    if not (c.get("reason") or track.get("reason")):
                        warnings.append(f"{where}: no reason (clip or track)")
                    if "id" in c and str(c["id"]) not in rows:
                        warnings.append(f"{where}: id {c['id']} is not a plan row")
                if last and c["start"] < last["start"] + last["frames"]:
                    errors.append(f"{where}: overlaps previous clip ending {last['start'] + last['frames']}")
                last = c
                if c["start"] + c["frames"] > t["frames"]:
                    errors.append(f"{where}: ends after the timeline ({t['frames']})")
                if not c["_path"].exists():
                    errors.append(f"{where}: missing {c['_path']}")
                    continue
                crop = c.get("crop")
                if crop is not None:
                    if kind == "audio" or not (isinstance(crop, list) and len(crop) == 4
                                               and all(isinstance(v, int) and v >= 0 for v in crop)
                                               and crop[2] > 0 and crop[3] > 0):
                        errors.append(f"{where}: crop must be [x, y, w, h] integer pixels on a video clip")
                        continue
                    if c["_path"].suffix.lower() in IMAGE:
                        size = image_size(c["_path"])
                    else:
                        pr = probe(c["_path"])
                        size = (pr["width"], pr["height"]) if pr and pr["video"] else None
                    if size and (crop[0] + crop[2] > size[0] or crop[1] + crop[3] > size[1]):
                        errors.append(f"{where}: crop {crop} falls outside the {size[0]}x{size[1]} source")
                    up = min(t["width"] / crop[2], t["height"] / crop[3])
                    if up > 1.2:
                        warnings.append(f"{where}: crop is enlarged {up:.2f}x and will look soft")
                    if abs(crop[2] / crop[3] - t["width"] / t["height"]) > 0.01 * t["width"] / t["height"]:
                        warnings.append(f"{where}: crop aspect differs from the frame; it will be letterboxed")
                if c["_path"].suffix.lower() in IMAGE:
                    if kind == "audio":
                        errors.append(f"{where}: image on an audio track")
                    if speed != 1:
                        errors.append(f"{where}: speed on a still")
                    continue
                p = probe(c["_path"])
                if p is None:
                    errors.append(f"{where}: ffprobe cannot read it")
                    continue
                if kind == "audio" and not p["audio"]:
                    errors.append(f"{where}: no audio stream")
                if kind == "video" and not p["video"]:
                    errors.append(f"{where}: no video stream")
                short = (c["in"] + c["frames"] * speed) / fps - p["duration"]
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


def image_size(path):
    from PIL import Image
    with Image.open(path) as im:
        return im.size


def plan_rows(path):
    """Rows of the PLAN.md shot table: [{id, start (seconds), cells}], in file order."""
    rows, header = [], None
    for line in Path(path).read_text().splitlines():
        cells = [x.strip() for x in line.strip().strip("|").split("|")] if line.lstrip().startswith("|") else None
        if not cells:
            header = None
            continue
        if [x.lower() for x in cells[:2]] == ["id", "start"]:
            header = [x.lower() for x in cells]
            continue
        if header and not set(cells[0]) <= set("-: "):
            try:
                start = sum(float(v) * 60 ** k for k, v in enumerate(reversed(cells[1].split(":"))))
            except ValueError:
                continue
            rows.append({"id": cells[0], "start": start, **dict(zip(header[2:], cells[2:]))})
    return rows


def require_valid(t):
    errors, warnings = check(t)
    for w in warnings:
        print("warning:", w, file=sys.stderr)
    if errors:
        sys.exit("timeline errors:\n  " + "\n  ".join(errors))
    for kind in ("video", "audio"):
        for track in t[kind]:
            for c in track["clips"]:
                if c.get("speed", 1) != 1:
                    c["_path"], c["in"] = derived(c, t["fps"], t["_dir"] / ".reel", speed=c["speed"]), 0


def derived(c, fps, cache, speed=1, crop=None):
    """The clip's source span, exactly `frames` long at timeline fps: retimed with pitch kept, and/or cropped."""
    src, p = c["_path"], probe(c["_path"])
    cache.mkdir(parents=True, exist_ok=True)
    tag = f"-x{speed:g}" if speed != 1 else ""
    tag += "-crop{}x{}+{}+{}".format(crop[2], crop[3], crop[0], crop[1]) if crop else ""
    out = cache / (f"{src.stem}-{int(src.stat().st_mtime)}-{c['in']}-{c['frames']}f{tag}"
                   + (".mov" if p["video"] else ".wav"))
    if out.exists():
        return out
    cmd = ["ffmpeg", "-v", "error", "-y", "-ss", f"{c['in'] / fps:.6f}",
           "-t", f"{(c['frames'] + 1) * speed / fps:.6f}", "-i", str(src)]
    if p["video"]:
        cut = "crop={2}:{3}:{0}:{1},".format(*crop) if crop else ""
        cmd += ["-vf", f"{cut}setpts=(PTS-STARTPTS)/{speed},fps={fps},tpad=stop=-1:stop_mode=clone",
                "-frames:v", str(c["frames"]), "-c:v", "prores_ks",
                *(["-profile:v", "4444", "-pix_fmt", "yuva444p10le"] if p["alpha"] else ["-profile:v", "hq"])]
    if p["audio"]:
        # atempo keeps pitch; apad+atrim make the audio exactly as long as the picture
        cmd += ["-af", f"atempo={speed},aresample={RATE},apad,atrim=end_sample={round(c['frames'] / fps * RATE)}",
                "-c:a", "pcm_s24le"]
    run(cmd + [str(out)])
    return out


# ---------------------------------------------------------------- ffmpeg

def run(cmd):
    subprocess.run(cmd, check=True)


def clip_input(c, fps, audio=False):
    """-ss before -i is frame-accurate for decoding; -t bounds the read."""
    dur = f"{c['frames'] / fps + (0 if audio else 1 / fps):.6f}"
    if c["_path"].suffix.lower() in IMAGE:
        return ["-loop", "1", "-framerate", str(fps), "-t", dur, "-i", str(c["_path"])]
    return ["-ss", f"{c['in'] / fps:.6f}", "-t", dur, "-i", str(c["_path"])]


def audio_graph(t, first_input, role=None):
    """Inputs and filters for the enabled audio tracks (optionally one role), output label [aout]."""
    fps, total = t["fps"], t["frames"] / t["fps"]
    args, chains, labels, i = [], [], [], first_input
    for track in t["audio"]:
        if not track.get("enabled", True) or (role and track.get("role") != role):
            continue
        for c in track["clips"]:
            args += clip_input(c, fps, audio=True)
            d = c["frames"] / fps
            fi = min(c.get("fade_in", c.get("fade", 0.008)), d / 2)
            fo = min(c.get("fade_out", c.get("fade", 0.008)), d / 2)
            fades = (f",afade=t=in:d={fi:.4f}" if fi > 0 else "") + \
                    (f",afade=t=out:st={d - fo:.6f}:d={fo:.4f}" if fo > 0 else "")
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
            crop = "crop={2}:{3}:{0}:{1},".format(*c["crop"]) if c.get("crop") else ""
            parts.append(f"[{i}:v]{crop}fps={fps},scale={W}:{H}:force_original_aspect_ratio=decrease,"
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
    run(["ffmpeg", "-v", "error", "-nostats", "-y", *args, *a_args, "-/filter_complex", f.name,
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
    crop = c.get("crop")
    out = cache / (f"{c['_path'].stem}-{c['frames']}f" + ("-crop{}x{}+{}+{}".format(*crop[2:], *crop[:2])
                                                        if crop else "") + ".mov")
    if not out.exists():
        cut = "crop={2}:{3}:{0}:{1},".format(*crop) if crop else ""
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(fps), "-i", str(c["_path"]),
             "-frames:v", str(c["frames"]), "-vf", f"{cut}format=argb", "-c:v", "qtrle", str(out)])
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
                elif c.get("crop"):  # one reframed file keeps Resolve identical to the FFmpeg render
                    path, s = derived(c, fps, cache, crop=c["crop"]), 0
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


# ---------------------------------------------------------------- review

def loudness_curve(path):
    """Momentary loudness (LUFS, 400 ms window) every 100 ms: [(t, lufs)]."""
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
        meta = f.name
    run(["ffmpeg", "-v", "error", "-nostats", "-i", str(path), "-vn", "-af",
         f"ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.M:file={meta}", "-f", "null", "-"])
    out, ts = [], None
    for line in Path(meta).read_text().splitlines():
        if line.startswith("frame:"):
            ts = float(line.rsplit("pts_time:", 1)[1])
        elif line.startswith("lavfi.r128.M=") and ts is not None:
            if ts >= 0.4:  # the 400 ms window is still filling before this
                out.append((ts, max(-70.0, float(line.split("=", 1)[1]))))
    Path(meta).unlink()
    return out


def detect_cuts(video, threshold=0.1):
    """Times (s) where the picture changes abruptly: cuts, jump cuts, overlays popping on or off.
    Dissolves and camera moves change gradually and mostly stay under the threshold."""
    r = subprocess.run(["ffmpeg", "-v", "error", "-nostats", "-i", str(video), "-an", "-vf",
                        f"scale=160:-2,select='gt(scene,{threshold})',metadata=print:file=-", "-f", "null", "-"],
                       capture_output=True, text=True)
    hits = [float(l.rsplit("pts_time:", 1)[1]) for l in r.stdout.splitlines() if "pts_time:" in l]
    return [h for k, h in enumerate(hits) if k == 0 or h - hits[k - 1] > 0.25]  # a fade-on is one change


def speech_vs_music(t):
    """Speech minus music momentary loudness wherever speech is active, from the timeline's track roles."""
    curves = {}
    for role in ("speech", "music"):
        if not any(tr.get("role") == role and tr.get("enabled", True) and tr["clips"] for tr in t["audio"]):
            return None
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            stem = f.name
        args, chains = audio_graph(t, 0, role)
        run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", ";".join(chains),
             "-map", "[aout]", "-c:a", "pcm_s16le", stem])
        curves[role] = {round(ts, 1): v for ts, v in loudness_curve(stem)}
        Path(stem).unlink()
    diffs = [(ts, sp - curves["music"].get(ts, -70.0)) for ts, sp in curves["speech"].items() if sp > -45]
    return sorted(diffs)


def cmd_review(video, out_dir, plan=None, timeline=None):
    """Frames-only sheet for a sound-off retell, and the shape of the cut: shots, loudness, plan rows."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    dur = probe(Path(video))["duration"]
    rows = plan_rows(plan) if plan else []
    report = {"video": str(video), "seconds": round(dur, 3), "plan_rows": len(rows)}

    # sheet: one frame per plan row at its midpoint (or evenly spaced), labelled only with the row id
    if rows:
        marks = [(r["id"], (r["start"] + (rows[k + 1]["start"] if k + 1 < len(rows) else dur)) / 2)
                 for k, r in enumerate(rows)]
    else:
        n = min(24, max(6, int(dur // 2)))
        marks = [(f"{dur * (k + 0.5) / n:.1f}s", dur * (k + 0.5) / n) for k in range(n)]
    font = ImageFont.load_default(size=22)
    thumbs = []
    for label, ts in marks:
        png = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{min(ts, dur - 0.05):.3f}", "-i", str(video),
                              "-frames:v", "1", "-vf", "scale=-2:360", "-f", "image2pipe", "-vcodec", "png", "-"],
                             capture_output=True).stdout
        import io
        im = Image.open(io.BytesIO(png)).convert("RGB") if png else Image.new("RGB", (202, 360), "#333")
        ImageDraw.Draw(im).text((8, 6), label, fill="#ffd400", font=font, stroke_width=2, stroke_fill="black")
        thumbs.append(im)
    cols = min(6, len(thumbs))
    tw, th = max(i.width for i in thumbs), max(i.height for i in thumbs)
    sheet = Image.new("RGB", (cols * tw, -(-len(thumbs) // cols) * th), "#111")
    for k, im in enumerate(thumbs):
        sheet.paste(im, ((k % cols) * tw, (k // cols) * th))
    sheet.save(out_dir / "sheet.png")

    # picture changes: exact from the timeline's video clips when given, else detected
    t = load(timeline) if timeline else None
    if t:
        edges = sorted({e / t["fps"] for tr in t["video"] for c in tr["clips"]
                        for e in (c["start"], c["start"] + c["frames"]) if 0 < e < t["frames"]})
        cuts = [e for k, e in enumerate(edges) if k == 0 or e - edges[k - 1] > 0.25]
    else:
        cuts = detect_cuts(video)
    report["changes_from"] = "timeline" if t else "detected"
    bounds = [0.0] + cuts + [dur]
    shots = [round(b - a, 3) for a, b in zip(bounds, bounds[1:]) if b - a > 0.02]
    runs, run_len = [], 1  # consecutive shots within 15% of each other: a metronome, not a rhythm
    for a, b in zip(shots, shots[1:]):
        if abs(a - b) <= 0.15 * max(a, b):
            run_len += 1
        else:
            runs.append(run_len)
            run_len = 1
    runs.append(run_len)
    arr = np.array(shots) if shots else np.zeros(1)
    report["shots"] = {"count": len(shots), "changes_at": [round(c, 2) for c in cuts],
                       "median": round(float(np.median(arr)), 2), "min": round(float(arr.min()), 2),
                       "max": round(float(arr.max()), 2),
                       "variation": round(float(arr.std() / arr.mean()), 2) if arr.mean() else 0,
                       "longest_even_run": max(runs)}

    # loudness
    curve = loudness_curve(video)
    if curve:
        loud = max(curve, key=lambda x: x[1])
        report["loudness"] = {"loudest_at": round(loud[0], 2), "loudest_lufs": round(loud[1], 1),
                              "quiet_below_-40_seconds": round(sum(0.1 for _, v in curve if v < -40), 1)}
        if rows:
            report["loudness"]["loudest_row"] = next((r["id"] for r in reversed(rows) if r["start"] <= loud[0]), None)
    diffs = speech_vs_music(t) if t else None
    if diffs:
        d = np.array([x for _, x in diffs])
        low = []  # merged windows where speech sits less than 10 LU above music
        for ts, x in diffs:
            if x >= 10:
                continue
            if low and ts - low[-1][1] < 0.3:
                low[-1][1] = ts + 0.1
            else:
                low.append([ts, ts + 0.1])
        report["speech_over_music"] = {"median_lu": round(float(np.median(d)), 1),
                                       "p10_lu": round(float(np.percentile(d, 10)), 1),
                                       "under_10_lu": [[round(a, 1), round(b, 1)] for a, b in low if b - a >= 0.3]}

    # shape.png: plan rows, shots and loudness on one time axis
    W, H = 1600, 360
    img = Image.new("RGB", (W, H), "#111")
    dr = ImageDraw.Draw(img)
    small = ImageFont.load_default(size=14)
    x = lambda s: s / dur * (W - 20) + 10
    for k, r in enumerate(rows):
        dr.line([(x(r["start"]), 0), (x(r["start"]), H)], fill="#444")
        dr.text((x(r["start"]) + 3, 4 + 16 * (k % 2)), r["id"], fill="#e0e0e0", font=small)
    for a, b in zip(bounds, bounds[1:]):  # shot bars: height = length
        h = min(1.0, (b - a) / max(shots or [1])) * 100
        dr.rectangle([x(a) + 1, 150 - h, max(x(a) + 1, x(b) - 1), 150], fill="#7fb3ff")
    for (t0, v0), (t1, v1) in zip(curve, curve[1:]):
        y = lambda v: 340 - (v + 70) / 70 * 170
        dr.line([(x(t0), y(v0)), (x(t1), y(v1))], fill="#ffd400")
    for ts, xv in diffs or []:
        if xv < 10:
            dr.line([(x(ts), 345), (x(ts), 355)], fill="#ff5a4f")
    dr.text((10, 155), "time between picture changes (bar height)   loudness (yellow)   speech under 10 LU over music (red)",
            fill="#888", font=small)
    img.save(out_dir / "shape.png")
    (out_dir / "review.json").write_text(json.dumps(report, indent=2))
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
    s = sub.add_parser("review"); s.add_argument("video"); s.add_argument("--plan")
    s.add_argument("--timeline", help="with audio track roles, measures speech against music")
    s.add_argument("--dir", default="review")
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
    elif a.cmd == "review":
        cmd_review(a.video, a.dir, a.plan, a.timeline)
    elif a.cmd == "qa":
        return 1 if cmd_qa(load(a.timeline), a.video, a.dir, a.words)["problems"] else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
