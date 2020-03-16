import { RollCommand } from "./commands/roll-command";
import { CommandType } from "../models/game-elements/enums/command-type";

export class PrimitiveAI {

    constructor() {

    }

    generateCommand(app) {
        const command = this._randomCommand(app.currentState);
        switch (command.type) {
            case CommandType.Roll:
                return new RollCommand(app, app.currentState);
            default:
                throw new Error('Such command is not supported!');
        }
    }

    _randomCommand(gameState) {
        const commands = gameState.getAllAvailableCommands();
        return commands[0];
    }
}