import { Field } from './field.js'
import { Dice } from './dice.js';
import { CommandType } from '../models/game-elements/command-type.js';
import { GameStatus } from '../models/game-elements/enums/game-status.js';

export class GameState {

    get oppositePlayerColor() {
        return this.currentPlayerColor === 1 ? 2 : 1;
    }

    get distances() {
        return this.dices.length > 1 ? [...this.dices, this.dices[0] + this.dices[1]] : [...this.dices];
    }

    get possibleMoves() {
        let result;
        if (this._selectedFigureReadyToMove()) {
            result = this.distances.map(distance =>
                this.field.getNotBlockedSquareCoordinateByDistanceFrom(this.selectedFigure.coordinate, distance, this.currentPlayerColor)
            );
        } else {
            result = [];
        }

        // Просто балуюсь возможностями js, вообще не думаю, что этот миксин прям хорошая идея
        result.hasMove = (checkingMove) => {
            return !!result.filter(move => JSON.stringify(move) === JSON.stringify(checkingMove)).length;
        } 

        return result;
    }

    constructor(field, player, status) {
        this.field = field;
        this.dices = player.dices;
        this.currentPlayerColor = player.color;
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

    equals(otherState) {
        return false; // TODO: complete
        return this.field.equals(otherState.field) &&
            this.currentPlayerColor === otherState.currentPlayerColor &&
            this.status === otherState.status &&
            this.dices.filter(dice => this.otherState.dices.includes(dice))
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
        return new GameState(this.field, { color: this.currentPlayerColor, dices: rolledDices, selectedFigure: null }, this.status);
    }

    activate(figureCoordinate) {
        if (this._hasDal()) {
            const changedField = this.field.activate(figureCoordinate, this.currentPlayerColor);
            const remainingDices = this._removeUsedDices(Dice.dal);
            const nextPlayerColor = !!remainingDices.length ? this.currentPlayerColor : this.oppositePlayerColor;
            const status = this.status;
            return new GameState(changedField, { color: nextPlayerColor, dices: remainingDices, selectedFigure: null }, status);
        } else {
            return this;
        }
    }

    pickFigure(figureCoordinate) {
        const selectedFigure = this.field.pickFigure(figureCoordinate);
        if (!selectedFigure || !selectedFigure.active) return this;

        selectedFigure.coordinate = figureCoordinate;

        if (selectedFigure && selectedFigure.color === this.currentPlayerColor) {
            return new GameState(this.field, { color: this.currentPlayerColor, dices: this.dices, selectedFigure }, this.status);
        }
        return this;
    }

    makeMove(from, to) {
        const movedField = this.field.moveFigure(from, to); // гарантируем иммутабельность поля
        const moveDistance = this.field.distance(from, to);
        const remainingDices = this._removeUsedDices(moveDistance);
        const nextPlayerColor = !!remainingDices.length ? this.currentPlayerColor : this.oppositePlayer.color;
        const status = movedField.onlyOneFigureOfColor(nextPlayerColor)
            ? this.currentPlayerColor === 1
                ? GameStatus.FirstWin : GameStatus.SecondWin
            : GameStatus.Playing;

        return new GameState(
            movedField,
            { color: nextPlayerColor, dices: remainingDices, selectedFigure: null },
            status);
    }

    isSquareAvailableToMove(squareCoordinate) {
        return this.possibleMoves.hasMove(squareCoordinate);
    }

    _selectedFigureReadyToMove() {
        const figure = this.selectedFigure;
        return figure && figure.color === this.currentPlayerColor && figure.active;
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