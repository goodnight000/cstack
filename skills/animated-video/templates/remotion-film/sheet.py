# Contact sheet of stills: python sheet.py out.png a.png b.png ...
import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]
w0, h0 = Image.open(files[0]).size  # tiles keep the film's aspect: 9:16, 16:9, 1:1 ...
W = 360 if h0 > w0 else 480; H = round(W * h0 / w0); cols = 5 if h0 > w0 else 4
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * W, rows * (H + 30)), "white")
for i, p in enumerate(files):
    im = Image.open(p).convert("RGB").resize((W, H))
    x, y = (i % cols) * W, (i // cols) * (H + 30)
    sheet.paste(im, (x, y + 30)); ImageDraw.Draw(sheet).text((x + 8, y + 8), p.split("/")[-1], fill="black")
sheet.save(sys.argv[1])
