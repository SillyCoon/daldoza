export class CanvasDrawer {

    squareSize = 40;
    squarePadding = 5;

    canvas;
    _context;

    constructor(canvas, colorScheme) {

        canvas.height = 400;
        canvas.width = 1100;

        this.canvas = canvas;
        this.colorScheme = colorScheme;

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

    _drawSquare(x, y) {
        this._setStrokeColor('black');
        this._context.strokeRect(x * this.squareSize, y * this.squareSize, this.squareSize, this.squareSize);
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

    _centerOfSquare(coord) {
        return this.squareSize * (coord + 0.5);
    }

    _setFigureColor(figure) {
        const playerColor = figure.player === 1 ? this.colorScheme.firstPlayerColor : this.colorScheme.secondPlayerColor; 
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