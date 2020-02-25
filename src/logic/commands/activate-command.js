import { Command } from "./command.js";
import { CommandType } from '/src/models/game-elements/enums/command-type.js';

export class ActivateCommand extends Command {
    constructor(app, gameState, context) {
        super(app, gameState, context);
    }

    _runCommand() {
        const figureCoordinate = this.app.getActionCoordinate(this.context);
        if (figureCoordinate) {
            return this.gameState.command(CommandType.Activate, { figureCoordinate });
        }
    }
}