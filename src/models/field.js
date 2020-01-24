import { Square } from './square.js';
import { Figure } from './figure.js';
import { Coordinate } from './coordinate.js';
import { NotationConverter } from '../logic/notation-converter.js';

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
    const desk = NotationConverter.toNotation(this).replace(/\|/g, '\n');
    console.log(desk);
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