import { Annotation } from "./base.js";

export class LineAnnotation extends Annotation {
  constructor(start, end) {
    super("line");
    this.start = start;
    this.end = end;
  }

  draw(ctx, opts = {}) {
    ctx.save();
    ctx.strokeStyle = this.selected ? "#0FF" : "#FFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.start.canvasX, this.start.canvasY);
    ctx.lineTo(this.end.canvasX, this.end.canvasY);
    ctx.stroke();
    ctx.restore();
  }
}
