import { Game } from './src/logic/game.js';
import { Coordinate } from './src/models/game-elements/coordinate.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';
import { Size } from './src/models/draw/size.js';

const canvas = document.getElementById('canvas');

const drawer = initDrawer();
const logger = initLogger(); 

const snapshots = [];


const btnMove = document.querySelector('#btn-move');
btnMove.addEventListener('click', makeMove);

const btnActivate = document.querySelector('#btn-activate');
btnActivate.addEventListener('click', activate);

const btnRoll = document.querySelector('#btn-roll');
btnRoll.addEventListener('click', rollDices);

const btnSave = document.querySelector('#btn-save');
btnSave.addEventListener('click', save);

const btnUndo = document.querySelector('#btn-undo');
btnUndo.addEventListener('click', undo);

canvas.addEventListener('click', (event) => {
    const mousePosition = getMousePosition(event);
    const translatedCoordinates = translateMousePositionToGameCoordinates(mousePosition);
    console.log(mousePosition);
});

const game = new Game(drawer, logger);
enableUndo(false);

function makeMove() {
    save();
    const from = getCoordinates('move-from');
    const to = getCoordinates('move-to');
    game.makeMove(from, to);
}

function activate() {
    save();
    const coordinates = getCoordinates('activate-coordinates');
    game.activate(coordinates);
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

function translateMousePositionToGameCoordinates() {
    
}

function enableUndo(state) {
    btnUndo.disabled = !state;
}


// Фабрику бы, фабрику (или нет)
function initDrawer() {
    const size = new Size();
    const colorScheme = new ColorScheme();
    
    canvas.height = size.height;
    canvas.width = size.width;
    return new CanvasDrawer(canvas, colorScheme, size);
}

function initLogger() {
    const logPane = document.querySelector('#log-pane');
    const logger = new Logger(logPane);
    return logger;
}