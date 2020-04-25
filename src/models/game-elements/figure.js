export class Figure {
  constructor(color) {
    this.color = color;
    this.isActive = false;
    this.canMove = false;
  }

  activate() {
    this.isActive = true;
  }

  get active() {
    return this.isActive;
  }

  get isFirstPlayer() {
    return this.color === 1;
  }

  canActivatedBy(player) {
    return !this.active && this.color === player;
  }
}
