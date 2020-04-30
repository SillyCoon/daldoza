import { Container } from './container';
import { BaseControl } from './base-control';
import { CoordinateTranslator } from '../coordinate-translator';
import { fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export class InteractiveBoard extends BaseControl {
  constructor(size) {
    const boardContainer = new Container(null, 'dal-field');
    const canvas = document.createElement('canvas');
    canvas.id = 'dal-canvas';
    canvas.width = size.width;
    canvas.height = size.height;
    boardContainer.appendElement(canvas);

    super(boardContainer.nativeElement);

    this.fieldSize = size.fieldSize;
    this.canvas = canvas;
    this._disableContextMenu();
  }

  _disableContextMenu() {
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  disable() {
    this.nativeElement.classList.add('disabled-field');
  }

  enable() {
    this.nativeElement.classList.remove('disabled-field');
  }

  handleDoubleClick() {
    return fromEvent(this.canvas, 'dblclick').pipe(
      map(event => this.getActionCoordinate(event)),
      filter(coordinates => coordinates)
    );
  }

  handleLeftClick() {
    return this._handleMouseupEvent().pipe(
      filter(event => event.button === 0),
      map(event => this.getActionCoordinate(event))
    );
  }

  handleRightClick() {
    return this._handleMouseupEvent().pipe(
      filter(event => event.button === 2),
      map(event => this.getActionCoordinate(event))
    );
  }

  _handleMouseupEvent() {
    return fromEvent(this.canvas, 'mouseup').pipe(
      filter(event => this.getActionCoordinate(event))
    );
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
      (y >= 0 && (y < this.fieldSize || (x === 1 && y < this.fieldSize + 1)));
    if (!isValid) console.log('click outside the field');
    return isValid;
  }
}
