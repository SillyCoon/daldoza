import { BaseControl } from './base-control';

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
    return new Promise((resolve, reject) => {
      this.nativeElement.addEventListener('click', () => resolve());
    });
  }
}
