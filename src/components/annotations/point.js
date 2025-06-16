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
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.coord.canvasX, this.coord.canvasY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = this.selected ? "#0FF" : "#FFF";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    if (this.selected) {
      // Draw handle
      ctx.beginPath();
      ctx.arc(this.coord.canvasX, this.coord.canvasY, 8, 0, 2 * Math.PI);
      ctx.strokeStyle = "#0FF";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }
  hitTest(pos) {
    const dx = pos.canvasX - this.coord.canvasX;
    const dy = pos.canvasY - this.coord.canvasY;
    return Math.sqrt(dx * dx + dy * dy) <= 8; // within 8px
  }
  hitTestHandle(pos) {
    return this.hitTest(pos) ? "point" : null;
  }
}
