import * as signalR from '@microsoft/signalr';

class WebSocketService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
  }

  connect(sessionId, userId) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://127.0.0.1:5196/liveHub?sessionId=${sessionId}&userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.connection.on('connection', (data) => {
      this.notifyListeners('connection', data);
    });

    this.connection.on('signal', (data) => {
      this.notifyListeners('signal', data);
    });

    this.connection.on('chat', (data) => {
      this.notifyListeners('chat', data);
    });

    this.connection.on('control', (data) => {
      this.notifyListeners('control', data);
    });

    this.connection.onclose((error) => {
      console.error('SignalR connection closed:', error);
      this.notifyListeners('connection', { status: 'disconnected' });
    });

    this.connection.start().catch((err) => {
      console.error('SignalR connection error:', err);
    });
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, callbacks);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  sendMessage(type, data) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('Send' + type.charAt(0).toUpperCase() + type.slice(1), data.sessionId, data)
        .catch(err => console.error(`Error sending ${type}:`, err));
    } else {
      console.warn('SignalR connection is not active');
    }
  }
}

export const webSocketService = new WebSocketService();