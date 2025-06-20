import React, { useState, useEffect } from 'react';
import { useMessages } from '../contexts/MessageContext';
import { useAuth } from '../services/AuthContext';
import {
  EnvelopeIcon,
  UserGroupIcon,
  BellIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { messageService } from '../services/MessageService';

const MessagesPage = () => {
  const {
    conversations,
    messages,
    activeConversation,
    updateMessages,
    setActiveConversation,
    sendMessage,
    markAsRead,
    messagesEndRef,
    setConversations,
    unreadCount
  } = useMessages();
  
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');

  // Ajout d'un effet pour le défilement automatique
  useEffect(() => {
    if (messages?.length > 0 && messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  // Ajoutez cet effet pour écouter les nouveaux messages
  useEffect(() => {
    if (activeConversation) {
      messageService.setMessageHandler((newMessage) => {
        const parsedMessage = typeof newMessage === 'string' ? JSON.parse(newMessage) : newMessage;
        
        if (parsedMessage.senderId === activeConversation.userId || 
            parsedMessage.recipientId === activeConversation.userId) {
          updateMessages(prev => [...prev, parsedMessage].sort((a, b) => 
            new Date(a.sentAt) - new Date(b.sentAt)
          ));
        }
      });
    }
    
    return () => {
      messageService.setMessageHandler(null);
    };
  }, [activeConversation]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const messageData = {
        content: newMessage,
        recipientId: activeConversation.userId,
        senderId: user.userId,
        messageType: 'prive'
      };

      const result = await sendMessage(messageData);
      // Ajout immédiat du message dans la conversation
      updateMessages(prev => [...prev, {
        ...messageData,
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const handleConversationClick = async (conversation) => {
    try {
      setActiveConversation(conversation);
      
      const messagesData = await messageService.getMessagesForConversation(conversation.userId);
      updateMessages(messagesData.sort((a, b) => 
        new Date(a.sentAt) - new Date(b.sentAt)
      ));

      const unreadMessages = messagesData.filter(m => 
        !m.isRead && 
        m.senderId === conversation.userId && 
        m.recipientId === user.userId
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map(message => markAsRead(message.messageId))
        );

        setConversations(prev => prev.map(conv => 
          conv.userId === conversation.userId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error in conversation click:', error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-80 bg-white p-6 shadow-md flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <EnvelopeIcon className="h-6 w-6" />
          <span>Messages Instantanes</span>
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">{conversations.length}</span>
            <span className="text-sm text-gray-600">Conversations</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">{conversations.filter(c => c.status === 'online').length}</span>
            <span className="text-sm text-gray-600">Actifs aujourd'hui</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-e-bosy-purple text-2xl font-bold">{unreadCount}</span>
            <span className="text-sm text-gray-600">Non lus</span>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pr-2">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => handleConversationClick(conv)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer ${
                  activeConversation?.userId === conv.userId ? 'bg-purple-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                    {conv.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                    conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  } border-2 border-white`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {conv.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {conv.role}
                  </p>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {conv.lastMessage}
                    </p>
                  )}
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-e-bosy-purple mx-auto mb-4"></div>
              <p>Chargement des utilisateurs...</p>
            </div>
          )}
        </div>
      </div>

      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md m-6">
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="relative">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                {activeConversation?.name.split(' ')[0].charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${activeConversation?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} border border-white`}></div>
            </div>
            <div className="ml-3">
              <p className="font-semibold text-gray-800">{activeConversation?.name}</p>
              <p className="text-sm text-gray-500">{activeConversation?.role}</p>
            </div>
            <div className="ml-auto flex space-x-3 text-gray-500">
              <button><UserGroupIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
              <button><BellIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
              <button><ArrowPathIcon className="h-6 w-6 hover:text-e-bosy-purple" /></button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div 
                key={message.messageId} 
                className={`flex ${message.senderId === user.userId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs p-3 rounded-lg ${
                  message.senderId === user.userId 
                    ? 'bg-e-bosy-purple text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 text-right opacity-75">
                    {new Date(message.sentAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
            />
            <button type="submit" className="bg-e-bosy-purple text-white px-6 py-3 rounded-md hover:bg-purple-700">
              Envoyer
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-md m-6">
          <div className="text-center">
            <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Aucune conversation sélectionnée</h3>
            <p className="mt-1 text-gray-500">
              Sélectionnez une conversation pour commencer à discuter
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;