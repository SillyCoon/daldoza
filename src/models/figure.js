export class Figure {
    
    isActive = false;
    canMove = false;

    constructor(player) {
        this.player = player
    }

    activate() {
        this.isActive = true;
    }
}