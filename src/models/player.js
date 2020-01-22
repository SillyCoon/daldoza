export class Player {
    
    constructor(turn, name, figuresCounter) {
        this.turn = turn;
        this.name = name;
        this.figuresCounter = 16;
    }

    getColor() {
        return this.turn === 1 ? 'red' : 'green';
    }
}