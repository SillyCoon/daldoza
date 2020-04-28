import { Container } from './container';
import { BaseControl } from './base-control';
import { CoordinateTranslator } from '../coordinate-translator';

export class InteractiveBoard extends BaseControl {
  constructor(size) {
    const boardContainer = new Container(null, 'dal-field');
    const canvas = document.createElement('canvas');
    canvas.id = 'dal-canvas';
    canvas.width = size.width;
    canvas.height = size.height;
    boardContainer.appendElement(canvas);

    super(boardContainer.nativeElement);

    this.canvas = canvas;
    this._disableContextMenu();
  }

  _disableContextMenu() {
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  handleDoubleClick() {
    return new Promise((resolve, reject) => {
      this.canvas.addEventListener('dblclick', (event) => {
        resolve(this.getActionCoordinate(event));
      });
    });
  }

  handleLeftClick() {
    return new Promise((resolve, reject) => {
      this._handleMouseupEvent().then(event => {
        if (event.button === 2) resolve(this.getActionCoordinate(event));
      });
    });
  }

  handleRightClick() {
    return new Promise((resolve, reject) => {
      this._handleMouseupEvent().then(event => {
        if (event.button === 0) resolve(this.getActionCoordinate(event));
      });
    });
  }

  _handleMouseupEvent() {
    return new Promise((resolve, reject) => {
      this.canvas.addEventListener('mouseup', (event) => {
        resolve(event);
      });
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

  isValidCoordinate({ x, y }) {
    const isValid = (x >= 0 && x < 3) &&
        (y >= 0 && (y < this.size.fieldSize || (x === 1 && y < this.size.fieldSize + 1)));
    if (!isValid) console.log('click outside the field');
    return isValid;
  }
}
