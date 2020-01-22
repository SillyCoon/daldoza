export class Player {
    
    constructor(turn, name, figuresCounter) {
        this.turn = turn;
        this.name = name;
        this.figuresCounter = figuresCounter;
    }

    getColor() {
        return this.turn === 1 ? 'red' : 'green';
    }
}