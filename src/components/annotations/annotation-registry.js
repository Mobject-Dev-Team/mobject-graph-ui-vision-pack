export class AnnotationRegistry {
  static registry = new Map();

  static register(type, Ctor) {
    this.registry.set(type, Ctor);
  }

  static get(type) {
    return this.registry.get(type);
  }
}
