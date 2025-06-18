import { AnnotationTool } from "./base-tool.js";
import { Point_TcVnPoint2_LREAL_Annotation } from "../annotations/point-TcVnPoint2-LREAL-annotation.js";

export class Point_TcVnPoint2_LREAL_Tool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.hover = null;
  }

  pointerDown(pos, imageCoords) {
    const annotation = new Point_TcVnPoint2_LREAL_Annotation({
      ...pos,
      ...imageCoords,
    });
    this.onFinish?.(annotation);
    this.hover = null;
  }

  setHover(pos, imageCoords) {
    this.hover = { ...pos, ...imageCoords };
  }

  draw(ctx, opts) {
    super.draw(ctx, opts);
    if (this.hover) {
      Point_TcVnPoint2_LREAL_Annotation.drawGhostHandle(ctx, this.hover);
    }
  }
}
