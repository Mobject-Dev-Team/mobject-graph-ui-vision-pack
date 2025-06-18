import { AnnotationTool } from "./base-tool.js";
import { TcVnVector4_DINT_Annotation } from "../annotations/tcVnVector4_DINT-annotation.js";

export class TcVnVector4_DINT_Tool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.start = null;
    this.hover = null;
    this.activeAnnotation = null;
  }

  pointerDown(pos, imageCoords) {
    this.start = { ...pos, ...imageCoords };
    this.activeAnnotation = new TcVnVector4_DINT_Annotation(
      this.start,
      this.start
    );
  }

  pointerMove(pos, imageCoords) {
    if (!this.start || !this.activeAnnotation) return;
    this.activeAnnotation.setEnd({ ...pos, ...imageCoords });
  }

  pointerUp(pos, imageCoords) {
    if (this.start && this.activeAnnotation) {
      this.activeAnnotation.setEnd({ ...pos, ...imageCoords });
      this.onFinish?.(this.activeAnnotation);
    }
    this.start = null;
    this.activeAnnotation = null;
  }

  setHover(pos, imageCoords) {
    this.hover = { ...pos, ...imageCoords };
  }

  draw(ctx, opts) {
    super.draw(ctx, opts);
    if (!this.start && this.hover) {
      TcVnVector4_DINT_Annotation.drawGhostHandle(ctx, this.hover);
    }
  }
}
