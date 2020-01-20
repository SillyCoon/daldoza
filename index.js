import { Game } from './src/models/game.js';
import { Coordinate } from './src/models/coordinate.js';

const game = new Game();
game.field.print();

const btn = document.querySelector('#btn-move');
btn.addEventListener('click', makeMove);

function makeMove() {
    const from = new Coordinate(document.getElementById('move-from').value);
    const to = new Coordinate(document.getElementById('move-to').value);
    game.makeMove(from, to);
}