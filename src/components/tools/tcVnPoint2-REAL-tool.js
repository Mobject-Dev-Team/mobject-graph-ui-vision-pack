import { AnnotationTool } from "./base-tool.js";
import { TcVnPoint2_REAL_Annotation } from "../annotations/tcVnPoint2-REAL-annotation.js";

export class TcVnPoint2_REAL_Tool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.hover = null;
  }

  pointerDown(pos, imageCoords) {
    const annotation = new TcVnPoint2_REAL_Annotation({
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
      TcVnPoint2_REAL_Annotation.drawGhostHandle(ctx, this.hover);
    }
  }
}
