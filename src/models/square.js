export class Square {
    x;
    y;
    figure;

    get hasFigure() {
        return !!this.figure;
    };

constructor(x, y, figure) {
    this.x = x;
    this.y = y;
    this.figure = figure;
}
}