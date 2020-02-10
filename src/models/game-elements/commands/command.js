import { Game } from "../../../logic/game-state";

export class Command {
    
    constructor(app, game) {
        this.app = app;
        this.game = game;
    }

    execute(){}

    saveBackup() {
        this.backup = this.game.save();
    }

    undo() {
        game = new Game(this.backup);
    }
}