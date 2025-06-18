import { Annotation } from "./base.js";
import { AnnotationRegistry } from "./annotation-registry.js";
import { annotationTheme } from "./theme.js";

export class TcVnPoint2_REAL_Annotation extends Annotation {
  static type = "TcVnPoint2_REAL";

  constructor(coord) {
    super(TcVnPoint2_REAL_Annotation.type);
    this.coord = coord;
  }

  toJSON() {
    return {
      type: TcVnPoint2_REAL_Annotation.type,
      coord: { ...this.coord },
    };
  }

  static fromJSON(data) {
    return new TcVnPoint2_REAL_Annotation({ ...data.coord });
  }

  draw(ctx, opts = {}) {
    const { imageToCanvas } = opts;
    const { canvasX, canvasY } = imageToCanvas(
      this.coord.imgX,
      this.coord.imgY
    );
    const theme = annotationTheme.point;
    const handleTheme = theme.handle;

    ctx.save();
    ctx.translate(0.5, 0.5);

    // Crosshair lines
    const crossLen = theme.crossLength || 12;
    const crossWidth = theme.crossWidth || 2;
    ctx.strokeStyle = theme.crossStroke;
    ctx.lineWidth = crossWidth;

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(canvasX - crossLen, canvasY);
    ctx.lineTo(canvasX + crossLen, canvasY);
    ctx.stroke();

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(canvasX, canvasY - crossLen);
    ctx.lineTo(canvasX, canvasY + crossLen);
    ctx.stroke();

    // Show larger square
    ctx.beginPath();
    ctx.rect(
      canvasX - theme.size / 2,
      canvasY - theme.size / 2,
      theme.size,
      theme.size
    );
    ctx.fillStyle = handleTheme.fill;
    ctx.strokeStyle = this.selected
      ? handleTheme.selectedStroke
      : handleTheme.stroke;
    ctx.lineWidth = handleTheme.lineWidth;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  hitTest(pos, imageToCanvas) {
    const handleCanvas = imageToCanvas(this.coord.imgX, this.coord.imgY);
    const size = annotationTheme.point.handle.size;
    // Use the handle area for hit test, which is generous
    return (
      Math.abs(pos.canvasX - handleCanvas.canvasX) < size / 2 + 2 &&
      Math.abs(pos.canvasY - handleCanvas.canvasY) < size / 2 + 2
    );
  }

  hitTestHandle(pos, imageToCanvas) {
    const handleCanvas = imageToCanvas(this.coord.imgX, this.coord.imgY);
    const size = annotationTheme.point.handle.size;
    if (
      Math.abs(pos.canvasX - handleCanvas.canvasX) < size / 2 + 2 &&
      Math.abs(pos.canvasY - handleCanvas.canvasY) < size / 2 + 2
    )
      return "point";
    return null;
  }

  moveHandle(handleId, imgCoords) {
    if (handleId === "point") {
      this.coord.imgX = imgCoords.imgX;
      this.coord.imgY = imgCoords.imgY;
    }
  }

  static drawGhostHandle(ctx, pt) {
    const theme = annotationTheme.point;
    const handleTheme = theme.handle;
    ctx.beginPath();
    ctx.rect(
      pt.canvasX - theme.size / 2,
      pt.canvasY - theme.size / 2,
      theme.size,
      theme.size
    );
    ctx.fillStyle = handleTheme.fill;
    ctx.strokeStyle = this.selected
      ? handleTheme.selectedStroke
      : handleTheme.stroke;
    ctx.lineWidth = handleTheme.lineWidth;
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}

AnnotationRegistry.register(
  TcVnPoint2_REAL_Annotation.type,
  TcVnPoint2_REAL_Annotation
);
