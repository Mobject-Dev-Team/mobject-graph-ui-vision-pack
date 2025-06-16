export class CanvasInteractionManager {
  constructor() {
    this.currentTool = null;
    this.mode = "select"; // start in select mode
    this.selectedAnnotation = null;
    this.draggingHandle = null;
    this.canvasToImage = null; // Function to convert canvas coords to image coords
    this.imageToCanvas = null; // Function to convert image coords to canvas coords
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

  setImageToCanvasFunc(func) {
    this.imageToCanvas = func;
  }
  setCanvasToImageFunc(func) {
    this.canvasToImage = func;
  }

  pointerDown(pos, imageCoords, button = 0) {
    if (this.mode === "draw") {
      this.currentTool?.pointerDown(pos, imageCoords, button);
      return;
    }
    if (!this.annotations) return;

    let found = false;
    let selectedAnnotation = null;
    let draggingHandle = null;

    // Go backwards for z-order (topmost first)
    for (let i = this.annotations.length - 1; i >= 0; i--) {
      const ann = this.annotations[i];
      if (!found) {
        // Only first annotation that is hit gets selected
        const handleId = ann.hitTestHandle(pos, this.imageToCanvas);
        if (handleId) {
          selectedAnnotation = ann;
          draggingHandle = handleId;
          ann.selected = true;
          found = true;
          continue;
        } else if (ann.hitTest && ann.hitTest(pos, this.imageToCanvas)) {
          selectedAnnotation = ann;
          draggingHandle = null;
          ann.selected = true;
          found = true;
          continue;
        }
      }
      // All others (including overlapping ones) are NOT selected
      ann.selected = false;
    }

    this.selectedAnnotation = selectedAnnotation;
    this.draggingHandle = draggingHandle;

    // If nothing hit, clear all selections
    if (!selectedAnnotation) {
      this.selectedAnnotation = null;
      this.draggingHandle = null;
      for (const ann of this.annotations) ann.selected = false;
    }
  }

  pointerMove(pos, imageCoords) {
    if (this.mode === "draw") {
      this.currentTool?.pointerMove(pos, imageCoords);
      return;
    }

    if (this.selectedAnnotation && this.draggingHandle) {
      const imgCoords = this.canvasToImage(pos.canvasX, pos.canvasY);
      this.selectedAnnotation.moveHandle(this.draggingHandle, {
        imgX: imgCoords[0],
        imgY: imgCoords[1],
      });
    }
    // // If dragging
    // if (this.selectedAnnotation) {
    //   // Move handle or whole annotation
    //   if (this.draggingHandle) {
    //     if (this.selectedAnnotation.type === "line") {
    //       if (this.draggingHandle === "start")
    //         Object.assign(this.selectedAnnotation.start, pos, imageCoords);
    //       if (this.draggingHandle === "end")
    //         Object.assign(this.selectedAnnotation.end, pos, imageCoords);
    //     }
    //     if (this.selectedAnnotation.type === "rectangle") {
    //       if (this.draggingHandle === "start")
    //         Object.assign(this.selectedAnnotation.start, pos, imageCoords);
    //       if (this.draggingHandle === "end")
    //         Object.assign(this.selectedAnnotation.end, pos, imageCoords);
    //     }
    //     if (
    //       this.selectedAnnotation.type === "point" &&
    //       this.draggingHandle === "point"
    //     ) {
    //       Object.assign(this.selectedAnnotation.coord, pos, imageCoords);
    //     }
    //   }
    // }
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
