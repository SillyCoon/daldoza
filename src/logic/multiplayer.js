export class SocketMultiplayer {
  constructor(url = 'ws://localhost:8080/ws') {
    this.socket = new WebSocket();
  }
}
