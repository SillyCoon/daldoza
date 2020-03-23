import { RollCommand } from "./commands/roll-command";
import { CommandType } from "../models/game-elements/enums/command-type";
import { ActivateCommand } from "./commands/activate-command";
import { MoveCommand } from "./commands/move-command";

// еще прикольно можно сделать commandsHelper.bind(commands), только придется поменять this.commands на this
const commandsHelper = {
    getActivationCommandWithSmallestCoordinate() {
        return this._filterCommandsOfType(CommandType.Activate).sort((a, b) => a.actionCoordinate.y - b.actionCoordinate.y)[0];
    },
    getMoveCommandWithEating() {
        return this._filterCommandsOfType(CommandType.Move).filter(move => move.hasFigureToEat)[0];
    },
    getFirstRandom() {
        return this._shuffle()[0];
    },
    getCommandAfterWhichCanEat(currentState) {
        const activation = this.getActivationAfterWhichCanEat(currentState);
        if (activation) return activation;
        return this.getMoveAfterWhichCanEat(currentState);
    },
    getActivationAfterWhichCanEat(currentState) {
        const activationCommands = this._filterCommandsOfType(CommandType.Activate);
        return activationCommands.filter(activation => {
            const stateAfterActivation = currentState.activate(activation.actionCoordinate);
            if (stateAfterActivation.hasAnyAvailableMove()) {
                return true;
            }
        })[0];
    },
    getMoveAfterWhichCanEat(currentState) {
        const moveCommands = this._filterCommandsOfType(CommandType.Move);
        return moveCommands.filter(move => {
            const stateAfterMove = currentState.makeMove(move.from, move.to);
            if (stateAfterMove.hasAnyAvailableMove()) {
                return true;
            }
        })[0];
    },
    _filterCommandsOfType(type) {
        return this.commands.filter(command => command.type === type);
    },
    _shuffle() {
        if (this.commands.length <= 1) return this.commands;
        for (let i = this.commands.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.commands[i], this.commands[j]] = [this.commands[j], this.commands[i]];
        }
        return this.commands;
    }
}

export class PrimitiveAI {

    constructor() {

    }

    generateCommand(app) {
        const command = this._notSuchRandomCommand(app.currentState);
        switch (command.type) {
            case CommandType.Roll:
                return new RollCommand(app, app.currentState);
            case CommandType.Activate:
                return new ActivateCommand(app, app.currentState, command.actionCoordinate);
            case CommandType.Move:
                return new MoveCommand(app, app.currentState, { from: command.from, to: command.to });
            default:
                throw new Error('Such command is not supported!');
        }
    }

    _randomCommand(gameState) {
        const commands = gameState.getAllAvailableCommands();
        return this._shuffle(commands)[0];
    }

    _notSuchRandomCommand(gameState) {
        const commands = gameState.getAllAvailableCommands();
        const commandsHelper = this._connectHelper(commands);

        const eat = commandsHelper.getMoveCommandWithEating();
        const commandThenEat = commandsHelper.getCommandAfterWhichCanEat(gameState);
        const activateFigureWithSmallestCoordinate = commandsHelper.getActivationCommandWithSmallestCoordinate();
        
        const firstDefinedCommand = this._firstDefined(eat, commandThenEat, activateFigureWithSmallestCoordinate);

        if (firstDefinedCommand) {
            return firstDefinedCommand
        } else {
            return commandsHelper.getFirstRandom();
        }
    }

    _connectHelper(commands) {
        const logic = { commands };
        Object.setPrototypeOf(logic, commandsHelper);
        return logic;
    }

    _firstDefined(...elems) {
        return elems.find(elem => elem);
    }

    _shuffle(array) {
        if (array.length <= 1) return array;
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
