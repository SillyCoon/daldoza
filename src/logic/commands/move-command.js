import { Command } from "./command.js";
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class MoveCommand extends Command {
    constructor(app, gameState, actionCoordinate) {
        super(app, gameState, actionCoordinate);
    }

    _runCommand() {
        const to = this.actionCoordinate;
        if (to) {
            return this.gameState.command(CommandType.Move, { to });
        }
    }
}