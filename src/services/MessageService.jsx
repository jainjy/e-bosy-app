import { 
  HubConnectionBuilder, 
  LogLevel,
  HttpTransportType 
} from '@microsoft/signalr';
import { getData, postData, putData } from './ApiFetch';

class MessageService {
  constructor() {
    this.connection = null;
    this.baseUrl = 'http://localhost:5196';
    this.hubUrl = `${this.baseUrl}/messageHub`;
  }

  async startConnection(userId) {
    try {
      // Arrêter la connexion existante uniquement si elle est en cours de connexion ou connectée
      if (this.connection && 
          (this.connection.state === 'Connected' || this.connection.state === 'Connecting')) {
        await this.connection.stop();
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => localStorage.getItem('token'),
          skipNegotiation: false,
          withCredentials: false
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Configuration des handlers
      this.connection.on("ReceiveMessage", (message) => {
        if (this.onMessageReceived) {
          this.onMessageReceived(message);
        }
      });

      this.connection.on("UserStatusChanged", (userId, status) => {
        if (this.onUserStatusChanged) {
          this.onUserStatusChanged(userId, status);
        }
      });

      this.connection.onclose((error) => {
        console.log('Connection closed:', error);
      });

      this.connection.onreconnecting((error) => {
        console.log('Reconnecting:', error);
      });

      this.connection.onreconnected(() => {
        console.log('Reconnected');
        this.connection.invoke("JoinUser", userId).catch(console.error);
      });

      // Démarrer la connexion
      await this.connection.start();
      console.log("SignalR Connected.");
      
      // Rejoindre en tant qu'utilisateur
      await this.connection.invoke("JoinUser", userId);

      return true;
    } catch (err) {
      console.error("SignalR Connection Error:", err);
      throw err;
    }
  }

  setMessageHandler(callback) {
    this.onMessageReceived = callback;
  }

  setUserStatusHandler(callback) {
    this.onUserStatusChanged = callback;
  }

  async getConversations() {
    try {
      const [data, error] = await getData('messages/conversations');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  async getMessagesForConversation(userId) {
    try {
      // Récupérer les messages envoyés et reçus pour créer la conversation complète
      const [sentMessages] = await getData(`messages/sent?recipientId=${userId}`);
      const [receivedMessages] = await getData(`messages/received?senderId=${userId}`);
      
      // Combiner et trier les messages par date
      const allMessages = [...(sentMessages || []), ...(receivedMessages || [])].sort(
        (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
      );

      return allMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  async sendMessage(messageData) {
    try {
      const [data, error] = await postData('messages', messageData);
      if (error) throw error;

      // Notification via SignalR
      if (this.connection) {
        await this.connection.invoke('SendMessage', 
          JSON.stringify(data), 
          messageData.recipientId
        );
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const [data, error] = await putData(`messages/${messageId}/read`);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop();
    }
  }

  async getUsers() {
    try {
      // Utiliser l'endpoint all qui récupère tous les utilisateurs sauf l'utilisateur courant
      const [data] = await getData('users/all');
      
      if (!data) return [];

      // Transformer les données pour correspondre au format attendu
      return data.map(user => ({
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        status: 'offline', // État par défaut
        lastMessage: '',
        lastMessageDate: null,
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const messageService = new MessageService();