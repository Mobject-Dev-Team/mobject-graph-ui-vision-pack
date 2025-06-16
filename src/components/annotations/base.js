export class Annotation {
  constructor(type) {
    this.type = type;
    this.selected = false;
  }
  draw(ctx, opts = {}) {}

  hitTest(pos) {
    return false;
  }
  
  hitTestHandle(pos) {
    return null;
  } 

  toJSON() {
    return { type: this.type };
  }

  static fromJSON(data) {
    return new Annotation(data.type);
  }
}