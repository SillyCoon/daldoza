import { BaseControl } from './base-control';
import { fromEvent } from 'rxjs';

export class Button extends BaseControl {
  constructor({ name, disabled = false }, className = null, handler = null) {
    const nativeButton = document.createElement('button');
    nativeButton.id = `btn-${name}`;
    nativeButton.textContent = name;
    nativeButton.disabled = disabled;
    super(nativeButton);
    if (handler) {
      this.addClickHandler(handler);
    }
  }

  handleClick() {
    return fromEvent(this.nativeElement, 'click');
  }

  enable() {
    this.nativeElement.disabled = false;
  }

  disable() {
    this.nativeElement.disabled = true;
  }
}
