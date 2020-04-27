import { Command } from './command.js';
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class OppositeRollCommand extends Command {
  constructor(app, gameState, dices) {
    super(app, gameState, null);
    this.dices = dices;
  }

  _runCommand() {
    return this.gameState.command(CommandType.Roll, { dices: this.dices });
  }
}
