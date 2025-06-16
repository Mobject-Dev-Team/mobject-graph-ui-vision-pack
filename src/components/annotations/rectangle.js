import { Annotation } from "./base.js";

function pointInRect(pos, rectStart, rectEnd) {
  const x = Math.min(rectStart.canvasX, rectEnd.canvasX);
  const y = Math.min(rectStart.canvasY, rectEnd.canvasY);
  const w = Math.abs(rectStart.canvasX - rectEnd.canvasX);
  const h = Math.abs(rectStart.canvasY - rectEnd.canvasY);
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
    this.start = start;
    this.end = end;
  }

  toJSON() {
    return {
      type: "line",
      start: { ...this.start },
      end: { ...this.end },
    };
  }

  static fromJSON(data) {
    return new LineAnnotation({ ...data.start }, { ...data.end });
  }

  draw(ctx, opts = {}) {
    ctx.save();
    ctx.strokeStyle = this.selected ? "#0FF" : "#FFF";
    ctx.lineWidth = 2;
    const x = Math.min(this.start.canvasX, this.end.canvasX);
    const y = Math.min(this.start.canvasY, this.end.canvasY);
    const w = Math.abs(this.end.canvasX - this.start.canvasX);
    const h = Math.abs(this.end.canvasY - this.start.canvasY);
    ctx.strokeRect(x, y, w, h);
    if (this.selected) {
      // Handles: 4 corners
      [this.start, this.end].forEach((pt) => {
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
  hitTest(pos) {
    // Check handles first
    if (
      Math.abs(pos.canvasX - this.start.canvasX) <= 8 &&
      Math.abs(pos.canvasY - this.start.canvasY) <= 8
    )
      return true;
    if (
      Math.abs(pos.canvasX - this.end.canvasX) <= 8 &&
      Math.abs(pos.canvasY - this.end.canvasY) <= 8
    )
      return true;
    // Inside rectangle (with some tolerance)
    return pointInRect(pos, this.start, this.end);
  }
  hitTestHandle(pos) {
    if (
      Math.abs(pos.canvasX - this.start.canvasX) <= 8 &&
      Math.abs(pos.canvasY - this.start.canvasY) <= 8
    )
      return "start";
    if (
      Math.abs(pos.canvasX - this.end.canvasX) <= 8 &&
      Math.abs(pos.canvasY - this.end.canvasY) <= 8
    )
      return "end";
    return null;
  }
}
