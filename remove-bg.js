const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/images/logo-hd.png');
    // iterate over all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];

      // If pixel is close to white (light grey or white)
      if (red > 230 && green > 230 && blue > 230) {
        this.bitmap.data[idx + 3] = 0; // set alpha to 0 (transparent)
      } else if (red > 200 && green > 200 && blue > 200) {
         // Anti-aliasing edges - make them semi-transparent
         this.bitmap.data[idx + 3] = Math.max(0, 255 - (red + green + blue) / 3);
      }
    });

    await image.writeAsync('public/images/logo-hd-transparent.png');
    console.log('Image processed!');
  } catch (e) {
    console.error('Error processing image', e);
  }
}

processImage();
