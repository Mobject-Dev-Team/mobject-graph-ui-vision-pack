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
    this.dragStart = null;
    this.dragCurrent = null;
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

  onMouse(event, pos, node) {
    if (!this._imageDrawRect) return;
    const { x, y, width, height } = this._imageDrawRect;

    let canvasX = pos[0],
      canvasY = pos[1];

    canvasX = this.clamp(canvasX, x, x + width);
    canvasY = this.clamp(canvasY, y, y + height);

    const imageX = canvasX - x;
    const imageY = canvasY - y;

    const inside =
      imageX >= 0 && imageX <= width && imageY >= 0 && imageY <= height;
    const scaleX = this.imageData.imageInfo.nWidth / width;
    const scaleY = this.imageData.imageInfo.nHeight / height;

    switch (event.type) {
      case "pointerdown":
        console.log("onMouse pointerdown", event, pos, node, this.imageData);
        if (inside) {
          console.log("mousedown inside", imageX, imageY, scaleX, scaleY);
          this.dragStart = {
            imgX: Math.floor(imageX * scaleX),
            imgY: Math.floor(imageY * scaleY),
            canvasX,
            canvasY,
          };
          this.dragCurrent = { ...this.dragStart };
        }
        break;
      case "pointermove":
        if (this.dragStart) {
          this.dragCurrent = {
            imgX: Math.floor(imageX * scaleX),
            imgY: Math.floor(imageY * scaleY),
            canvasX,
            canvasY,
          };
        }
        break;
      case "pointerup":
        if (this.dragStart) {
          this.dragCurrent = {
            imgX: Math.floor(imageX * scaleX),
            imgY: Math.floor(imageY * scaleY),
            canvasX,
            canvasY,
          };

          this.dragStart = null;
          this.dragCurrent = null;
        }
        break;
      default:
        break;
    }
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

  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
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

    if (this.dragStart && this.dragCurrent && this._imageDrawRect) {
      const { canvasX: x0, canvasY: y0 } = this.dragStart;
      const { canvasX: x1, canvasY: y1 } = this.dragCurrent;
      this._drawSelectionMask(ctx, this._imageDrawRect, x0, y0, x1, y1);
      this._drawSelectionRect(ctx, this._imageDrawRect, x0, y0, x1, y1);
      this._drawSelectionLabels(
        ctx,
        x0,
        y0,
        x1,
        y1,
        this._imageDrawRect,
        this.imageData.imageInfo
      );
      this._drawDiagonalLabel(ctx, x0, y0, x1, y1);
    } else if (this.hoverImageCoords && this._imageDrawRect) {
      this._drawHoverTooltip(ctx, node, metaFont);
    }

    const totalHeight =
      2 * this.margin + drawImageHeight + this.getMetaHeight() + drawImageY;
    const totalWidth = widget_width;
    this.lastComputedSize = new Float32Array([totalWidth, totalHeight]);
  }

  _drawSelectionRect(ctx, drawRect) {
    const { canvasX: x0, canvasY: y0 } = this.dragStart;
    const { canvasX: x1, canvasY: y1 } = this.dragCurrent;

    ctx.save();
    ctx.strokeStyle = "#0FF";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.restore();
  }

  _drawDiagonalLabel(ctx, x0, y0, x1, y1) {
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const length = Math.sqrt(dx * dx + dy * dy).toFixed(1);

    // Draw the diagonal line
    ctx.save();
    ctx.strokeStyle = "#0FF";
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    // Draw the label
    ctx.setLineDash([]);
    ctx.globalAlpha = 1.0;
    this._drawTextBox(ctx, `${length}px`, mx, my);

    ctx.restore();
  }

  _drawSelectionMask(ctx, drawRect, x0, y0, x1, y1) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    // The selection box, normalized
    const left = Math.min(x0, x1),
      right = Math.max(x0, x1);
    const top = Math.min(y0, y1),
      bottom = Math.max(y0, y1);

    // Top
    ctx.fillRect(drawRect.x, drawRect.y, drawRect.width, top - drawRect.y);
    // Bottom
    ctx.fillRect(
      drawRect.x,
      bottom,
      drawRect.width,
      drawRect.y + drawRect.height - bottom
    );
    // Left
    ctx.fillRect(drawRect.x, top, left - drawRect.x, bottom - top);
    // Right
    ctx.fillRect(right, top, drawRect.x + drawRect.width - right, bottom - top);
    ctx.restore();
  }

  _drawTextBox(ctx, text, x, y, opts = {}) {
    ctx.save();
    ctx.font = opts.font || "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const padding = opts.padding || 4;
    const metrics = ctx.measureText(text);
    const w = metrics.width + padding * 2;
    const h = 18;
    ctx.fillStyle = opts.bg || "rgba(0,0,0,0.7)";
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.strokeStyle = opts.border || "#0FF";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = opts.fg || "#0FF";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  _drawSelectionLabels(ctx, x0, y0, x1, y1, drawRect, imageInfo) {
    // Convert canvas coords to image coords
    const { x, y, width, height } = drawRect;
    const nativeWidth = imageInfo.nWidth;
    const nativeHeight = imageInfo.nHeight;
    const scaleX = nativeWidth / width;
    const scaleY = nativeHeight / height;

    function toImageCoords(cx, cy) {
      return [Math.floor((cx - x) * scaleX), Math.floor((cy - y) * scaleY)];
    }

    const [minImgX, minImgY] = toImageCoords(
      Math.min(x0, x1),
      Math.min(y0, y1)
    );
    const [maxImgX, maxImgY] = toImageCoords(
      Math.max(x0, x1),
      Math.max(y0, y1)
    );

    // Labels for corners (in image space)
    this._drawTextBox(
      ctx,
      `(${minImgX}, ${minImgY})`,
      Math.min(x0, x1),
      Math.min(y0, y1) - 15
    );
    this._drawTextBox(
      ctx,
      `(${maxImgX}, ${maxImgY})`,
      Math.max(x0, x1),
      Math.max(y0, y1) + 15
    );

    // Width label (in image pixels)
    const widthPx = Math.abs(maxImgX - minImgX) + 1;
    const midTopX = (x0 + x1) / 2;
    this._drawTextBox(ctx, `${widthPx}px`, midTopX, Math.min(y0, y1));

    // Height label (in image pixels)
    const heightPx = Math.abs(maxImgY - minImgY) + 1;
    const midLeftY = (y0 + y1) / 2;
    this._drawTextBox(ctx, `${heightPx}px`, Math.max(x0, x1), midLeftY, {
      font: "bold 12px sans-serif",
      fg: "#0FF",
      bg: "rgba(0,0,0,0.7)",
      padding: 3,
    });
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
    let labelLines = [`📐 ${imgX}, ${imgY}`];
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
