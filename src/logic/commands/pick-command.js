import { Command } from "./command.js";
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class PickCommand extends Command {
    constructor(app, gameState, context) {
        super(app, gameState, context);
    }

    _runCommand() {
        const figureCoordinate = this.app.getActionCoordinate(this.context);
        if (figureCoordinate) {
            return this.gameState.command(CommandType.PickFigure, { figureCoordinate });
        }
    }
}