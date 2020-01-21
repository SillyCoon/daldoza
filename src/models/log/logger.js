import { MoveEvent } from './move-event.js';

export class Logger {

    _logPane;

    constructor(logPane) {
        this._logPane = logPane;
    }
    
    log(event) {
        const logItem = document.createElement('p');
        logItem.textContent = event.toString();
        this._logPane.appendChild(logItem);
    }
    
    logError(error) {
        this._logPane.appendChild(error);
    }
}