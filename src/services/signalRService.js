import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { API_BASE_URL } from './ApiFetch';

class SignalRService {
  constructor() {
    this.connection = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async startConnection(sessionId) {
    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/liveHub?sessionId=${sessionId}`, {
          skipNegotiation: true,
          transport: 1 // WebSockets seulement
        })
        .configureLogging(LogLevel.Warning)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.elapsedMilliseconds < 10000) {
              return 2000;
            }
            return 5000;
          }
        })
        .build();

      await this.connection.start();
      console.log('SignalR connected');
      this.retryCount = 0;
    } catch (err) {
      console.error('SignalR connection error:', err);
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.startConnection(sessionId);
      }
      throw err;
    }
  }

  async joinSession(sessionId, userId) {
    try {
      await this.connection.invoke('JoinSession', sessionId, userId);
    } catch (err) {
      console.error('Join session error:', err);
      throw err;
    }
  }

  async leaveSession(sessionId, userId) {
    try {
      if (this.connection && this.connection.state === 'Connected') {
        await this.connection.invoke('LeaveSession', sessionId, userId);
      }
    } catch (err) {
      console.error('Leave session error:', err);
    }
  }

  async sendSignal(sessionId, targetUserId, signal) {
    try {
      if (this.connection && this.connection.state === 'Connected') {
        await this.connection.invoke('SendSignal', sessionId, targetUserId, signal);
      }
    } catch (err) {
      console.error('Send signal error:', err);
      throw err;
    }
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
    }
  }
}

export const signalRService = new SignalRService();