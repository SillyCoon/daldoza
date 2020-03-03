import { Command } from "./command.js";
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class MoveCommand extends Command {
    constructor(app, gameState, context) {
        super(app, gameState, context);
    }

    _runCommand() {
        const to = this.app.getActionCoordinate(this.context);
        if (to) {
            return this.gameState.command(CommandType.Move, { to });
        }
    }
}