import { GameState } from './src/logic/game-state.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';
import { RollCommand } from './src/logic/commands/roll-command.js';
import { ActivateCommand } from './src/logic/commands/activate-command.js';

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

        btnRoll.addEventListener('click', () => this.rollDices().then(() => enableUndoButton(true)));
        btnUndo.addEventListener('click', () => this.undo().then(() => enableUndoButton(false)));

        this.canvas.addEventListener('dblclick', event => this.activateFigure(event));

        function enableUndoButton(flag) {
            btnUndo.disabled = !flag;
        }
    }


    rollDices() {
        return this.executeCommand(new RollCommand(this, this.currentState, null));
    }

    activateFigure(event) {
        return this.executeCommand(new ActivateCommand(this, this.currentState, event));
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

    // canvas.addEventListener('click', (event) => {
    //     const figureCoordinate = getActionCoordinate(event);
    //     if (isValidCoordinate(figureCoordinate)) {
    //         const nextState = currentState.command(CommandType.PickFigure, { figureCoordinate });

    //         if (!currentState.equals(nextState)) {
    //             logger.log(`Игрок ${currentState.currentPlayerColor === 1 ? firstPlayerName : secondPlayerName} выбрал фигуру ${figureCoordinate.x};${figureCoordinate.y}`)
    //             currentState = nextState;
    //             draw(nextState);
    //         }
    //     }
    // });

    // canvas.addEventListener('contextmenu', (event) => {
    //     event.preventDefault();
    //     const moveTo = getActionCoordinate(event);
    //     states.push(currentState);
    //     const nextState = currentState.command(CommandType.Move, { to: moveTo });
    //     currentState = nextState;
    //     draw(nextState);
    // });

    executeCommand(command) {
        if (command.execute()) {
            this.commands.push(command);
        }
        return Promise.resolve();
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
}

const app = new App();

// Application();