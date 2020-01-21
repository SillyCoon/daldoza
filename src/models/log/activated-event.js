import { BaseEvent } from "./base-event.js";

export class ActivatedEvent extends BaseEvent {

    constructor(player, from) {
        super(player, from);
    }

    toString() {
        return `Игрок ${this.player} активировал фигуру ${this.from}`;
    }
}