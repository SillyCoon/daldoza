export class Dice {
  static roll() {
    return (Math.floor(Math.random() * Math.floor(4)) + 1);
  }

  static get dal() {
    return 1;
  }

  static hasDoubleDal(...dices) {
    return !dices.some((dice) => dice !== this.dal);
  }
}
