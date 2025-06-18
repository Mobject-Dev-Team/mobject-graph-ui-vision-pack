export class CanvasInteractionManager {
  constructor() {
    this.currentTool = null;
    this.selectedAnnotation = null;
    this.draggingHandle = null;
    this.canvasToImage = null;
    this.imageToCanvas = null;
    this.annotations = [];
  }

  setTool(toolInstance) {
    this.currentTool = toolInstance;
    this.selectedAnnotation = null;
    this.draggingHandle = null;
  }

  clearTool() {
    this.currentTool = null;
    this.selectedAnnotation = null;
    this.draggingHandle = null;
  }

  cancelCurrentTool() {
    if (this.currentTool) {
      this.currentTool.cancel();
    }
    this.clearTool();
  }

  get usingTool() {
    return this.currentTool;
  }

  setAnnotations(annotations) {
    this.annotations = annotations;
  }

  setImageToCanvasFunc(func) {
    this.imageToCanvas = func;
  }
  setCanvasToImageFunc(func) {
    this.canvasToImage = func;
  }

  selectAnnotationAt(pos) {
    if (!this.annotations) return null;

    let selected = null;

    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const annotation = this.annotations[i];
      if (annotation.hitTest(pos, this.imageToCanvas)) {
        selected = annotation;
        annotation.selected = true;
      } else {
        annotation.selected = false;
      }
    }

    this.selectedAnnotation = selected;
    this.draggingHandle = null;
    return selected;
  }

  pointerDown(pos, imageCoords, button = 0) {
    if (this.currentTool) {
      this.currentTool.pointerDown(pos, imageCoords, button);
      return;
    }
    if (!this.annotations) return;

    let found = false;
    let selectedAnnotation = null;
    let draggingHandle = null;

    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const annotation = this.annotations[i];
      if (!found) {
        const handleId = annotation.hitTestHandle(pos, this.imageToCanvas);
        if (handleId) {
          selectedAnnotation = annotation;
          draggingHandle = handleId;
          annotation.selected = true;
          found = true;
          continue;
        } else if (
          annotation.hitTest &&
          annotation.hitTest(pos, this.imageToCanvas)
        ) {
          selectedAnnotation = annotation;
          draggingHandle = null;
          annotation.selected = true;
          found = true;
          continue;
        }
      }
      annotation.selected = false;
    }

    this.selectedAnnotation = selectedAnnotation;
    this.draggingHandle = draggingHandle;

    if (!selectedAnnotation) {
      this.selectedAnnotation = null;
      this.draggingHandle = null;
      for (const annotation of this.annotations) annotation.selected = false;
    }
  }

  pointerMove(pos, imageCoords) {
    if (this.currentTool) {
      this.currentTool.pointerMove(pos, imageCoords);
      return;
    }

    if (this.selectedAnnotation && this.draggingHandle) {
      const imgCoords = this.canvasToImage(pos.canvasX, pos.canvasY);
      this.selectedAnnotation.moveHandle(this.draggingHandle, {
        imgX: imgCoords[0],
        imgY: imgCoords[1],
      });
    }
  }

  pointerUp(pos, imageCoords) {
    if (this.currentTool) {
      this.currentTool.pointerUp(pos, imageCoords);
      return;
    }
    this.draggingHandle = null;
  }

  get activeAnnotation() {
    return this.currentTool?.activeAnnotation || null;
  }

  pointerOver(pos, imageCoords) {
    if (this.currentTool && typeof this.currentTool.setHover === "function") {
      this.currentTool.setHover(pos, imageCoords);
    }
  }

  draw(ctx, opts) {
    if (this.currentTool && typeof this.currentTool.draw === "function") {
      this.currentTool.draw(ctx, { ...opts, preview: true });
    }
  }
}
