import { Annotation } from "./base.js";
import { AnnotationRegistry } from "./annotation-registry.js";
import { annotationTheme } from "./theme.js";
import { UiVisionDraw } from "../../draw/ui-vision-draw.js";

export class Line_TcVnVector4_DINT_Annotation extends Annotation {
  static type = "TcVnVector4_DINT";
  constructor(start, end) {
    super(Line_TcVnVector4_DINT_Annotation.type);
    this.start = start;
    this.end = end;
  }

  toJSON() {
    return {
      type: Line_TcVnVector4_DINT_Annotation.type,
      start: { ...this.start },
      end: { ...this.end },
    };
  }

  static fromJSON(data) {
    return new Line_TcVnVector4_DINT_Annotation(
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

    const theme = annotationTheme.line;
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

    // Draw black/white dashed line using theme
    UiVisionDraw.drawDashedLine(
      ctx,
      a.canvasX,
      a.canvasY,
      b.canvasX,
      b.canvasY,
      dashBg,
      dashFg,
      dash,
      lineWidth
    );

    // Handles as squares if selected
    if (this.selected || preview) {
      const htheme = theme.handle;
      [a, b].forEach((pt) => {
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
      });
    }
    ctx.restore();
  }

  hitTest(pos, imageToCanvas) {
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);

    function dist2(pt1, pt2) {
      return (
        (pt1.canvasX - pt2.canvasX) ** 2 + (pt1.canvasY - pt2.canvasY) ** 2
      );
    }

    // Check endpoints first (use handle size from theme)
    const size = annotationTheme.line.handle.size;
    if (Math.sqrt(dist2(a, pos)) <= size / 2 + 2) return true;
    if (Math.sqrt(dist2(b, pos)) <= size / 2 + 2) return true;

    // Check near line segment
    const { canvasX: x1, canvasY: y1 } = a;
    const { canvasX: x2, canvasY: y2 } = b;
    const { canvasX: px, canvasY: py } = pos;
    const L2 = dist2(a, b);
    if (L2 === 0) return false;
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / L2;
    t = Math.max(0, Math.min(1, t));
    const closest = {
      canvasX: x1 + t * (x2 - x1),
      canvasY: y1 + t * (y2 - y1),
    };
    const dist = Math.sqrt(
      (closest.canvasX - px) ** 2 + (closest.canvasY - py) ** 2
    );
    return dist < size / 2 + 2;
  }

  hitTestHandle(pos, imageToCanvas) {
    const handles = [
      { handleId: "start", ...this.start },
      { handleId: "end", ...this.end },
    ];
    const size = annotationTheme.line.handle.size;
    for (const handle of handles) {
      const { canvasX, canvasY } = imageToCanvas(handle.imgX, handle.imgY);
      if (
        Math.abs(pos.canvasX - canvasX) < size / 2 + 2 &&
        Math.abs(pos.canvasY - canvasY) < size / 2 + 2
      )
        return handle.handleId;
    }
    return null;
  }

  moveHandle(handleId, imgCoords) {
    if (handleId === "start") {
      this.start.imgX = imgCoords.imgX;
      this.start.imgY = imgCoords.imgY;
    } else if (handleId === "end") {
      this.end.imgX = imgCoords.imgX;
      this.end.imgY = imgCoords.imgY;
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
  Line_TcVnVector4_DINT_Annotation.type,
  Line_TcVnVector4_DINT_Annotation
);
