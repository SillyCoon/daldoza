import { GameState } from './game-state.js';
import { CanvasDrawer } from './drawer.js';
import { Logger } from './logger.js';
import { ColorScheme } from '../models/draw/color-scheme.js';
import { Size } from '../models/draw/size.js';
import { CoordinateTranslator } from './coordinate-translator.js';
import { RollCommand } from './commands/roll-command.js';
import { ActivateCommand } from './commands/activate-command.js';
import { PickCommand } from './commands/pick-command.js';
import { MoveCommand } from './commands/move-command.js';
import { LayoutHelper } from './layout-helper.js';
import { GameMode } from '../models/game-elements/enums/game-mode.js';
import { PrimitiveAI } from './primitive-AI';
import { SocketMultiplayer } from './multiplayer.js';

export class App {
  constructor(container, { firstPlayerName = 'Дал', secondPlayerName = 'Доз' }, { mode = GameMode.Single }, logger) {
    if (logger) {
      this.httpLogger = logger;
    }

    this.mode = mode;

    // по идее еще задизейблить ходы для 2 игрока со стороны реального игрока
    if (mode === GameMode.AI) {
      this._initAI();
    } else if (mode === GameMode.Multi) {
      this._initMultiplayer();
    }

    this.firstPlayerName = firstPlayerName;
    this.secondPlayerName = secondPlayerName;

    this.canvas = makeFieldLayout(container);
    const controlsDiv = makeControlsLayout(container);
    const loggerDiv = makeLoggerLayout(controlsDiv.parentElement);

    this._initControls(controlsDiv, this.canvas);
    this.logger = this._initLogger(loggerDiv);

    this.commands = [];

    this.colorScheme = new ColorScheme();
    this.size = new Size();
    this.fieldSize = 16;

    this.drawer = this._initDrawer();

    function makeFieldLayout(container) {
      const fieldContainer = document.createElement('div');
      fieldContainer.id = 'dal-field';

      const canvas = document.createElement('canvas');
      canvas.id = 'dal-canvas';

      fieldContainer.prepend(canvas);
      container.prepend(fieldContainer);

      return canvas;
    }

    function makeControlsLayout(container) {
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'dal-controls-container';

      const controls = document.createElement('div');
      controls.className = 'dal-controls';

      controlsContainer.prepend(controls);
      container.appendChild(controlsContainer);
      return controls;
    }

    function makeLoggerLayout(container) {
      const logContainer = document.createElement('div');
      logContainer.id = 'dal-log-pane';
      const logHeader = document.createElement('h3');
      logHeader.textContent = 'Лог:';
      logContainer.appendChild(logHeader);
      container.appendChild(logContainer);

      return logContainer;
    }
  }

  start() {
    this.currentState = GameState.start(this.fieldSize);
    this.draw(this.currentState);
  }

  _initControls(controlsContainer, canvas) {
    const btnRoll = LayoutHelper.makeControlButton({ name: 'Roll' });
    const btnUndo = LayoutHelper.makeControlButton({ name: 'Undo', disabled: true });

    controlsContainer.append(btnRoll, btnUndo);

    btnRoll.addEventListener('click', () => this.rollDices());
    btnUndo.addEventListener('click', () => this.undo().then(() => enableUndoButton(false)));

    canvas.addEventListener('mouseup', (event) => {
      const actionCoordinate = this.getActionCoordinate(event);
      if (event.button === 0) {
        this.pickFigure(actionCoordinate);
      } else if (event.button === 2) {
        this.move(actionCoordinate);
      }
      if (this.commands.length) {
        enableUndoButton(true);
      }
    });

    canvas.addEventListener('dblclick', (event) => this.activate(this.getActionCoordinate(event)).then(() => enableUndoButton(true)));

    canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });

    function enableUndoButton(flag) {
      btnUndo.disabled = !flag;
    }
  }

  _initAI() {
    this.AI = new PrimitiveAI();
  }

  _initMultiplayer() {
    this.multiplayer = new SocketMultiplayer();
  }

  rollDices() {
    return this.executeCommand(new RollCommand(this, this.currentState, null));
  }

  pickFigure(figureCoordinate) {
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
      if (this.mode === GameMode.AI && this.currentState.currentPlayerColor === 2) {
        const AICommand = this.AI.generateCommand(this);
        setTimeout(() => this.executeCommand(AICommand), 1000); // Пока так
      }
    });
  }

  getActionCoordinate(event) {
    const mousePosition = this.getMousePosition(event);
    const translatedCoordinates = CoordinateTranslator.translateMousePositionToGameCoordinates(mousePosition);
    if (this.isValidCoordinate(translatedCoordinates)) {
      return translatedCoordinates;
    }
    return null;
  }

  getMousePosition(event) {
    const canvasSize = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - canvasSize.left,
      y: event.clientY - canvasSize.top,
    };
  }

  // Фабрику бы, фабрику (или нет)
  _initDrawer() {
    this.canvas.height = this.size.height;
    this.canvas.width = this.size.width;
    return new CanvasDrawer(this.canvas, this.colorScheme, this.size);
  }

  _initLogger(logPane) {
    const logger = new Logger(logPane);
    return logger;
  }

  isValidCoordinate({ x, y }) {
    const isValid = (x >= 0 && x < 3) && (y >= 0 && (y < this.fieldSize || (x === 1 && y < this.fieldSize + 1)));
    if (!isValid) console.log('click outside the field');
    return isValid;
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
