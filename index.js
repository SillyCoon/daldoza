import { GameState } from './src/logic/game-state.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';
import { CommandType } from './src/models/game-elements/enums/command-type.js';
import { RollCommand } from './src/models/game-elements/commands/roll-command.js';

export class App {

    constructor() {
        this.firstPlayerName = "Дал";
        this.secondPlayerName = "Доз";

        this.canvas = document.getElementById('canvas');
        this.colorScheme = new ColorScheme();
        this.size = new Size();
        this.fieldSize = 16;

        this.drawer = this.initDrawer();
        this.logger = this.initLogger();

        this.states = [];

        this.currentState = GameState.start(16);
        this.draw(this.currentState);

        this.btnRoll = document.querySelector('#btn-roll');
        this.btnRoll.addEventListener('click', this.rollDices());

    }


    rollDices() {
        // states.push(currentState);
        // const nextState = currentState.command(CommandType.Roll);
        // currentState = nextState;
        // draw(nextState);
        return this.executeCommand(new RollCommand(this, this.currentState, null));
    }


    // const btnUndo = document.querySelector('#btn-undo');
    // btnUndo.addEventListener('click', undo);
    // enableUndo(false);

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

    // canvas.addEventListener('dblclick', (event) => {
    //     const figureCoordinate = getActionCoordinate(event);
    //     const nextState = currentState.command(CommandType.Activate, { figureCoordinate });
    //     currentState = nextState;
    //     draw(nextState);
    // });

    executeCommand(command) {
        return () => {
        command.app = this;
            const nextState = command.execute();
            if (nextState) {
                this.currentState = nextState;
                this.states.push(nextState);
            }
        }
    }

    undo() {
        if (!this.states.length) return;
        const previousState = this.states.pop();
        this.currentState = previousState;
        if (!this.states.length) this.enableUndo(false);
        this.draw(this.currentState);
    }

    getActionCoordinate(event) {
        const mousePosition = this.getMousePosition(event);
        return CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
    }

    getMousePosition(event) {
        const canvasSize = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - canvasSize.left,
            y: event.clientY - canvasSize.top
        }
    }

    enableUndo(state) {
        this.btnUndo.disabled = !state;
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

function Application() {

    const firstPlayerName = "Дал";
    const secondPlayerName = "Доз";

    const canvas = document.getElementById('canvas');
    const colorScheme = new ColorScheme();
    const size = new Size();
    const fieldSize = 16;

    const drawer = initDrawer();
    const logger = initLogger();

    const states = [];

    let currentState = GameState.start(16);
    draw(currentState);


    const rollDices = () => {
        // states.push(currentState);
        // const nextState = currentState.command(CommandType.Roll);
        // currentState = nextState;
        // draw(nextState);
        executeCommand(new RollCommand(this, currentState, null));
    }

    const btnRoll = document.querySelector('#btn-roll');
    btnRoll.addEventListener('click', rollDices);

    const btnUndo = document.querySelector('#btn-undo');
    btnUndo.addEventListener('click', undo);
    enableUndo(false);

    canvas.addEventListener('click', (event) => {
        const figureCoordinate = getActionCoordinate(event);
        if (isValidCoordinate(figureCoordinate)) {
            const nextState = currentState.command(CommandType.PickFigure, { figureCoordinate });

            if (!currentState.equals(nextState)) {
                logger.log(`Игрок ${currentState.currentPlayerColor === 1 ? firstPlayerName : secondPlayerName} выбрал фигуру ${figureCoordinate.x};${figureCoordinate.y}`)
                currentState = nextState;
                draw(nextState);
            }
        }
    });

    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const moveTo = getActionCoordinate(event);
        states.push(currentState);
        const nextState = currentState.command(CommandType.Move, { to: moveTo });
        currentState = nextState;
        draw(nextState);
    });

    canvas.addEventListener('dblclick', (event) => {
        const figureCoordinate = getActionCoordinate(event);
        const nextState = currentState.command(CommandType.Activate, { figureCoordinate });
        currentState = nextState;
        draw(nextState);
    });

    function executeCommand(command) {
        const nextState = command.execute();
        if (nextState) {
            currentState = nextState;
            this.states.push(nextState);
        }
    }

    function undo() {
        if (!states.length) return;
        const previousState = states.pop();
        currentState = previousState;
        if (!states.length) enableUndo(false);
        draw(currentState);
    }

    function getActionCoordinate(event) {
        const mousePosition = getMousePosition(event);
        return CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
    }

    function getMousePosition(event) {
        const canvasSize = canvas.getBoundingClientRect();
        return {
            x: event.clientX - canvasSize.left,
            y: event.clientY - canvasSize.top
        }
    }

    function enableUndo(state) {
        btnUndo.disabled = !state;
    }

    // Фабрику бы, фабрику (или нет)
    function initDrawer() {
        canvas.height = size.height;
        canvas.width = size.width;
        return new CanvasDrawer(canvas, colorScheme, size);
    }

    function initLogger() {
        const logPane = document.querySelector('#log-pane');
        const logger = new Logger(logPane);
        return logger;
    }

    function isValidCoordinate({ x, y }) {
        const isValid = (x >= 0 && x < 3) && (y >= 0 && (y < fieldSize || (x === 1 && y < fieldSize + 1)));
        if (!isValid) console.log('click outside the field');
        return isValid;
    }

    function playerStatistics(gameState) {
        return ({
            name: gameState.currentPlayerColor === 1 ? firstPlayerName : secondPlayerName
        });
    }

    function draw(state) {
        drawer.draw(state, playerStatistics(state))
    }
}

const app = new App();

// Application();