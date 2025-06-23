import React, { useState, useEffect, useMemo } from 'react';
import { useMessages } from '../contexts/MessageContext';
import {
  EnvelopeIcon,
  UserGroupIcon,
  BellIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { messageService } from '../services/MessageService';
import { useAuth } from '../contexts/AuthContext';
const API_BASE_URL = "http://localhost:5196";
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
  const [searchQuery, setSearchQuery] = useState('');

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

      const _ = await sendMessage(messageData);
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
      console.log(conversations)
    } catch (error) {
      console.error('Error in conversation click:', error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  // Ajout de la fonction de filtrage et tri des conversations
  const filteredAndSortedConversations = useMemo(() => {
    return conversations
      .filter(conv => 
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastMessageDate || 0) - new Date(a.lastMessageDate || 0));
  }, [conversations, searchQuery]);

  return (
    <div className="flex h-full bg-gray-50">
      <div className="w-96 bg-white p-6 shadow-lg flex flex-col border-r">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <EnvelopeIcon className="h-6 w-6 text-e-bosy-purple" />
          <span>Messages</span>
        </h2>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

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

        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {filteredAndSortedConversations.map((conv) => (
            <div
              key={conv.userId}
              onClick={() => handleConversationClick(conv)}
              className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                activeConversation?.userId === conv.userId 
                  ? 'bg-purple-50 border-l-4 border-e-bosy-purple' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                {conv.profilePictureUrl ? (
                  <img 
                    src={`${API_BASE_URL}${conv.profilePictureUrl}`}
                    alt={`${conv.name}'s profile`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                    {conv.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${
                  conv.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                } border-2 border-white shadow-sm`}></div>
              </div>
              <div className="flex-1 min-w-0 ml-4">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-800 truncate">
                    {conv.name}
                  </p>
                  {conv.lastMessageDate && (
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {new Date(conv.lastMessageDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-1">
                  {conv.role}
                </p>
                {conv.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                )}
                {conv.unreadCount > 0 && (
                  <span className="absolute right-4 top-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md m-6">
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="relative">
              {activeConversation?.profilePictureUrl ? (
                <img 
                  src={`${API_BASE_URL}${activeConversation.profilePictureUrl}`}
                  alt={`${activeConversation.name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                  {activeConversation?.name.split(' ')[0].charAt(0).toUpperCase()}
                </div>
              )}
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