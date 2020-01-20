import { Field } from './field.js'

export class Game {
    field;

    init() { }

    makeMove(from, to) {
        const fromSquare = this.field.findSquareByCoordinate(from);
        const toSquare = this.field.findSquareByCoordinate(to);
        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;
        this.field.print();
    }

    constructor() {
        this.field = new Field(16);
    }
}