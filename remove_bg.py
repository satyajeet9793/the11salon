from PIL import Image
import sys

def remove_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # item is (R, G, B, A)
        r, g, b, a = item
        brightness = (r + g + b) / 3
        
        # If it's bright (like the beige background), make it transparent
        if brightness > 150:
            new_data.append((51, 22, 6, 0)) # transparent dark brown
        elif brightness > 50:
            # anti-aliasing edge
            alpha = int(255 - ((brightness - 50) / 100) * 255)
            new_data.append((51, 22, 6, alpha))
        else:
            # solid text
            new_data.append((51, 22, 6, 255))

    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_bg("public/images/logo-hd.png", "public/images/logo-hd-transparent.png")
    print("Done")
