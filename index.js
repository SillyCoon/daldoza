import { Game } from './src/models/game.js';
import { Coordinate } from './src/models/coordinate.js';

const game = new Game();
game.field.print();

const btnMove = document.querySelector('#btn-move');
btnMove.addEventListener('click', makeMove);

const btnActivate = document.querySelector('#btn-activate');
btnActivate.addEventListener('click', activate);

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