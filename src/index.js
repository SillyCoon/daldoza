import { App } from './logic/app';
import { HttpLogger } from './logic/http-logger';
import { GameMode } from './models/game-elements/enums/game-mode.js';

// eslint-disable-next-line no-unused-vars
import css from './styles/style.css';

import { Container } from './logic/control/container';
import { Button } from './logic/control/button';
import { SocketMultiplayer } from './logic/multiplayer';
import { PrimitiveAI } from './logic/primitive-AI';

(function showStartScreen() {
  const container = new Container('game-container');
  document.body.appendChild(container.nativeElement);

  renderGameModePicker(container);
  // initGame(gameContainer);

  function renderGameModePicker(container) {
    const startContainer = new Container('start-container');
    const controlsContainer = new Container('dal-controls-container');
    appendElementTo(startContainer.nativeElement, 'h1', '', 'Привет!');
    appendElementTo(startContainer.nativeElement, 'h2', '', 'Выбери тип игры:');

    startContainer.appendElement(controlsContainer.nativeElement);
    container.appendElement(startContainer);

    const multiplayerBtn = new Button({ name: 'Multiplayer' }, '')
    multiplayerBtn.handleClick().then(() => {
      container.remove(startContainer);
      const otherPlayer = new SocketMultiplayer();
      initGame(container, GameMode.Multi, 'Дал', otherPlayer);
    });

    const aiBtn = new Button({ name: 'AI' }, '');
    aiBtn.handleClick().then(() => {
      container.remove(startContainer);
      const otherPlayer = new PrimitiveAI();
      initGame(container, GameMode.AI, 'Дал', otherPlayer);
    });

    controlsContainer.append(multiplayerBtn, aiBtn);
  }
})();


function initGame(gameContainer, mode, playerName, otherPlayer) {
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
        playerName,
        otherPlayer,
        { mode }, logger
      );
      app.start();
    },
    (onRejected) => {
      console.error(onRejected);
      const app = new App(gameContainer, playerName, { mode }, otherPlayer);
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
