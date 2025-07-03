import React, { useEffect, useState, useMemo } from "react"; // Import useMemo
import { getData, postData } from "../services/ApiFetch";
import { toast } from "react-hot-toast";
import moment from "moment";
import "moment/locale/fr";
import { XMarkIcon } from "@heroicons/react/24/outline";

moment.locale("fr");

const CourseComments = ({ courseId, user, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [sortBy, setSortBy] = useState("oldest"); // New state for sorting: 'oldest' or 'newest'

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
      setMessages(data); // Store unsorted data
      setIsLoading(false);
    };
    fetchMessages();
  }, [courseId, isOpen]);

  // Use useMemo to sort messages whenever messages or sortBy changes
  const sortedMessages = useMemo(() => {
    // Create a shallow copy to avoid mutating the original state
    const messagesCopy = [...messages];
    if (sortBy === "oldest") {
      return messagesCopy.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
    } else {
      // 'newest'
      return messagesCopy.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    }
  }, [messages, sortBy]); // Dependencies for memoization

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
    };

    const [data, error] = await postData(`Messages`, messageCreateDto);
    if (error) {
      toast.error("Erreur lors de l'envoi du message.");
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        messageId: data.messageId,
        sender: {
          name: user.name || user.email || "Utilisateur Inconnu",
          senderId: user.userId,
        },
        content: data.content,
        sentAt: new Date().toISOString(),
      },
    ]);
    setNewMessage("");
    toast.success("Message envoyé !");
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl p-6 relative animate-zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
          aria-label="Fermer le modal"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Forum du cours ({messages.length})
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700 text-lg font-medium">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-e-bosy-purple"
            >
              <option value="oldest">Plus anciens</option>
              <option value="newest">Plus récents</option>
            </select>
          </div>
        </div>


        {/* Affichage des messages */}
        <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading && (
            <p className="text-center text-e-bosy-purple flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-e-bosy-purple"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Chargement des messages...
            </p>
          )}

          {hasError && !isLoading && (
            <p className="text-red-600 text-center">
              Impossible de charger les messages. Veuillez réessayer.
            </p>
          )}

          {!isLoading && !hasError && sortedMessages.length === 0 ? (
            <p className="text-gray-500 text-center p-4 bg-gray-50 rounded-md">
              Soyez le premier à poser une question ou à laisser un commentaire !
            </p>
          ) : (
            sortedMessages.map((message) => ( // Use sortedMessages here
              <div
                key={message.messageId}
                className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out border border-gray-100"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-e-bosy-purple flex items-center justify-center text-white font-bold text-sm">
                    {getInitials(message.sender?.name || message.sender?.email)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <p className="text-md font-semibold text-gray-900 truncate">
                      {message.sender?.name ||
                      message.sender?.email ||
                      "Utilisateur"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {moment(message.sentAt).fromNow()}
                    </p>
                  </div>
                  <p className="text-gray-800 break-words leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Zone de saisie de nouveau message */}
        {user ? (
          <div className="mt-8 pt-4 border-t border-gray-200">
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-3 focus:ring-e-bosy-purple/50 text-gray-800 placeholder-gray-500 transition duration-200 ease-in-out"
              rows="4"
              placeholder="Écrivez votre message pour le cours ici..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              aria-label="Ajouter un nouveau message"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                className="bg-e-bosy-purple text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!newMessage.trim()}
              >
                Publier votre question
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 ml-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-center">
            <p className="font-medium">
              Connectez-vous pour participer à la discussion.
            </p>
            <a
              href="/login"
              className="mt-3 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
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