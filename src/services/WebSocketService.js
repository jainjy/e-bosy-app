class WebSocketService {
    constructor() {
      this.socket = null;
      this.listeners = new Map();
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.reconnectDelay = 3000; // 3 seconds
    }
  
    connect(sessionId, userId) {
      if (this.socket) {
        this.disconnect();
      }
  
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      this.socket = new WebSocket(`${protocol}//${host}/api/ws/${sessionId}?userId=${userId}`);
  
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };
  
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
  
      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event);
        this.notifyListeners('connection', { status: 'disconnected' });
        
        // Tentative de reconnexion
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.connect(sessionId, userId);
          }, this.reconnectDelay);
        }
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('connection', { status: 'error', error });
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  
    sendMessage(type, data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ type, data });
        this.socket.send(message);
      }
    }
  
    addListener(type, callback) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type).add(callback);
    }
  
    removeListener(type, callback) {
      if (this.listeners.has(type)) {
        this.listeners.get(type).delete(callback);
      }
    }
  
    notifyListeners(type, data) {
      if (this.listeners.has(type)) {
        this.listeners.get(type).forEach(callback => callback(data));
      }
    }
  }
  
  export const webSocketService = new WebSocketService();