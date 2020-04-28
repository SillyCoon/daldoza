export class LayoutHelper {
  static makeControlButton({ name, disabled = false }, clickHandler = null) {
    const btn = document.createElement('button');
    btn.id = `btn-${name}`;
    btn.textContent = name;
    btn.disabled = disabled;
    if (clickHandler) {
      addHandlerTo(btn, 'click', clickHandler);
    }
    return btn;
  }

  static addHandlerTo(element, type, handler) {
    element.addEventListener(type, handler);
  }
}
