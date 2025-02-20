import { imageToItcVnImage } from "./image-to-itcvnimage.js";

export async function pngUrlToITcVnImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;

    image.onload = () => {
      imageToItcVnImage(image).then(resolve).catch(reject);
      URL.revokeObjectURL(image.src);
    };

    image.onerror = () => {
      console.error(`Error loading the image: ${url}`);
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image from ${url}`));
    };
  });
}
