import { App } from './logic/app';
import { HttpLogger } from './logic/http-logger';
import { GameMode } from './models/game-elements/enums/game-mode.js';

import css from './styles/style.css';

const url = 'ws://localhost:8080/ws';


(function initGame() {
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  document.body.appendChild(gameContainer);

  fetch('http://localhost:3000/health').then(
    () => {
      console.log('Logger health: OK');
      const logger = new HttpLogger('http://localhost:3000/log/', {
        activate: 'activate',
        roll: 'roll',
        move: 'move',
      });
      const app = new App(
        gameContainer,
        { firstPlayerName: 'Дал', secondPlayerName: 'Доз' },
        { mode: GameMode.AI }, logger
      );
      app.start();
    },
    (onRejected) => {
      console.error(onRejected);
      const app = new App(gameContainer, { firstPlayerName: 'Дал', secondPlayerName: 'Доз' }, { mode: GameMode.AI });
      app.start();
    },
  );
})();
