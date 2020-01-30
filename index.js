import { Game } from './src/logic/game.js';
import { Coordinate } from './src/models/game-elements/coordinate.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';
import { CoordinateTranslator } from './src/logic/coordinate-translator.js';

const canvas = document.getElementById('canvas');
const colorScheme = new ColorScheme();
const size = new Size();

const drawer = initDrawer();
const logger = initLogger();

const snapshots = [];

const game = new Game(drawer, logger);

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
        game.showPossibleMoves(gameCoordinates);
    }
});

canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const mousePosition = getMousePosition(event);
    const gameCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
    game.makeMove(game.currentFigure, gameCoordinates);
});

canvas.addEventListener('dblclick', (event) => {
    const mousePosition = getMousePosition(event);
    const translatedCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
    game.activate(translatedCoordinates);
});

function makeMove() {
    save();
    const from = getCoordinates('move-from');
    const to = getCoordinates('move-to');
    game.makeMove(from, to);
}

function rollDices() {
    game.rollDices();
}

function save() {
    const snapshot = game.save();
    snapshots.push(snapshot);
    enableUndo(true);
}

function undo() {
    if (!snapshots.length) return;
    const restoringSnapshot = snapshots.pop();
    game.restore(restoringSnapshot);
    if (!snapshots.length) enableUndo(false);
}

function getCoordinates(id) {
    return new Coordinate(document.getElementById(id).value);
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