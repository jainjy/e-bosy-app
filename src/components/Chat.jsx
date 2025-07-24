import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../services/ApiFetch";

export default function Chat({ connection, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Effet pour gérer la connexion et les messages
  useEffect(() => {
    if (!connection) return;

    const handleReceiveMessage = (userName, userId, content, profilePicture, timestamp) => {
      setMessages(prev => {
        // Éviter les doublons
        const messageExists = prev.some(msg => 
          msg.userId === userId && 
          msg.message === content && 
          msg.timestamp.getTime() === new Date(timestamp).getTime()
        );
        
        if (!messageExists) {
          return [...prev, {
            userName,
            userId,
            message: content,
            profilePicture: profilePicture ? `${API_BASE_URL}${profilePicture}` : '/default-avatar.png',
            timestamp: new Date(timestamp),
            isCurrentUser: userId === currentUser.userId.toString()
          }];
        }
        return prev;
      });
    };

    const requestHistory = async () => {
      try {
        await connection.invoke("RequestHistory");
      } catch (error) {
        console.error("Error requesting history:", error);
      }
    };

    const setupListeners = async () => {
      try {
        connection.on("ReceiveMessage", handleReceiveMessage);
        setIsConnected(true);
        
        // Demander l'historique des messages au chargement
        await requestHistory();
      } catch (error) {
        console.error("Erreur lors de la configuration des écouteurs:", error);
      }
    };

    setupListeners();

    return () => {
      if (connection) {
        connection.off("ReceiveMessage", handleReceiveMessage);
        setIsConnected(false);
      }
    };
  }, [connection, currentUser]);

  // Effet pour le défilement automatique
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !connection || !isConnected) return;

    try {
      await connection.invoke("SendMessage", message);
      setMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Aucun message pour le moment</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={`${msg.userId}-${index}-${msg.timestamp.getTime()}`}
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {!msg.isCurrentUser && (
                <img 
                  src={msg.profilePicture} 
                  alt={msg.userName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              )}
              <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {!msg.isCurrentUser && (
                  <div className="font-semibold text-xs mb-1">
                    {msg.userName}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
              {msg.isCurrentUser && (
                <img 
                  src={currentUser.profilePictureUrl ? `${API_BASE_URL}${currentUser.profilePictureUrl}` : '/default-avatar.png'} 
                  alt={currentUser.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={sendMessage} 
        className="p-4 border-t border-gray-200 flex gap-2"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim() || !isConnected}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}