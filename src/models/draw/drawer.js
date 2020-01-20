import { Coordinate } from '../coordinate.js';

export class CanvasDrawer {

    squareSize = 40;
    squarePadding = 5;

    _context;

    constructor(canvas) {

        canvas.height = 400;
        canvas.width = 1100;

        if (canvas.getContext) {
            this._context = canvas.getContext('2d');
        } else {
            throw new Error('Not canvas!');
        }
    }

    draw(field) {
        field.squares.forEach((row, y) => {
            row.forEach((square, x) => {
                this._context.beginPath();
                this._drawSquare(x, y);
                this._drawFigure(square.figure, x, y);
                this._context.stroke();
            });
        })
    }

    _drawSquare(x, y) {
        this._context.strokeRect(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize);
    }

    _drawFigure(figure, x, y) {
        if (figure) {
            console.log(this._findCenter(x), this._findCenter(y));
            this._context.arc(this._findCenter(x), this._findCenter(y), 15, 0, Math.PI * 2, true);
        }
    }

    _findCenter(coord) {
        return this.squareSize * (coord + 0.5);
    }
}