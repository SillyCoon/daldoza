import { Container } from './container';

export class LogPane extends Container {
  constructor() {
    const logContainer = new Container('log-pane'); const logHeader = document.createElement('h3');
    logHeader.textContent = 'Лог:';
    logContainer.appendElement(logHeader);
    super(logContainer.nativeElement);
  }

  log(event) {
    const logItem = document.createElement('p');
    logItem.textContent = event.toString();
    this.appendElement(logItem);
  }
}
