import { Game } from './src/logic/game.js';
import { Coordinate } from './src/models/game-elements/coordinate.js';
import { CanvasDrawer } from './src/logic/drawer.js';
import { Logger } from './src/logic/logger.js';
import { ColorScheme } from './src/models/draw/color-scheme.js';

const drawer = initDrawer();
const logger = initLogger(); 


const game = new Game(drawer, logger);
game.field.print();

const btnMove = document.querySelector('#btn-move');
btnMove.addEventListener('click', makeMove);

const btnActivate = document.querySelector('#btn-activate');
btnActivate.addEventListener('click', activate);

const btnRoll = document.querySelector('#btn-roll');
btnRoll.addEventListener('click', rollDices);

function makeMove() {
    const from = getCoordinates('move-from')
    const to = getCoordinates('move-to')
    game.makeMove(from, to);
}

function activate() {
    const coordinates = getCoordinates('activate-coordinates');
    game.activate(coordinates);
}

function getCoordinates(id) {
    return new Coordinate(document.getElementById(id).value);
}

function rollDices() {
    game.rollDices();
}

// Фабрику бы, фабрику
function initDrawer() {
    const canvas = document.getElementById('canvas');
    const colorScheme = new ColorScheme();
    return new CanvasDrawer(canvas, colorScheme);
}

function initLogger() {
    const logPane = document.querySelector('#log-pane');
    const logger = new Logger(logPane);
    return logger;
}