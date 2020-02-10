import { Field } from './field.js'
import { Dice } from './dice.js';
import { CommandType } from '../models/game-elements/command-type.js';
import { GameStatus } from '../models/game-elements/enums/game-status.js';

export class GameState {

    get oppositePlayer() {
        return this.currentPlayer.color === this.firstPlayer.color ? this.secondPlayer : this.firstPlayer;
    }

    constructor(field, player, status) {
        this.field = field;
        this.dices = player.dices;
        this.currentPlayer = player.color;
        this.selectedFigure = player.selectedFigure;
        this.status = status;
    }

    static start(fieldSize) {

        const field = Field.initial(fieldSize);
        const playerOptions = {
            dices: [],
            color: 1,
            selectedFigure: null
        };
        const status = GameStatus.Playing;

        return new GameState(field, playerOptions, status);

    }

    command(type, params) {
        switch (type) {
            case CommandType.Move:
                return this.makeMove(params.from, params.to);
            case CommandType.Activate:
                return this.activate(params.figureCoordinate);
            case CommandType.PickFigure:
                return this.pickFigure(params.figureCoordinate);
            case CommandType.Roll:
                return this.roll();
            default: throw new Error('No such command!');
        }
    }


    roll() {
        const rolledDices = [Dice.roll(), Dice.roll()];
        return new GameState(this.field, { color: this.currentPlayer.color, dices: rolledDices, selectedFigure: null }, this.status);
    }

    activate(figureCoordinate) {
        if (this._hasDal()) {
            const changedField = this.field.activate(figureCoordinate);
            const remainingDices = this._removeUsedDices(Dice.dal);
            const nextPlayerColor = !!remainingDices.length ? this.currentPlayer.color : this.oppositePlayer.color;
            const status = this.status;
            return new GameState(changedField, { color: nextPlayerColor, dices: remainingDices, selectedFigure: null }, status);
        } else {
            return this;
        }
    }

    pickFigure(figureCoordinate) {
        const selectedFigure = this.figure.pickFigure(figureCoordinate);

        if (selectedFigure && selectedFigure.color === this.currentPlayer.color) {
            return new GameState(this.field, { color: this.currentPlayer.color, dices: this.dices, selectedFigure }, this.status);
        }
        return this;
    }

    makeMove(from, to) {
        const movedField = this.field.moveFigure(from, to); // гарантируем иммутабельность поля
        const moveDistance = this.field.distance(from, to);
        const remainingDices = this._removeUsedDices(moveDistance);
        const nextPlayerColor = !!remainingDices.length ? this.currentPlayer.color : this.oppositePlayer.color;
        const status = movedField.onlyOneFigureOfColor(nextPlayerColor)
            ? this.currentPlayer.color === 1
                ? GameStatus.FirstWin : GameStatus.SecondWin
            : GameStatus.Playing;

        return new GameState(
            movedField,
            { color: nextPlayerColor, dices: remainingDices, selectedFigure: null },
            status);
    }

    _removeUsedDices(distance) {
        if (distance === this.dices[0] + this.dices[1]) return [];
        const usedDiceIndex = this.dices.indexOf(distance);
        return this.dices.filter((_, i) => i !== usedDiceIndex);
    }

    _hasDal() {
        return this.dices.some(dice => dice === 1);
    }
}