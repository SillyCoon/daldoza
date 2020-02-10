import { Square } from '../models/game-elements/square.js';
import { Figure } from '../models/game-elements/figure.js';
import { NotationConverter } from './notation-converter.js';

export class Field {

  squares = [];

  sideRowLength;

  colsLength;

  get middleRowLength() {
    return this.sideRowLength + 1;
  }

  constructor(snapshot) {

    this.sideRowLength = 16;
    this.colsLength = 3;
    this._init();
    this.restore(snapshot);
  }

  static initial(size = 16) {
    return new Field(NotationConverter.initialNotation(size));
  }

  _init() {
    for (let i = 0; i < this.colsLength; i++) {
      this.squares.push([]);
      const rowLength = (i === 1) ? this.middleRowLength : this.sideRowLength;
      for (let j = 0; j < rowLength; j++) {
        this.squares[i].push(
          new Square(
            { x: i, y: j },
            i !== 1 ? new Figure(i === 0 ? 1 : 2) : null)
        );
      }
    }
  }

  activate(figureCoordinate, currentColor) {
    const changingField = this.clone();
    const selectedFigure = changingField.findSquare(figureCoordinate).figure;

    if (selectedFigure && !selectedFigure.isActive && figure.color === currentColor) {
      figure.activate();
      return changingField;
    }
    return this;
  }

  moveFigure(from, to) {
    const changingField = this.clone();
    const fromSquare = changingField.findSquare(from);
    const toSquare = changingField.findSquare(to);

    if (!fromSquare || !toSquare) throw new Error('Неправильный ход!');

    if (toSquare.availableToMakeMove) {
      toSquare.figure = fromSquare.figure;
      fromSquare.figure = null;
    }

    return changingField;
  }

  pickFigure(coordinate) {
    const figure = this.findSquare(coordinate).figure;
    return figure;
  }

  findSquare(coordinate) {
    return this.squares[coordinate.x][coordinate.y];
  }

  distance(from, to) {

    const fromSideToCenter = () => from.y + to.y + 1;
    const fromCenterToSide = () => (this.middleRowLength - from.y) + (this.sideRowLength - to.y) - 1;
    const onOneLine = () => Math.abs(to.y - from.y);

    if (to.x === from.x) {
      return onOneLine();
    } else if (from.x === 1) {
      return fromCenterToSide();
    } else {
      return fromSideToCenter();
    }
  }

  setHighlighting(highlightingSquaresCoordinates, highlighted) {
    highlightingSquaresCoordinates.forEach(coordinates => {
      const square = this.findSquare(coordinates);
      square.highlighted = highlighted;
    });
  }

  getSquareByDistanceFromCurrent(currentSquareCoordinates, distance, direction) {

    for (let nextSquare of this.iterateFromToExcludeFirst(direction, currentSquareCoordinates, currentSquareCoordinates)) {
      if (this.distance(currentSquareCoordinates, nextSquare.coordinate) === distance) return nextSquare;
    }
  }

  onlyOneFigureOfColor(color) {

    let figuresCounter = 0;

    for (let square of this.iterate()) {
      if (square.figure && square.figure.color === color) figuresCounter++;
      if (figuresCounter > 1) return false;
    }
    return true;
  }

  hasFiguresOnWay(from, to, direction) {
    for (let square of this.iterateFromToExcludeFirst(direction, from, to)) {
      if (square.hasFigure && square.figure.color === direction) return true
    }
    return false;
  }

  anyActiveFigure(color) {
    return this._anyFigureSuitsCondition(
      color,
      (clr, figure) => figure && figure.active && figure.color === clr
    )
  }

  anyNotActiveFigure(color) {
    return this._anyFigureSuitsCondition(
      color,
      (clr, figure) => figure && !figure.active && figure.color === clr
    )
  }

  _anyFigureSuitsCondition(color, condition) {
    for (let square of this.iterate()) {
      if (condition(color, square.figure)) return true;
    }
    return false;
  }

  *iterate(direction = 1) {
    const from = direction === 1 ? { x: 0, y: 0 } : { x: 2, y: 0 };
    const to = direction === 1 ? { x: 2, y: 0 } : { x: 0, y: 0 };

    yield* this.iterateFromTo(direction, from, to)
  }

  *iterateFromTo(direction, from, to, condition = () => true) {
    let x = from.x;
    let y = from.y;

    do {
      if (condition({ x, y })) {
        yield this.squares[x][y];
      }

      if (x === 0 || x === 2) {
        if (y === 0) {
          x = 1;
          y = 0;
        } else {
          y--;
        }
      } else {
        if (y === this.middleRowLength - 1) {
          x = direction === 1 ? 2 : 0;
          y = this.sideRowLength - 1;
        } else {
          y++;
        }
      }
    } while (x !== to.x || y !== to.y)
    yield this.squares[to.x][to.y]; // last square
  }

  *iterateFromToExcludeFirst(direction, from, to) {
    yield* this.iterateFromTo(direction, from, to, ({ x, y }) => x !== from.x || y !== from.y);
  }

  makeSnapshot() {
    return NotationConverter.toNotation(this);
  }

  restore(snapshot) {
    const cols = snapshot.split('\n');
    cols.forEach((col, i) => {
      let j = 0;
      for (let c of col) {
        const figure = NotationConverter.charToFigure(c);
        const currentSquare = this.findSquare({ x: i, y: j });
        currentSquare.figure = figure;
        j++;
      }
    });
  }

  clone() {
    return new Field(this.makeSnapshot());
  }

}