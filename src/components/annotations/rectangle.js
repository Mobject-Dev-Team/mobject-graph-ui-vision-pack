import { Annotation } from "./base.js";

export class RectangleAnnotation extends Annotation {
  constructor(start, end) {
    super("rectangle");
    this.start = start;
    this.end = end;
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
    ctx.restore();
  }
}
