import { RollCommand } from "./commands/roll-command";
import { CommandType } from "../models/game-elements/enums/command-type";
import { ActivateCommand } from "./commands/activate-command";
import { MoveCommand } from "./commands/move-command";

// еще прикольно можно сделать commandsHelper.bind(commands), только придется поменять this.commands на this
const commandsHelper = {
    _getActivationCommandWithSmallestCoordinate() {
        return this._filterCommandsOfType(CommandType.Activate).sort((a, b) => a.actionCoordinate.y - b.actionCoordinate.y)[0];
    },
    _getMoveCommandWithEating() {
        return this._filterCommandsOfType(CommandType.Move).filter(move => move.hasFigureToEat)[0];
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

        const eat = commandsHelper._getMoveCommandWithEating();
        if (eat) {
            return eat;
        }

        const activatingFigure = commandsHelper._getActivationCommandWithSmallestCoordinate();
        if (activatingFigure) {
            return activatingFigure;
        }

        return commandsHelper._shuffle()[0];
    }

    _connectHelper(commands) {
        const logic = { commands };
        Object.setPrototypeOf(logic, commandsHelper);
        return logic;
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
