import { GameState } from './src/logic/game-state.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';
import { RollCommand } from './src/logic/commands/roll-command.js';
import { ActivateCommand } from './src/logic/commands/activate-command.js';
import { PickCommand } from './src/logic/commands/pick-command.js';
import { MoveCommand } from './src/logic/commands/move-command.js';

export class App {

    constructor() {
        this.firstPlayerName = "Дал";
        this.secondPlayerName = "Доз";

        this.canvas = document.getElementById('canvas');

        this._initControls();

        this.commands = [];

        this.colorScheme = new ColorScheme();
        this.size = new Size();
        this.fieldSize = 16;

        this.drawer = this.initDrawer();
        this.logger = this.initLogger();

        this.states = [];

        this.currentState = GameState.start(16);
        this.draw(this.currentState);

    }

    _initControls() {

        const btnRoll = document.querySelector('#btn-roll');
        const btnUndo = document.querySelector('#btn-undo');

        btnRoll.addEventListener('click', () => this.rollDices());
        btnUndo.addEventListener('click', () => this.undo().then(() => enableUndoButton(false)));

        this.canvas.addEventListener('mouseup', event => {
            if (event.button === 0) {
                this.pickFigure(event);
            } else if (event.button === 2) {
                this.move(event);
            }
            if (this.commands.length) {
                enableUndoButton(true);
            }
        });

        this.canvas.addEventListener('dblclick', event => this.activate(event).then(() => enableUndoButton(true)));

        this.canvas.addEventListener('contextmenu', event => {
            event.preventDefault();
        });

        function enableUndoButton(flag) {
            btnUndo.disabled = !flag;
        }
    }

    rollDices() {
        return this.executeCommand(new RollCommand(this, this.currentState, null));
    }

    pickFigure(event) {
        return this.executeCommand(new PickCommand(this, this.currentState, event));
    }

    activate(event) {
        return this.executeCommand(new ActivateCommand(this, this.currentState, event));
    }

    move(event) {
        return this.executeCommand(new MoveCommand(this, this.currentState, event)); // TODO: проверять условие победы только после хода
    }

    undo() {
        const lastCommand = this.commands.pop();
        if (lastCommand) {
            lastCommand.undo();
        }
        return new Promise((resolve) => {
            if (!this.commands.length) resolve();
        })
    }

    executeCommand(command) {
        return command.execute().then(stateHasMove => {
            if (stateHasMove && !(command instanceof RollCommand)) {
                this.commands.push(command);
                if (this.currentState.hasWinCondition) {
                    this.showVictoryScreen()
                }
            }
        });
    }

    getActionCoordinate(event) {
        const mousePosition = this.getMousePosition(event);
        const translatedCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        if (this.isValidCoordinate(translatedCoordinates)) {
            return translatedCoordinates;
        }
        return null;
    }

    getMousePosition(event) {
        const canvasSize = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - canvasSize.left,
            y: event.clientY - canvasSize.top
        }
    }

    // Фабрику бы, фабрику (или нет)
    initDrawer() {
        this.canvas.height = this.size.height;
        this.canvas.width = this.size.width;
        return new CanvasDrawer(this.canvas, this.colorScheme, this.size);
    }

    initLogger() {
        const logPane = document.querySelector('#log-pane');
        const logger = new Logger(logPane);
        return logger;
    }

    isValidCoordinate({ x, y }) {
        const isValid = (x >= 0 && x < 3) && (y >= 0 && (y < this.fieldSize || (x === 1 && y < this.fieldSize + 1)));
        if (!isValid) console.log('click outside the field');
        return isValid;
    }

    playerStatistics(gameState) {
        return ({
            name: gameState.currentPlayerColor === 1 ? this.firstPlayerName : this.secondPlayerName
        });
    }

    draw(state) {
        this.drawer.draw(state, this.playerStatistics(state))
    }

    log(message) {
        this.logger.log(message);
    }

    showVictoryScreen() {
        this.drawer.drawVictory(this.currentState, this.playerStatistics(this.currentState));
    }
}

const app = new App();

// Application();