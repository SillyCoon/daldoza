export class DiceDrawerFactory {
  constructor(diceSide) {
    this.diceSide = diceSide;
  }

  makeDrawFunction() {
    switch (this.diceSide) {
    case 1:
      return this.drawCross;
    case 2:
      return this.drawTwo;
    case 3:
      return this.drawThree;
    case 4:
      return this.drawFour;
    }
  }

  drawCross(context, x, y) {
    context.fillText('X', x, y);
  }

  drawTwo(context, x, y) {
    context.fillText('II', x, y);
  }

  drawThree(context, x, y) {
    context.fillText('III', x, y);
  }

  drawFour(context, x, y) {
    context.fillText('IV', x, y);
  }
}
