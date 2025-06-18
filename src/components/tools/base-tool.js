export class AnnotationTool {
  constructor(finishCallback) {
    this.onFinish = finishCallback;
    this.activeAnnotation = null;
  }

  pointerDown(pos, imageCoords, button = 0) {}
  pointerMove(pos, imageCoords) {}
  pointerUp(pos, imageCoords) {}

  cancel() {
    this.activeAnnotation = null;
  }

  draw(ctx, opts) {
    if (this.activeAnnotation) {
      this.activeAnnotation.draw(ctx, { ...opts, preview: true });
    }
  }
}
