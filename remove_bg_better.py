import sys
import math
from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Sample background colors from corners
    corners = [
        pixels[0, 0], pixels[width-1, 0], 
        pixels[0, height-1], pixels[width-1, height-1]
    ]
    # Average the background color
    bg_r = sum(c[0] for c in corners) / 4
    bg_g = sum(c[1] for c in corners) / 4
    bg_b = sum(c[2] for c in corners) / 4

    print(f"Detected background color: RGB({bg_r}, {bg_g}, {bg_b})")

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Distance from background color
            dist = math.sqrt((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)
            
            if dist < 15:
                # Exactly background
                pixels[x, y] = (r, g, b, 0)
            elif dist < 40:
                # Edge/anti-aliasing
                alpha = int(((dist - 15) / 25) * 255)
                pixels[x, y] = (r, g, b, alpha)

    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == '__main__':
    process_logo("public/images/user-logo.png", "public/images/user-logo-transparent.png")
