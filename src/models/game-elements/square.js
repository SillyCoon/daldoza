export class Square {
    coordinate;
    figure;

    get hasFigure() {
        return !!this.figure;
    };

    constructor(coordinate, figure, highlighted = false) {
        this.figure = figure;
        this.highlighted = highlighted;
    }
}