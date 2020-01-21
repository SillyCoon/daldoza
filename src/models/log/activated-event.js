export class ActivatedEvent {

    player;
    from;

    constructor(player, from) {
        this.player = player;
        this.from = from;
    }

    toString() {
        return `Игрок ${this.player} активировал фигуру ${this.from}`;
    }
}