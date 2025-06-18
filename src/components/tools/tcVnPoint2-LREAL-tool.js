import { AnnotationTool } from "./base-tool.js";
import { TcVnPoint2_LREAL_Annotation } from "../annotations/tcVnPoint2-LREAL-annotation.js";

export class TcVnPoint2_LREAL_Tool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.hover = null;
  }

  pointerDown(pos, imageCoords) {
    const annotation = new TcVnPoint2_LREAL_Annotation({
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
      TcVnPoint2_LREAL_Annotation.drawGhostHandle(ctx, this.hover);
    }
  }
}
