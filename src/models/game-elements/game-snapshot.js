export class GameSnapshot {

    constructor(fieldSnapshot, player, status) {
        this.fieldSnapshot = fieldSnapshot;
        this.dices = player.dices;
        this.currentPlayer = player.color;
        this.selectedFigure = player.selectedFigure;
        this.status = status;
        console.log(player);
    }

}