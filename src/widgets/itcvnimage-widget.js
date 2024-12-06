import { DisplayWidget, ControlWidget } from "mobject-graph-ui";
import {
  loadITcVnImageToImage,
  convertImageToITcVnImage,
} from "../utils/itcvnimage-conversion.js";

export class ITcVnImageDisplayWidget extends DisplayWidget {
  constructor(name, parent, options) {
    super(name, parent, options);
    this.image = new Image();

    this.on("valueChanged", (newValue, oldValue) => {
      if (newValue) {
        loadITcVnImageToImage(newValue, this.image);
      } else {
        this.image = new Image();
      }
    });
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
    if (this.image.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF"; //this.secondary_text_color;
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText("No image", widget_width * 0.5, y + drawHeight * 0.5);
      return;
    }

    // draw the image
    ctx.drawImage(this.image, margin, y, drawWidth, drawHeight);
  }
}
export class ITcVnImageControlWidget extends ControlWidget {
  static SUPPORTED_TYPES = ["image/jpeg", "image/png", "image/bmp"];
  static DEFAULT_SIZE = new Float32Array([100, 100]);
  static OUTLINE_COLOR = "#000"; // default outline color
  static BACKGROUND_COLOR = "#303030";
  static TEXT_COLOR = "#FFF";

  constructor(name, property, parameter, content) {
    super(name, property, parameter, content);
    this.image = new Image();
    this._size = ITcVnImageControlWidget.DEFAULT_SIZE;
    this.value = this.getDefaultImageData();

    this.on("valueChanged", (newValue, oldValue) => {
      loadITcVnImageToImage(newValue, this.image);
    });
  }

  computeSize(width) {
    return this._size;
  }

  mouse(event, pos, node) {
    // Mouse interaction handling
  }

  draw(ctx, node, widget_width, y, H) {
    const margin = 5;
    const drawWidth = widget_width - 2 * margin;
    const drawHeight = node.size[1] - margin - y;

    this.drawBackground(ctx, margin, y, drawWidth, drawHeight);
    this.drawOutline(ctx, margin, y, drawWidth, drawHeight);

    // draw the no image text
    if (this.image.src == "") {
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "italic 10pt Sans-serif";
      ctx.fillText("Drag image here", widget_width * 0.5, y + drawHeight * 0.5);

      return;
    }

    // draw the image
    ctx.drawImage(this.image, margin, y, drawWidth, drawHeight);
  }

  onDropFile(file) {
    if (!this.isSupportedFileType(file)) {
      console.error("Unsupported file type:", file.type);
      return false;
    }

    const url = URL.createObjectURL(file);
    this.loadDroppedImageToWidget(url);
    return true;
  }

  isSupportedFileType(file) {
    return ITcVnImageControlWidget.SUPPORTED_TYPES.includes(file.type);
  }

  loadDroppedImageToWidget(url) {
    const image = new Image();
    image.src = url;
    image.onload = this.handleImageOnLoad.bind(this, image);
    image.onerror = () => {
      console.error(`Error loading the image: ${url}`);
      URL.revokeObjectURL(url);
    };
  }

  handleImageOnLoad(image) {
    this.setWidgetSizeToImage(image);
    this.value = convertImageToITcVnImage(image);
    URL.revokeObjectURL(image.src);
  }

  setWidgetSizeToImage(image) {
    let originalWidth = image.width;
    let originalHeight = image.height;
    let newHeight = 300;
    let aspectRatio = originalWidth / originalHeight;
    let newWidth = newHeight * aspectRatio;
    this._size = new Float32Array([newWidth, newHeight]);
    this.triggerParentResetSize();
  }

  drawBackground(ctx, margin, y, width, height) {
    ctx.fillStyle = ITcVnImageControlWidget.BACKGROUND_COLOR;
    ctx.fillRect(margin, y, width, height);
  }

  drawOutline(ctx, margin, y, width, height) {
    ctx.strokeStyle = ITcVnImageControlWidget.OUTLINE_COLOR;
    ctx.strokeRect(margin, y, width, height);
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
