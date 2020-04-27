import { RollCommand } from './commands/roll-command';
import { MoveCommand } from './commands/move-command';
import { ActivateCommand } from './commands/activate-command';
import { CommandType } from '../models/game-elements/enums/command-type';

export class SocketMultiplayer {
  constructor(url = 'ws://localhost:8000/ws/') {
    this.socket = new WebSocket(url);
    this.socket.onopen = () => console.log('connection opened!');
    this.socket.onclose = () => alert('connection closed!');
  }

  send(command) {
    let message;
    if (command instanceof RollCommand) {
      message = this.makeRoll(command);
    } else if (command instanceof MoveCommand) {
      message = this.makeActivate(command);
    } else if (command instanceof ActivateCommand) {
      message = this.makeMove(command);
    }
    this.socket.send(JSON.stringify(message));
  }

  receive() {
    return new Promise((resolve, reject) => {
      this.socket.onmessage = (message) => {
        console.log(message.data);
        const action = JSON.parse(message.data);
        resolve(action);
      };
    });
  }

  makeActivate(command) {
    const activateMessage = { commandType: CommandType.Activate, actionCoordinate: command.actionCoordinate };
    return activateMessage;
  }

  makeMove(command) {
    const from = command.from ? command.from : command.gameState.selectedFigure.coordinate;
    const moveMessage = { commandType: CommandType.Move, from, to: command.actionCoordinate };
    return moveMessage;
  }

  makeRoll(command) {
    const rollMessage = { commandType: CommandType.Roll, dices: command.app.currentState.dices };
    return rollMessage;
  }
}
