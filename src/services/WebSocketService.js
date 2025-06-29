import * as signalR from "@microsoft/signalr";

class WebSocketService {
  constructor() {
    this.connection = null;
    this.listeners = {};
  }

  connect(sessionId, userId) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`http://localhost:5196/liveHub?sessionId=${sessionId}&userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.connection.start().catch((err) => {
      console.error("SignalR Connection Error:", err);
    });

    // Gestion des messages entrants
    this.connection.on("ReceiveSignal", (data) => {
      this.notifyListeners("signal", data);
    });

    this.connection.on("ReceiveChatMessage", (message) => {
      this.notifyListeners("chat", message);
    });

    this.connection.on("ParticipantsUpdated", (participants) => {
      this.notifyListeners("participants", participants);
    });

    this.connection.on("StreamStarted", (streamData) => {
      this.notifyListeners("stream", streamData);
    });

    this.connection.onclose((error) => {
      this.notifyListeners("connection", { status: "disconnected", error });
    });
  }

  disconnect() {
    if (this.connection) {
      this.connection.stop();
    }
  }

  addListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  notifyListeners(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  sendMessage(type, data) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      switch (type) {
        case "chat":
          this.connection.invoke("SendChatMessage", data.sessionId, data.sender, data.message);
          break;
        case "signal":
          this.connection.invoke("SendSignal", data.sessionId, data.signal);
          break;
        case "control":
          this.connection.invoke("SendControl", data.sessionId, data);
          break;
        default:
          console.warn("Unknown message type:", type);
      }
    } else {
      console.warn("Cannot send message - connection not established");
    }
  }
}

export const webSocketService = new WebSocketService();