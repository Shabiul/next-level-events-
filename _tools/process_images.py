"""
Compress + downscale every image in a source dir and write web-ready JPEGs to
NLE-frontend/public/drive/. Also emits contact-sheet montages so the images can
be eyeballed and bucketed by theme.

    python _tools/process_images.py <src_dir>
"""
import sys, os, glob, hashlib
from PIL import Image, ImageOps, ImageDraw, ImageFont

SRC = sys.argv[1] if len(sys.argv) > 1 else "_drive_dl3"
OUT = os.path.join("NLE", "public", "drive")
SHEETS = os.path.join("_tools", "sheets")
MAX_EDGE = 1600
QUALITY = 82

os.makedirs(OUT, exist_ok=True)
os.makedirs(SHEETS, exist_ok=True)

files = []
for ext in ("*.jpg", "*.jpeg", "*.png", "*.webp", "*.JPG", "*.JPEG", "*.PNG"):
    files += glob.glob(os.path.join(SRC, "**", ext), recursive=True)
files = sorted(set(files))
print(f"{len(files)} source images")

seen_hash = {}
manifest = []
idx = 0
for f in files:
    try:
        with open(f, "rb") as fh:
            digest = hashlib.md5(fh.read()).hexdigest()
        if digest in seen_hash:
            print(f"  dup skip: {os.path.basename(f)} == {seen_hash[digest]}")
            continue
        im = Image.open(f)
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        w, h = im.size
        if w < 400 or h < 400:
            print(f"  too small skip: {os.path.basename(f)} {w}x{h}")
            continue
        scale = min(1.0, MAX_EDGE / max(w, h))
        if scale < 1.0:
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        idx += 1
        name = f"drive-{idx:03d}.jpg"
        im.save(os.path.join(OUT, name), "JPEG", quality=QUALITY, optimize=True, progressive=True)
        seen_hash[digest] = name
        manifest.append((name, os.path.relpath(f, SRC), im.size))
    except Exception as e:
        print(f"  ERROR {os.path.basename(f)}: {e}")

print(f"\nwrote {len(manifest)} images to {OUT}")
out_bytes = sum(os.path.getsize(os.path.join(OUT, n)) for n, _, _ in manifest)
print(f"total optimised size: {out_bytes/1024/1024:.1f} MB  (avg {out_bytes/max(1,len(manifest))/1024:.0f} KB)")

with open(os.path.join("_tools", "manifest.tsv"), "w", encoding="utf-8") as mf:
    for n, src, size in manifest:
        mf.write(f"{n}\t{size[0]}x{size[1]}\t{src}\n")

# ---- contact sheets: 6 cols x 7 rows, label each tile with its drive-NNN id ----
COLS, ROWS = 6, 7
TILE = 300
PER = COLS * ROWS
try:
    font = ImageFont.truetype("arialbd.ttf", 26)
except Exception:
    font = ImageFont.load_default()

for s in range(0, len(manifest), PER):
    chunk = manifest[s:s + PER]
    sheet = Image.new("RGB", (COLS * TILE, ROWS * TILE), (245, 240, 232))
    d = ImageDraw.Draw(sheet)
    for i, (n, _, _) in enumerate(chunk):
        tile = ImageOps.fit(Image.open(os.path.join(OUT, n)).convert("RGB"), (TILE, TILE), Image.LANCZOS)
        x, y = (i % COLS) * TILE, (i // COLS) * TILE
        sheet.paste(tile, (x, y))
        num = n.split("-")[1].split(".")[0]
        d.rectangle([x, y, x + 62, y + 34], fill=(56, 25, 50))
        d.text((x + 6, y + 3), num, fill=(255, 243, 230), font=font)
    sp = os.path.join(SHEETS, f"sheet-{s // PER + 1:02d}.jpg")
    sheet.save(sp, "JPEG", quality=78)
    print("sheet:", sp)
