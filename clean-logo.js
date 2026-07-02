const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('public/images/logo-hd.png');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      const brightness = (red + green + blue) / 3;
      
      let alpha = 255;
      if (brightness > 200) {
        alpha = 0;
      } else if (brightness > 50) {
        alpha = 255 - ((brightness - 50) / 150) * 255;
      }
      
      this.bitmap.data[idx + 0] = 51;
      this.bitmap.data[idx + 1] = 22;
      this.bitmap.data[idx + 2] = 6;
      this.bitmap.data[idx + 3] = alpha;
    });

    await image.writeAsync('public/images/logo-hd-transparent.png');
    console.log('Image perfectly cleaned and colored!');
  } catch (e) {
    console.error('Error processing image', e);
  }
}

processImage();
