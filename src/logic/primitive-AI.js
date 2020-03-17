import { RollCommand } from "./commands/roll-command";
import { CommandType } from "../models/game-elements/enums/command-type";
import { ActivateCommand } from "./commands/activate-command";
import { MoveCommand } from "./commands/move-command";

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
        const activatingFigure = getActivationCommandWithSmallestCoordinate();

        if (activatingFigure) return activatingFigure;
        return this._shuffle(commands)[0];

        function getActivationCommandWithSmallestCoordinate() {
            return commands
                .filter(command => command.type === CommandType.Activate)
                .sort((a, b) => a.actionCoordinate.y - b.actionCoordinate.y)[0];
        }
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