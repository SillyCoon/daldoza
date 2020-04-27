import { App } from './logic/app';
import { HttpLogger } from './logic/http-logger';
import { GameMode } from './models/game-elements/enums/game-mode.js';

import css from './styles/style.css';

(function showStartScreen() {
  const gameContainer = appendElementTo(document.body, 'div', 'game-container');
  document.body.appendChild(gameContainer);

  renderGameModePicker(gameContainer);
  // initGame(gameContainer);

  function renderGameModePicker(container) {
    const startContainer = appendElementTo(container, 'div', 'start-container');
    appendElementTo(startContainer, 'h1', '', 'Привет!');
    appendElementTo(startContainer, 'h2', '', 'Выбери тип игры:');
    const controlsContainer = appendElementTo(startContainer, 'div', 'dal-controls-container');
    const multiplayerBtn = appendElementTo(controlsContainer, 'button', '', 'Multiplayer');
    const aiBtn = appendElementTo(controlsContainer, 'button', '', 'AI');

    multiplayerBtn.addEventListener('click', (event) => {
      container.removeChild(startContainer);
      initGame(gameContainer, GameMode.Multi);
    });

    aiBtn.addEventListener('click', (event) => {
      container.removeChild(startContainer);
      initGame(gameContainer, GameMode.AI);
    });
  }
})();


function initGame(gameContainer, mode) {
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
        { mode }, logger
      );
      app.start();
    },
    (onRejected) => {
      console.error(onRejected);
      const app = new App(gameContainer, { firstPlayerName: 'Дал', secondPlayerName: 'Доз' }, { mode });
      app.start();
    },
  );
}

function appendElementTo(parent, tag, className, text = null) {
  const elt = document.createElement(tag);
  elt.className = className;
  elt.textContent = text;
  parent.appendChild(elt);
  return elt;
}
