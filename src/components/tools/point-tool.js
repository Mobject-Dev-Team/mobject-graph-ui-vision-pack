import { AnnotationTool } from "./base-tool.js";
import { PointAnnotation } from "../annotations/point.js";

export class PointTool extends AnnotationTool {
  pointerDown(pos, imageCoords) {
    const annotation = new PointAnnotation({ ...pos, ...imageCoords });
    this.onFinish?.(annotation);
  }
}
