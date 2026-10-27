from PIL import Image

def create_white_bg_icon(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    white_bg = Image.new('RGBA', img.size, 'WHITE')
    white_bg.alpha_composite(img)
    white_bg.convert('RGB').save(output_path, 'PNG')

if __name__ == '__main__':
    create_white_bg_icon('public/images/user-logo-transparent.png', 'src/app/icon.png')
    create_white_bg_icon('public/images/user-logo-transparent.png', 'src/app/apple-icon.png')
    print('Icons generated successfully!')
