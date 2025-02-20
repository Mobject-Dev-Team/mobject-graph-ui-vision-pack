import { DisplayWidget, ControlWidget } from "mobject-graph-ui";
import { iTcVnImageToImage } from "../utils/image-converters/itcvnimage-to-image.js";

import { jpegUrlToITcVnImage } from "../utils/image-converters/jpeg-conversion.js";
import { pngUrlToITcVnImage } from "../utils/image-converters/png-conversion.js";
import { bmpUrlToITcVnImage } from "../utils/image-converters/bmp-conversion.js";
import { tiffUrlToITcVnImage } from "../utils/image-converters/tiff-conversion.js";

export class ITcVnImageDisplayWidget extends DisplayWidget {
  constructor(name, parent, options) {
    super(name, parent, options);
    this.widgetDisplayImage = new Image();

    this.on("valueChanged", async (newValue, oldValue) => {
      if (newValue) {
        this.widgetDisplayImage = await iTcVnImageToImage(newValue);
      } else {
        this.clearDisplayImage();
      }
    });
  }

  clearDisplayImage() {
    this.widgetDisplayImage = new Image();
  }

  computeSize() {
    return new Float32Array([60, 60]);
  }

  draw(ctx, node, widget_width, y, H) {
    const margin = 5;
    const drawWidth = widget_width - margin * 2 + 1;
    const drawHeight = node.size[1] - margin - y;

    // draw the background
    ctx.fillStyle = "#303030";
    ctx.fillRect(margin, y, drawWidth, drawHeight);

    // create a rectangular clipping path
    ctx.fillStyle = "#353535";
    ctx.beginPath();
    ctx.rect(margin, y, drawWidth, drawHeight);
    ctx.clip();

    // draw the checkerboard pattern
    let blockHeight = 10;
    let blockWidth = 10;
    let nRow = drawHeight / blockHeight;
    let nCol = drawWidth / blockWidth;

    ctx.beginPath();
    for (var i = 0; i < nRow; ++i) {
      for (var j = 0, col = nCol / 2; j < col; ++j) {
        ctx.rect(
          2 * j * blockWidth + (i % 2 ? 0 : blockWidth) + margin,
          i * blockHeight + y,
          blockWidth,
          blockHeight
        );
      }
    }
    ctx.fill();

    // draw the outline
    ctx.strokeStyle = this.outline_color;
    ctx.strokeRect(margin, y, drawWidth, drawHeight);

    // draw the no image text
    if (this.widgetDisplayImage.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF"; //this.secondary_text_color;
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText("No image", widget_width * 0.5, y + drawHeight * 0.5);
      return;
    }

    // draw the image
    ctx.drawImage(this.widgetDisplayImage, margin, y, drawWidth, drawHeight);
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

    this.FILE_HANDLERS = {
      "image/jpeg": (url) => jpegUrlToITcVnImage(url),
      "image/png": (url) => pngUrlToITcVnImage(url),
      "image/bmp": (url) => bmpUrlToITcVnImage(url),
      "image/tiff": (url) => tiffUrlToITcVnImage(url),
    };

    this.on("valueChanged", async (newValue, oldValue) => {
      if (newValue) {
        this.widgetDisplayImage = await iTcVnImageToImage(newValue);
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

    return new Float32Array([
      this.droppedImageSize[0],
      this.droppedImageSize[1] + this.getMetaHeight(),
    ]);
  }

  mouse(event, pos, node) {
    // Mouse interaction handling
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
    const margin = 5;
    const drawWidgetWidth = widget_width - 2 * margin;
    const drawImageHeight =
      node.size[1] - 2 * margin - y - this.getMetaHeight();

    this.drawImageBackground(ctx, margin, y, drawWidgetWidth, drawImageHeight);

    if (this.widgetDisplayImage.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText(
        "Drag image here",
        widget_width * 0.5,
        y + drawImageHeight * 0.5
      );
      return;
    }

    // Draw the main image
    ctx.drawImage(
      this.widgetDisplayImage,
      margin,
      y,
      drawWidgetWidth,
      drawImageHeight
    );

    // Metadata configuration
    const metadataLines = this.getMetaLines();

    // Calculate metadata box position
    const metadataY = y + drawImageHeight + margin; // Position below image
    const metadataHeight = this.getMetaHeight();
    const metadataWidth = drawWidgetWidth;

    // Draw metadata text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "10pt Sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const textX = margin + 6;
    const textY = metadataY + 6;
    metadataLines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * 16);
    });
  }

  drawImageBackground(ctx, margin, y, width, height) {
    ctx.strokeStyle = ITcVnImageControlWidget.OUTLINE_COLOR;
    ctx.fillStyle = ITcVnImageControlWidget.BACKGROUND_COLOR;
    ctx.fillRect(margin, y, width, height);
    ctx.strokeRect(margin, y, width, height);
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
