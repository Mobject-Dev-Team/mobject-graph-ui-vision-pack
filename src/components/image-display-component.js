import { UiVisionDraw } from "../draw/ui-vision-draw.js";
import { iTcVnImageToImage } from "../utils/image-converters/itcvnimage-to-image.js";
import { ItcVnImageDataDecoder } from "../utils/itcvnimagedata-decoder.js";
import { clamp } from "mobject-graph-ui";

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

  constructor({ margin = 5, imageTopPadding = 1 } = {}) {
    this.margin = margin;
    this.imageTopPadding = imageTopPadding;
    this.displayImage = new Image();
    this.rawImageData = ImageDisplayComponent.DEFAULT_IMAGE_DATA;
    this.hoverImageCoords = null;
    this.cachedComponentSize = null;
    this.itcVnImageDataDecoder = new ItcVnImageDataDecoder();
    this.imageDrawArea = null;
    this.currentLoadId = 0;
    this.interaction = new CanvasInteractionManager();
  }

  async setImageData(newValue) {
    this.cachedComponentSize = null;
    if (newValue) {
      const loadId = ++this.currentLoadId;
      const img = await iTcVnImageToImage(newValue);
      if (loadId !== this.currentLoadId) return;
      this.displayImage = img;
      this.rawImageData = newValue;
      this.itcVnImageDataDecoder.update(newValue);
    } else {
      this.clearDisplayImage();
      this.rawImageData = ImageDisplayComponent.DEFAULT_IMAGE_DATA;
    }
  }

  clearDisplayImage() {
    this.displayImage = new Image();
    this.cachedComponentSize = null;
  }

  computeSize(widgetWidth = 300, widgetHeight = 300) {
    if (
      !this.displayImage ||
      !this.displayImage.width ||
      !this.displayImage.height
    ) {
      return new Float32Array([widgetWidth, widgetHeight]);
    }
    if (this.cachedComponentSize) {
      return this.cachedComponentSize;
    }
    const result = new Float32Array([
      this.displayImage.width,
      this.displayImage.height + this.getMetaHeight(),
    ]);
    this.cachedComponentSize = result;
    return result;
  }

  getImageMetaText() {
    const info = this.rawImageData?.imageInfo || {};
    const fmt = info.stPixelFormat || {};

    const line1 = `📐 ${info.nWidth || 0} x ${info.nHeight || 0} px 🌈 ${
      fmt.nChannels || 0
    } ch 🎚️ ${fmt.nElementSize || 0} bit`;

    let line2 = "  ";
    if (this.hoverImageCoords && this.itcVnImageDataDecoder) {
      const { imgX, imgY } = this.hoverImageCoords;
      const pixel = this.itcVnImageDataDecoder.getPixel(imgX, imgY);

      if (Array.isArray(pixel)) {
        const emojiMapByLength = {
          1: ["⚪"],
          2: ["⚪", "🔳"],
          3: ["🔴", "🟢", "🔵"],
          4: ["🔴", "🟢", "🔵", "🔳"],
        };
        const emojis = emojiMapByLength[pixel.length] || [];
        const values = pixel.map((val, i) => {
          const emoji = emojis[i] || `Ch${i + 1}`;
          return `${emoji}${val.toFixed(0).padStart(3)}`;
        });
        line2 = `➕ ${imgX.toFixed(0).padStart(3)}, ${imgY
          .toFixed(0)
          .padStart(3)} ${values.join(" ")}`;
      } else {
        line2 = `➕ ${imgX.toFixed(0).padStart(3)}, ${imgY
          .toFixed(0)
          .padStart(3)}`;
      }
    }

    return [line1, line2];
  }

  isPointInDrawArea(canvasX, canvasY) {
    const area = this.imageDrawArea;
    if (!area) return false;
    return (
      canvasX >= area.x &&
      canvasX <= area.x + area.width &&
      canvasY >= area.y &&
      canvasY <= area.y + area.height
    );
  }

  clampToDrawArea(canvasX, canvasY) {
    const area = this.imageDrawArea;
    if (!area) return [canvasX, canvasY];
    return [
      clamp(canvasX, area.x, area.x + area.width),
      clamp(canvasY, area.y, area.y + area.height),
    ];
  }

  toImageCoords(canvasX, canvasY) {
    const area = this.imageDrawArea;
    const info = this.rawImageData?.imageInfo;
    if (!area || !info || !info.nWidth || !info.nHeight) return null;
    const { x, y, width, height } = area;
    const scaleX = info.nWidth / width;
    const scaleY = info.nHeight / height;
    return [
      Math.min(
        info.nWidth - 1,
        Math.max(0, Math.floor((canvasX - x) * scaleX))
      ),
      Math.min(
        info.nHeight - 1,
        Math.max(0, Math.floor((canvasY - y) * scaleY))
      ),
    ];
  }

  getImageAndCanvasCoords(pos) {
    const [canvasX, canvasY] = this.clampToDrawArea(pos[0], pos[1]);
    const [imgX, imgY] = this.toImageCoords(canvasX, canvasY);
    return { imgX, imgY, canvasX, canvasY };
  }

  onMouse(event, pos, parentNode) {
    if (!this.imageDrawArea) return;
    let [canvasX, canvasY] = this.clampToDrawArea(pos[0], pos[1]);
    const [imgX, imgY] = this.toImageCoords(canvasX, canvasY);

    switch (event.type) {
      case "pointerdown":
        this.interaction.pointerDown(
          { canvasX, canvasY },
          { imgX, imgY },
          event.button || 0
        );
        break;
      case "pointermove":
        this.interaction.pointerMove({ canvasX, canvasY }, { imgX, imgY });
        break;
      case "pointerup":
        this.interaction.pointerUp({ canvasX, canvasY }, { imgX, imgY });
        break;
    }
  }

  onMouseOver(event, pos, parentNode, value) {
    if (!this.imageDrawArea || !value) return;
    const { imgX, imgY, canvasX, canvasY } = this.getImageAndCanvasCoords(pos);
    if (this.isPointInDrawArea(canvasX, canvasY)) {
      this.hoverImageCoords = { imgX, imgY, canvasX, canvasY };
    }
  }
  draw(ctx, parentNode, availableWidth, startY, suggestedHeight, opts = {}) {
    const { placeholderText = "No image" } = opts;

    // Compute meta info
    const metaLines = this.getImageMetaText();
    const metaLineHeight = 16;
    const metaHeight = metaLines.length * metaLineHeight + 8;

    // Layout
    const componentWidth = availableWidth - 2 * this.margin;
    const drawImageY = startY + this.imageTopPadding;
    const drawImageHeight =
      parentNode.height - 2 * this.margin - startY - metaHeight;

    // Save draw area
    this.imageDrawArea = {
      x: this.margin,
      y: drawImageY,
      width: componentWidth,
      height: drawImageHeight,
    };

    // Draw background/border/image/placeholder
    const image = this.displayImage;
    const imageDrawn = UiVisionDraw.drawImagePanel(
      ctx,
      image,
      this.margin,
      drawImageY,
      componentWidth,
      drawImageHeight,
      { placeholderText }
    );
    if (!imageDrawn) return;

    // Draw meta info (below the image)
    UiVisionDraw.drawMetaInfoBox(
      ctx,
      metaLines,
      this.margin + 6,
      drawImageY + drawImageHeight + this.margin + 6,
      componentWidth - 12
    );

    // Draw selection box if we are in select mode
    if (
      this.interaction.mode === "select" &&
      this.interaction.dragStart &&
      this.interaction.dragEnd &&
      this.imageDrawArea
    ) {
      UiVisionDraw.drawSelectionBox(
        ctx,
        this.interaction.dragStart,
        this.interaction.dragEnd,
        this.imageDrawArea,
        this.rawImageData.imageInfo
      );
    }

    // Cache the total widget size
    const totalHeight =
      2 * this.margin + drawImageHeight + metaHeight + drawImageY;
    const totalWidth = availableWidth;
    this.cachedComponentSize = new Float32Array([totalWidth, totalHeight]);
  }
}

class CanvasInteractionManager {
  constructor() {
    this.mode = "select"; // "select" | "line" | "rectangle"
    this.dragStart = null; // { imgX, imgY, canvasX, canvasY }
    this.dragEnd = null;
  }

  setMode(mode) {
    this.mode = mode;
    this.cancelCurrentAction();
  }

  pointerDown(pos, imageCoords, button = 0) {
    switch (this.mode) {
      case "select":
        this.dragStart = { ...pos, ...imageCoords };
        this.dragEnd = { ...pos, ...imageCoords };
        break;
      case "line":
        // TODO:
        break;
      case "rectangle":
        // TODO:
        break;
    }
  }

  pointerMove(pos, imageCoords) {
    if (!this.dragStart) return;
    switch (this.mode) {
      case "select":
        this.dragEnd = { ...pos, ...imageCoords };
        break;
      case "line":
        // TODO:
        break;
      case "rectangle":
        // TODO:
        break;
    }
  }

  pointerUp(pos, imageCoords) {
    if (!this.dragStart) return;
    switch (this.mode) {
      case "select":
        this.dragEnd = { ...pos, ...imageCoords };
        this.dragStart = null;
        this.dragEnd = null;
        break;
      case "line":
        // TODO:
        break;
      case "rectangle":
        // TODO:
        break;
    }
  }

  cancelCurrentAction() {
    this.dragStart = null;
    this.dragEnd = null;
  }
}
