import { AnnotationTool } from "./base-tool.js";
import { Rectangle_TcVnRectangle_DINT_Annotation } from "../annotations/rectangle-TcVnRectangle-DINT-annotation.js";

export class Rectangle_TcVnRectangle_DINT_Tool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.start = null;
    this.hover = null;
    this.activeAnnotation = null;
  }

  pointerDown(pos, imageCoords) {
    this.start = { ...pos, ...imageCoords };
    this.activeAnnotation = new Rectangle_TcVnRectangle_DINT_Annotation(
      this.start,
      this.start
    );
    this.hover = null;
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
    this.hover = null;
  }

  setHover(pos, imageCoords) {
    this.hover = { ...pos, ...imageCoords };
  }

  draw(ctx, opts) {
    super.draw(ctx, opts);
    if (!this.start && this.hover) {
      Rectangle_TcVnRectangle_DINT_Annotation.drawGhostHandle(ctx, this.hover);
    }
  }
}
