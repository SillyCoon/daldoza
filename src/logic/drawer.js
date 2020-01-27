export class CanvasDrawer {

    squareSize = 40;

    _context;

    constructor(canvas, colorScheme) {

        this.canvas = canvas;
        canvas.height = 800;
        canvas.width = 600;

        this.fontSize = this.squareSize / 2;
        this.numerationPadding = this.fontSize * 2;

        this.colorScheme = colorScheme;

        if (canvas.getContext) {
            this._context = canvas.getContext('2d');
            this._context.font = `${this.fontSize}px serif`;
            this._context.textAlign = 'center';
        } else {
            throw new Error('Not canvas!');
        }
    }

    draw(field) {
        this.clear();
        field.squares.forEach((row, x) => {
            this._drawXNumeration(x);
            row.forEach((square, y) => {
                this._context.beginPath();
                this._drawSquare(x, y);
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

    _drawSquare(x, y) {
        this._setStrokeColor('black');
        this._context.strokeRect(this._nextSquareCoordinate(x), this._nextSquareCoordinate(y), this.squareSize, this.squareSize);
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