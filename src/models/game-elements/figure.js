export class Figure {
    
    isActive = false;
    canMove = false;

    constructor(color) {
        this.color = color;
    }

    activate() {
        this.isActive = true;
    }

    get isFirstPlayer() {
        return this.color === 1; 
    }
}