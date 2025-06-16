import { AnnotationTool } from "./base-tool.js";
import { LineAnnotation } from "../annotations/line.js";

export class LineTool extends AnnotationTool {
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
    this.activeAnnotation = new LineAnnotation(this.start, {
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
