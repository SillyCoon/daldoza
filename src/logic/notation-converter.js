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
      notation += '|';
    });
    return notation;
  }

  static charToFigure(c) {

    let isActive;
    let player;

    switch (c) {
      case '*':
        return null;
      case '+':
        isActive = true;
        player = 1;
        break;
      case '-':
        isActive = false;
        player = 1;
        break
      case '1':
        isActive = true;
        player = 2;
      case '0':
        isActive = false;
        player = 2;
    }

    const figure = new Figure(player);
    if(isActive) figure.activate();
    
    return figure;
  }
}