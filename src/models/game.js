import { Field } from './field.js'
import { MoveEvent } from './log/move-event.js';
import { ActivatedEvent } from './log/activated-event.js';
import { Player } from './player.js';
import { Dice } from './dice.js';
import { Square } from './square.js';
import { GameSnapshot } from './game-snapshot.js';

export class Game {

    state;

    constructor(drawer, logger) {

        this.field = new Field(16);
        this.drawer = drawer;
        this.logger = logger;

        this.initPlayers();
        this.initDices();

        this.currentPlayer = this.firstPlayer;
        this.drawer.draw(this.field);
    }

    initPlayers(first = 'A', second = 'B') {
        this.firstPlayer = new Player(1, first);
        this.secondPlayer = new Player(2, second);
    }

    initDices() {
        this.aDice = new Dice();
        this.bDice = new Dice();
    }

    makeMove(from, to) {
        const fromSquare = this.field.findSquare(from);
        const toSquare = this.field.findSquare(to);

        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;

        console.log(this.field.distance(from, to));

        this.drawer.draw(this.field);
        this.logger.log(new MoveEvent(this.currentPlayer.name, from, to));

        this.switchPlayer();
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

    switchPlayer() {
        this.currentPlayer = this.currentPlayer == this.firstPlayer
            ? this.secondPlayer : this.firstPlayer;
    }

    rollDices() {
        this.aDice.roll();
        this.bDice.roll();
        this.logger.log(`1 кубик: ${this.aDice.side}; 2 кубик: ${this.bDice.side}`);
    }

    save() {
        const fieldSnapshot = this.field.makeSnapshot();
        return new GameSnapshot(fieldSnapshot, [this.aDice.side, this.bDice.side], this.currentPlayer);
    }

    restore(snapshot) {
        this.field.restore(snapshot.fieldSnapshot);

    }
}