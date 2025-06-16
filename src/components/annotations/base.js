export class Annotation {
  constructor(type) {
    this.type = type;
    this.selected = false;
  }

  draw(ctx, opts = {}) {
    // To be implemented by subclasses
  }
}
