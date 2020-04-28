import { BaseControl } from './base-control';

export class Container extends BaseControl {
  constructor(className, id = '') {
    const nativeContainer = document.createElement('div');
    nativeContainer.className = className;
    nativeContainer.id = id;
    super(nativeContainer);
  }

  remove(element) {
    if (element instanceof BaseControl) {
      this.nativeElement.removeChild(element.nativeElement);
    } else {
      this.nativeElement.removeChild(element);
    }
  }

  append(...elements) {
    const nativeElements = elements.map(element => this._extractNativeFrom(element));
    this.nativeElement.append(...nativeElements);
  }

  appendElement(element) {
    this.nativeElement.appendChild(this._extractNativeFrom(element));
  }

  prepend(element) {
    this.nativeElement.prepend(this._extractNativeFrom(element));
  }

  get parent() {
    return this.nativeElement.parentElement;
  }

  _extractNativeFrom(element) {
    if (element instanceof BaseControl) {
      return element.nativeElement;
    } else {
      return element;
    }
  }
}
