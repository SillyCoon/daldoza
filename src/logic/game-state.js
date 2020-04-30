import { Field } from './field.js';
import { Dice } from './dice.js';
import { CommandType } from '../models/game-elements/enums/command-type.js';
import { GameStatus } from '../models/game-elements/enums/game-status.js';

export class GameState {
  constructor(field, { dices, color, selectedFigure }, status) {
    this.field = field;
    this.dices = dices;
    this.currentPlayerColor = color;
    this.selectedFigure = selectedFigure;
    this.status = status;
  }

  static start(fieldSize) {
    const field = Field.initial(fieldSize);
    const playerOptions = {
      dices: [],
      color: 1,
      selectedFigure: null,
    };
    const status = GameStatus.Playing;

    return new GameState(field, playerOptions, status);
  }

  get oppositePlayerColor() {
    return this.currentPlayerColor === 1 ? 2 : 1;
  }

  get distances() {
    return this.dices.length > 1 ? [...this.dices, this.dices[0] + this.dices[1]] : [...this.dices];
  }

  get possibleMovesForSelectedFigure() {
    let result;
    if (this._selectedFigureReadyToMove()) {
      result = this.distances.map((distance) =>
        this.field.getNotBlockedSquareCoordinateByDistanceFrom(this.selectedFigure.coordinate, distance, this.currentPlayerColor),
      );
    } else {
      result = [];
    }

    // Просто балуюсь возможностями js, вообще не думаю, что этот миксин прям хорошая идея
    result.hasMove = (checkingMove) => {
      return !!result.filter((move) => JSON.stringify(move) === JSON.stringify(checkingMove)).length;
    };

    return result;
  }

  get hasWinCondition() {
    return this.field.onlyOneFigureOfColor(this.oppositePlayerColor);
  }

  get hasAnyMove() {
    return this.hasAnyAvailableMove() || this._hasDal() || !this._hasDices();
  }

  get snapshot() {
    return ({
      field: this.field,
      dices: this.dices,
      currentPlayerColor: this.color,
      selectedFigure: this.selectedFigure,
      status: this.status,
    });
  }


  equals(otherState) {
    return JSON.stringify(this.snapshot) === JSON.stringify(otherState.snapshot);
  }

  command(type, params) {
    let nextState;
    switch (type) {
    case CommandType.Move:
      if (params.from) {
        this.selectedFigure = this.field.pickFigure(params.from);
      }
      nextState = this.selectedFigure ? this.makeMove(this.selectedFigure.coordinate, params.to) : this;
      break;
    case CommandType.Activate:
      nextState = this.activate(params.figureCoordinate);
      break;
    case CommandType.PickFigure:
      nextState = this.pickFigure(params.figureCoordinate);
      break;
    case CommandType.Roll:
      // TODO: серьезно подумать над разделением интерфейсов
      nextState = this.roll(params ? params.dices : null);
      break;
    default:
      throw new Error('No such command!');
    }

    return nextState;
  }


  roll(externalDices) {
    if (!this._hasDices()) {
      const rolledDices = externalDices ? externalDices : [Dice.roll(), Dice.roll()];

      // хотел с apply, но по сути static метод сделает то же самое
      if (Dice.hasDoubleDal(...rolledDices)) {
        rolledDices.push(Dice.roll(), Dice.roll());
      }

      const nextState = new GameState(this.field, {
        color: this.currentPlayerColor,
        dices: rolledDices,
        selectedFigure: null,
      }, this.status);
      return nextState;
    } else {
      return this;
    }
  }

  activate(figureCoordinate) {
    if (this._hasDal()) {
      const changedField = this.field.activate(figureCoordinate, this.currentPlayerColor);
      if (changedField === this.field) return this;
      const remainingDices = this._removeUsedDices(Dice.dal);
      const nextPlayerColor = remainingDices.length ? this.currentPlayerColor : this.oppositePlayerColor;
      const status = this.status;
      return new GameState(changedField, {
        color: nextPlayerColor,
        dices: remainingDices,
        selectedFigure: null,
      }, status);
    } else {
      return this;
    }
  }

  pickFigure(figureCoordinate) {
    const selectedFigure = this.field.pickFigure(figureCoordinate);
    if (!selectedFigure || !selectedFigure.active) return this;

    selectedFigure.coordinate = figureCoordinate;

    if (selectedFigure && selectedFigure.color === this.currentPlayerColor) {
      return new GameState(this.field, {
        color: this.currentPlayerColor,
        dices: this.dices,
        selectedFigure,
      }, this.status);
    }
    return this;
  }

  makeMove(from, to) {
    if (this.isSquareAvailableToMove(to)) {
      const movedField = this.field.moveFigure(from, to);
      const moveDistance = this.field.distance(from, to);
      const remainingDices = this._removeUsedDices(moveDistance);
      const nextPlayerColor = remainingDices.length ? this.currentPlayerColor : this.oppositePlayerColor;
      const status = movedField.onlyOneFigureOfColor(nextPlayerColor) ?
        this.currentPlayerColor === 1 ?
          GameStatus.FirstWin : GameStatus.SecondWin :
        GameStatus.Playing;

      return new GameState(
        movedField, {
          color: nextPlayerColor,
          dices: remainingDices,
          selectedFigure: null,
        }, status);
    }

    return this;
  }

  skipMove() {
    return new GameState(this.field, { dices: [], color: this.oppositePlayerColor, selectedFigure: null }, this.status);
  }

  isSquareAvailableToMove(squareCoordinate) {
    return this.possibleMovesForSelectedFigure.hasMove(squareCoordinate);
  }

  getAllAvailableCommands() {
    const availableMoveCommands = () => {
      const commands = [];
      this.distances.forEach((distance) => {
        const movesForDistance = this.field
          .getAllFiguresOfColorCanMoveOn(distance, this.currentPlayerColor)
          .map((figure) => {
            const to = this.field.getSquareByDistanceFromCurrent(figure.coordinate, distance, this.currentPlayerColor).coordinate;
            const from = figure.coordinate;
            const hasFigureToEat = this.field.pickFigure(to);
            return { type: CommandType.Move, from, to, hasFigureToEat };
          });
        commands.push(...movesForDistance);
      });
      return commands;
    };

    const availableRollCommands = () => {
      if (!this._hasDices()) {
        return { type: CommandType.Roll };
      } else {
        return null;
      }
    };

    const availableActivateCommands = () => {
      if (this._hasDal()) {
        return this.field.getAllFiguresCanActivate(this.currentPlayerColor)
          .map((figure) => ({ type: CommandType.Activate, actionCoordinate: figure.coordinate }));
      }
      return [];
    };

    const rollCommand = availableRollCommands();
    if (rollCommand) return [rollCommand];

    const commands = [];
    commands.push(...availableActivateCommands());
    commands.push(...availableMoveCommands());

    return commands;
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
    return this.dices.some((dice) => dice === Dice.dal);
  }

  _hasDices() {
    return !!this.dices.length;
  }

  hasAnyAvailableMove() {
    return this.distances.find((distance) => {
      return !!this.field.getAnyFigureOfColorCanMoveOn(distance, this.currentPlayerColor);
    });
  }
}
