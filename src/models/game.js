import { Field } from './field.js'
import { CanvasDrawer } from './draw/drawer.js';

export class Game {
    field;
    drawer;

    constructor() {
        this.field = new Field(16);
        const canvas = document.getElementById('canvas');
        this.drawer = new CanvasDrawer(canvas);
        this.drawer.draw(this.field);
    }

    reset() {
        this.field = new Field(16); // field.reset();
    }

    makeMove(from, to) {
        const fromSquare = this.field.findSquareByCoordinate(from);
        const toSquare = this.field.findSquareByCoordinate(to);
        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;
        this.field.print();
    }
}