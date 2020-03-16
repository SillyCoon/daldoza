import { Square } from '../models/game-elements/square.js';
import { NotationConverter } from './notation-converter.js';
import { FieldException } from '../models/game-elements/exceptions/field-exception.js';
import { FieldSnapshot } from '../models/game-elements/field-snapshot.js';

export class Field {

  get middleRowLength() {
    return this.sideRowLength + 1;
  }

  constructor(snapshot) {

    this.sideRowLength = snapshot.size;
    this.colsLength = 3;
    this.restore(snapshot.value);
  }

  static initial(size = 16) {
    const snapshot = new FieldSnapshot(NotationConverter.initialNotation(size));
    return new Field(snapshot);
  }

  activate(figureCoordinate, currentColor) {
    const changingField = this.clone();
    const selectedFigure = changingField.findSquare(figureCoordinate).figure;

    if (selectedFigure && !selectedFigure.active && selectedFigure.color === currentColor) {
      selectedFigure.activate();
      return changingField;
    }
    return this;
  }

  moveFigure(from, to) {
    const changingField = this.clone(); // чтобы изменения не затронули старое состояние поля
    const fromSquare = changingField.findSquare(from);
    const toSquare = changingField.findSquare(to);

    if (!fromSquare || !toSquare) throw new FieldException('Неправильный ход!');

    toSquare.figure = fromSquare.figure;
    fromSquare.figure = null;

    // TODO: архитектура от бога просто, чтобы поменять координаты фигур, придется еще раз
    // переводить в нотацию и создавать поле
    // в перспективе можно двигать сразу в нотации или избавиться от понятия поля и оставить только фигуры
    // или избавиться от поля в данном виде и оставить только нотацию в виде массива символов

    // snapshot[to.x][to.y] = snapshot[from.x][from.y]
    // snapshot[from.x][from.y] = '*'
    return changingField.clone();

  }

  pickFigure(coordinate) {
    const figure = this.findSquare(coordinate).figure;
    return figure;
  }

  findSquare(coordinate) {
    return this.squares[coordinate.x][coordinate.y];
  }

  getAnyFigureOfColorCanMoveOn(distance, color) {
    return this.figures.find(figure => {
      let squareToMove;
      if (figure.color === color && figure.active) {
        squareToMove = this.getNotBlockedSquareCoordinateByDistanceFrom(figure.coordinate, distance, color);
      }
      return !!squareToMove;
    });
  }

  getNotBlockedSquareCoordinateByDistanceFrom(fromCoordinate, distance, blockingColor) {
    const squareOnDistance = this.getSquareByDistanceFromCurrent(fromCoordinate, distance, blockingColor);
    if (this.hasFiguresOnWay(fromCoordinate, squareOnDistance.coordinate, blockingColor)) {
      return null;
    }
    return squareOnDistance.coordinate;
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

  getSquareByDistanceFromCurrent(currentSquareCoordinates, distance, direction) {

    for (let nextSquare of this.iterateFromToExcludeFirst(direction, currentSquareCoordinates, currentSquareCoordinates)) {
      if (this.distance(currentSquareCoordinates, nextSquare.coordinate) === distance) return nextSquare;
    }
  }

  onlyOneFigureOfColor(color) {

    const figuresCounter = this.figures.filter(figure => figure.color === color).length;
    return figuresCounter <= 1;
  }

  hasFiguresOnWay(from, to, direction) {
    for (let square of this.iterateFromToExcludeFirst(direction, from, to)) {
      if (square.hasFigure && square.figure.color === direction) return true;
    }
    return false;
  }

  getAllFiguresCanActivate(color) {
    return this.figures.filter(figure => figure.color === color && !figure.active);
  }

  anyActiveFigure(color) {
    return this._anyFigureSuitsCondition(
      color,
      (clr, figure) => figure && figure.active && figure.color === clr
    );
  }

  anyNotActiveFigure(color) {
    return this._anyFigureSuitsCondition(
      color,
      (clr, figure) => figure && !figure.active && figure.color === clr
    );
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

    yield* this.iterateFromTo(direction, from, to);
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
    } while (x !== to.x || y !== to.y);
    yield this.squares[to.x][to.y]; // last square
  }

  *iterateFromToExcludeFirst(direction, from, to) {
    yield* this.iterateFromTo(direction, from, to, ({ x, y }) => x !== from.x || y !== from.y);
  }

  makeSnapshot() {
    const snapshot = new FieldSnapshot(NotationConverter.toNotation(this));
    return snapshot;
  }

  restore(snapshot) {
    this.squares = [];
    this.figures = [];
    const fieldColumns = snapshot.split('\n');

    for (let x = 0; x < this.colsLength; x++) {
      this.squares.push([]);
      const rowLength = (x === 1) ? this.middleRowLength : this.sideRowLength;
      for (let y = 0; y < rowLength; y++) {

        const figure = makeFigure(fieldColumns[x][y], { x, y });
        if (figure) this.figures.push(figure);
        this.squares[x].push(
          new Square(
            { x, y },
            figure)
        );
      }
    }

    function makeFigure(char, coordinate) {
      const figure = NotationConverter.charToFigure(char);
      if (figure) figure.coordinate = coordinate;
      return figure;
    }
  }

  equals(otherField) {
    this.makeSnapshot() === otherField.makeSnapshot();
  }

  clone() {
    return new Field(this.makeSnapshot());
  }

}