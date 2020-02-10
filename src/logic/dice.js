export class Dice {
    
    get sides() {
        return 4;
    }

    static roll() {
        return this._generateRandom(this.sides);
    }

    _generateRandom(max) {
        return Math.floor(Math.random() * Math.floor(max)) + 1;
    }

    static get dal() {
        return 1;
    }
}