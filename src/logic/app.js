import { GameState } from './game-state.js';
import { CanvasDrawer } from './drawer.js';
import { ColorScheme } from '../models/draw/color-scheme.js';
import { Size } from '../models/draw/size.js';
import { RollCommand } from './commands/roll-command.js';
import { OppositeRollCommand } from './commands/opposite-roll-command.js';
import { ActivateCommand } from './commands/activate-command.js';
import { PickCommand } from './commands/pick-command.js';
import { MoveCommand } from './commands/move-command.js';
import { GameMode } from '../models/game-elements/enums/game-mode.js';
import { Button } from './control/button.js';
import { InteractiveBoard } from './control/Interactive-board.js';
import { Container } from './control/container.js';
import { LogPane } from './control/log-pane.js';
import { takeWhile } from 'rxjs/operators';

export class App {
  get firstPlayerName() {
    return this.myColor === 1 ? this.myName : this.otherPlayer.name;
  }

  get secondPlayerName() {
    return this.myColor === 1 ? this.otherPlayer.name : this.myName;
  }

  get myColor() {
    if (!this.otherPlayer) return 1;
    if (this.otherPlayer.order === 1) {
      return 2;
    } else {
      return 1;
    }
  }

  get gameExists() {
    return this.currentState && !this.currentState.hasWinCondition;
  }

  constructor(container, myName, { mode = GameMode.Single }, otherPlayer, logger) {
    if (logger) {
      this.httpLogger = logger;
    }

    this.colorScheme = new ColorScheme();
    this.size = new Size();
    this.size.fieldSize = 16;
    this.commands = [];

    this.myName = myName;
    this.mode = mode;
    this.otherPlayer = otherPlayer;

    this._initBoard(container, this.size);
    this._initControlsButtons(container);
    this._initLogger(container);
    this._initDrawer();
  }

  start() {
    this.currentState = GameState.start(this.size.fieldSize);
    // this._toggleControlsAvailability();
    this.draw(this.currentState);
  }

  _initBoard(container, size) {
    this.board = new InteractiveBoard(size);
    this._assignBoardHandlers();
    container.appendElement(this.board);
  }

  _initControlsButtons(container) {
    const btnRoll = new Button({ name: 'Roll' });
    const btnUndo = new Button({ name: 'Undo' });
    const controlsContainer = makeControlsLayout(container);

    btnRoll.handleClick()
      .pipe(takeWhile(() => this.gameExists))
      .subscribe(() => this.rollDices());
    btnUndo.handleClick()
      .pipe(takeWhile(() => this.gameExists))
      .subscribe(() => this.undo());

    controlsContainer.append(btnRoll, btnUndo);

    function makeControlsLayout(container) {
      const controlsContainer = new Container('dal-controls-container');
      const controls = new Container('dal-controls');

      controlsContainer.prepend(controls);
      container.appendElement(controlsContainer);
      return controls;
    }
  }

  _initLogger(container) {
    const logger = new LogPane();
    container.appendElement(logger);
    this.logger = logger;
  }

  _assignBoardHandlers() {
    this.board.handleLeftClick()
      .pipe(takeWhile(() => this.gameExists))
      .subscribe(actionCoordinate => this.pickFigure(actionCoordinate));
    this.board.handleRightClick()
      .pipe(takeWhile(() => this.gameExists))
      .subscribe(actionCoordinate => this.move(actionCoordinate));
    this.board.handleDoubleClick()
      .pipe(takeWhile(() => this.gameExists))
      .subscribe(actionCoordinate => this.activate(actionCoordinate));
  }

  _toggleControlsAvailability() {
    if (!this.otherPlayer) return;
    if (this.myColor !== this.currentState.currentPlayerColor) {
      document.querySelector('#btn-Roll').disabled = true;
      document.querySelector('#btn-Undo').disabled = true;
    } else {
      document.querySelector('#btn-Roll').disabled = false;
      document.querySelector('#btn-Undo').disabled = false;
    }
  }

  rollDices() {
    return this.executeCommand(new RollCommand(this, this.currentState, null));
  }

  oppositePlayerRollDices(dices) {
    return this.executeCommand(new OppositeRollCommand(this, this.currentState, dices));
  }

  pickFigure(figureCoordinate) {
    console.log('pick');
    return this.executeCommand(new PickCommand(this, this.currentState, figureCoordinate));
  }

  activate(figureCoordinate) {
    return this.executeCommand(new ActivateCommand(this, this.currentState, figureCoordinate));
  }

  move(to) {
    return this.executeCommand(new MoveCommand(this, this.currentState, { to })).then(() => {
      if (this.currentState.hasWinCondition) {
        this.showVictoryScreen();
      }
    });
  }

  undo() {
    const lastCommand = this.commands.pop();
    if (lastCommand) {
      lastCommand.undo();
    }
    return new Promise((resolve) => {
      if (!this.commands.length) resolve();
    });
  }

  executeCommand(command) {
    return command.execute().then((stateHasMove) => {
      if (stateHasMove) {
        if (!(command instanceof RollCommand) && !(command instanceof PickCommand)) {
          this.commands.push(command);
        }
      }
      this.handleOtherPlayerCommand(command);
      this._toggleControlsAvailability();
    });
  }

  handleOtherPlayerCommand(command) {
    if (this.otherPlayer && command.gameState.currentPlayerColor === this.myColor) {
      this.otherPlayer.send(command).then(() => {
        if (this.currentState.currentPlayerColor !== this.myColor) {
          this.otherPlayer.getCommand(this).then(command => {
            this.executeCommand(command);
          });
        }
      });
    }
  }

  _initDrawer() {
    this.drawer = new CanvasDrawer(this.board.canvas, this.colorScheme, this.size);
  }

  playerStatistics(gameState) {
    return ({
      name: gameState.currentPlayerColor === 1 ? this.firstPlayerName : this.secondPlayerName,
    });
  }

  draw(state) {
    this.drawer.draw(state, this.playerStatistics(state));
  }

  log(message) {
    this.logger.log(message);
  }

  showVictoryScreen() {
    this.drawer.drawVictory(this.currentState, this.playerStatistics(this.currentState));
  }
}
