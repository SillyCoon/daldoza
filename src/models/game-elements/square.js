export class Square {
  get hasFigure() {
    return !!this.figure;
  }

  get availableToMakeMove() {
    return this.highlighted;
  }

  constructor(coordinate, figure, highlighted = false) {
    this.coordinate = coordinate;
    this.figure = figure;
    this.highlighted = highlighted;
  }
}
