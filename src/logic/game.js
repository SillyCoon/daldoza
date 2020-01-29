import { Field } from './field.js'
import { MoveEvent } from '../models/events/move-event.js';
import { ActivatedEvent } from '../models/events/activated-event.js';
import { Player } from '../models/game-elements/player.js';
import { Dice } from './dice.js';
import { GameSnapshot } from '../models/game-elements/game-snapshot.js';
import { CoordinateTranslator } from './coordinate-translator.js';

export class Game {

    state;

    constructor(drawer, logger) {

        this.field = new Field(16);
        this.dice = new Dice(4);

        this.drawer = drawer;
        this.logger = logger;
        this.dices = [];

        this.availableMoves = [];

        this.initPlayers();

        this.currentPlayer = this.firstPlayer;
        this.drawer.draw(this.field);
    }

    initPlayers(first = 'A', second = 'B') {
        this.firstPlayer = new Player(1, first);
        this.secondPlayer = new Player(2, second);
    }

    get dicesThrown() {
        return !!this.dices.length;
    }

    showPossibleMoves(coordinates) {

        const currentSquareHasProperFigure = () => {
            const currentSquare = this.field.findSquare(coordinates);
            return !(!currentSquare.hasFigure || currentSquare.figure.color !== this.currentPlayer.turn || !currentSquare.figure.isActive);
        }

        this.removeHighlighting();

        if (!this.dicesThrown) {
            this.logger.log('Сначала киньте кубики!');
            return;
        }

        if (currentSquareHasProperFigure()) {

            this.availableMoves = this.dices
                .map(distance => this.field.getSquareByDistanceFromCurrent(coordinates, distance, this.currentPlayer.turn))
                .filter(square => !this.field.hasFiguresOnWay(coordinates, square.coordinate, this.currentPlayer.turn))
                .map(square => square.coordinate);

            this.highlightAvailableToMoveSquares(this.availableMoves);
        }
    }



    makeMove(from, to) {
        this.removeHighlighting();
        const fromSquare = this.field.findSquare(from);
        const toSquare = this.field.findSquare(to);

        toSquare.figure = fromSquare.figure;
        fromSquare.figure = null;

        this.drawer.draw(this.field);
        this.logger.log(new MoveEvent(this.currentPlayer.name, from, to));

        // this.switchPlayer();
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
        this.dices = [];
        this.dices.push(this.dice.roll(), this.dice.roll())
        this.dices.push(this.dices.reduce((a, b) => a + b));
        this.logger.log(`1 кубик: ${this.dices[0]}; 2 кубик: ${this.dices[1]}`);
    }

    save() {
        const fieldSnapshot = this.field.makeSnapshot();
        return new GameSnapshot(fieldSnapshot, [...this.dices], this.currentPlayer.turn);
    }

    restore(snapshot) {
        this.field.restore(snapshot.fieldSnapshot);
        this.dices = [...snapshot.dices];
        this.currentPlayer = snapshot.currentPlayer === 1 ? this.firstPlayer : this.secondPlayer;
        this.drawer.draw(this.field);
    }

    highlightAvailableToMoveSquares(squaresCoordinates) {

        if (!squaresCoordinates || !squaresCoordinates.length) {
            this.logger.log('У этой фигуры нет доступных ходов!');
        }
        this.field.setHighlighting(squaresCoordinates, true);
        this.drawer.draw(this.field);
    }

    removeHighlighting() {
        this.field.setHighlighting(this.availableMoves, false);
        this.highlightingCoordinates = [];
        this.drawer.draw(this.field);
    }
}