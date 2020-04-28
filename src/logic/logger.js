export class Logger {
  constructor(logPane) {
    this._logPane = logPane;
  }

  log(event) {
    const logItem = document.createElement('p');
    logItem.textContent = event.toString();
    this._logPane.appendElement(logItem);
  }

  logError(error) {
    // add red text color
    this.log(error);
  }
}
