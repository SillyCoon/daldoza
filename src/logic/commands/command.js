export class Command {
  get executerColor() {
    return this.gameState.currentPlayerColor;
  }

  get executedByMe() {
    return this.executerColor === this.app.myColor;
  }

  constructor(app, gameState, actionCoordinate) {
    this.app = app;
    this.gameState = gameState;
    this.actionCoordinate = actionCoordinate;
  }

  execute() {
    const nextState = this._runCommand();

    if (!nextState || nextState.equals(this.gameState)) {
      return Promise.resolve(false);
    }

    this.app.currentState = nextState;
    this.app.draw(nextState);

    if (this.app.httpLogger) {
      this.app.httpLogger.logCommand(this);
    }

    return new Promise((resolve) => {
      if (nextState.hasAnyMove) {
        resolve(true);
      } else {
        this.app.log(`Нет доступных ходов для игрока ${nextState.currentPlayerColor}`);
        setTimeout(() => {
          const skippedState = nextState.skipMove();
          this.skippedDices = nextState.dices;
          this.app.currentState = skippedState;
          this.app.draw(skippedState);
          resolve(false);
        }, 1000);
      }
    });
  }

  _runCommand() {
    return null; // implemented in siblings
  }

  undo() {
    this.app.currentState = this.gameState;
    this.app.draw(this.gameState);
  }
}
