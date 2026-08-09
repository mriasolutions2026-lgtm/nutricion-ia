#!/usr/bin/env python3
"""
NutricionLu Icon Generator
===========================
Generates PNG icons at all required sizes for PWA and app stores.

Primary method: Uses Pillow (PIL) to render a styled icon with
  - Crimson-to-rose gradient background
  - Stylized fork symbol in white
  - Smooth antialiased rendering

Fallback method: Creates simple solid-color square PNGs with
  text overlay if Pillow/cairosvg are not available.

Usage:
  python generate_icons.py

Requirements (optional, for best quality):
  pip install Pillow
"""

import os
import sys
import math

# Icon sizes required by PWA spec + app stores
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

# Color palette
COLOR_PRIMARY = (200, 29, 58)     # #c81d3a crimson
COLOR_ACCENT  = (232, 130, 154)   # #e8829a rose
COLOR_BG      = (253, 245, 245)   # #fdf5f5 warm white
COLOR_WHITE   = (255, 255, 255)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def lerp_color(c1, c2, t):
    """Linear interpolation between two RGB colors."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def generate_with_pillow():
    """Generate icons using Pillow with gradient + fork symbol."""
    from PIL import Image, ImageDraw, ImageFont

    print(f"[✓] Pillow found. Generating {len(SIZES)} PNG icons with gradient...")

    for size in SIZES:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # ── Draw circular gradient background ──────────────────────
        center = size / 2
        radius = size / 2

        # Build gradient pixel by pixel for circular area
        # For efficiency use a temporary larger canvas then paste
        for y in range(size):
            for x in range(size):
                dx = x - center
                dy = y - center
                dist = math.sqrt(dx * dx + dy * dy)

                if dist <= radius:
                    # Diagonal gradient: top-left → bottom-right
                    t = (x / size * 0.5 + y / size * 0.5)
                    color = lerp_color(COLOR_PRIMARY, COLOR_ACCENT, t)
                    # Inner glow: brighten top-left area slightly
                    glow_t = max(0.0, 1.0 - math.sqrt((x / size - 0.35)**2 + (y / size - 0.30)**2) / 0.6)
                    r = min(255, int(color[0] + 35 * glow_t))
                    g = min(255, int(color[1] + 20 * glow_t))
                    b = min(255, int(color[2] + 20 * glow_t))
                    img.putpixel((x, y), (r, g, b, 255))

        draw = ImageDraw.Draw(img)

        # ── Draw fork symbol (scaled relative to icon size) ────────
        scale = size / 512.0
        white = (255, 255, 255, 242)

        # Fork handle
        handle_x = int(240 * scale)
        handle_y = int(320 * scale)
        handle_w = int(32 * scale)
        handle_h = int(100 * scale)
        handle_r = int(16 * scale)
        draw.rounded_rectangle(
            [handle_x, handle_y, handle_x + handle_w, handle_y + handle_h],
            radius=handle_r, fill=white
        )

        # Tine 1 (left)
        t1x = int(200 * scale)
        t_y = int(140 * scale)
        t_w = int(16 * scale)
        t_h = int(110 * scale)
        t_r = int(8 * scale)
        draw.rounded_rectangle([t1x, t_y, t1x + t_w, t_y + t_h], radius=t_r, fill=white)

        # Tine 2 (center)
        t2x = int(240 * scale)
        draw.rounded_rectangle([t2x, t_y, t2x + t_w, t_y + t_h], radius=t_r, fill=white)

        # Tine 3 (right)
        t3x = int(280 * scale)
        draw.rounded_rectangle([t3x, t_y, t3x + t_w, t_y + t_h], radius=t_r, fill=white)

        # Fork neck connector (horizontal)
        nx = int(200 * scale)
        ny = int(248 * scale)
        nw = int(96 * scale)
        nh = int(24 * scale)
        nr = int(12 * scale)
        draw.rounded_rectangle([nx, ny, nx + nw, ny + nh], radius=nr, fill=white)

        # Fork neck to handle (vertical rounded)
        vy_x = int(224 * scale)
        vy_y = int(264 * scale)
        vy_w = int(48 * scale)
        vy_h = int(60 * scale)
        vy_r = int(24 * scale)
        draw.rounded_rectangle([vy_x, vy_y, vy_x + vy_w, vy_y + vy_h], radius=vy_r, fill=white)

        # Leaf accent dot (top right)
        dot_cx = int(370 * scale)
        dot_cy = int(142 * scale)
        dot_r = int(12 * scale)
        dot_color = (255, 255, 255, 115)
        draw.ellipse(
            [dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r],
            fill=dot_color
        )

        # ── Apply circular mask (make corners transparent) ─────────
        mask = Image.new('L', (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse([0, 0, size, size], fill=255)
        img.putalpha(mask)

        # ── Save PNG ───────────────────────────────────────────────
        output_path = os.path.join(SCRIPT_DIR, f'icon-{size}.png')
        # Convert to RGB with white bg for compatibility
        final = Image.new('RGBA', (size, size), (253, 245, 245, 255))
        final.paste(img, (0, 0), img)
        final = final.convert('RGB')
        final.save(output_path, 'PNG', optimize=True)
        print(f"  [✓] icon-{size}.png  ({size}×{size}px)")

    print(f"\n[✓] All {len(SIZES)} icons generated successfully!")
    return True


def generate_fallback():
    """
    Fallback: Generate simple colored PNG squares without Pillow.
    Uses raw PNG byte construction (no external dependencies).
    """
    import struct
    import zlib

    print("[!] Pillow not found. Generating simplified PNG icons (fallback mode)...")
    print("    Tip: Run 'pip install Pillow' for higher quality gradient icons.\n")

    def make_png(size, r, g, b):
        """Create a minimal valid PNG with a solid color and circular clip."""
        def pack_chunk(chunk_type, data):
            chunk_len = struct.pack('>I', len(data))
            chunk_data = chunk_type + data
            chunk_crc = struct.pack('>I', zlib.crc32(chunk_data) & 0xffffffff)
            return chunk_len + chunk_data + chunk_crc

        # PNG signature
        signature = b'\x89PNG\r\n\x1a\n'

        # IHDR chunk
        ihdr_data = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
        ihdr = pack_chunk(b'IHDR', ihdr_data)

        # Build image data: each row prefixed with filter byte 0 (None)
        raw_rows = []
        cx = size / 2.0
        cy = size / 2.0
        radius = size / 2.0

        for y in range(size):
            row = bytearray()
            row.append(0)  # Filter byte
            for x in range(size):
                dx = x - cx
                dy = y - cy
                if math.sqrt(dx * dx + dy * dy) <= radius:
                    # Gradient: top-left crimson → bottom-right rose
                    t = (x / size * 0.5 + y / size * 0.5)
                    pr = int(r + (232 - r) * t)
                    pg = int(g + (130 - g) * t)
                    pb = int(b + (154 - b) * t)
                    row.extend([max(0, min(255, pr)),
                                 max(0, min(255, pg)),
                                 max(0, min(255, pb))])
                else:
                    # Transparent corners → white background
                    row.extend([253, 245, 245])
            raw_rows.append(bytes(row))

        raw_data = b''.join(raw_rows)
        compressed = zlib.compress(raw_data, 9)
        idat = pack_chunk(b'IDAT', compressed)
        iend = pack_chunk(b'IEND', b'')

        return signature + ihdr + idat + iend

    for size in SIZES:
        png_data = make_png(size, *COLOR_PRIMARY)
        output_path = os.path.join(SCRIPT_DIR, f'icon-{size}.png')
        with open(output_path, 'wb') as f:
            f.write(png_data)
        print(f"  [✓] icon-{size}.png  ({size}×{size}px) [fallback gradient]")

    print(f"\n[✓] All {len(SIZES)} fallback icons generated!")
    print("    Install Pillow (pip install Pillow) and re-run for better quality icons.")
    return True


def create_placeholder_screenshots():
    """Create placeholder screenshot files (required by manifest)."""
    screenshots = [
        ('screenshot-mobile.png', 390, 844),
        ('screenshot-tablet.png', 1024, 768),
    ]

    try:
        from PIL import Image, ImageDraw

        for filename, w, h in screenshots:
            path = os.path.join(SCRIPT_DIR, filename)
            if os.path.exists(path):
                print(f"  [~] {filename} already exists, skipping")
                continue

            img = Image.new('RGB', (w, h), COLOR_BG)
            draw = ImageDraw.Draw(img)

            # Simple branded placeholder
            # Draw header bar
            draw.rectangle([0, 0, w, 80], fill=COLOR_PRIMARY)

            # Draw card placeholders
            for i in range(3):
                y = 120 + i * 140
                draw.rounded_rectangle([20, y, w - 20, y + 120],
                                        radius=16, fill=(240, 220, 225))

            img.save(path, 'PNG')
            print(f"  [✓] {filename}  ({w}×{h}px) [placeholder]")

    except ImportError:
        # Create empty placeholder files
        for filename, w, h in screenshots:
            path = os.path.join(SCRIPT_DIR, filename)
            if not os.path.exists(path):
                with open(path, 'wb') as f:
                    # Write 1x1 pixel PNG as placeholder
                    f.write(b'\x89PNG\r\n\x1a\n')
                print(f"  [~] {filename} — empty placeholder (install Pillow for real screenshots)")


def main():
    print("=" * 60)
    print("  NutricionLu Icon Generator")
    print("=" * 60)
    print(f"  Output directory: {SCRIPT_DIR}")
    print(f"  Sizes to generate: {SIZES}")
    print()

    success = False

    # Try Pillow first (best quality)
    try:
        import PIL
        print(f"[✓] Pillow {PIL.__version__} detected\n")
        success = generate_with_pillow()
    except ImportError:
        success = generate_fallback()

    if success:
        print()
        print("  Creating screenshot placeholders...")
        create_placeholder_screenshots()

        print()
        print("=" * 60)
        print("  DONE! Files created in /icons/")
        print("=" * 60)
        print()
        print("  Next steps:")
        print("  1. Review the generated icons")
        print("  2. For production: use a professional design tool")
        print("     (Figma, Adobe Illustrator) to create polished icons")
        print("  3. Submit to Play Store / App Store with the 512px icon")
        print()


if __name__ == '__main__':
    main()
