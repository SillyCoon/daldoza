import { Field } from './field.js'
import { CanvasDrawer } from './draw/drawer.js';
import { Logger } from './log/logger.js';
import { MoveEvent } from './log/move-event.js';
import { ActivatedEvent } from './log/activated-event.js';

export class Game {
    field;
    drawer;
    logger;

    constructor() {
        this.field = new Field(16);
        const canvas = document.getElementById('canvas');

        this.drawer = new CanvasDrawer(canvas);
        this.drawer.draw(this.field);

        const logPane = document.querySelector('#log-pane');
        this.logger = new Logger(logPane);
    }

    reset() {
        this.field = new Field(16); // field.reset();
    }

    makeMove(from, to) {
        const fromSquare = this.field.findSquare(from);
        const toSquare = this.field.findSquare(to);
        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;
        this.drawer.draw(this.field);
        this.logger.log(new MoveEvent('1', from, to));
    }

    activate(figureCoordinate) {
        const square = this.field.findSquare(figureCoordinate);
        if (square.hasFigure) {

            if (!square.figure.isActive) {
                this.logger.log(new ActivatedEvent('1', figureCoordinate));
                square.figure.activate();
                this.drawer.draw(this.field);
            }
        } else {
            const error = 'Нельзя активировать пустую клетку!';
            this.logger.logError(error);
            throw new Error(error);
        }
    }
}