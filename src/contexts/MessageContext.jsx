import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { messageService } from '../services/MessageService';
import { useAuth } from '../services/AuthContext';
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
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.userId);
    }
  }, [activeConversation]);

  const loadUsers = async () => {
    try {
      const users = await messageService.getUsers();
      const filteredUsers = users.filter(u => u.userId !== user?.userId);
      setUsers(filteredUsers);
      setConversations(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const initializeMessageService = async () => {
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await messageService.startConnection(user.userId);
        messageService.setMessageHandler(handleNewMessage);
        messageService.setUserStatusHandler(handleUserStatusChange);
        await loadConversations();
        break;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) {
          toast.error("Impossible de se connecter au service de messagerie");
          console.error('Failed to initialize message service after multiple attempts:', error);
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
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
      const messages = await messageService.getMessagesForConversation(userId);
      setMessages(messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  const handleNewMessage = (message) => {
    // Mise à jour des messages si la conversation est active
    if (activeConversation?.userId === message.senderId || 
        activeConversation?.userId === message.recipientId) {
      setMessages(prev => [...prev, {
        ...message,
        sentAt: new Date().toISOString()
      }]);
      scrollToBottom();
    }

    // Mise à jour des conversations
    setConversations(prev => prev.map(conv => {
      if (conv.userId === message.senderId || conv.userId === message.recipientId) {
        return {
          ...conv,
          lastMessage: message.content,
          lastMessageDate: new Date().toISOString(),
          unreadCount: activeConversation?.userId !== message.senderId 
            ? (conv.unreadCount || 0) + 1 
            : conv.unreadCount
        };
      }
      return conv;
    }));
  };

  const handleUserStatusChange = (userId, status) => {
    setConversations(prev => prev.map(conv => 
      conv.userId === userId ? { ...conv, status } : conv
    ));
  };

  const sendMessage = async (messageData) => {
    try {
      const result = await messageService.sendMessage(messageData);
      // Ajouter immédiatement le message à la liste
      handleNewMessage({
        ...messageData,
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      throw error;
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversationId
        ? {
            ...conv,
            lastMessage: message.content,
            lastMessageDate: message.sentAt,
            unreadCount: activeConversation?.id !== message.conversationId 
              ? conv.unreadCount + 1 
              : conv.unreadCount
          }
        : conv
    ));
  };

  const updateMessageReadStatus = (conversationId) => {
    setMessages(prev => prev.map(message => 
      message.senderId === conversationId ? { ...message, isRead: true } : message
    ));

    setConversations(prev => prev.map(conv => 
      conv.userId === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const value = {
    conversations,
    activeConversation,
    messages,
    unreadCount,
    setActiveConversation,
    sendMessage, // Utilisez la nouvelle fonction sendMessage
    markAsRead: messageService.markAsRead,
    messagesEndRef,
    updateMessageReadStatus,
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