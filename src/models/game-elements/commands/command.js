export class Command {

    constructor(app, gameState, context) {
        this.app = app;
        this.gameState = gameState;
        this.context = context;
    }

    execute() {
        if (this.context) {
            this.app.getActionCoordinate(this.context);
        }
        const nextState = this._runCommand();
        if (!nextState) {
            return null;
        }
        this.app.currentState = nextState;
        this.app.drawer.draw(nextState);
        return this.gameState;
    }

    _runCommand() {
        // implemented in siblings
        return null;
    }

    makeBackup() {
        this.backup = this.gameState;
    }

    undo() {
    }
}