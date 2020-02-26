export class Command {

    constructor(app, gameState, context) {
        this.app = app;
        this.gameState = gameState;
        this.context = context;
    }

    execute() {
        const nextState = this._runCommand();
        if (!nextState || nextState.equals(this.gameState)) {
            return null;
        }
        this.app.currentState = nextState;
        this.app.draw(nextState);
        return nextState;
    }

    _runCommand() {
        return null;  // implemented in siblings
    }

    undo() {
        this.app.currentState = this.gameState;
        this.app.draw(this.gameState);
    }
}