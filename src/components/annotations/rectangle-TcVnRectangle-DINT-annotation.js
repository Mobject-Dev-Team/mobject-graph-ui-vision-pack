import { Annotation } from "./base.js";
import { AnnotationRegistry } from "./annotation-registry.js";
import { annotationTheme } from "./theme.js";
import { UiVisionDraw } from "../../draw/ui-vision-draw.js";

function pointInRect(pos, a, b) {
  const x = Math.min(a.canvasX, b.canvasX);
  const y = Math.min(a.canvasY, b.canvasY);
  const w = Math.abs(a.canvasX - b.canvasX);
  const h = Math.abs(a.canvasY - b.canvasY);
  return (
    pos.canvasX >= x &&
    pos.canvasX <= x + w &&
    pos.canvasY >= y &&
    pos.canvasY <= y + h
  );
}

export class Rectangle_TcVnRectangle_DINT_Annotation extends Annotation {
  static type = "(rectangle)TcVnRectangle_DINT";
  constructor(start, end) {
    super(Rectangle_TcVnRectangle_DINT_Annotation.type);
    this.start = start;
    this.end = end;
  }

  toJSON() {
    return {
      type: Rectangle_TcVnRectangle_DINT_Annotation.type,
      start: { ...this.start },
      end: { ...this.end },
    };
  }

  static fromJSON(data) {
    return new Rectangle_TcVnRectangle_DINT_Annotation(
      { ...data.start },
      { ...data.end }
    );
  }

  setEnd(end) {
    this.end = end;
  }

  draw(ctx, opts = {}) {
    const { imageToCanvas, preview } = opts;
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);
    const x = Math.min(a.canvasX, b.canvasX);
    const y = Math.min(a.canvasY, b.canvasY);
    const w = Math.abs(a.canvasX - b.canvasX);
    const h = Math.abs(a.canvasY - b.canvasY);

    const theme = annotationTheme.rectangle;
    // Use selected dash/fg/bg if selected, otherwise default
    const dashFg = this.selected
      ? theme.selectedDashFg || theme.dashFg
      : theme.dashFg;
    const dashBg = this.selected
      ? theme.selectedDashBg || theme.dashBg
      : theme.dashBg;
    const dash = theme.dash;
    const lineWidth = theme.lineWidth;

    ctx.save();
    ctx.translate(0.5, 0.5);

    // Use a double-pass dashed rectangle for BW dashes
    UiVisionDraw.drawDashedRect(
      ctx,
      x,
      y,
      w,
      h,
      dashBg,
      dashFg,
      dash,
      lineWidth
    );

    // Handles as squares if selected
    if (this.selected || preview) {
      const htheme = theme.handle;
      const corners = [
        { x: x, y: y, handleId: "topLeft" },
        { x: x + w, y: y, handleId: "topRight" },
        { x: x, y: y + h, handleId: "bottomLeft" },
        { x: x + w, y: y + h, handleId: "bottomRight" },
      ];
      corners.forEach((pt) => {
        ctx.beginPath();
        ctx.rect(
          pt.x - htheme.size / 2,
          pt.y - htheme.size / 2,
          htheme.size,
          htheme.size
        );
        ctx.fillStyle = htheme.fill;
        ctx.strokeStyle = htheme.stroke;
        ctx.lineWidth = htheme.lineWidth;
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  hitTest(pos, imageToCanvas) {
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);
    // Check handles first (corners)
    const theme = annotationTheme.rectangle;
    const size = theme.handle.size || 12;
    const x = Math.min(a.canvasX, b.canvasX);
    const y = Math.min(a.canvasY, b.canvasY);
    const w = Math.abs(a.canvasX - b.canvasX);
    const h = Math.abs(a.canvasY - b.canvasY);
    const handles = [
      { x: x, y: y },
      { x: x + w, y: y },
      { x: x, y: y + h },
      { x: x + w, y: y + h },
    ];
    for (const pt of handles) {
      if (
        Math.abs(pos.canvasX - pt.x) < size / 2 + 2 &&
        Math.abs(pos.canvasY - pt.y) < size / 2 + 2
      ) {
        return true;
      }
    }
    // Inside rectangle
    return pointInRect(pos, a, b);
  }

  hitTestHandle(pos, imageToCanvas) {
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);
    const x = Math.min(a.canvasX, b.canvasX);
    const y = Math.min(a.canvasY, b.canvasY);
    const w = Math.abs(a.canvasX - b.canvasX);
    const h = Math.abs(a.canvasY - b.canvasY);
    const size = annotationTheme.rectangle.handle.size || 12;
    const handles = [
      { handleId: "topLeft", x: x, y: y },
      { handleId: "topRight", x: x + w, y: y },
      { handleId: "bottomLeft", x: x, y: y + h },
      { handleId: "bottomRight", x: x + w, y: y + h },
    ];
    for (const handle of handles) {
      if (
        Math.abs(pos.canvasX - handle.x) < size / 2 + 2 &&
        Math.abs(pos.canvasY - handle.y) < size / 2 + 2
      ) {
        return handle.handleId;
      }
    }
    return null;
  }

  moveHandle(handleId, imgCoords) {
    switch (handleId) {
      case "topLeft":
        this.start.imgX = imgCoords.imgX;
        this.start.imgY = imgCoords.imgY;
        break;
      case "topRight":
        this.end.imgX = imgCoords.imgX;
        this.start.imgY = imgCoords.imgY;
        break;
      case "bottomLeft":
        this.start.imgX = imgCoords.imgX;
        this.end.imgY = imgCoords.imgY;
        break;
      case "bottomRight":
        this.end.imgX = imgCoords.imgX;
        this.end.imgY = imgCoords.imgY;
        break;
    }
  }

  static drawGhostHandle(ctx, pt) {
    const htheme = annotationTheme.line.handle;
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      pt.canvasX - htheme.size / 2,
      pt.canvasY - htheme.size / 2,
      htheme.size,
      htheme.size
    );
    ctx.fillStyle = htheme.fill;
    ctx.strokeStyle = htheme.stroke;
    ctx.lineWidth = htheme.lineWidth;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

AnnotationRegistry.register(
  Rectangle_TcVnRectangle_DINT_Annotation.type,
  Rectangle_TcVnRectangle_DINT_Annotation
);
