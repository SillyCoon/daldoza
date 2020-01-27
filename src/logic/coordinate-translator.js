import { Size } from "../models/draw/size.js";

export class CoordinateTranslator {


    constructor() {}

    static translateMousePositionToGameCoordinates(mousePosition) {
        const size = new Size(); // TODO: изменить!!!
        const x = translate(mousePosition.x);
        const y = translate(mousePosition.y);
        return {x, y};
    
        function translate(coord) { return Math.floor((coord - size.numerationPadding) / size.square)}
        
    }

    static translateGameCoordinatesToSquareCoordinate(gameCoordinate) {
        const size = new Size();
        const x = translate(gameCoordinate.x);
        const y = translate(gameCoordinate.y)
        return {x, y};

        function translate(coord) {
            return size.numerationPadding + size.square * coord;
        }

    }
}