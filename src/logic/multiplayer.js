export class SocketMultiplayer {
  constructor(url = 'ws://localhost:8080/ws') {
    this.socket = new WebSocket();
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
    this.socket.send(message);
  }

  receive() {
    return new Promise((resolve, reject) => {
      this.socket.onmessage((event) => {
        console.log(event);
        resolve(event);
      });
    });
  }

  makeActivate(command) {
    const activateMessage = { commandType: 'Activate', actionCoordinate: command.actionCoordinate };
    return activateMessage;
  }

  makeMove(command) {
    const from = command.from ? command.from : command.gameState.selectedFigure.coordinate;
    const moveMessage = { commandType: 'Move', from, to: command.actionCoordinate };
    return moveMessage;
  }

  makeRoll(command) {
    const rollMessage = { commandType: 'Roll', dices: command.app.currentState.dices };
    return rollMessage;
  }
}
