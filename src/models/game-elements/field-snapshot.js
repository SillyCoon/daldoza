export class FieldSnapshot {
    constructor(fieldNotation) {
        this.value = fieldNotation;
    }

    get size() {
        return this.value.split('\n')[0].length;
    }
}