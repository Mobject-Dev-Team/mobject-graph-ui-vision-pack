import { UiVisionDraw } from "../draw/ui-vision-draw.js";
import { iTcVnImageToImage } from "../utils/image-converters/itcvnimage-to-image.js";
import { ItcVnImageDataDecoder } from "../utils/itcvnimagedata-decoder.js";
import { clamp } from "mobject-graph-ui";

import { CanvasInteractionManager } from "./canvas-interaction-manager.js";
import { Point_TcVnPoint2_REAL_Tool } from "./tools/point-TcVnPoint2-REAL-tool.js";
import { Point_TcVnPoint2_LREAL_Tool } from "./tools/point-TcVnPoint2-LREAL-tool.js";
import { Line_TcVnVector4_DINT_Tool } from "./tools/line-TcVnVector4-DINT-tool.js";
import { Rectangle_TcVnRectangle_DINT_Tool } from "./tools/rectangle-TcVnRectangle-DINT-tool.js";
import { AnnotationRegistry } from "./annotations/annotation-registry.js";

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

  constructor(parentWidget, { margin = 5, imageTopPadding = 1 } = {}) {
    this.parentWidget = parentWidget;
    this.margin = margin;
    this.imageTopPadding = imageTopPadding;
    this.displayImage = new Image();
    this.rawImageData = ImageDisplayComponent.DEFAULT_IMAGE_DATA;
    this.tooltipCoords = null; // { imgX, imgY, canvasX, canvasY }
    this.cachedComponentSize = null;
    this.itcVnImageDataDecoder = new ItcVnImageDataDecoder();
    this.drawArea = null;
    this.currentLoadId = 0;
    this.interaction = new CanvasInteractionManager();
    this.annotations = [];
    this.handleGraphConfigure = this.handleGraphConfigure.bind(this);

    this.parentWidget?.parent.on("removed", () => {
      this.destroy();
    });

    this.interaction.setImageToCanvasFunc(
      this.imageCoordsToCanvasCoords.bind(this)
    );
    this.interaction.setCanvasToImageFunc((x, y) =>
      this.canvasCoordsToImageCoords(x, y)
    );

    // Wire ESC and contextmenu for cancel
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.interaction.cancelCurrentTool();
      }
    });
  }

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown);
  }

  handleGraphConfigure() {
    this.linkAnnotationsToNodes();
  }

  saveAnnotations() {
    return this.annotations.map((a) => a.toJSON());
  }

  loadAnnotations(annotations) {
    if (!annotations || !Array.isArray(annotations)) {
      console.warn("Invalid annotations format, expected an array.");
      return;
    }
    this.annotations = annotations
      .map((obj) => {
        const Ctor = AnnotationRegistry.get(obj.type);
        if (!Ctor) {
          console.warn(`Unknown annotation type: ${obj.type}`);
          return null;
        }
        return Ctor.fromJSON(obj);
      })
      .filter(Boolean);
    this.interaction.setAnnotations(this.annotations);
  }

  linkAnnotationsToNodes() {
    const graph = this.parentWidget?.parent?.graph;
    if (!graph) return;

    for (const annotation of this.annotations) {
      if (annotation.linkedNodeId) {
        const node = graph.getNodeById(annotation.linkedNodeId);
        if (node) {
          annotation.bindToNode?.(node);
        } else {
          annotation.isOrphan = true;
        }
      }
    }
  }

  onSerialize() {
    return { annotations: this.saveAnnotations() };
  }

  onConfigure(info) {
    if (info?.annotations) {
      this.loadAnnotations(info.annotations);
    }
    this.linkAnnotationsToNodes();
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

  getMetaHeight() {
    return this.metaHeight || 0;
  }

  getImageMetaText() {
    const info = this.rawImageData?.imageInfo || {};
    const fmt = info.stPixelFormat || {};

    const line1 = `📐 ${info.nWidth || 0} x ${info.nHeight || 0} px 🌈 ${
      fmt.nChannels || 0
    } ch 🎚️ ${fmt.nElementSize || 0} bit`;

    let line2 = "  ";
    if (this.tooltipCoords && this.itcVnImageDataDecoder) {
      const { imgX, imgY } = this.tooltipCoords;
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

  isMouseInDrawArea(x, y) {
    const drawArea = this.drawArea;
    if (!drawArea) return false;
    return (
      x >= drawArea.x &&
      x <= drawArea.x + drawArea.width &&
      y >= drawArea.y &&
      y <= drawArea.y + drawArea.height
    );
  }

  clampMouseToDrawArea(x, y) {
    const drawArea = this.drawArea;
    if (!drawArea) return [x, y];
    return [
      clamp(x, drawArea.x, drawArea.x + drawArea.width),
      clamp(y, drawArea.y, drawArea.y + drawArea.height),
    ];
  }

  canvasCoordsToImageCoords(canvasX, canvasY) {
    const area = this.drawArea;
    const info = this.rawImageData?.imageInfo;
    if (!area || !info || !info.nWidth || !info.nHeight) return [null, null];
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

  imageCoordsToCanvasCoords(imgX, imgY) {
    const drawArea = this.drawArea;
    const imageInfo = this.rawImageData?.imageInfo;
    if (!drawArea || !imageInfo || !imageInfo.nWidth || !imageInfo.nHeight)
      return null;
    const scaleX = drawArea.width / imageInfo.nWidth;
    const scaleY = drawArea.height / imageInfo.nHeight;
    return {
      canvasX: drawArea.x + imgX * scaleX,
      canvasY: drawArea.y + imgY * scaleY,
    };
  }

  getClampedImageAndCanvasCoords(pos) {
    const [canvasX, canvasY] = this.clampMouseToDrawArea(pos[0], pos[1]);
    const [imgX, imgY] = this.canvasCoordsToImageCoords(canvasX, canvasY);
    return { imgX, imgY, canvasX, canvasY };
  }

  onMouse(event, pos) {
    const area = this.drawArea;
    const info = this.rawImageData?.imageInfo;
    if (!area || !info || !info.nWidth || !info.nHeight) return;

    const { imgX, imgY, canvasX, canvasY } =
      this.getClampedImageAndCanvasCoords(pos);

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
    if (!this.drawArea || !value) return;
    const { imgX, imgY, canvasX, canvasY } =
      this.getClampedImageAndCanvasCoords(pos);
    if (this.isMouseInDrawArea(canvasX, canvasY)) {
      this.tooltipCoords = { imgX, imgY, canvasX, canvasY };
    }
    this.interaction.pointerOver({ canvasX, canvasY }, { imgX, imgY });
  }

  draw(ctx, parentNode, availableWidth, startY, suggestedHeight, opts = {}) {
    const { placeholderText = "No image" } = opts;

    // Compute meta info
    const metaLines = this.getImageMetaText();
    const metaLineHeight = 16;
    const metaHeight = (this.metaHeight =
      metaLines.length * metaLineHeight + 8);

    // Layout
    const componentWidth = availableWidth - 2 * this.margin;
    const drawImageY = startY + this.imageTopPadding;
    const drawImageHeight =
      parentNode.height - 2 * this.margin - startY - metaHeight;

    // Save draw area
    this.drawArea = {
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

    // Draw finished annotations
    for (const annotation of this.annotations) {
      annotation.draw(ctx, {
        imageToCanvas: this.imageCoordsToCanvasCoords.bind(this),
      });
    }

    // Draw interaction state (e.g. point being added)
    this.interaction.draw(ctx, {
      imageToCanvas: this.imageCoordsToCanvasCoords.bind(this),
      canvasToImage: this.canvasCoordsToImageCoords.bind(this),
    });

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
      !this.interaction.usingTool &&
      this.interaction.dragStart &&
      this.interaction.dragEnd &&
      this.drawArea
    ) {
      UiVisionDraw.drawSelectionBox(
        ctx,
        this.interaction.dragStart,
        this.interaction.dragEnd,
        this.drawArea,
        this.rawImageData.imageInfo
      );
    }

    // Cache the total widget size
    const totalHeight =
      2 * this.margin + drawImageHeight + metaHeight + drawImageY;
    const totalWidth = availableWidth;
    this.cachedComponentSize = new Float32Array([totalWidth, totalHeight]);
  }

  getContextMenuOptions(event, localMouse, node) {
    const x = localMouse[0];
    const y = localMouse[1];

    if (!this.isMouseInDrawArea(x, y)) return null;

    if (this.interaction.usingTool) {
      return [
        {
          content: "Cancel",
          callback: () => this.interaction.cancelCurrentTool(),
        },
      ];
    }

    const hitAnnotation = this.interaction.selectAnnotationAt({
      canvasX: x,
      canvasY: y,
    });
    if (hitAnnotation) {
      return [
        {
          content: "🗑️ Delete",
          callback: () => this.deleteAnnotation(hitAnnotation),
        },
      ];
    }

    const pixelCoords = this.tooltipCoords;
    const pixel = pixelCoords
      ? this.itcVnImageDataDecoder.getPixel(pixelCoords.imgX, pixelCoords.imgY)
      : null;

    if (!pixelCoords || !pixel) return null;

    const { imgX, imgY } = pixelCoords;

    const submenuOptions = [];

    submenuOptions.push({
      content: `📋 X (${imgX})`,
      callback: () => navigator.clipboard.writeText(`${imgX}`),
    });
    submenuOptions.push({
      content: `📋 Y (${imgY})`,
      callback: () => navigator.clipboard.writeText(`${imgY}`),
    });

    for (let i = 0; i < pixel.length; i++) {
      submenuOptions.push({
        content: `📋 ${"Ch" + i} (${pixel[i]})`,
        callback: () => navigator.clipboard.writeText(`${pixel[i]}`),
      });
    }

    submenuOptions.push({
      content: `📋 All`,
      callback: () =>
        navigator.clipboard.writeText(
          `${imgX}, ${imgY}, ${pixel.map((v) => `${v}`).join(", ")}`
        ),
    });

    const menu = [];

    menu.push({
      content: "Copy Values",
      has_submenu: true,
      submenu: {
        title: "Copy Values",
        options: submenuOptions,
      },
    });

    // menu.push({
    //   content: "Add Node",
    //   has_submenu: true,
    //   submenu: {
    //     title: "Add Node",
    //     options: [
    //       {
    //         content: "Add Point as TcVnPoint2_REAL",
    //         callback: () => this.startAddAnnotation(Point_TcVnPoint2_REAL_Tool),
    //       },
    //       {
    //         content: "Add Point as TcVnPoint2_LREAL",
    //         callback: () =>
    //           this.startAddAnnotation(Point_TcVnPoint2_LREAL_Tool),
    //       },
    //       {
    //         content: "Add Line as TcVnVector4_DINT",
    //         callback: () => this.startAddAnnotation(Line_TcVnVector4_DINT_Tool),
    //       },
    //       {
    //         content: "Add Rectangle as TcVnRectangle_DINT",
    //         callback: () =>
    //           this.startAddAnnotation(Rectangle_TcVnRectangle_DINT_Tool),
    //       },
    //     ],
    //   },
    // });

    return menu;
  }

  startAddAnnotation(ToolClass) {
    if (!ToolClass) return;

    const finish = (annotation) => {
      this.annotations.push(annotation);
      this.interaction.setAnnotations(this.annotations);
      this.parentWidget?.requestRedraw();
      this.interaction.clearTool();
    };

    const tool = new ToolClass(finish);
    this.interaction.setTool(tool);
  }

  deleteAnnotation(annotation) {
    const idx = this.annotations.indexOf(annotation);
    if (idx !== -1) {
      annotation.onDelete?.();
      this.annotations.splice(idx, 1);
      this.parentWidget?.requestRedraw();
    }
  }
}
