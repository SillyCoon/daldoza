export class Command {

    constructor(app, gameState, context) {
        this.app = app;
        this.gameState = gameState;
        this.context = context;
    }

    execute() {
        const nextState = this._runCommand();
        if (!nextState || nextState.equals(this.gameState)) {
            return Promise.resolve(false);
        }

        this.app.currentState = nextState;
        this.app.draw(nextState);

        return new Promise((resolve) => {
            if (nextState.hasAnyMove) {
                resolve(true);
            } else {
                this.app.log(`Нет доступных ходов для игрока ${nextState.currentPlayerColor}`)
                setTimeout(() => {
                    const skippedState = nextState.skipMove();
                    this.app.currentState = skippedState;
                    this.app.draw(skippedState);
                    resolve(false);
                }, 1000)
            }
        });
    }

    _runCommand() {
        return null;  // implemented in siblings
    }

    undo() {
        this.app.currentState = this.gameState;
        this.app.draw(this.gameState);
    }
}