import os
from PIL import Image, ImageOps

public_dir = r"d:\d\next-level-events-\NLE\public"

created_count = 0
failed_count = 0

for root, _, files in os.walk(public_dir):
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png']:
            base = os.path.splitext(f)[0]
            webp_path = os.path.join(root, base + '.webp')
            if not os.path.exists(webp_path):
                src_path = os.path.join(root, f)
                try:
                    with Image.open(src_path) as img:
                        # Fix orientation from EXIF if present
                        img = ImageOps.exif_transpose(img)
                        # Handle modes
                        if img.mode in ('RGBA', 'LA'):
                            # Keep alpha channel for webp
                            img.save(webp_path, 'WEBP', quality=85, method=4)
                        elif img.mode == 'P':
                            # Palette mode - convert to RGBA to preserve transparency if present
                            img = img.convert('RGBA')
                            img.save(webp_path, 'WEBP', quality=85, method=4)
                        elif img.mode != 'RGB':
                            img = img.convert('RGB')
                            img.save(webp_path, 'WEBP', quality=85, method=4)
                        else:
                            img.save(webp_path, 'WEBP', quality=85, method=4)
                    created_count += 1
                    print(f"Generated: {os.path.relpath(webp_path, public_dir)}")
                except Exception as e:
                    failed_count += 1
                    print(f"FAILED {src_path}: {e}")

print(f"\nDone! Successfully generated {created_count} webp images. Failed: {failed_count}")
