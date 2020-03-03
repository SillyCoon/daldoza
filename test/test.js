import { App } from '../index.js';

(function initGame() {

    const gameContainer = document.querySelector(".game-container");
    const app = new App(gameContainer, { firstPlayerName: "Дал", secondPlayerName: "Доз" });
    app.start();
})()