import { Notation } from './enums/notation.js';

export class FieldSnapshot {
  constructor(fieldNotation) {
    this.value = fieldNotation;
  }

  get size() {
    return this.splittedByColumns[0].length;
  }

  get splittedByColumns() {
    return this.value.split(Notation.Delimiter);
  }
}
