import { Annotation } from "./base.js";

export class LineAnnotation extends Annotation {
  constructor(start, end) {
    super("line");
    this.start = start; // {imgX, imgY}
    this.end = end; // {imgX, imgY}
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
    const { imageToCanvas } = opts;
    // Convert img coords to canvas coords
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);

    ctx.save();
    ctx.strokeStyle = this.selected ? "#0FF" : "#FFF";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.canvasX, a.canvasY);
    ctx.lineTo(b.canvasX, b.canvasY);
    ctx.stroke();
    // Handles
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

  // (Optional) Hit test for endpoints and line
  hitTest(pos, imageToCanvas) {
    // Convert endpoints to canvas coords
    const a = imageToCanvas(this.start.imgX, this.start.imgY);
    const b = imageToCanvas(this.end.imgX, this.end.imgY);

    function dist2(pt1, pt2) {
      return (
        (pt1.canvasX - pt2.canvasX) ** 2 + (pt1.canvasY - pt2.canvasY) ** 2
      );
    }

    // Check endpoints first
    if (Math.sqrt(dist2(a, pos)) <= 8) return true;
    if (Math.sqrt(dist2(b, pos)) <= 8) return true;

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
    return dist < 8;
  }

  hitTestHandle(pos, imageToCanvas) {
    // pos = {canvasX, canvasY}
    const handles = [
      { handleId: "start", ...this.start },
      { handleId: "end", ...this.end },
    ];
    for (const handle of handles) {
      const { canvasX, canvasY } = imageToCanvas(handle.imgX, handle.imgY);
      const dx = pos.canvasX - canvasX;
      const dy = pos.canvasY - canvasY;
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
