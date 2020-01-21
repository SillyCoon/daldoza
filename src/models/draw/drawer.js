export class CanvasDrawer {

    squareSize = 40;
    squarePadding = 5;

    canvas;
    _context;

    constructor(canvas) {

        canvas.height = 400;
        canvas.width = 1100;

        this.canvas = canvas;

        if (canvas.getContext) {
            this._context = canvas.getContext('2d');
        } else {
            throw new Error('Not canvas!');
        }
    }

    draw(field) {
        this.clear();
        field.squares.forEach((row, y) => {
            row.forEach((square, x) => {
                this._context.beginPath();
                this._drawSquare(x, y);
                this._drawFigure(square.figure, x, y);
                this._context.stroke();
            });
        })
    }

    clear() {
        this._context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _drawSquare(x, y) {
        this._context.strokeRect(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize);
    }

    _drawFigure(figure, x, y) {
        if (figure) {
            this._context.arc(this._centerOfSquare(x), this._centerOfSquare(y), 15, 0, Math.PI * 2, true);
            if (figure.isActive) {
                console.log('filled')
                this._context.fill();
            } else {
                this._context.stroke();
            }
        }
    }

    _centerOfSquare(coord) {
        return this.squareSize * (coord + 0.5);
    }
}