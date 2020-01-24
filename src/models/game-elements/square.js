export class Square {
    coordinate;
    figure;

    get hasFigure() {
        return !!this.figure;
    };

    constructor(coordinate, figure) {
        this.figure = figure;
    }
}