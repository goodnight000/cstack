"""Run with `uv run test_reel.py` (needs ffmpeg). Builds tiny media and exercises every reel.py command."""
# /// script
# dependencies = ["pillow", "numpy"]
# ///
import json
from pathlib import Path
import subprocess
import sys
import tempfile

sys.path.insert(0, str(Path(__file__).parent))
import reel  # noqa: E402


def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def pixel(video, frame, xy):
    from PIL import Image
    import io
    png = subprocess.run(["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"select=eq(n\\,{frame})",
                          "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
                         capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA").getpixel(xy)


def main():
    with tempfile.TemporaryDirectory() as d:
        d = Path(d)
        ff("-f", "lavfi", "-i", "color=c=0x2040a0:s=360x640:r=30:d=4", "-f", "lavfi",
           "-i", "sine=f=440:r=48000:d=4", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-shortest", str(d / "cam.mp4"))
        ff("-f", "lavfi", "-i", "color=c=red:s=100x100", "-frames:v", "1", str(d / "card.png"))
        timeline = {
            "fps": 30, "width": 360, "height": 640,
            "resolve": {"project": "Test", "timeline": "t1"},
            "video": [{"name": "Camera", "clips": [
                {"file": "cam.mp4", "in": 0, "start": 0, "frames": 30},
                {"file": "cam.mp4", "in": 60, "start": 30, "frames": 30}]},
                {"name": "Card", "clips": [{"file": "card.png", "start": 10, "frames": 20}]}],
            "audio": [{"name": "Dialogue", "clips": [
                {"file": "cam.mp4", "in": 0, "start": 0, "frames": 30},
                {"file": "cam.mp4", "in": 60, "start": 30, "frames": 30}]}]}
        tl = d / "timeline.json"
        tl.write_text(json.dumps(timeline))

        errors, _ = reel.check(reel.load(tl))
        assert errors == [], errors
        bad = json.loads(tl.read_text())
        bad["video"][0]["clips"][1]["start"] = 20
        bad["video"][1]["clips"][0]["in"] = 0.5
        (d / "bad.json").write_text(json.dumps(bad))
        errors, _ = reel.check(reel.load(d / "bad.json"))
        assert any("overlaps" in e for e in errors) and any("integer" in e for e in errors), errors

        out = d / "out.mp4"
        reel.cmd_render(reel.load(tl), out)
        qa = reel.cmd_qa(reel.load(tl), out, d / "qa")
        assert qa["frames"] == 60 and qa["problems"] == [], qa
        assert len(qa["join_views"]) == 1 and Path(qa["join_views"][0]).exists()
        r, g, b, _ = pixel(out, 15, (180, 320))
        assert r > 200 and g < 60, (r, g, b)          # card on top, fitted to the frame width
        r, g, b, _ = pixel(out, 5, (180, 320))
        assert b > 120 and r < 80, (r, g, b)          # camera before the card starts

        mix = d / "mix.wav"
        reel.cmd_mix(reel.load(tl), mix)
        assert abs(reel.probe(mix)["duration"] - 2.0) < 0.01

        lua = d / "build.lua"
        reel.cmd_resolve(reel.load(tl), lua)
        text = lua.read_text()
        assert text.count("\nadd(") == 5 and "recordFrame=T0+rec" in text and "CreateEmptyTimeline" in text
        assert "card-20f.mov" in text               # stills become movies with an exact length

        # blue for 2 s then green: at 2x from 1 s, output frame 20 reads source 2.33 s (green)
        ff("-f", "lavfi", "-i", "color=c=blue:s=360x640:r=30:d=2[a];color=c=green:s=360x640:r=30:d=2[b];"
           "[a][b]concat", "-f", "lavfi", "-i", "sine=f=440:r=48000:d=4", "-c:v", "libx264",
           "-pix_fmt", "yuv420p", "-shortest", str(d / "cam2.mp4"))
        fast = {"fps": 30, "width": 360, "height": 640, "resolve": {"project": "Test", "timeline": "t2"},
                "video": [{"name": "Camera", "clips": [{"file": "cam2.mp4", "in": 30, "start": 0, "frames": 30,
                                                        "speed": 2}]}],
                "audio": [{"name": "Dialogue", "clips": [{"file": "cam2.mp4", "in": 30, "start": 0, "frames": 30,
                                                          "speed": 2}]}]}
        (d / "fast.json").write_text(json.dumps(fast))
        fast["video"][0]["clips"][0]["frames"] = 60     # 1 s + 60 * 2 frames overruns the 4 s source
        (d / "overrun.json").write_text(json.dumps(fast))
        errors, _ = reel.check(reel.load(d / "overrun.json"))
        assert any("shorter" in e for e in errors), errors
        reel.cmd_render(reel.load(d / "fast.json"), d / "fast.mp4")
        assert reel.cmd_qa(reel.load(d / "fast.json"), d / "fast.mp4", d / "qa2")["problems"] == []
        r, g, b, _ = pixel(d / "fast.mp4", 20, (180, 320))
        assert g > 100 and b < 80, (r, g, b)
        reel.cmd_resolve(reel.load(d / "fast.json"), d / "fast.lua")
        text = (d / "fast.lua").read_text()
        assert text.count("-x2.mov',0,30,0,30,") == 2, text   # video and audio use the retimed file
        retimed = next((d / ".reel").glob("cam2-*-x2.mov"))
        assert reel.probe(retimed)["fps"] == 30 and abs(reel.probe(retimed)["duration"] - 1.0) < 0.01

        # crop: the right half of cam2 (green after 2 s) fills the frame; out of bounds is an error
        crop = {"fps": 30, "width": 180, "height": 320, "plan": "PLAN.md",
                "video": [{"name": "Camera", "clips": [{"file": "cam2.mp4", "in": 0, "start": 0, "frames": 90,
                                                        "crop": [180, 0, 180, 320], "id": "1", "reason": "the setup"},
                                                       {"file": "cam2.mp4", "in": 90, "start": 90, "frames": 30,
                                                        "id": "9"}]}],
                "audio": [{"name": "Voice", "role": "speech", "reason": "the argument", "clips": [
                              {"file": "cam2.mp4", "in": 0, "start": 0, "frames": 120, "fade_in": 0, "fade_out": 0.5}]},
                          {"name": "Music", "role": "music", "reason": "carries the mood", "clips": [
                              {"file": "music.wav", "start": 0, "frames": 120}]}]}
        ff("-f", "lavfi", "-i", "sine=f=220:r=48000:d=4", "-af", "volume=0.1", str(d / "music.wav"))
        (d / "PLAN.md").write_text("# Plan\n\n| id | start | beat | see |\n|---|---|---|---|\n"
                                   "| 1 | 0:00 | setup | blue |\n| 2 | 0:02.5 | turn | green |\n")
        (d / "crop.json").write_text(json.dumps(crop))
        errors, warnings = reel.check(reel.load(d / "crop.json"))
        assert errors == [] and any("id 9 is not a plan row" in w for w in warnings) \
            and any("no reason" in w for w in warnings), (errors, warnings)
        assert [r["id"] for r in reel.plan_rows(d / "PLAN.md")] == ["1", "2"]
        reel.cmd_render(reel.load(d / "crop.json"), d / "crop.mp4")
        assert pixel(d / "crop.mp4", 75, (90, 160))[1] > 100      # green half, filling the frame
        bad = json.loads((d / "crop.json").read_text())
        bad["video"][0]["clips"][0]["crop"] = [200, 0, 180, 320]
        (d / "badcrop.json").write_text(json.dumps(bad))
        assert any("outside" in e for e in reel.check(reel.load(d / "badcrop.json"))[0])
        reel.cmd_resolve({**reel.load(d / "crop.json"), "resolve": {"project": "T", "timeline": "c"}}, d / "c.lua")
        assert "-crop180x320+180+0.mov" in (d / "c.lua").read_text()

        rv = reel.cmd_review(d / "crop.mp4", d / "rv", d / "PLAN.md", d / "crop.json")
        assert (d / "rv" / "sheet.png").exists() and (d / "rv" / "shape.png").exists()
        assert rv["changes_from"] == "timeline" and rv["shots"]["changes_at"] == [3.0], rv["shots"]
        (d / "words.json").write_text(json.dumps([{"w": "one", "s": 0.1, "e": 0.4}, {"w": "two", "s": 0.5, "e": 0.8},
                                                  {"w": "three", "s": 2.6, "e": 3.0}]))    # animation w/s/e keys
        rw = reel.cmd_review(d / "crop.mp4", d / "rv3", d / "PLAN.md", words=d / "words.json")
        assert rw["speech"]["pauses"] == 1 and rw["speech"]["longest_pause"] == 1.8, rw["speech"]
        assert [r["id"] for r in rw["speech"]["rows"]] == ["1", "2"]
        assert reel.cmd_qa(None, d / "crop.mp4", d / "qa3")["frames"] == 120              # qa without a timeline
        seen = reel.cmd_review(d / "crop.mp4", d / "rv2")                              # no timeline: detect
        assert any(abs(c - 2.0) < 0.1 for c in seen["shots"]["changes_at"]), seen["shots"]  # blue -> green
        assert 17 < rv["speech_over_music"]["median_lu"] < 23, rv["speech_over_music"]  # sine at 0.1x = -20 dB

        placed = d / "placed.mov"
        reel.main(["place", str(d / "card.png"), "-o", str(placed), "--box", "20,40,100,50",
                   "--frames", "12", "--size", "360x640", "--fade", "0"])
        assert pixel(placed, 3, (70, 65))[3] == 255 and pixel(placed, 3, (5, 5))[3] == 0
        print("reel.py ok")


if __name__ == "__main__":
    main()
