import { Annotation } from "./base.js";

export class PointAnnotation extends Annotation {
  constructor(coord) {
    super("point");
    this.coord = coord;
  }

  toJSON() {
    return {
      type: "point",
      coord: { ...this.coord },
    };
  }

  static fromJSON(data) {
    return new PointAnnotation({ ...data.coord });
  }

  draw(ctx, opts = {}) {
    const { imageToCanvas } = opts;
    const { canvasX, canvasY } = imageToCanvas(
      this.coord.imgX,
      this.coord.imgY
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = this.selected ? "#0FF" : "#FFF";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    if (this.selected) {
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = "#0FF";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  hitTest(pos, imageToCanvas) {
    const handleCanvas = imageToCanvas(this.coord.imgX, this.coord.imgY);
    const dx = pos.canvasX - handleCanvas.canvasX;
    const dy = pos.canvasY - handleCanvas.canvasY;
    return Math.sqrt(dx * dx + dy * dy) <= 8;
  }

  hitTestHandle(pos, imageToCanvas) {
    // pos = {canvasX, canvasY}
    const handleCanvas = imageToCanvas(this.coord.imgX, this.coord.imgY);
    const dx = pos.canvasX - handleCanvas.canvasX;
    const dy = pos.canvasY - handleCanvas.canvasY;
    if (Math.sqrt(dx * dx + dy * dy) < 8) return "point";
    return null;
  }

  moveHandle(handleId, imgCoords) {
    if (handleId === "point") {
      this.coord.imgX = imgCoords.imgX;
      this.coord.imgY = imgCoords.imgY;
    }
  }
}
