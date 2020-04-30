import { RollCommand } from '../commands/roll-command';
import { MoveCommand } from '../commands/move-command';
import { ActivateCommand } from '../commands/activate-command';
import { CommandType } from '../../models/game-elements/enums/command-type';
import { OppositeRollCommand } from '../commands/opposite-roll-command';

export class SocketMultiplayer {
  constructor(url = 'ws://localhost:8000/ws/') {
    this.socket = new WebSocket(url);
    this.socket.onopen = (ev) => {
      console.log(`connection opened!`);
    };
    this.socket.onclose = () => alert('connection closed!');
  }

  assignOrder() {
    return new Promise((resolve, reject) => {
      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({ type: 'order' }));
        this.receive().then(() => resolve());
      };
    });
  }

  send(command) {
    return new Promise((resolve, reject) => {
      let message;
      if (command instanceof RollCommand) {
        message = this.makeRoll(command);
      } else if (command instanceof ActivateCommand) {
        message = this.makeActivate(command);
      } else if (command instanceof MoveCommand) {
        message = this.makeMove(command);
      }
      this.socket.send(JSON.stringify(message));
      resolve();
    });
  }

  getCommandFor(app) {
    return this.receive().then((action) => {
      return new Promise((resolve, reject) => {
        switch (action.commandType) {
        case CommandType.Activate:
          resolve(new ActivateCommand(app, app.currentState, action.actionCoordinate));
        case CommandType.Roll:
          resolve(new OppositeRollCommand(app, app.currentState, action.dices));
        case CommandType.Move:
          resolve(new MoveCommand(app, app.currentState, { from: action.from, to: action.to }));
        }
      });
    });
  }

  receive() {
    return new Promise((resolve, reject) => {
      this.socket.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === 'order') {
          this.order = data.value;
          this.name = `Игрок ${this.order}`;
          resolve(this.order);
          console.log(`Opponent is: ${data.value}`);
        } else if (data.type === 'command') {
          resolve(data.value);
        }
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
    const rollMessage = {
      commandType: CommandType.Roll,
      dices: command.skippedDices ? command.skippedDices : command.app.currentState.dices
    };
    return rollMessage;
  }
}
