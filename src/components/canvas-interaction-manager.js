export class CanvasInteractionManager {
  constructor() {
    this.currentTool = null;
  }

  setTool(toolInstance) {
    this.currentTool = toolInstance;
  }

  pointerDown(pos, imageCoords, button = 0) {
    this.currentTool?.pointerDown(pos, imageCoords, button);
  }

  pointerMove(pos, imageCoords) {
    this.currentTool?.pointerMove(pos, imageCoords);
  }

  pointerUp(pos, imageCoords) {
    this.currentTool?.pointerUp(pos, imageCoords);
  }

  get activeAnnotation() {
    return this.currentTool?.activeAnnotation || null;
  }

  cancelCurrentAction() {
    this.currentTool?.cancel();
  }
}
