import UTIF from "utif";

export async function tiffUrlToITcVnImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        const buffer = event.target.result;
        const tiffs = UTIF.decode(buffer);
        if (tiffs.length === 0) {
          throw new Error("No TIFF images found in the file");
        }

        const firstTiff = tiffs[0];
        UTIF.decodeImage(buffer, firstTiff);

        const samplesPerPixel = firstTiff.t277[0];
        const bitsPerSample = firstTiff.t258[0];
        const base64String = bufferToBase64(firstTiff.data);

        const itcvnimage = {
          imageInfo: {
            nImageSize: firstTiff.data.length,
            nWidth: firstTiff.width,
            nHeight: firstTiff.height,
            nXPadding: 0,
            nYPadding: 0,
            stPixelFormat: {
              nChannels: samplesPerPixel,
              nElementSize: bitsPerSample,
              nTotalSize: samplesPerPixel * bitsPerSample,
            },
          },
          imageData: base64String,
        };

        resolve(itcvnimage);
      } catch (error) {
        console.error("Error processing TIFF file:", error);
        reject(
          "Failed to process TIFF file. Please check the file and try again."
        );
      }
    };
    reader.onerror = function (error) {
      console.error("Error reading file:", error);
      reject("Failed to read the file. Please try again.");
    };
    reader.readAsArrayBuffer(file);
  });
}

function bufferToBase64(buf) {
  if (buf instanceof ArrayBuffer) {
    buf = new Uint8Array(buf);
  }
  const chunkSize = 8192;
  let result = "";
  for (let i = 0; i < buf.length; i += chunkSize) {
    const chunk = buf.subarray(i, i + chunkSize);
    result += String.fromCharCode.apply(null, chunk);
  }
  return btoa(result);
}
