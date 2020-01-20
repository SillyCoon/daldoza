import { Field } from './field.js'

export class Game {
    field;

    init() { }

    constructor() {
        this.field = new Field(16);
    }
}