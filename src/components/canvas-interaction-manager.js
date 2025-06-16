export class CanvasInteractionManager {
  constructor() {
    this.currentTool = null;
    this.mode = "select"; // start in select mode
    this.selectedAnnotation = null;
    this.draggingHandle = null;
  }
  setTool(toolInstance) {
    this.currentTool = toolInstance;
    this.mode = toolInstance ? "draw" : "select";
    this.selectedAnnotation = null;
    this.draggingHandle = null;
  }

  setAnnotations(annotations) {
    this.annotations = annotations; // for hit-testing
  }

  pointerDown(pos, imageCoords, button = 0) {
    if (this.mode === "draw") {
      this.currentTool?.pointerDown(pos, imageCoords, button);
      return;
    }
    // Selection mode
    if (!this.annotations) return;
    // Go backwards for z-order
    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const ann = this.annotations[i];
      const handle = ann.hitTestHandle(pos);
      if (handle) {
        this.selectedAnnotation = ann;
        ann.selected = true;
        this.draggingHandle = handle;
        return;
      }
      if (ann.hitTest(pos)) {
        this.selectedAnnotation = ann;
        ann.selected = true;
        this.draggingHandle = null;
        return;
      }
    }
    // Clicked empty space: deselect
    this.selectedAnnotation?.selected &&
      (this.selectedAnnotation.selected = false);
    this.selectedAnnotation = null;
    this.draggingHandle = null;
  }

  pointerMove(pos, imageCoords) {
    if (this.mode === "draw") {
      this.currentTool?.pointerMove(pos, imageCoords);
      return;
    }
    // If dragging
    if (this.selectedAnnotation) {
      // Move handle or whole annotation
      if (this.draggingHandle) {
        if (this.selectedAnnotation.type === "line") {
          if (this.draggingHandle === "start")
            Object.assign(this.selectedAnnotation.start, pos, imageCoords);
          if (this.draggingHandle === "end")
            Object.assign(this.selectedAnnotation.end, pos, imageCoords);
        }
        if (this.selectedAnnotation.type === "rectangle") {
          if (this.draggingHandle === "start")
            Object.assign(this.selectedAnnotation.start, pos, imageCoords);
          if (this.draggingHandle === "end")
            Object.assign(this.selectedAnnotation.end, pos, imageCoords);
        }
        if (
          this.selectedAnnotation.type === "point" &&
          this.draggingHandle === "point"
        ) {
          Object.assign(this.selectedAnnotation.coord, pos, imageCoords);
        }
      }
    }
  }

  pointerUp(pos, imageCoords) {
    if (this.mode === "draw") {
      this.currentTool?.pointerUp(pos, imageCoords);
      return;
    }
    // Done dragging
    this.draggingHandle = null;
    this.dragOffset = null;
  }

  get activeAnnotation() {
    return this.currentTool?.activeAnnotation || null;
  }

  cancelCurrentAction() {
    if (this.mode === "draw") {
      this.currentTool?.cancel();
    }
    this.draggingHandle = null;
    this.dragOffset = null;
    this.selectedAnnotation = null;
  }
}
