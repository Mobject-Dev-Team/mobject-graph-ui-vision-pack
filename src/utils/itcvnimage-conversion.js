import { bytesToBase64 } from "./base64.js";

/* Example of itcvnimage
---------------------------
{
    imageInfo: {
        nImageSize: 75,
        nWidth: 5,
        nHeight: 5,
        nXPadding: 0,
        nYPadding: 0,
        stPixelFormat: {
            bSupported: true,
            bSigned: false,
            bPlanar: false,
            bFloat: false,
            nChannels: 3,
            ePixelEncoding: "TCVN_PE_NONE",
            ePixelPackMode: "TCVN_PPM_NONE",
            nElementSize: 8,
            nTotalSize: 24,
        },
    },
    imageData:
        "7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk",
};
*/

export function loadITcVnImageToImage(itcvnimage, image) {
  if (!itcvnimage) {
    return;
  }
  const {
    imageInfo: { nWidth, nHeight, stPixelFormat },
    imageData,
  } = itcvnimage;

  // Convert base64 to binary data
  const binaryData = decodeBase64ToBinary(imageData);

  // Determine the correct bytes per pixel and channels
  const { nChannels, nElementSize } = stPixelFormat;

  // Process the binary data based on channel information
  const pixelArray = convertBinaryDataToPixelArray(
    binaryData,
    nWidth,
    nHeight,
    nChannels,
    nElementSize
  );

  // Create and draw the image on the canvas
  setImageUsingPixelArray(image, pixelArray, nWidth, nHeight);
}

function decodeBase64ToBinary(base64String) {
  const binaryString = window.atob(base64String);
  return new Uint8Array(
    binaryString.split("").map((char) => char.charCodeAt(0))
  );
}

function convertBinaryDataToPixelArray(
  binaryData,
  width,
  height,
  channels,
  bitDepth
) {
  const bytesPerPixel = (channels * bitDepth) / 8;
  const outputBytes = new Uint8Array(width * height * 4);
  let j = 0;

  for (let i = 0; i < binaryData.length; i += bytesPerPixel) {
    let r,
      g,
      b,
      a = 255;

    if (bitDepth === 8) {
      if (channels === 1) {
        r = g = b = binaryData[i];
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
        r = g = b = (binaryData[i] + binaryData[i + 1] * 256) >> 8;
      } else if (channels === 3) {
        r = (binaryData[i] + binaryData[i + 1] * 256) >> 8;
        g = (binaryData[i + 2] + binaryData[i + 3] * 256) >> 8;
        b = (binaryData[i + 4] + binaryData[i + 5] * 256) >> 8;
      } else if (channels === 4) {
        r = (binaryData[i] + binaryData[i + 1] * 256) >> 8;
        g = (binaryData[i + 2] + binaryData[i + 3] * 256) >> 8;
        b = (binaryData[i + 4] + binaryData[i + 5] * 256) >> 8;
        a = (binaryData[i + 6] + binaryData[i + 7] * 256) >> 8;
      }
    }

    outputBytes.set([r, g, b, a], j);
    j += 4;
  }

  return outputBytes;
}

function setImageUsingPixelArray(
  image,
  imagePixelArray,
  imageWidth,
  imageHeight
) {
  const canvas = createCanvas(imageWidth, imageHeight);
  const ctx = canvas.getContext("2d");

  const imageData = new ImageData(
    new Uint8ClampedArray(imagePixelArray),
    imageWidth,
    imageHeight
  );
  ctx.putImageData(imageData, 0, 0);

  image.src = canvas.toDataURL("image/png");
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function convertImageToITcVnImage(image) {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const itcvnimage = {
    imageInfo: {
      nImageSize: imageData.data.length,
      nWidth: canvas.width,
      nHeight: canvas.height,
      nXPadding: 0,
      nYPadding: 0,
      stPixelFormat: {
        bSupported: true,
        bSigned: false,
        bPlanar: false,
        bFloat: false,
        nChannels: 4,
        ePixelEncoding: "TCVN_PE_NONE",
        ePixelPackMode: "TCVN_PPM_NONE",
        nElementSize: 8,
        nTotalSize: 24,
      },
    },
    imageData: bytesToBase64(imageData.data),
  };

  // console.log("Serialized Image Data:", image);
  return itcvnimage;
}
