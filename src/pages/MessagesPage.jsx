import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessages } from "../contexts/MessageContext";
import {
  EnvelopeIcon,
  UserGroupIcon,
  BellIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { messageService } from "../services/MessageService";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../services/ApiFetch";

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
    unreadCount,
    users,
  } = useMessages();

  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSelection, setShowUserSelection] = useState(false);
  const fileInputRef = useRef(null);

  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      const targetUserId = parseInt(userId);
      let conversation = conversations.find((conv) => conv.userId === targetUserId);

      if (!conversation) {
        const targetUser = users.find((u) => u.userId === targetUserId);
        if (targetUser) {
          conversation = {
            userId: targetUser.userId,
            name: targetUser.name,
            role: targetUser.role,
            status: targetUser.status,
            profilePictureUrl: targetUser.profilePictureUrl,
            lastMessage: "",
            lastMessageDate: null,
            unreadCount: 0,
          };
          setConversations((prev) => [...prev, conversation]);
        } else {
          toast.error("Utilisateur non trouvé ou non autorisé");
          navigate("/messages");
          return;
        }
      }
      setActiveConversation(conversation);
    } else {
      setActiveConversation(null);
    }
  }, [userId, conversations, users, setActiveConversation, setConversations, navigate]);

  useEffect(() => {
    if (messages?.length > 0 && messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagesEndRef]);

  useEffect(() => {
    if (!activeConversation) return;

    const handler = (newMessageReceived) => {
      const parsedMessage =
        typeof newMessageReceived === "string"
          ? JSON.parse(newMessageReceived)
          : newMessageReceived;

      if (
        parsedMessage.senderId === activeConversation.userId ||
        parsedMessage.recipientId === activeConversation.userId
      ) {
        updateMessages((prev) =>
          [...prev, parsedMessage].sort(
            (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
          )
        );
      }
    };

    messageService.setMessageHandler(handler);

    return () => {
      messageService.setMessageHandler(null);
    };
  }, [activeConversation?.userId, updateMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        recipientId: activeConversation.userId,
        senderId: user.userId,
        messageType: "prive",
      };

      await sendMessage(messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const handleConversationClick = async (conversation) => {
    try {
      setActiveConversation(conversation);
      const messagesData = await messageService.getMessagesForConversation(
        conversation.userId
      );
      updateMessages(
        messagesData.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
      );

      const unreadMessages = messagesData.filter(
        (m) =>
          !m.isRead &&
          m.senderId === conversation.userId &&
          m.recipientId === user.userId
      );

      if (unreadMessages.length > 0) {
        await Promise.all(
          unreadMessages.map((message) => markAsRead(message.messageId))
        );

        setConversations((prev) =>
          prev.map((conv) =>
            conv.userId === conversation.userId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
      navigate(`/message/${conversation.userId}`);
    } catch (error) {
      console.error("Error in conversation click:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const filteredAndSortedConversations = useMemo(() => {
    return conversations
      .filter(
        (conv) =>
          conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.role.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort(
        (a, b) =>
          new Date(b.lastMessageDate || 0) - new Date(a.lastMessageDate || 0)
      );
  }, [conversations, searchQuery]);

  const handleStartConversation = () => {
    setShowUserSelection(true);
  };

  const handleUserSelect = async (userSelected) => {
    try {
      const newConversation = {
        userId: userSelected.userId,
        name: userSelected.name,
        role: userSelected.role,
        status: userSelected.status,
        profilePictureUrl: userSelected.profilePictureUrl,
        lastMessage: "",
        lastMessageDate: null,
        unreadCount: 0,
      };

      setConversations((prev) => [...prev, newConversation]);
      setActiveConversation(newConversation);
      setShowUserSelection(false);
      navigate(`/message/${userSelected.userId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Erreur lors du démarrage de la conversation");
    }
  };

  // UI - gestion clic bouton "Ajouter un fichier"
  const handleFileButtonClick = () => {
    // Ce bouton ne fait rien actuellement, il ouvre le selecteur fichier mais on n'upload rien
    fileInputRef.current?.click();
  };

  // Optionnel - prise en charge du fichier sélectionné (inutile mais affichage)
  const [selectedFileName, setSelectedFileName] = useState(null);
  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      setSelectedFileName(e.target.files[0].name);
      // Pas d'upload ni d'envoi de fichier actif (fonctionnalité future)
    }
  };

  return (
    <div className="flex h-full bg-gray-50 min-h-screen">
      {/* Liste conversations */}
      <div className="w-96 bg-white p-6 shadow-lg flex flex-col border-r">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2 select-none">
          <EnvelopeIcon className="h-6 w-6 text-e-bosy-purple" />
          <span>Messages</span>
        </h2>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            aria-label="Rechercher un utilisateur"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-e-bosy-purple transition"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Statistiques résumées */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-center select-none">
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center space-y-1">
            <span className="text-e-bosy-purple text-2xl font-bold">{conversations.length}</span>
            <span className="text-sm text-gray-600">Conversations</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center space-y-1">
            <span className="text-e-bosy-purple text-2xl font-bold">
              {conversations.filter((c) => c.status === "online").length}
            </span>
            <span className="text-sm text-gray-600">Actifs aujourd'hui</span>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg flex flex-col items-center space-y-1">
            <span className="text-e-bosy-purple text-2xl font-bold">{unreadCount}</span>
            <span className="text-sm text-gray-600">Non lus</span>
          </div>
        </div>

        {/* Liste des conversations */}
        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {filteredAndSortedConversations.length > 0 ? (
            filteredAndSortedConversations.map((conv) => (
              <div
                key={conv.userId}
                onClick={() => handleConversationClick(conv)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' || e.key === ' ') {
                    handleConversationClick(conv);
                    e.preventDefault();
                  }
                }}
                className={`relative flex items-center p-4 rounded-lg cursor-pointer transition-all 
                ${activeConversation?.userId === conv.userId
                  ? "bg-purple-50 border-l-4 border-e-bosy-purple"
                  : "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"}
                `}
              >
                <div className="relative flex-shrink-0">
                  {conv.profilePictureUrl ? (
                    <img
                      src={`${API_BASE_URL}${conv.profilePictureUrl}`}
                      alt={`${conv.name}'s profile`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                      {conv.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                      conv.status === "online" ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={conv.status === "online" ? "En ligne" : "Hors ligne"}
                  />
                </div>
                <div className="flex-1 min-w-0 ml-4 relative">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-800 truncate">{conv.name}</p>
                    {conv.lastMessageDate && (
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2 select-none" title={new Date(conv.lastMessageDate).toLocaleString()}>
                        {new Date(conv.lastMessageDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{conv.role}</p>
                  {conv.lastMessage && (
                    <p className="text-sm text-gray-600 truncate" title={conv.lastMessage}>
                      {conv.lastMessage}
                    </p>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute right-4 top-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full select-none">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 select-none">Aucune conversation trouvée</p>
          )}
        </div>

        <button
          onClick={handleStartConversation}
          className="mt-4 w-full bg-e-bosy-purple text-white py-2 rounded-lg hover:bg-purple-700 transition"
          aria-label="Démarrer une nouvelle discussion"
        >
          Démarrer une nouvelle discussion
        </button>

        {/* Modal Sélection utilisateur */}
        {showUserSelection && (
          <div
            className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="userSelectionTitle"
          >
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto">
              <h3 id="userSelectionTitle" className="text-lg font-bold mb-4">
                Sélectionnez un utilisateur
              </h3>
              <div className="space-y-2">
                {users.length > 0 ? (
                  users.map((userItem) => (
                    <div
                      key={userItem.userId}
                      onClick={() => handleUserSelect(userItem)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleUserSelect(userItem);
                          e.preventDefault();
                        }
                      }}
                      className="flex items-center p-4 rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
                    >
                      <div className="relative flex-shrink-0">
                        {userItem.profilePictureUrl ? (
                          <img
                            src={`${API_BASE_URL}${userItem.profilePictureUrl}`}
                            alt={`${userItem.name}'s profile`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                            {userItem.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-800">{userItem.name}</p>
                        <p className="text-sm text-gray-500">{userItem.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Aucun autre utilisateur</p>
                )}
              </div>
              <button
                onClick={() => setShowUserSelection(false)}
                className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zone conversation & messages */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md m-6 max-h-[calc(100vh-48px)]">
          {/* En-tête conversation */}
          <div className="flex items-center p-4 border-b border-gray-200 select-none">
            <div className="relative flex-shrink-0">
              {activeConversation?.profilePictureUrl ? (
                <img
                  src={`${API_BASE_URL}${activeConversation.profilePictureUrl}`}
                  alt={`${activeConversation.name}'s profile`}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-700">
                  {activeConversation?.name
                    ?.split(" ")[0]
                    ?.charAt(0)
                    ?.toUpperCase() || "?"}
                </div>
              )}
              <div
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${
                  activeConversation?.status === "online"
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
                title={
                  activeConversation?.status === "online" ? "En ligne" : "Hors ligne"
                }
              ></div>
            </div>
            <div className="ml-3">
              <p className="font-semibold text-gray-800">{activeConversation?.name}</p>
              <p className="text-sm text-gray-500">{activeConversation?.role}</p>
            </div>
            <div className="ml-auto flex space-x-3 text-gray-500">
              <button
                type="button"
                aria-label="Actualiser les messages"
                onClick={() => handleConversationClick(activeConversation)}
                className="hover:text-e-bosy-purple transition"
                title="Recharger"
              >
                <ArrowPathIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Liste des messages */}
          <div
            className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 && (
              <p className="text-gray-400 text-center select-none">Aucun message</p>
            )}
            {messages.map((message) => (
              <div
                key={message.messageId}
                className={`flex ${
                  message.senderId === user.userId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg break-words whitespace-pre-wrap shadow-sm ${
                    message.senderId === user.userId
                      ? "bg-e-bosy-purple text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                  aria-label={`Message de ${message.senderId === user.userId ? "vous" : activeConversation.name}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 text-right opacity-75 select-none" title={new Date(message.sentAt).toLocaleString()}>
                    {new Date(message.sentAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulaire saisie message */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-gray-200 flex items-center space-x-3 flex-wrap"
          >
            <input
              type="text"
              aria-label="Saisir un message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 min-w-[180px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-e-bosy-purple transition mb-2 sm:mb-0"
            />

            {/* Bouton ajouter un fichier (UI uniquement) */}
            <button
              type="button"
              onClick={handleFileButtonClick}
              className="flex items-center space-x-1 bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-2 rounded-md transition select-none"
              aria-label="Ajouter un fichier (fonctionnalité non encore active)"
              title="Ajouter un fichier (fonctionnalité non encore active)"
            >
              <PaperClipIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Fichier</span>
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-e-bosy-purple text-white px-6 py-3 rounded-md hover:bg-purple-700 disabled:opacity-50 transition select-none"
            >
              Envoyer
            </button>
          </form>

          {/* Nom fichier sélectionné, optionnel */}
          {selectedFileName && (
            <p className="p-2 text-xs text-gray-500 select-none">
              Fichier sélectionné : {selectedFileName}
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-md m-6 select-none">
          <div className="text-center px-4">
            <EnvelopeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              Aucune conversation sélectionnée
            </h3>
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
