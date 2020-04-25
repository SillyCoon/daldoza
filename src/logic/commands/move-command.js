import { Command } from './command.js';
import { CommandType } from '../../models/game-elements/enums/command-type.js';

export class MoveCommand extends Command {
  constructor(app, gameState, { from, to }) {
    super(app, gameState, to);
    this.from = from;
  }

  _runCommand() {
    const to = this.actionCoordinate;
    const from = this.from;
    if (to) {
      return this.gameState.command(CommandType.Move, { from, to });
    }
  }
}
