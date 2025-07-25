import { 
  HubConnectionBuilder, 
  LogLevel,
  HttpTransportType 
} from '@microsoft/signalr';
import { API_BASE_URL, getData, postData, putData } from './ApiFetch';

class MessageService {
  constructor() {
    this.connection = null;
    this.baseUrl = API_BASE_URL;
    this.hubUrl = `${this.baseUrl}/messageHub`;
  }

  async startConnection(userId) {
    try {
      if (this.connection?.state === "Connected") {
        return true;
      }

      this.connection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => localStorage.getItem('token')
        })
        .withAutomaticReconnect()
        .build();

      this.connection.on("ReceiveMessage", (message) => {
        if (this.onMessageReceived) {
          this.onMessageReceived(message);
        }
      });

      this.connection.on("UserStatusChanged", (statusUserId, status) => {
        if (this.onUserStatusChanged) {
          this.onUserStatusChanged(parseInt(statusUserId), status);
        }
      });

      this.connection.on("ConnectedUsers", (userIds) => {
        if (this.onConnectedUsers) {
          this.onConnectedUsers(userIds);
        }
      });
      await this.connection.start();
      await this.connection.invoke("JoinUser", userId);
      
      return true;
    } catch (error) {
      console.log("SignalR Connection Error:", error);
      throw error;
    }
  }

  setMessageHandler(callback) {
    this.onMessageReceived = callback;
  }

  setUserStatusHandler(callback) {
    this.onUserStatusChanged = callback;
  }

  setConnectedUsersHandler(callback) {
    this.onConnectedUsers = callback;
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
      if (!userId) return [];
      
      // Récupérer les messages envoyés et reçus
      const [sentMessagesData] = await getData(`messages/sent?recipientId=${userId}`);
      const [receivedMessagesData] = await getData(`messages/received?senderId=${userId}`);
      
      const sentMessages = sentMessagesData || [];
      const receivedMessages = receivedMessagesData || [];
      
      // Combiner et trier tous les messages
      const allMessages = [...sentMessages, ...receivedMessages].sort(
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
      if (this.connection?.state === "Connected") {
        await this.connection.invoke('SendMessage', 
          JSON.stringify({
            ...data,
            senderId: messageData.senderId,
            recipientId: messageData.recipientId
          }), 
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

  async getUsers(currentUser) {
    try {
      const [data,error] = await getData(`users/toConversation/${currentUser.userId}`);
      if (!data || !Array.isArray(data)) return [];

      // Construction de la liste enrichie des utilisateurs
      const users = data.map(user => ({
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        status: 'offline',
        lastMessage: '',
        lastMessageDate: null,
        unreadCount: 0,
        profilePictureUrl: user.profilePictureUrl,
      }));
      return users;

    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

}

export const messageService = new MessageService();