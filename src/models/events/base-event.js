export class BaseEvent {
    player;
    from;

    constructor(player, from) {
        this.player = player;
        this.from = from;
    }

    toString(){};
}