import { Command } from './command.js';
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class RollCommand extends Command {
    constructor(app, gameState, context = null){
        super(app, gameState, context);
    }

    _runCommand() {
        return this.gameState.command(CommandType.Roll);
    }
}