import { Figure } from '../models/game-elements/figure.js'

export class NotationConverter {

  constructor() { }

  static toNotation(field) {
    let notation = '';
    field.squares.forEach(row => {
      row.forEach(square => {
        if (square.hasFigure) {
          if (square.figure.isFirstPlayer) {
            notation += square.figure.isActive ? '+' : '-';
          } else {
            notation += square.figure.isActive ? '1' : '0';
          }
        }
        else {
          notation += '*';
        }
      });
      notation += '\n';
    });
    return notation;
  }

  static charToFigure(c) {

    let isActive;
    let color;

    switch (c) {
      case '*':
        return null;
      case '+':
        isActive = true;
        color = 1;
        break;
      case '-':
        isActive = false;
        color = 1;
        break
      case '1':
        isActive = true;
        color = 2;
      case '0':
        isActive = false;
        color = 2;
    }

    const figure = new Figure(color);
    if(isActive) figure.activate();
    
    return figure;
  }
}