import { iTcVnImageToImage } from "../utils/image-converters/itcvnimage-to-image.js";
import { ItcVnImageDataDecoder } from "../utils/itcvnimagedata-decoder.js";

export class ImageDisplayComponent {
  static DEFAULT_IMAGE_DATA = {
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

  constructor({ defaultImageData, margin = 5, imageTopPadding = 1 } = {}) {
    this.margin = margin;
    this.imageTopPadding = imageTopPadding;
    this.widgetDisplayImage = new Image();
    this.imageData =
      defaultImageData || ImageDisplayComponent.DEFAULT_IMAGE_DATA;
    this.hoverImageCoords = null;
    this.lastComputedSize = null;
    this.itcVnImageDataDecoder = new ItcVnImageDataDecoder();
    this._imageDrawRect = null;
    this._loadToken = 0;
  }

  async setImageData(newValue) {
    this.lastComputedSize = null;
    if (newValue) {
      const loadToken = ++this._loadToken;
      const img = await iTcVnImageToImage(newValue);
      if (loadToken !== this._loadToken) return;
      this.widgetDisplayImage = img;
      this.imageData = newValue;
      this.itcVnImageDataDecoder.update(newValue);
    } else {
      this.clearDisplayImage();
      this.imageData = ImageDisplayComponent.DEFAULT_IMAGE_DATA;
    }
  }

  clearDisplayImage() {
    this.widgetDisplayImage = new Image();
    this.lastComputedSize = null;
  }

  computeSize(widgetWidth = 100, widgetHeight = 100) {
    if (
      !this.widgetDisplayImage ||
      !this.widgetDisplayImage.width ||
      !this.widgetDisplayImage.height
    ) {
      return new Float32Array([widgetWidth, widgetHeight]);
    }
    if (this.lastComputedSize) {
      return this.lastComputedSize;
    }
    const result = new Float32Array([
      this.widgetDisplayImage.width,
      this.widgetDisplayImage.height + this.getMetaHeight(),
    ]);
    this.lastComputedSize = result;
    return result;
  }

  getMetaLines() {
    const info = this.imageData?.imageInfo || {};
    const fmt = info.stPixelFormat || {};
    return [
      `${info.nWidth || 0}x${info.nHeight || 0}px, ${fmt.nChannels || 0}ch, ${
        fmt.nElementSize || 0
      }bit`,
    ];
  }

  getMetaHeight() {
    return this.getMetaLines().length * 16 + 8;
  }

  onMouseOver(_, pos, __, value) {
    if (!this._imageDrawRect || !value) return;

    const { x, y, width, height } = this._imageDrawRect;
    const nativeWidth = value.imageInfo.nWidth;
    const nativeHeight = value.imageInfo.nHeight;

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
  }

  draw(ctx, node, widget_width, y, H, opts = {}) {
    const {
      showEmptyText = "No image",
      metaLines = this.getMetaLines(),
      image = this.widgetDisplayImage,
      value = this.imageData,
      outline_color = "#000",
      metaTextColor = "#FFF",
      metaFont = "10pt Sans-serif",
    } = opts;

    const drawWidgetWidth = widget_width - 2 * this.margin;
    const drawImageHeight =
      node.size[1] - 2 * this.margin - y - this.getMetaHeight();
    const drawImageY = y + this.imageTopPadding;

    this._drawBackgroundAndCheckerboard(
      ctx,
      drawWidgetWidth,
      drawImageY,
      drawImageHeight
    );
    this._drawImageOutline(
      ctx,
      drawWidgetWidth,
      drawImageY,
      drawImageHeight,
      outline_color
    );

    if (!image.src) {
      this._drawEmptyText(
        ctx,
        widget_width,
        drawImageY,
        drawImageHeight,
        showEmptyText,
        metaTextColor
      );
      return;
    }

    this._imageDrawRect = {
      x: this.margin,
      y: drawImageY,
      width: drawWidgetWidth,
      height: drawImageHeight,
    };

    ctx.drawImage(
      image,
      this.margin,
      drawImageY,
      drawWidgetWidth,
      drawImageHeight
    );

    this._drawMeta(
      ctx,
      metaLines,
      metaFont,
      metaTextColor,
      drawImageY,
      drawImageHeight
    );

    if (this.hoverImageCoords && this._imageDrawRect) {
      this._drawHoverTooltip(ctx, node, metaFont);
    }

    const totalHeight =
      2 * this.margin + drawImageHeight + this.getMetaHeight() + drawImageY;
    const totalWidth = widget_width;
    this.lastComputedSize = new Float32Array([totalWidth, totalHeight]);
  }

  _drawBackgroundAndCheckerboard(ctx, width, y, height) {
    ctx.fillStyle = "#303030";
    ctx.fillRect(this.margin, y, width, height);

    const blockSize = 10;
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.margin, y, width, height);
    ctx.clip();

    const blocksY = Math.ceil(height / blockSize);
    const blocksX = Math.ceil(width / blockSize);

    for (let i = 0; i < blocksY; ++i) {
      for (let j = 0; j < blocksX; ++j) {
        if ((i + j) % 2 === 0) {
          const x = this.margin + j * blockSize;
          const yy = y + i * blockSize;
          const w = Math.min(blockSize, width - (x - this.margin));
          const h = Math.min(blockSize, height - (yy - y));
          ctx.fillStyle = "#404040";
          ctx.fillRect(x, yy, w, h);
        }
      }
    }
    ctx.restore();
  }

  _drawImageOutline(ctx, width, y, height, color) {
    ctx.strokeStyle = color;
    ctx.strokeRect(this.margin, y, width, height);
  }

  _drawEmptyText(ctx, widget_width, y, height, text, color) {
    ctx.textAlign = "center";
    ctx.fillStyle = color;
    ctx.font = "italic 10pt Sans-serif";
    ctx.fillText(text, widget_width * 0.5, y + height * 0.5);
  }

  _drawMeta(ctx, metaLines, font, color, y, height) {
    const metadataY = y + height + this.margin;
    const textX = this.margin + 6;
    const textY = metadataY + 6;
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    metaLines.forEach((line, index) => {
      ctx.fillText(line, textX, textY + index * 16);
    });
  }

  _drawHoverTooltip(ctx, node, font) {
    const { imgX, imgY, canvasX, canvasY } = this.hoverImageCoords;
    const pixel = this.itcVnImageDataDecoder?.getPixel(imgX, imgY);
    const labelLines = [`📐 ${imgX}, ${imgY}`];

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
        labelLines.push(`${emoji} ${pixel[i]}`);
      }
    } else {
      labelLines.push(`[?]`);
    }

    ctx.font = font;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const padding = 5;
    const lineHeight = 20;
    const textWidth = Math.max(
      ...labelLines.map((line) => ctx.measureText(line).width)
    );

    // Add extra width for emoji padding
    const tooltipWidth = textWidth + padding * 2 + 4;
    const tooltipHeight = labelLines.length * lineHeight + padding * 2;

    let tooltipX = canvasX + 12;
    let tooltipY = canvasY + 12;
    if (tooltipX + tooltipWidth > node.size[0])
      tooltipX = canvasX - tooltipWidth - 12;
    if (tooltipY + tooltipHeight > node.size[1])
      tooltipY = canvasY - tooltipHeight - 12;
    tooltipX = Math.max(2, Math.min(tooltipX, node.size[0] - tooltipWidth - 2));
    tooltipY = Math.max(
      2,
      Math.min(tooltipY, node.size[1] - tooltipHeight - 2)
    );

    // Draw background
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Draw text with vertical centering
    ctx.fillStyle = "#FFF";
    const verticalOffset = padding + lineHeight * 0.8;
    labelLines.forEach((line, i) => {
      ctx.fillText(
        line,
        tooltipX + padding + 2,
        tooltipY + verticalOffset + i * lineHeight
      );
    });
  }
}
