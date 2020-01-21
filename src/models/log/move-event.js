export class MoveEvent {
    player;
    from;
    to;   
    
    constructor(player, from, to) {
        this.player = player;
        this.from = from;
        this.to = to;
    }

    toString() {
        return `Игрок ${this.player} сходил с клетки ${this.from.toString()} на ${this.to.toString()}`;
    }
}