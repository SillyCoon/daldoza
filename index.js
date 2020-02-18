import { GameState } from './src/logic/game-state.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';
import { CommandType } from './src/models/game-elements/command-type.js';

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


    const btnRoll = document.querySelector('#btn-roll');
    btnRoll.addEventListener('click', rollDices);

    const btnUndo = document.querySelector('#btn-undo');
    btnUndo.addEventListener('click', undo);
    enableUndo(false);

    canvas.addEventListener('click', (event) => {
        const mousePosition = getMousePosition(event);
        const figureCoordinate = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
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
        const mousePosition = getMousePosition(event);
        const moveTo = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        states.push(currentState);
        const nextState = currentState.command(CommandType.Move, {to: moveTo });
        currentState = nextState;
        draw(nextState);
    });

    canvas.addEventListener('dblclick', (event) => {
        const mousePosition = getMousePosition(event);
        const figureCoordinate = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
        const nextState = currentState.command(CommandType.Activate, { figureCoordinate });
        currentState = nextState;
        draw(nextState);
    });

    function rollDices() {
        states.push(currentState);
        const nextState = currentState.command(CommandType.Roll);
        currentState = nextState;
        draw(nextState);
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


Application();