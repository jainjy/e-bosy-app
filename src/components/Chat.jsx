import React, { useState, useEffect, useRef } from "react";

export default function Chat({ connection, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (connection && !hasInitializedRef.current) {
      connection.on("ReceiveMessage", (userName, userId, message) => {
        setMessages(prev => [...prev, { 
          userName, 
          userId,
          message,
          isCurrentUser: userId === currentUser.userId.toString()
        }]);
      });
      hasInitializedRef.current = true;
    }
  }, [connection, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() && connection) {
      try {
        await connection.invoke("SendMessage", message);
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
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
              key={index} 
              className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${msg.isCurrentUser ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {!msg.isCurrentUser && (
                  <div className="font-semibold text-xs mb-1">
                    {msg.userName}
                  </div>
                )}
                <div className="text-sm">{msg.message}</div>
              </div>
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
          disabled={!message.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}