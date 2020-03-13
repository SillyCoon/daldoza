import { Figure } from '../models/game-elements/figure.js';
import { Notation } from "../models/game-elements/enums/notation.js";

export class NotationConverter {

  constructor() { }

  static toNotation(field) {
    let notation = '';
    field.squares.forEach(row => {
      row.forEach(square => {
        if (square.hasFigure) {
          if (square.figure.isFirstPlayer) {
            notation += square.figure.isActive ? Notation.FirstActive : Notation.FirstPassive;
          } else {
            notation += square.figure.isActive ? Notation.SecondActive : Notation.SecondPassive;
          }
        }
        else {
          notation += Notation.Empty;
        }
      });
      notation += Notation.Delimiter;
    });
    return notation;
  }

  static charToFigure(c) {

    let isActive;
    let color;

    switch (c) { // . после квадрата - активный
      case Notation.Empty:
        return null;
      case Notation.FirstActive:
        isActive = true;
        color = 1;
        break;
      case Notation.FirstPassive:
        isActive = false;
        color = 1;
        break;
      case Notation.SecondActive:
        isActive = true;
        color = 2;
        break;
      case Notation.SecondPassive:
        isActive = false;
        color = 2;
    }

    const figure = new Figure(color);
    if (isActive) figure.activate();

    return figure;
  }

  static initialNotation(size = 16) {

    let firstPlayerRow = '';
    let secondPlayerRow = '';
    let middleRow = '';

    for (let i = 0; i < size; i++) {
      firstPlayerRow += Notation.FirstPassive;
      secondPlayerRow += Notation.SecondPassive;
      middleRow += Notation.Empty;
    }
    middleRow += Notation.Empty;
    return firstPlayerRow + Notation.Delimiter + middleRow + Notation.Delimiter + secondPlayerRow;
  }

  static goodTest(size = 13) {
    let firstPlayerRow = '';
    let secondPlayerRow = '';
    let middleRow = '';

    for (let i = 0; i < size; i++) {
      if (i === 0 || i === 5) { firstPlayerRow += Notation.FirstPassive }
      else {
        firstPlayerRow += Notation.Empty;
      }

      if (i === 0 || i === 5) { secondPlayerRow += Notation.SecondPassive }
      else {
        secondPlayerRow += Notation.Empty;
      }
      middleRow += Notation.Empty;
    }
    middleRow += Notation.Empty;
    return firstPlayerRow + Notation.Delimiter + middleRow + Notation.Delimiter + secondPlayerRow;
  }
}