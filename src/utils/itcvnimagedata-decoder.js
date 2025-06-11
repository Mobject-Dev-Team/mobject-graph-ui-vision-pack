export class ItcVnImageDataDecoder {
  constructor(image) {
    this._buffer = null;
    this.imageInfo = null;
    if (image) this.update(image);
  }

  /**
   * Update the decoder with a new image
   * @param {object} image - New image object with imageInfo and imageData
   */
  update(image) {
    this.imageInfo = image?.imageInfo || null;
    this._buffer = null;

    if (!image?.imageData) return;

    const raw = atob(image.imageData);
    const buf = new ArrayBuffer(raw.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
    this._buffer = buf;
  }

  /**
   * Checks if the decoder has valid data
   * @returns {boolean}
   */
  isValid() {
    return !!this._buffer && !!this.imageInfo;
  }

  /**
   * Gets channel values at pixel (x, y)
   * @param {number} x - X position in pixels
   * @param {number} y - Y position in pixels
   * @returns {number[] | null}
   */
  getPixel(x, y) {
    if (!this.isValid()) return null;

    const { nWidth, nHeight, stPixelFormat: fmt } = this.imageInfo;

    if (x < 0 || y < 0 || x >= nWidth || y >= nHeight) return null;

    const channels = fmt.nChannels;
    const bitsPerChannel = fmt.nElementSize;
    const bytesPerChannel = bitsPerChannel / 8;
    const pixelStride = channels * bytesPerChannel;
    const rowStride = nWidth * pixelStride;
    const offset = y * rowStride + x * pixelStride;

    if (offset + pixelStride > this._buffer.byteLength) return null;

    let TypedArray = null;
    if (fmt.bFloat) {
      if (bitsPerChannel === 32) TypedArray = Float32Array;
      else if (bitsPerChannel === 64) TypedArray = Float64Array;
    } else if (fmt.bSigned) {
      if (bitsPerChannel === 8) TypedArray = Int8Array;
      else if (bitsPerChannel === 16) TypedArray = Int16Array;
      else if (bitsPerChannel === 32) TypedArray = Int32Array;
    } else {
      if (bitsPerChannel === 8) TypedArray = Uint8Array;
      else if (bitsPerChannel === 16) TypedArray = Uint16Array;
      else if (bitsPerChannel === 32) TypedArray = Uint32Array;
    }

    if (!TypedArray) return null;

    const view = new TypedArray(this._buffer, offset, channels);
    return Array.from(view);
  }
}
