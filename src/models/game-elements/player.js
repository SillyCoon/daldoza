export class Player {
  constructor(color, name, figuresCounter) {
    this.color = color;
    this.name = name;
    this.figuresCounter = 16;
  }

  getColor() {
    return this.color === 1 ? 'red' : 'green';
  }
}
