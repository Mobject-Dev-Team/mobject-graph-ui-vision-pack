import { Annotation } from "./base.js";

export class PointAnnotation extends Annotation {
  constructor(coord) {
    super("point");
    this.coord = coord;
  }

  draw(ctx, opts = {}) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.coord.canvasX, this.coord.canvasY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = this.selected ? "#0FF" : "#FFF";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
