import { BaseEvent } from "./base-event.js";

export class MoveEvent extends BaseEvent {

    to;   
    
    constructor(player, from, to) {
        super(player, from);
        this.to = to;
    }

    toString() {
        return `Игрок ${this.player} сходил с клетки ${this.from.x};${this.from.y} на ${this.to.x};${this.to.y}`;
    }
}