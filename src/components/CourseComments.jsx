import React, { useEffect, useState, useMemo } from "react";
import { getData, postData } from "../services/ApiFetch";
import { toast } from "react-hot-toast";
import moment from "moment";
import "moment/locale/fr";
import { XMarkIcon, ChatBubbleLeftIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";

moment.locale("fr");

const getInitials = (name) => {
  if (!name) return "??";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return (
      parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
    );
  }
  return name.charAt(0).toUpperCase();
};

const CommentCard = ({ message, onReply, expanded, onToggle, replies, getReplies, depth = 0 }) => {
  const maxDepth = 3;

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-purple-100' : ''}`}>
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out border border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-e-bosy-purple to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {getInitials(message.sender?.name || message.sender?.email)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <p className="text-md font-semibold text-gray-900">
                  {message.sender?.name || message.sender?.email || "Utilisateur"}
                </p>
                <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                  {moment(message.sentAt).fromNow()}
                </span>
              </div>
            </div>
            <p className="text-gray-800 break-words leading-relaxed mb-3">{message.content}</p>
            <div className="flex items-center space-x-4">
              {depth < maxDepth && (
                <button
                  className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800 transition-colors"
                  onClick={() => onReply(message.messageId)}
                >
                  <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                  Répondre
                </button>
              )}
              {replies?.length > 0 && (
                <button
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => onToggle(message.messageId)}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                  {expanded ? "Masquer" : `Voir les réponses (${replies.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {expanded && replies?.length > 0 && (
        <div className="space-y-3 transition-all duration-300">
          {replies.map((reply) => (
            <CommentCard
              key={reply.messageId}
              message={reply}
              onReply={onReply}
              expanded={expanded}
              onToggle={onToggle}
              replies={getReplies(reply.messageId)}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseComments = ({ courseId, user, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sortBy, setSortBy] = useState("oldest");
  const [replyTo, setReplyTo] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const fetchMessages = async () => {
    setIsLoading(true);
    setHasError(false);
    const [data, error] = await getData(`Messages/course/${courseId}`);
    if (error) {
      toast.error("Erreur lors du chargement des messages.");
      setHasError(true);
      setIsLoading(false);
      return;
    }
    setMessages(data);
    setIsLoading(false);
  };
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      setHasError(false);
      const [data, error] = await getData(`Messages/course/${courseId}`);
      if (error) {
        toast.error("Erreur lors du chargement des messages.");
        setHasError(true);
        setIsLoading(false);
        return;
      }
      setMessages(data);
      setIsLoading(false);
    };
    fetchMessages();
  }, [courseId, isOpen]);

  const sortedMessages = useMemo(() => {
    const messagesCopy = [...messages];
    if (sortBy === "oldest") {
      return messagesCopy.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    } else {
      return messagesCopy.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    }
  }, [messages, sortBy]);

  const filteredMessages = useMemo(() => {
    return sortedMessages.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedMessages, searchQuery]);

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;

    if (!user || !user.userId) {
      toast.error("Vous devez être connecté pour publier un message.");
      return;
    }

    const messageCreateDto = {
      senderId: user.userId,
      content: newMessage,
      messageType: "cours",
      courseId: parseInt(courseId),
      parentMessageId: replyTo,
    };

    const [data, error] = await postData(`Messages`, messageCreateDto);
    if (error) {
      toast.error("Erreur lors de l'envoi du message.");
      return;
    }

    const newMessageObject = {
      messageId: data.messageId,
      sender: {
        name: user.name || user.email || "Utilisateur Inconnu",
        senderId: user.userId,
      },
      content: data.content,
      sentAt: new Date().toISOString(),
      parentMessageId: replyTo,
    };

    setMessages((prev) => [...prev, newMessageObject]);
    setNewMessage("");
    setReplyTo(null);
    toast.success("Message envoyé !");
  };

  const toggleMessage = (messageId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const getReplies = (messageId) => {
    return sortedMessages.filter((message) => message.parentMessageId === messageId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl p-6 relative animate-zoom-in max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            Forum du cours
            <span className="ml-3 text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              {messages.length} messages
            </span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Plus récents</option>
            <option value="oldest">Plus anciens</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : hasError ? (
            <div className="text-center py-10">
              <p className="text-red-600">Une erreur est survenue lors du chargement des messages.</p>
              <button
                onClick={() => fetchMessages()}
                className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Réessayer
              </button>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                {searchQuery ? "Aucun message ne correspond à votre recherche." : "Soyez le premier à poser une question !"}
              </p>
            </div>
          ) : (
            filteredMessages
              .filter(message => !message.parentMessageId)
              .map(message => (
                <CommentCard
                  key={message.messageId}
                  message={message}
                  onReply={setReplyTo}
                  expanded={expandedMessages[message.messageId]}
                  onToggle={toggleMessage}
                  replies={getReplies(message.messageId)}
                  getReplies={getReplies}
                />
              ))
          )}
        </div>

        {user ? (
          <div className="mt-6 pt-4 border-t border-gray-200">
            {replyTo && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg flex items-center justify-between">
                <span className="text-purple-700">
                  Réponse à : {messages.find(m => m.messageId === replyTo)?.sender?.name}
                </span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  Annuler
                </button>
              </div>
            )}
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
              rows="4"
              placeholder={replyTo ? "Écrivez votre réponse..." : "Posez votre question..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={!newMessage.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                <span>{replyTo ? "Envoyer la réponse" : "Publier la question"}</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-blue-700 font-medium">Connectez-vous pour participer à la discussion</p>
            <a
              href="/login"
              className="mt-3 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Se connecter
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseComments;