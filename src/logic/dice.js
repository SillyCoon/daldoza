export class Dice {
    

    constructor(sides = 4) {
        this.sides = sides;
    }

    roll() {
        return this._generateRandom(this.sides);
    }

    _generateRandom(max) {
        return Math.floor(Math.random() * Math.floor(max)) + 1;
    }

    static get dos() {
        return 1;
    }
}