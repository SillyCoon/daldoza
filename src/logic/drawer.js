import { DicePresentation } from './draw/dice-presentation.js';


export class CanvasDrawer {
  constructor(board, colorScheme, size) {
    this.canvas = board.canvas;

    this.dice = DicePresentation;
    this.dice.init();

    this.squareSize = size.square;
    this.fontSize = size.fontSize;
    this.numerationPadding = size.numerationPadding;
    this.colorScheme = colorScheme;

    if (this.canvas.getContext) {
      this._context = this.canvas.getContext('2d');
      this._context.font = `${this.fontSize}px serif`;
      this._context.textAlign = 'center';
      this._context.textBaseline = 'middle';
    } else {
      throw new Error('Not canvas!');
    }
  }

  draw(state, playerStatistic) {
    this.clear();
    this._setFillColor(state.currentPlayerColor === 1 ? this.colorScheme.firstPlayerColor : this.colorScheme.secondPlayerColor);

    this._drawDices(state.dices);
    this._drawCurrentPlayerStatistics(playerStatistic);
    state.field.squares.forEach((row, x) => {
      this._drawXNumeration(x);
      row.forEach((square, y) => {
        this._context.beginPath();
        const highlighted = state.isSquareAvailableToMove(square.coordinate);
        this._drawSquare(x, y, highlighted);
        this._drawYNumeration(y);
        if (square.figure) {
          this._drawFigure(square.figure, x, y);
        }
        this._context.stroke();
      });
    });
  }

  drawVictory(state, playerStatistic) {
    this.clear();
    this._setFillColor(state.currentPlayerColor === 1 ? this.colorScheme.firstPlayerColor : this.colorScheme.secondPlayerColor);
    playerStatistic.win = true;
    this._drawCurrentPlayerStatistics(playerStatistic);
  }

  clear() {
    this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _drawCurrentPlayerStatistics(player) {
    if (player) {
      let text = `Игрок: ${player.name}`;
      if (player.win) {
        text += ` победил`;
      }
      this._context.fillText(text, this._nextSquareCoordinate(7), this._nextSquareCoordinate(0));
    }
  }

  _drawDices(dices) {
    if (dices && dices.length) {
      dices.forEach((dice, i) => {
        this._drawDice(8 + i, 2, dice);
      });
    }
  }

  _drawDice(x, y, face) {
    this.dice.getSprite(face).then(([cubeSprite, faceSprite]) => {
      this._context.drawImage(cubeSprite, this._nextSquareCoordinate(x), this._nextSquareCoordinate(y));
      this._context.drawImage(faceSprite, this._nextSquareCoordinate(x), this._nextSquareCoordinate(y));
    });
  }

  _drawSquare(x, y, highlighted = false) {
    let color = this.colorScheme.basicSquare;
    if (highlighted) {
      this._context.lineWidth = 3;
      color = this.colorScheme.highlightedSquare;
    }
    this._setStrokeColor(color);
    this._context.strokeRect(this._nextSquareCoordinate(x), this._nextSquareCoordinate(y), this.squareSize, this.squareSize);
    this._context.lineWidth = 1;
  }

  _drawFigure(figure, x, y) {
    this._setFigureColor(figure);

    this._context.arc(this._centerOfSquare(x), this._centerOfSquare(y), 15, 0, Math.PI * 2, true);
    if (figure.isActive) {
      this._context.fill();
    } else {
      this._context.stroke();
    }
  }

  _drawXNumeration(x) {
    this._setFillColor('blue');
    this._context.fillText(x, this._centerOfSquare(x), this.fontSize * 1.5);
  }

  _drawYNumeration(y) {
    this._setFillColor('orange');
    this._context.fillText(y, this.fontSize, this._centerOfSquare(y) + 5);
  }

  _nextSquareCoordinate(coord) {
    return coord * this.squareSize + this.numerationPadding;
  }

  _centerOfSquare(coord) {
    return this.squareSize * (coord + 0.5) + this.numerationPadding;
  }

  _setFigureColor(figure) {
    const playerColor = figure.isFirstPlayer ? this.colorScheme.firstPlayerColor : this.colorScheme.secondPlayerColor;
    this._setStrokeColor(playerColor);
    this._setFillColor(playerColor);
  }

  _setStrokeColor(color) {
    this._context.strokeStyle = color;
  }

  _setFillColor(color) {
    this._context.fillStyle = color;
  }
}
