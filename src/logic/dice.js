export class Dice {
    

    constructor() {
        this.sides = 4;
        this.side = 1;
    }

    static roll() {
        this.side = this._generateRandom(this.sides);
    }

    _generateRandom(max) {
        return Math.floor(Math.random() * Math.floor(max)) + 1;
    }
}