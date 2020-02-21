import { Command } from './command.js';
import { CommandType } from '../enums/command-type.js';

export class RollCommand extends Command {
    constructor(app, gameState, context){
        super(app, gameState, context);
    }

    _runCommand() {
        return this.gameState.command(CommandType.Roll);
    }
}