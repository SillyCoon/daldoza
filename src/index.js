import { GameState } from './logic/game-state.js';
import { CanvasDrawer } from './logic/drawer.js';
import { Logger } from './logic/logger.js';
import { ColorScheme } from './models/draw/color-scheme.js';
import { Size } from './models/draw/size.js';
import { CoordinateTranslator } from './logic/coordinate-translator.js';
import { RollCommand } from './logic/commands/roll-command.js';
import { ActivateCommand } from './logic/commands/activate-command.js';
import { PickCommand } from './logic/commands/pick-command.js';
import { MoveCommand } from './logic/commands/move-command.js';
import { LayoutHelper } from './logic/layout-helper.js';
import css from './styles/style.css';

export class App {

    constructor(container, { firstPlayerName = "Дал", secondPlayerName = "Доз" }) {

        this.firstPlayerName = firstPlayerName;
        this.secondPlayerName = secondPlayerName;

        this.canvas = makeFieldLayout(container);
        const controlsDiv = makeControlsLayout(container);
        this._initControls(controlsDiv, this.canvas);

        this.commands = [];

        this.colorScheme = new ColorScheme();
        this.size = new Size();
        this.fieldSize = 16;

        this.drawer = this.initDrawer();
        this.logger = this.initLogger();


        function makeFieldLayout(container) {

            const fieldContainer = document.createElement('div');
            fieldContainer.id = "dal-field";

            const canvas = document.createElement('canvas')
            canvas.id = "dal-canvas";

            fieldContainer.prepend(canvas);
            container.prepend(fieldContainer);
            return canvas;
        }

        function makeControlsLayout(container) {
            const controlsContainer = document.createElement('div');
            controlsContainer.className = 'dal-controls-container';

            const controls = document.createElement('div');
            controls.className = 'dal-controls';

            const logContainer = document.createElement('div');
            logContainer.id = 'dal-log-pane';
            const logHeader = document.createElement('h3');
            logHeader.textContent = 'Лог:';
            logContainer.appendChild(logHeader);

            controlsContainer.prepend(controls);
            controlsContainer.append(logContainer);
            container.appendChild(controlsContainer);
            return controls;
        }
    }

    start() {
        this.currentState = GameState.start(this.fieldSize);
        this.draw(this.currentState);
    }

    _initControls(controlsContainer, canvas) {

        const btnRoll = LayoutHelper.makeControlButton({ name: 'Roll' });
        const btnUndo = LayoutHelper.makeControlButton({ name: 'Undo', disabled: true });

        controlsContainer.append(btnRoll, btnUndo);

        btnRoll.addEventListener('click', () => this.rollDices());
        btnUndo.addEventListener('click', () => this.undo().then(() => enableUndoButton(false)));

        canvas.addEventListener('mouseup', event => {
            if (event.button === 0) {
                this.pickFigure(event);
            } else if (event.button === 2) {
                this.move(event);
            }
            if (this.commands.length) {
                enableUndoButton(true);
            }
        });

        canvas.addEventListener('dblclick', event => this.activate(event).then(() => enableUndoButton(true)));

        canvas.addEventListener('contextmenu', event => {
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
        return this.executeCommand(new MoveCommand(this, this.currentState, event)).then(() => {
            if (this.currentState.hasWinCondition) {
                this.showVictoryScreen();
            }
        });
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
        const logPane = document.querySelector('#dal-log-pane');
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

(function initGame() {

    const gameContainer = document.querySelector(".game-container");
    const app = new App(gameContainer, { firstPlayerName: "Дал", secondPlayerName: "Доз" });
    app.start();
})()