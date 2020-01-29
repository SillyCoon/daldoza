import { Square } from '../models/game-elements/square.js';
import { Figure } from '../models/game-elements/figure.js';
import { Coordinate } from '../models/game-elements/coordinate.js';
import { NotationConverter } from './notation-converter.js';

export class Field {

  squares = [];

  sideRowLength;

  colsLength;

  get middleRowLength() {
    return this.sideRowLength + 1;
  }

  constructor(size = 16) {
    this.sideRowLength = size;
    this.colsLength = 3;
    this._init();
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

  getSquareByDistanceFromCurrent(currentSquareCoordinates, distance, player) {

    let neededSquareCoordinates;
    if (currentSquareCoordinates.x === 1) {
      const res = currentSquareCoordinates.x + distance;
      const diff = res - this.middleRowLength;
      if (diff <= 0) neededSquareCoordinates = { x: 1, y: res }
      else neededSquareCoordinates = { x: player === 1 ? 2 : 0, y: diff - 1 };
    } else {
      const res = currentSquareCoordinates.y - distance;
      if (res >= 0) neededSquareCoordinates = { x: currentSquareCoordinates.x, y: res };
      else neededSquareCoordinates = { x: 1, y: Math.abs(res) - 1 };
    }
    return this.squares[neededSquareCoordinates.x][neededSquareCoordinates.y];
  }

  hasFiguresOnWay(from, to, player) {
    for (let square of this.iterateFromToExcludeFirst(player, from, to)) {
      if (square.hasFigure && square.figure.color === player) return true
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
    yield* this.iterateFromTo(direction, from, to, ({x, y}) => x !== from.x || y !== from.y);
  }

  print() {
    for (let square of this.iterate(1)) {
      console.log(square);
    }
  }

  makeSnapshot() {
    return NotationConverter.toNotation(this);
  }

  restore(snapshot) {
    const cols = snapshot.split('|');
    cols.forEach((col, i) => {
      let j = 0;
      for (let c of col) {
        const figure = NotationConverter.charToFigure(c);
        const currentSquare = this.findSquare(new Coordinate(`${i};${j}`))
        currentSquare.figure = figure;
        j++;
      }
    });
  }

}