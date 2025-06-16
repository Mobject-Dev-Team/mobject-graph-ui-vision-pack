import { Annotation } from "./base.js";

function dist2(a, b) {
  return (a.canvasX - b.canvasX) ** 2 + (a.canvasY - b.canvasY) ** 2;
}

export class LineAnnotation extends Annotation {
  constructor(start, end) {
    super("line");
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
    ctx.beginPath();
    ctx.moveTo(this.start.canvasX, this.start.canvasY);
    ctx.lineTo(this.end.canvasX, this.end.canvasY);
    ctx.stroke();
    if (this.selected) {
      // Draw handles
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
  // Hit test for line or ends
  hitTest(pos) {
    // Check ends first
    if (Math.sqrt(dist2(this.start, pos)) <= 8) return true;
    if (Math.sqrt(dist2(this.end, pos)) <= 8) return true;
    // Check near line
    const { canvasX: x1, canvasY: y1 } = this.start;
    const { canvasX: x2, canvasY: y2 } = this.end;
    const { canvasX: px, canvasY: py } = pos;
    const L2 = dist2(this.start, this.end);
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
    return dist < 8;
  }
  hitTestHandle(pos) {
    if (Math.sqrt(dist2(this.start, pos)) <= 8) return "start";
    if (Math.sqrt(dist2(this.end, pos)) <= 8) return "end";
    return null;
  }
}
