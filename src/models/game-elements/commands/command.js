import { Game } from "../../../logic/game-state";

export class ClickCommand {
    
    constructor(app, game) {
        this.app = app;
        this.game = game;
    }

    execute(context){
        const mousePosition = this.app.getMousePosition(context);
        const pickedFigureCoordinate = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        const nextState = this.app.currentState.command(CommandType.PickFigure, {figureCoordinates: pickedFigureCoordinate});
        this.app.currentState = nextState;
        this.app.drawer.draw(nextState);
    }

    saveBackup() {
        this.backup = this.game.save();
    }

    undo() {
        game = new Game(this.backup);
    }
}