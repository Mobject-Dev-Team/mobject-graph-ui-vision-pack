import { base64ToBytes } from "../base64.js";

export async function iTcVnImageToImage(itcvnimage) {
  if (!itcvnimage) {
    throw new Error("Invalid input: Missing itcvnimage data");
  }

  const {
    imageInfo: { nWidth, nHeight, stPixelFormat },
    imageData,
  } = itcvnimage;

  if (!imageData) {
    throw new Error("Invalid iTcVnImage: Missing image data.");
  }

  const binaryData = base64ToBytes(imageData);
  const { nChannels, nElementSize } = stPixelFormat;

  // Convert binary data to a properly formatted pixel array (RGBA)
  const pixelArray = createImageCompatiblePixelArray(
    binaryData,
    nWidth,
    nHeight,
    nChannels,
    nElementSize
  );

  // Set the image source from the pixel data

  const image = await createImageFromPixelArray(pixelArray, nWidth, nHeight);
  return image;
}

function createImageCompatiblePixelArray(
  binaryData,
  width,
  height,
  channels,
  bitDepth
) {
  const bytesPerPixel = (channels * bitDepth) / 8;
  const outputBytes = new Uint8Array(width * height * 4); // Always RGBA (4 channels)
  let j = 0;

  for (let i = 0; i < binaryData.length; i += bytesPerPixel) {
    let r = 0,
      g = 0,
      b = 0,
      a = 255; // Default alpha to 255 (opaque)

    if (bitDepth === 8) {
      if (channels === 1) {
        r = g = b = binaryData[i];
      } else if (channels === 2) {
        r = g = b = binaryData[i];
        a = binaryData[i + 1];
      } else if (channels === 3) {
        r = binaryData[i];
        g = binaryData[i + 1];
        b = binaryData[i + 2];
      } else if (channels === 4) {
        r = binaryData[i];
        g = binaryData[i + 1];
        b = binaryData[i + 2];
        a = binaryData[i + 3];
      }
    } else if (bitDepth === 16) {
      if (channels === 1) {
        r = g = b = (binaryData[i] | (binaryData[i + 1] << 8)) >> 8;
      } else if (channels === 2) {
        r = g = b = (binaryData[i] | (binaryData[i + 1] << 8)) >> 8;
        a = (binaryData[i + 2] | (binaryData[i + 3] << 8)) >> 8;
      } else if (channels === 3) {
        r = (binaryData[i] | (binaryData[i + 1] << 8)) >> 8;
        g = (binaryData[i + 2] | (binaryData[i + 3] << 8)) >> 8;
        b = (binaryData[i + 4] | (binaryData[i + 5] << 8)) >> 8;
      } else if (channels === 4) {
        r = (binaryData[i] | (binaryData[i + 1] << 8)) >> 8;
        g = (binaryData[i + 2] | (binaryData[i + 3] << 8)) >> 8;
        b = (binaryData[i + 4] | (binaryData[i + 5] << 8)) >> 8;
        a = (binaryData[i + 6] | (binaryData[i + 7] << 8)) >> 8;
      }
    }

    outputBytes.set([r, g, b, a], j);
    j += 4;
  }

  return outputBytes;
}

async function createImageFromPixelArray(pixels, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.putImageData(
    new ImageData(new Uint8ClampedArray(pixels), width, height),
    0,
    0
  );
  const image = new Image();
  image.src = await canvasToDataURL(canvas);
  return image;
}

function createCanvas(w, h) {
  return typeof OffscreenCanvas !== "undefined"
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement("canvas"), { width: w, height: h });
}

async function canvasToDataURL(canvas) {
  if (canvas instanceof OffscreenCanvas) {
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          resolve(reader.result);
        },
        false
      );
      reader.readAsDataURL(blob);
    });
  }
  return canvas.toDataURL();
}
