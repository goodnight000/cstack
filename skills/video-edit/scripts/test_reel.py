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

        placed = d / "placed.mov"
        reel.main(["place", str(d / "card.png"), "-o", str(placed), "--box", "20,40,100,50",
                   "--frames", "12", "--size", "360x640", "--fade", "0"])
        assert pixel(placed, 3, (70, 65))[3] == 255 and pixel(placed, 3, (5, 5))[3] == 0
        print("reel.py ok")


if __name__ == "__main__":
    main()
