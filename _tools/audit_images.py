import os
import re

public_dir = r"d:\d\next-level-events-\NLE\public"
src_dirs = [
    r"d:\d\next-level-events-\NLE\src",
    r"d:\d\next-level-events-\CRM\src",
    r"d:\d\next-level-events-\NLE\index.html"
]

# Build map of all existing files in public/ (case-insensitive, normalized path relative to public/)
public_files = {}
for root, _, files in os.walk(public_dir):
    for f in files:
        full_path = os.path.join(root, f)
        rel_path = os.path.relpath(full_path, public_dir).replace('\\', '/')
        public_files[rel_path.lower()] = rel_path
        # Also store just basename for convenience
        public_files[f.lower()] = rel_path

img_regex = re.compile(r"""(?:['"`])(/?[^'"`\s\?#]+\.(?:png|jpe?g|webp|svg|gif|ico))(?:['"`])""", re.IGNORECASE)

referenced = set()

for target in src_dirs:
    if os.path.isfile(target):
        targets = [target]
    else:
        targets = []
        for root, _, files in os.walk(target):
            for f in files:
                if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css')):
                    targets.append(os.path.join(root, f))

    for fpath in targets:
        try:
            with open(fpath, 'r', encoding='utf-8') as fh:
                content = fh.read()
                matches = img_regex.findall(content)
                for m in matches:
                    clean = m.strip().lstrip('/')
                    if not clean.startswith('http') and not clean.startswith('data:'):
                        rel_source = os.path.relpath(fpath, r'd:\d\next-level-events-')
                        referenced.add((clean, rel_source))
        except Exception:
            pass

missing_base = []
missing_webp_when_jpg = []

for img_ref, source_file in sorted(referenced):
    # Ignore relative code imports like ./assets/... or ../...
    if img_ref.startswith('.'):
        continue

    norm_ref = img_ref.replace('\\', '/').lower()
    basename = os.path.basename(img_ref).lower()

    # Check if either exact relative path exists in public or basename exists in public
    found_key = None
    if norm_ref in public_files:
        found_key = norm_ref
    elif basename in public_files:
        found_key = basename

    if not found_key:
        missing_base.append((img_ref, source_file))
    else:
        actual_rel = public_files[found_key]
        actual_ext = os.path.splitext(actual_rel)[1].lower()
        if actual_ext in ['.jpg', '.jpeg', '.png']:
            actual_base = os.path.splitext(actual_rel)[0]
            webp_rel = (actual_base + '.webp').lower()
            if webp_rel not in public_files:
                missing_webp_when_jpg.append((img_ref, actual_rel, actual_base + '.webp', source_file))

print(f"Total image references collected: {len(referenced)}")
print(f"\n=======================================================")
print(f"1. MISSING FILES (referenced in code, NOT found anywhere in public/): {len(missing_base)}")
print(f"=======================================================")
for m, s in missing_base:
    print(f"  MISSING: '{m}' (in {s})")

print(f"\n=======================================================")
print(f"2. REFERENCED JPG/PNG MISSING .WEBP EQUIVALENT: {len(missing_webp_when_jpg)}")
print(f"=======================================================")
for orig, actual, webp, s in missing_webp_when_jpg:
    print(f"  ORIGINAL: '{orig}' -> FILE: '{actual}' -> MISSING WEBP: '{webp}' (in {s})")
