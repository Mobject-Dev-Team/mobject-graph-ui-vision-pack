import { AnnotationTool } from "./base-tool.js";
import { RectangleAnnotation } from "../annotations/rectangle.js";

export class RectangleTool extends AnnotationTool {
  constructor(finishCallback) {
    super(finishCallback);
    this.start = null;
  }
  pointerDown(pos, imageCoords) {
    this.start = { ...pos, ...imageCoords };
    this.activeAnnotation = null;
  }
  pointerMove(pos, imageCoords) {
    if (!this.start) return;
    this.activeAnnotation = new RectangleAnnotation(this.start, {
      ...pos,
      ...imageCoords,
    });
  }
  pointerUp(pos, imageCoords) {
    if (this.start && this.activeAnnotation) {
      this.onFinish?.(this.activeAnnotation);
    }
    this.start = null;
    this.activeAnnotation = null;
  }
}
