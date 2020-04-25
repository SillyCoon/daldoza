export class Size {
  constructor(height = 800, width = 600) {
    this.height = height;
    this.width = width;
  }

  get square() {
    return Math.floor(Math.min(this.height / 20, this.width / 6));
  }

  get fontSize() {
    return Math.floor(this.square / 2);
  }

  get numerationPadding() {
    return this.fontSize * 2;
  }
}
