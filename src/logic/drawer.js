import { DiceDrawerFactory } from "./dice-drawer-factory.js";

export class CanvasDrawer {

    constructor(canvas, colorScheme, size) {
        this.canvas = canvas;

        this.squareSize = size.square;
        this.fontSize = size.fontSize;
        this.numerationPadding = size.numerationPadding;
        this.colorScheme = colorScheme;

        if (canvas.getContext) {
            this._context = canvas.getContext('2d');
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
        })
    }

    clear() {
        this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _drawCurrentPlayerStatistics(player) {
        if (player) {
            this._context.fillText(`Игрок: ${player.name}`, this._nextSquareCoordinate(7), this._nextSquareCoordinate(0));
        }
    }

    _drawDices(dices) {
        if (dices && dices.length) {
            dices.forEach((dice, i) => {
                this._drawDice(9 + i, 2, dice);
            });
        }
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

    _drawDice(x, y, value) {
        this._drawSquare(x, y);
        const valueDrawer = new DiceDrawerFactory(value);
        valueDrawer.makeDrawFunction()(this._context, this._centerOfSquare(x), this._centerOfSquare(y));
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