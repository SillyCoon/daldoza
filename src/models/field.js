import { Square } from './square.js';
import { Figure } from './figure.js';
import { Coordinate } from './coordinate.js';

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
    this.init();
  }

  init() {
    for (let i = 0; i < this.colsLength; i++) {
      this.squares.push([]);
      const rowLength = (i === 1) ? this.middleRowLength : this.sideRowLength;
      for (let j = 0; j < rowLength; j++) {
        this.squares[i].push(
          new Square(new Coordinate(`${i};${j}`),
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

  print() {
    let desk = '';
    this.squares.forEach(row => {
      row.forEach(square => {
        if (square.hasFigure) {
          desk += square.figure.isActive ? '+' : '-';
        }
        else {
          desk += '*';
        }
      });
      desk += '\n';
    })
    console.log(desk);
  }
}