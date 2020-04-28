export class BaseControl {
  constructor(nativeElement) {
    this.element = nativeElement;
  }

  get nativeElement() {
    return this.element;
  }
}
