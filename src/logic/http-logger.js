export class HttpLogger {
    constructor(baseUrl, endpoints) {
        this.url = baseUrl;
        this.endpoints = endpoints;
    }

    logActivate(activation) {
        return this._logRequest(this.endpoints.activation, activation);
    }

    logMove(move) {
        return this._logRequest(this.endpoints.move, move);
    }

    logRoll(roll) {
        return this._logRequest(this.endpoints.roll, roll);
    }

    _logRequest(endpoint, item) {
        return fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(item),
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
    }
} 