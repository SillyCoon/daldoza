import { Field } from './field.js'
import { MoveEvent } from '../models/events/move-event.js';
import { ActivatedEvent } from '../models/events/activated-event.js';
import { Player } from '../models/game-elements/player.js';
import { Dice } from './dice.js';
import { GameSnapshot } from '../models/game-elements/game-snapshot.js';

export class Game {

    constructor(drawer, logger) {

        this.field = new Field(16);
        this.dice = new Dice(4);

        this.drawer = drawer;
        this.logger = logger;
        this.dices = [];
        this.currentFigure = null;

        this.availableMoves = [];

        this.initPlayers();

        this.currentPlayer = this.firstPlayer;
        this.draw();
    }

    initPlayers(first = 'A', second = 'B') {
        this.firstPlayer = new Player(1, first);
        this.secondPlayer = new Player(2, second);
    }



    showPossibleMoves(coordinates) {

        const figureReadyToMove = (figure) => {
            return !(!figure || figure.color !== this.currentPlayer.color || !figure.isActive);
        }

        this.removeHighlighting();

        if (!this._dicesThrown) {
            this.logger.log('Сначала киньте кубики!');
            return;
        }

        const currentSquare = this.field.findSquare(coordinates);

        if (figureReadyToMove(currentSquare.figure)) {

            this.currentFigure = coordinates;
            
            const distances = this.dices.length > 1 ? [...this.dices, this.dices[0] + this.dices[1]] : [...this.dices];

            this.availableMoves = distances
                .map(dice => this.field.getSquareByDistanceFromCurrent(coordinates, dice, this.currentPlayer.color))
                .filter(square => !this.field.hasFiguresOnWay(coordinates, square.coordinate, this.currentPlayer.color))
                .map(square => square.coordinate);

            this.highlightAvailableToMoveSquares(this.availableMoves);
        }
    }

    makeMove(from, to) {
        const fromSquare = this.field.findSquare(from);
        const toSquare = this.field.findSquare(to);

        if (!fromSquare || !toSquare) return;

        if (toSquare.availableToMakeMove) {
            toSquare.figure = fromSquare.figure;
            fromSquare.figure = null;

            this.recountDicesAfterMove(this.field.distance(fromSquare.coordinate, toSquare.coordinate));
            this.logger.log(new MoveEvent(this.currentPlayer.name, from, to));
            if (!this.dices.length) this.switchPlayer();

            this.draw();
        }

        this.removeHighlighting();
    }

    activate(figureCoordinate) {

        const canActivate = (figure) => this._figureBelongsToCurrentPlayer(figure) && this._hasDal();

        const square = this.field.findSquare(figureCoordinate);
        if (canActivate(square.figure)) {
            if (!square.figure.isActive) {
                this.logger.log(new ActivatedEvent(this.currentPlayer.name, figureCoordinate));
                square.figure.activate();
                this.recountDicesAfterMove(Dice.dos);
                this.draw();
            }
        }
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer.color === this.firstPlayer.color
            ? this.secondPlayer : this.firstPlayer;
    }

    rollDices() {
        this.dices = [];
        this.dices.push(this.dice.roll(), this.dice.roll())
        this.logger.log(`1 кубик: ${this.dices[0]}; 2 кубик: ${this.dices[1]}`);
        this.draw();

        if (this._noAvailableMoves) {
            this.logger.log(`Нет доступных ходов для игрока ${this.currentPlayer.name}!`);
            // **** спорно ппц ****
            setTimeout(() => {
                this.switchPlayer(); 
                this.dices = [];
                this.draw();
            }, 1000);
        }
    }

    recountDicesAfterMove(distance) {
        if (distance === this.dices[0] + this.dices[1]) this.dices = [];
        const index = this.dices.indexOf(distance);
        this.dices = this.dices.filter((_, i) => i !== index);
    }


    highlightAvailableToMoveSquares(squaresCoordinates) {

        if (!squaresCoordinates || !squaresCoordinates.length) {
            this.logger.log('У этой фигуры нет доступных ходов!');
        }
        this.field.setHighlighting(squaresCoordinates, true);
        this.draw();
    }

    removeHighlighting() {
        this.field.setHighlighting(this.availableMoves, false);
        this.highlightingCoordinates = [];
        this.draw();
    }

    draw() {
        this.drawer.draw(this.field, this.dices, this.currentPlayer);
    }

    save() {
        const fieldSnapshot = this.field.makeSnapshot();
        return new GameSnapshot(fieldSnapshot, [...this.dices], this.currentPlayer.color);
    }

    restore(snapshot) {
        this.field.restore(snapshot.fieldSnapshot);
        this.dices = [...snapshot.dices];
        this.currentPlayer = snapshot.currentPlayer === 1 ? this.firstPlayer : this.secondPlayer;
        this.draw();
    }

    _figureBelongsToCurrentPlayer(figure) {
        return !!figure && figure.color === this.currentPlayer.color;
    }

    get _noAvailableMoves() {

        const currentColor = this.currentPlayer.color;
        const noActiveFigureToMove = !this._hasDal() && !this.field.anyActiveFigure(currentColor);
        const allFiguresBlocked = !this.availableMoves.length && this.field.anyActiveFigure(currentColor);

        return this._dicesThrown && (noActiveFigureToMove || allFiguresBlocked);
    }

    get _dicesThrown() {
        return !!this.dices.length;
    }

    _hasDal() {
        return this.dices.some(dice => dice === 1);
    }
}