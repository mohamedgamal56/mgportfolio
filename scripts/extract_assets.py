import base64
import io
import os
import re
from PIL import Image

SOURCE_HTML = r"E:\Mohamed Gamal\Web Site\Portfolio\Web Site With Cloud Ai\27_9_2026\index.html"
OUT_DIR = r"E:\Mohamed Gamal\Web Site\Portfolio\mgportfolio-v2\public\images"

TARGETS = [
    os.path.join(OUT_DIR, "hero-portrait.webp"),
    os.path.join(OUT_DIR, "results", "facebook-views.webp"),
    os.path.join(OUT_DIR, "results", "instagram-views.webp"),
]


def main():
    with open(SOURCE_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    pattern = re.compile(r"data:image/([a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=]+)")
    matches = pattern.findall(html)
    print(f"Found {len(matches)} embedded base64 images")

    if len(matches) < 3:
        raise RuntimeError(f"Expected at least 3 base64 images, found {len(matches)}")

    for idx, (ext, b64_data) in enumerate(matches[:3]):
        raw_bytes = base64.b64decode(b64_data)
        img = Image.open(io.BytesIO(raw_bytes))
        target_path = TARGETS[idx]
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        if idx == 0:
            # Hero portrait: resize if larger than 1920px max dimension, preserve RGBA/RGB
            max_dim = 1920
            if max(img.size) > max_dim:
                img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            img.save(target_path, "WEBP", quality=84, method=6)
        else:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.save(target_path, "WEBP", quality=85, method=6)

        size_kb = os.path.getsize(target_path) / 1024
        print(
            f"[{idx+1}] {ext} ({len(raw_bytes)/1024:.1f} KB) -> {target_path} | "
            f"dim={img.size} | saved={size_kb:.1f} KB"
        )


if __name__ == "__main__":
    main()
