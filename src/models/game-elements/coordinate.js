export class Coordinate {
  constructor(stringWithDelimiter) {
    const [x, y] = stringWithDelimiter.replace(' ', '').split(';');
    this.x = +x;
    this.y = +y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `x: ${this.x}, y: ${this.y}`;
  }

  equals(coordinate) {
    return this.toString() === coordinate.toString();
  }
}
