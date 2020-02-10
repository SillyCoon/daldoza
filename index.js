import { GameState } from './src/logic/game-state.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';
import { CommandType } from './src/models/game-elements/command-type.js';

function Application() {

    const canvas = document.getElementById('canvas');
    const colorScheme = new ColorScheme();
    const size = new Size();

    const drawer = initDrawer();
    const logger = initLogger();

    const states = [];

    let currentState = GameState.start(16);
    drawer.draw(currentState);


    const btnRoll = document.querySelector('#btn-roll');
    btnRoll.addEventListener('click', rollDices);

    const btnSave = document.querySelector('#btn-save');
    btnSave.addEventListener('click', save);

    const btnUndo = document.querySelector('#btn-undo');
    btnUndo.addEventListener('click', undo);
    enableUndo(false);

    canvas.addEventListener('click', (event) => {
        const mousePosition = getMousePosition(event);
        const gameCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);

        if (event.button === 0) {
            gameState.showPossibleMoves(gameCoordinates);
        }
    });

    canvas.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        const mousePosition = getMousePosition(event);
        const gameCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        // game.makeMove(game.currentFigure, gameCoordinates);
        const gameState = gameState.command(CommandType.Move, { from: gameState.currentFigure, to: gameCoordinates });
        console.log(gameState);
    });

    canvas.addEventListener('dblclick', (event) => {
        const mousePosition = getMousePosition(event);
        const figureCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        const nextState = currentState.command(CommandType.Activate, { figureCoordinates });
        currentState = nextState;
        drawer.draw(nextState);
    });

    function rollDices() {
        states.push(currentState);
        const nextState = currentState.command(CommandType.Roll);
        currentState = nextState;
        drawer.draw(nextState);
    }

    function save() {
        const snapshot = gameState.save();
        states.push(snapshot);
        enableUndo(true);
    }

    function undo() {
        if (!states.length) return;
        const restoringSnapshot = states.pop();
        gameState.restore(restoringSnapshot);
        if (!states.length) enableUndo(false);
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
}


Application();