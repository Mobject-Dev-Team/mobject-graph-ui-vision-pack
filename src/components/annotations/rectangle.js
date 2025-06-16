import { Annotation } from "./base.js";

function pointInRect(pos, a, b) {
  // a, b, pos: all canvas coords
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

export class RectangleAnnotation extends Annotation {
  constructor(start, end) {
    super("rectangle");
    this.start = start; // {imgX, imgY}
    this.end = end; // {imgX, imgY}
  }

  toJSON() {
    return {
      type: "rectangle",
      start: { ...this.start },
      end: { ...this.end },
    };
  }

  static fromJSON(data) {
    return new RectangleAnnotation({ ...data.start }, { ...data.end });
  }

  draw(ctx, opts = {}) {
    const { imageToCanvas } = opts;
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);
    const x = Math.min(a.canvasX, b.canvasX);
    const y = Math.min(a.canvasY, b.canvasY);
    const w = Math.abs(a.canvasX - b.canvasX);
    const h = Math.abs(a.canvasY - b.canvasY);
    ctx.save();
    ctx.strokeStyle = this.selected ? "#0FF" : "#FFF";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    if (this.selected) {
      [a, b].forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.canvasX, pt.canvasY, 7, 0, 2 * Math.PI);
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#0FF";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });
    }
    ctx.restore();
  }

  hitTest(pos, imageToCanvas) {
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);
    // Check handles first
    if (
      Math.abs(pos.canvasX - a.canvasX) <= 8 &&
      Math.abs(pos.canvasY - a.canvasY) <= 8
    )
      return true;
    if (
      Math.abs(pos.canvasX - b.canvasX) <= 8 &&
      Math.abs(pos.canvasY - b.canvasY) <= 8
    )
      return true;
    // Inside rectangle
    return pointInRect(pos, a, b);
  }

  hitTestHandle(pos, imageToCanvas) {
    // pos = {canvasX, canvasY}
    const handles = [
      { handleId: "start", imgX: this.start.imgX, imgY: this.start.imgY },
      { handleId: "end", imgX: this.end.imgX, imgY: this.end.imgY },
    ];
    for (const handle of handles) {
      const canvas = imageToCanvas(handle.imgX, handle.imgY);
      const dx = pos.canvasX - canvas.canvasX;
      const dy = pos.canvasY - canvas.canvasY;
      if (Math.sqrt(dx * dx + dy * dy) < 8) return handle.handleId;
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
}
