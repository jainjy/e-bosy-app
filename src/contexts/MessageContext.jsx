import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { messageService } from '../services/MessageService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      initializeMessageService();
      return () => {
        messageService.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation?.userId) {
      loadMessages(activeConversation.userId);
    }
  }, [activeConversation?.userId]);

  const loadUsers = async () => {
    try {
      // On passe l'utilisateur courant pour le filtrage côté service
      const filteredUsers = await messageService.getUsers(user);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const initializeMessageService = async () => {
    try {
      await messageService.startConnection(user.userId);
      messageService.setMessageHandler(handleNewMessage);
      messageService.setUserStatusHandler(handleUserStatusChange);
      messageService.setConnectedUsersHandler(handleConnectedUsers);
      await loadConversations();
      await loadUsers();
    } catch (error) {
      console.log('Error initializing message service:', error);

    }
  };

  const handleConnectedUsers = (userIds) => {
    setConversations(prev =>
      prev.map(conv =>
        userIds.includes(conv.userId)
          ? { ...conv, status: 'online', isActive: true }
          : conv
      )
    );
  };

  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
      setUnreadCount(data.reduce((acc, conv) => acc + conv.unreadCount, 0));
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const loadMessages = async (userId) => {
    try {
      if (!userId) return;
      
      // Récupérer tous les messages pour cette conversation
      const messages = await messageService.getMessagesForConversation(userId);
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.sentAt) - new Date(b.sentAt)
      );
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      // toast.error('Erreur lors du chargement des messages');
    }
  };

  const handleNewMessage = (message) => {
    try {
      const parsedMessage = typeof message === 'string' ? JSON.parse(message) : message;

      // Mise à jour immédiate des messages si la conversation est active
      setMessages(prev => {
        if (
          activeConversation?.userId === parsedMessage.senderId ||
          activeConversation?.userId === parsedMessage.recipientId
        ) {
          if (prev.some(m => m.messageId === parsedMessage.messageId)) {
            return prev;
          }
          return [...prev, parsedMessage].sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
          );
        }
        return prev;
      });

      // Mise à jour des conversations
      setConversations(prev => prev.map(conv => {
        if (conv.userId === parsedMessage.senderId || conv.userId === parsedMessage.recipientId) {
          // Si la conversation n'est pas active et que le message est pour l'utilisateur courant, incrémente unreadCount
          const isForMe = parsedMessage.recipientId === user?.userId;
          const isActive = activeConversation?.userId === (parsedMessage.senderId === user?.userId ? parsedMessage.recipientId : parsedMessage.senderId);

          return {
            ...conv,
            lastMessage: parsedMessage.content,
            lastMessageDate: parsedMessage.sentAt,
            unreadCount:
              isForMe && !isActive
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount
          };
        }
        return conv;
      }));

      scrollToBottom();
    } catch (error) {
      console.error('Error handling new message:', error);
    }
  };

  const handleUserStatusChange = (userId, status) => {
    setConversations(prev => prev.map(conv => {
      if (conv.userId === parseInt(userId)) {
        return {
          ...conv,
          status: status,
          isActive: status === 'online'
        };
      }
      return conv;
    }));
  };

  const sendMessage = async (messageData) => {
    try {
      const result = await messageService.sendMessage(messageData);
      
      // Ajoutez directement le message à la liste des messages
      const newMessage = {
        ...messageData,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
        isRead: false
      };

      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

      // Mise à jour des conversations
      updateConversationWithNewMessage(newMessage);
      
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      //toast.error('Erreur lors de l\'envoi du message');
      throw error;
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => prev.map(conv => {
      const isParticipant = conv.userId === message.senderId || conv.userId === message.recipientId;
      if (!isParticipant) return conv;

      return {
        ...conv,
        lastMessage: message.content,
        lastMessageDate: message.sentAt,
        unreadCount: conv.userId === message.senderId && message.recipientId === user?.userId
          ? conv.unreadCount + 1
          : conv.unreadCount
      };
    }));
  };

  const updateMessages = (newMessages) => {
    setMessages(newMessages);
  };

  const value = {
    messages,
    conversations,
    activeConversation,
    updateMessages,
    setActiveConversation,
    sendMessage,
    markAsRead: messageService.markAsRead,
    messagesEndRef,
    setConversations,
    unreadCount,
    users, 
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};