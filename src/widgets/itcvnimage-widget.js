import { DisplayWidget, ControlWidget } from "mobject-graph-ui";
import { iTcVnImageToImage } from "../utils/image-converters/itcvnimage-to-image.js";
import { ItcVnImageDataDecoder } from "../utils/itcvnimagedata-decoder.js";

import { jpegUrlToITcVnImage } from "../utils/image-converters/jpeg-conversion.js";
import { pngUrlToITcVnImage } from "../utils/image-converters/png-conversion.js";
import { bmpUrlToITcVnImage } from "../utils/image-converters/bmp-conversion.js";
import { tiffUrlToITcVnImage } from "../utils/image-converters/tiff-conversion.js";

export class ITcVnImageDisplayWidget extends DisplayWidget {
  constructor(name, parent, options) {
    super(name, parent, options);
    this.widgetDisplayImage = new Image();
    this.imageData = this.getDefaultImageData();
    this.margin = 5;
    this.hoverImageCoords = null;
    this.lastComputedSize = null;
    this.imageTopPadding = 1;
    this.itcVnImageDataDecoder = new ItcVnImageDataDecoder();

    this.on("valueChanged", async (newValue, oldValue) => {
      if (newValue) {
        this.widgetDisplayImage = await iTcVnImageToImage(newValue);
        this.imageData = newValue;
        this.itcVnImageDataDecoder.update(newValue);
      } else {
        this.clearDisplayImage();
        this.imageData = this.getDefaultImageData();
      }
    });
  }

  clearDisplayImage() {
    this.widgetDisplayImage = new Image();
  }

  computeSize() {
    if (
      !this.widgetDisplayImage ||
      !this.widgetDisplayImage.width ||
      !this.widgetDisplayImage.height
    ) {
      return ITcVnImageControlWidget.DEFAULT_SIZE;
    }

    if (this.lastComputedSize) {
      return this.lastComputedSize;
    }

    return new Float32Array([
      this.widgetDisplayImage.width,
      this.widgetDisplayImage.height + this.getMetaHeight(),
    ]);
  }

  getMetaLines() {
    return [
      `${this.imageData.imageInfo.nWidth}x${this.imageData.imageInfo.nHeight}px, ${this.imageData.imageInfo.stPixelFormat.nChannels}ch, ${this.imageData.imageInfo.stPixelFormat.nElementSize}bit`,
    ];
  }

  getMetaHeight() {
    return this.getMetaLines().length * 16 + 8; // 16px per line + padding
  }

  mouse(event, pos, node) {
    //
  }

  onMouseOver(event, pos, node) {
    if (!this._imageDrawRect) return;
    if (!this.value) return;

    const { x, y, width, height } = this._imageDrawRect;
    const nativeWidth = this.value.imageInfo.nWidth;
    const nativeHeight = this.value.imageInfo.nHeight;

    const imageX = pos[0] - x;
    const imageY = pos[1] - y;

    if (imageX >= 0 && imageX <= width && imageY >= 0 && imageY <= height) {
      const scaleX = nativeWidth / width;
      const scaleY = nativeHeight / height;

      this.hoverImageCoords = {
        imgX: Math.floor(imageX * scaleX),
        imgY: Math.floor(imageY * scaleY),
        canvasX: pos[0],
        canvasY: pos[1],
      };
    } else {
      this.hoverImageCoords = null;
    }

    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  draw(ctx, node, widget_width, y, H) {
    const drawWidgetWidth = widget_width - 2 * this.margin;
    const drawImageHeight =
      node.size[1] - 2 * this.margin - y - this.getMetaHeight();
    const drawImageY = y + this.imageTopPadding;
    // draw the background
    ctx.fillStyle = "#303030";
    ctx.fillRect(this.margin, drawImageY, drawWidgetWidth, drawImageHeight);

    // create a rectangular clipping path
    ctx.fillStyle = "#353535";
    ctx.beginPath();
    ctx.rect(
      this.margin,
      drawImageY,
      drawWidgetWidth,
      drawImageHeight + this.getMetaHeight()
    );
    ctx.clip();

    // draw the checkerboard pattern
    let blockHeight = 10;
    let blockWidth = 10;
    let nRow = drawImageHeight / blockHeight;
    let nCol = drawWidgetWidth / blockWidth;

    ctx.beginPath();
    for (var i = 0; i < nRow; ++i) {
      for (var j = 0, col = nCol / 2; j < col; ++j) {
        ctx.rect(
          2 * j * blockWidth + (i % 2 ? 0 : blockWidth) + this.margin,
          i * blockHeight + drawImageY,
          blockWidth,
          blockHeight
        );
      }
    }
    ctx.fill();

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.strokeRect(this.margin, drawImageY, drawWidgetWidth, drawImageHeight);

    // draw the no image text
    if (this.widgetDisplayImage.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF"; //this.secondary_text_color;
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText(
        "No image",
        widget_width * 0.5,
        drawImageY + drawImageHeight * 0.5
      );
      return;
    }

    this._imageDrawRect = {
      x: this.margin,
      y: drawImageY,
      width: drawWidgetWidth,
      height: drawImageHeight,
    };

    // draw the image
    ctx.drawImage(
      this.widgetDisplayImage,
      this.margin,
      drawImageY,
      drawWidgetWidth,
      drawImageHeight
    );

    // Metadata configuration
    const metadataLines = this.getMetaLines();

    // Calculate metadata box position
    const metadataY = drawImageY + drawImageHeight + this.margin; // Position below image
    const metadataHeight = this.getMetaHeight();
    const metadataWidth = drawWidgetWidth;

    // Draw metadata text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10pt Sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const textX = this.margin + 6;
    const textY = metadataY + 6;
    metadataLines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * 16);
    });

    if (this.hoverImageCoords && this._imageDrawRect) {
      const { imgX, imgY, canvasX, canvasY } = this.hoverImageCoords;
      const pixel = this.itcVnImageDataDecoder?.getPixel(imgX, imgY);

      const labelLines = [`📐 (${imgX}, ${imgY})`];

      if (pixel && Array.isArray(pixel)) {
        const emojiMapByLength = {
          1: ["🔲"],
          2: ["🔲", "🔳"],
          3: ["🔴", "🟢", "🔵"],
          4: ["🔴", "🟢", "🔵", "🔳"],
        };

        const emojis = emojiMapByLength[pixel.length] || [];

        for (let i = 0; i < pixel.length; i++) {
          const emoji = emojis[i] || `Ch${i + 1}`;
          labelLines.push(`${emoji}: ${pixel[i]}`);
        }
      } else {
        labelLines.push(`[?]`);
      }

      // --- Text & layout ---
      ctx.font = "10pt Sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const padding = 4;
      const textWidth = Math.max(
        ...labelLines.map((line) => ctx.measureText(line).width)
      );
      const tooltipWidth = textWidth + padding * 2;
      const tooltipHeight = labelLines.length * 16 + padding * 2;

      // --- Start from default position (bottom-right) ---
      const offsetX = 12;
      const offsetY = 12;
      let tooltipX = canvasX + offsetX;
      let tooltipY = canvasY + offsetY;

      // --- Conditionally flip if out of bounds ---
      if (tooltipX + tooltipWidth > node.size[0]) {
        tooltipX = canvasX - tooltipWidth - offsetX;
      }
      if (tooltipY + tooltipHeight > node.size[1]) {
        tooltipY = canvasY - tooltipHeight - offsetY;
      }

      // --- Clamp to edge (just in case) ---
      tooltipX = Math.max(
        2,
        Math.min(tooltipX, node.size[0] - tooltipWidth - 2)
      );
      tooltipY = Math.max(
        2,
        Math.min(tooltipY, node.size[1] - tooltipHeight - 2)
      );

      // --- Draw background ---
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      ctx.fill();
      ctx.stroke();

      // --- Draw text ---
      ctx.fillStyle = "#FFFFFF";
      labelLines.forEach((line, i) => {
        ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * 16);
      });
    }

    const totalHeight =
      2 * this.margin + drawImageHeight + metadataHeight + drawImageY;
    const totalWidth = widget_width;

    this.lastComputedSize = new Float32Array([totalWidth, totalHeight]);
  }

  getDefaultImageData() {
    const image = {
      imageInfo: {
        nImageSize: 0,
        nWidth: 0,
        nHeight: 0,
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
          nElementSize: 0,
          nTotalSize: 0,
        },
      },
      imageData: "",
    };
    return image;
  }
}
export class ITcVnImageControlWidget extends ControlWidget {
  static DEFAULT_SIZE = new Float32Array([100, 100]);
  static OUTLINE_COLOR = "#000";
  static BACKGROUND_COLOR = "#303030";
  static TEXT_COLOR = "#FFF";

  constructor(name, property, parameter, content) {
    super(name, property, parameter, content);
    this.widgetDisplayImage = new Image();
    this.droppedImageSize = ITcVnImageControlWidget.DEFAULT_SIZE;
    this.value = this.getDefaultImageData();
    this.margin = 5;
    this.hoverImageCoords = null;
    this.lastComputedSize = null;
    this.imageTopPadding = 1;
    this.itcVnImageDataDecoder = new ItcVnImageDataDecoder();

    this.FILE_HANDLERS = {
      "image/jpeg": (url) => jpegUrlToITcVnImage(url),
      "image/png": (url) => pngUrlToITcVnImage(url),
      "image/bmp": (url) => bmpUrlToITcVnImage(url),
      "image/tiff": (url) => tiffUrlToITcVnImage(url),
    };

    this.on("valueChanged", async (newValue, oldValue) => {
      if (newValue) {
        this.widgetDisplayImage = await iTcVnImageToImage(newValue);
        this.itcVnImageDataDecoder.update(newValue);
        this.parent.setDirtyCanvas(true, true);
      } else {
        this.clearDisplayImage();
      }
    });
  }

  clearDisplayImage() {
    this.widgetDisplayImage = new Image();
  }

  computeSize(width) {
    if (
      !this.widgetDisplayImage ||
      !this.widgetDisplayImage.width ||
      !this.widgetDisplayImage.height
    ) {
      return ITcVnImageControlWidget.DEFAULT_SIZE;
    }

    if (this.lastComputedSize) {
      return this.lastComputedSize;
    }

    return new Float32Array([
      this.droppedImageSize[0],
      this.droppedImageSize[1] + this.getMetaHeight(),
    ]);
  }

  mouse(event, pos, node) {
    // Mouse interaction handling
  }

  onMouseOver(event, pos, node) {
    if (!this._imageDrawRect) return;
    if (!this.value) return;

    const { x, y, width, height } = this._imageDrawRect;
    const nativeWidth = this.value.imageInfo.nWidth;
    const nativeHeight = this.value.imageInfo.nHeight;

    const imageX = pos[0] - x;
    const imageY = pos[1] - y;

    if (imageX >= 0 && imageX <= width && imageY >= 0 && imageY <= height) {
      const scaleX = nativeWidth / width;
      const scaleY = nativeHeight / height;

      this.hoverImageCoords = {
        imgX: Math.floor(imageX * scaleX),
        imgY: Math.floor(imageY * scaleY),
        canvasX: pos[0],
        canvasY: pos[1],
      };
    } else {
      this.hoverImageCoords = null;
    }

    this.parent?.graph?.setDirtyCanvas(true, false);
  }

  getMetaLines() {
    return [
      `${this.value.imageInfo.nWidth}x${this.value.imageInfo.nHeight}px, ${this.value.imageInfo.stPixelFormat.nChannels}ch, ${this.value.imageInfo.stPixelFormat.nElementSize}bit`,
    ];
  }

  getMetaHeight() {
    return this.getMetaLines().length * 16 + 8; // 16px per line + padding
  }

  draw(ctx, node, widget_width, y, H) {
    const drawWidgetWidth = widget_width - 2 * this.margin;
    const drawImageHeight =
      node.size[1] - 2 * this.margin - y - this.getMetaHeight();
    const drawImageY = y + this.imageTopPadding;

    this.drawImageBackground(ctx, drawImageY, drawWidgetWidth, drawImageHeight);

    if (this.widgetDisplayImage.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText(
        "Drag image here",
        widget_width * 0.5,
        drawImageY + drawImageHeight * 0.5
      );
      return;
    }

    this._imageDrawRect = {
      x: this.margin,
      y: drawImageY,
      width: drawWidgetWidth,
      height: drawImageHeight,
    };

    // Draw the main image
    ctx.drawImage(
      this.widgetDisplayImage,
      this.margin,
      drawImageY,
      drawWidgetWidth,
      drawImageHeight
    );

    // Metadata configuration
    const metadataLines = this.getMetaLines();

    // Calculate metadata box position
    const metadataY = drawImageY + drawImageHeight + this.margin;
    const metadataHeight = this.getMetaHeight();
    const metadataWidth = drawWidgetWidth;

    // Draw metadata text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10pt Sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const textX = this.margin + 6;
    const textY = metadataY + 6;
    metadataLines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * 16);
    });

    if (this.hoverImageCoords && this._imageDrawRect) {
      const { imgX, imgY, canvasX, canvasY } = this.hoverImageCoords;
      const pixel = this.itcVnImageDataDecoder?.getPixel(imgX, imgY);

      const labelLines = [`📐 (${imgX}, ${imgY})`];

      if (pixel && Array.isArray(pixel)) {
        const emojiMapByLength = {
          1: ["🔲"],
          2: ["🔲", "🔳"],
          3: ["🔴", "🟢", "🔵"],
          4: ["🔴", "🟢", "🔵", "🔳"],
        };

        const emojis = emojiMapByLength[pixel.length] || [];

        for (let i = 0; i < pixel.length; i++) {
          const emoji = emojis[i] || `Ch${i + 1}`;
          labelLines.push(`${emoji}: ${pixel[i]}`);
        }
      } else {
        labelLines.push(`[?]`);
      }

      // --- Text & layout ---
      ctx.font = "10pt Sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";

      const padding = 4;
      const textWidth = Math.max(
        ...labelLines.map((line) => ctx.measureText(line).width)
      );
      const tooltipWidth = textWidth + padding * 2;
      const tooltipHeight = labelLines.length * 16 + padding * 2;

      // --- Start from default position (bottom-right) ---
      const offsetX = 12;
      const offsetY = 12;
      let tooltipX = canvasX + offsetX;
      let tooltipY = canvasY + offsetY;

      // --- Conditionally flip if out of bounds ---
      if (tooltipX + tooltipWidth > node.size[0]) {
        tooltipX = canvasX - tooltipWidth - offsetX;
      }
      if (tooltipY + tooltipHeight > node.size[1]) {
        tooltipY = canvasY - tooltipHeight - offsetY;
      }

      // --- Clamp to edge (just in case) ---
      tooltipX = Math.max(
        2,
        Math.min(tooltipX, node.size[0] - tooltipWidth - 2)
      );
      tooltipY = Math.max(
        2,
        Math.min(tooltipY, node.size[1] - tooltipHeight - 2)
      );

      // --- Draw background ---
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
      ctx.fill();
      ctx.stroke();

      // --- Draw text ---
      ctx.fillStyle = "#FFFFFF";
      labelLines.forEach((line, i) => {
        ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * 16);
      });
    }

    const totalHeight =
      2 * this.margin + drawImageHeight + metadataHeight + drawImageY;
    const totalWidth = widget_width;

    this.lastComputedSize = new Float32Array([totalWidth, totalHeight]);
  }

  drawImageBackground(ctx, y, width, height) {
    ctx.strokeStyle = ITcVnImageControlWidget.OUTLINE_COLOR;
    ctx.fillStyle = ITcVnImageControlWidget.BACKGROUND_COLOR;
    ctx.fillRect(this.margin, y, width, height);
    ctx.strokeRect(this.margin, y, width, height);
  }

  drawMetaBackground(ctx, x, y, width, height) {
    ctx.strokeStyle = ITcVnImageControlWidget.OUTLINE_COLOR;
    ctx.fillStyle = ITcVnImageControlWidget.BACKGROUND_COLOR;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    ctx.stroke();
  }

  onDropFile(file) {
    const fileType = file.type;
    if (this.FILE_HANDLERS[fileType]) {
      this.FILE_HANDLERS[fileType](file)
        .then(async (itcVnImageData) => {
          this.value = itcVnImageData;
          this.widgetDisplayImage = await iTcVnImageToImage(itcVnImageData);
          this.updateDroppedImageSize(this.widgetDisplayImage);
        })
        .catch((error) => {
          console.error(`Error processing the file: ${error}`);
        });

      return true;
    } else {
      console.error(`Unsupported file type: ${fileType}`);
      return false;
    }
  }

  updateDroppedImageSize(image) {
    let originalWidth = image.width;
    let originalHeight = image.height;
    let newHeight = 200;
    let aspectRatio = originalWidth / originalHeight;
    let newWidth = newHeight * aspectRatio;
    this.droppedImageSize = new Float32Array([newWidth, newHeight]);
    this.triggerParentResetSize();
  }

  getDefaultImageData() {
    const image = {
      imageInfo: {
        nImageSize: 0,
        nWidth: 0,
        nHeight: 0,
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
          nElementSize: 0,
          nTotalSize: 0,
        },
      },
      imageData: "",
    };
    return image;
  }
}

/* Example of data
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
