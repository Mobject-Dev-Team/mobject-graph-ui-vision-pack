import { bytesToBase64 } from "../base64.js";

// an image is only able to convey 8bit per channel, and 4 channel (rgba), so that is all this function
// is designed to do.

export async function imageToItcVnImage(image) {
  // Ensure the image is loaded before processing
  if (!image || !image.width || !image.height) {
    throw new Error("Invalid image provided");
  }

  // Use OffscreenCanvas if available, otherwise fallback to standard canvas
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(image.width, image.height)
      : document.createElement("canvas");

  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Use ImageBitmap for efficient rendering if available
  const imageBitmap = await createImageBitmap(image);
  ctx.drawImage(imageBitmap, 0, 0, image.width, image.height);

  // Extract ImageData (RGBA by default)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelArray = imageData.data;

  // Determine pixel format dynamically
  const isSingleChannel = hasSingleChannel(pixelArray);
  const hasAlpha = hasAlphaChannel(pixelArray);

  const channelCount = isSingleChannel
    ? hasAlpha
      ? 2
      : 1 // Grayscale + Alpha (2) or Grayscale (1)
    : hasAlpha
    ? 4
    : 3; // RGBA (4) or RGB (3)

  const reducedData = getReducedChannelData(
    pixelArray,
    isSingleChannel,
    hasAlpha
  );

  // Convert the pixel array to base64
  const base64Data = bytesToBase64(reducedData);

  // Construct final object
  const itcvnimage = {
    imageInfo: {
      nImageSize: reducedData.length,
      nWidth: canvas.width,
      nHeight: canvas.height,
      nXPadding: 0,
      nYPadding: 0,
      stPixelFormat: {
        bSupported: true,
        bSigned: false,
        bPlanar: false,
        bFloat: false,
        nChannels: channelCount,
        ePixelEncoding: "TCVN_PE_NONE",
        ePixelPackMode: "TCVN_PPM_NONE",
        nElementSize: 8,
        nTotalSize: channelCount * 8, // Bits per pixel
      },
    },
    imageData: base64Data,
  };

  return itcvnimage;
}

function getReducedChannelData(pixelArray, isSingleChannel, hasAlpha) {
  const pixelCount = pixelArray.length / 4;
  const channels = isSingleChannel
    ? hasAlpha
      ? 2
      : 1 // Grayscale + Alpha (2) or Grayscale (1)
    : hasAlpha
    ? 4
    : 3; // RGBA (4) or RGB (3)

  const reducedData = new Uint8ClampedArray(pixelCount * channels);

  let writeIndex = 0;

  for (let i = 0; i < pixelArray.length; i += 4) {
    const [r, g, b, a] = pixelArray.slice(i, i + 4);

    if (isSingleChannel) {
      // Grayscale (single channel)
      reducedData[writeIndex++] = r; // R = G = B in grayscale
      if (hasAlpha) {
        reducedData[writeIndex++] = a;
      }
    } else {
      // Color channels
      reducedData[writeIndex++] = r;
      reducedData[writeIndex++] = g;
      reducedData[writeIndex++] = b;
      if (hasAlpha) {
        reducedData[writeIndex++] = a;
      }
    }
  }

  return reducedData;
}

function hasSingleChannel(pixelArray) {
  for (let i = 0; i < pixelArray.length; i += 4) {
    const r = pixelArray[i];
    const g = pixelArray[i + 1];
    const b = pixelArray[i + 2];
    if (r !== g || g !== b) {
      return false;
    }
  }
  return true;
}

function hasAlphaChannel(pixelArray) {
  for (let i = 3; i < pixelArray.length; i += 4) {
    if (pixelArray[i] < 255) {
      return true;
    }
  }
  return false;
}
