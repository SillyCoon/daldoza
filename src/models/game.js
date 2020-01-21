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
        const fromSquare = this.field.findSquareByCoordinate(from);
        const toSquare = this.field.findSquareByCoordinate(to);
        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;
        this.drawer.draw(this.field);
        this.logger.log(new MoveEvent('1', from, to));
    }

    activate(figureCoordinate) {
        const square = this.field.findSquareByCoordinate(figureCoordinate);
        if (square.hasFigure) {
            square.figure.activate();
            this.logger.log(new ActivatedEvent('1', figureCoordinate));
        } else {
            const error = 'Нельзя активировать пустую клетку!';
            this.logger.logError(error);
            throw new Error(error);
        }
    } 
}