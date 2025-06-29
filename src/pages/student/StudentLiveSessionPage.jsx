import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";

const StudentLiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const chatInputRef = useRef(null);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("video");
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(true); // Simulation de connexion

  // Simuler les données de session
  useEffect(() => {
    const mockSession = {
      id: sessionId,
      course_id: 1,
      title: "Live Session: Advanced JavaScript",
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      host_id: 2,
      video_url: "https://example.com/live/123",
      attendees_ids: [1, 3, 4, 5],
      recording_url: null,
      course_title: "Advanced JavaScript",
      host_name: "Prof. Dupont",
      participants: [
        { id: 2, name: "Prof. Dupont", role: "Host", isSpeaking: true },
        { id: 1, name: "Vous", role: "Student", isSpeaking: false },
        { id: 3, name: "Marie Durand", role: "Student", isSpeaking: false },
        { id: 4, name: "Jean Martin", role: "Student", isSpeaking: false },
      ],
    };
    setSession(mockSession);
  }, [sessionId]);

  // Simuler le chat
  const sendChatMessage = (messageText) => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: { id: 1, name: "Vous" },
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages([...chatMessages, newMessage]);
    chatInputRef.current.value = "";
    
    // Simuler une réponse du professeur
    if (messageText.toLowerCase().includes("question")) {
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "Je répondrai à votre question après cette démonstration.",
          sender: { id: 2, name: "Prof. Dupont" },
          timestamp: new Date().toISOString(),
        }]);
      }, 2000);
    }
  };

  // Simuler le flux vidéo (remplacé par une image de placeholder en simulation)
  useEffect(() => {
    if (videoRef.current) {
      // Dans une vraie implémentation, vous utiliseriez WebRTC ici
      videoRef.current.src = "https://placehold.co/800x450?text=Flux+Live+du+Professeur";
      videoRef.current.controls = false;
    }
  }, []);

  // Gestion de la fin de session
  const handleLeaveSession = () => {
    if (window.confirm("Quitter cette session live ?")) {
      navigate("/dashboard/live-sessions");
    }
  };

  // Formatage de la date
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!session) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link 
        to="/dashboard/live-sessions" 
        className="flex items-center text-gray-600 hover:underline mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux sessions live
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {session.title} <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-3 space-x-4">
            <span><UsersIcon className="h-4 w-4 mr-1 inline" /> {session.participants.length} participants</span>
            <span>Hôte: {session.host_name}</span>
          </div>
        </div>
        <div className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
          Cours: {session.course_title}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone principale */}
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Onglets */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "video"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("video")}
              >
                Vidéo
              </button>
              <button
                className={`py-2 px-4 font-medium ${
                  activeTab === "chat"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
            </div>

            {/* Contenu des onglets */}
            {activeTab === "video" ? (
              <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gray-50 rounded-lg overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex ${msg.sender.id === 1 ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender.id === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.sender.name} • {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Aucun message dans le chat
                    </div>
                  )}
                </div>
                <div className="p-4 border-t">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendChatMessage(chatInputRef.current.value);
                    }}
                    className="flex"
                  >
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Envoyer un message..."
                      className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700"
                    >
                      Envoyer
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Contrôles */}
            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={() => setIsMicrophoneMuted(!isMicrophoneMuted)}
                className={`p-3 rounded-full ${isMicrophoneMuted ? 'bg-gray-300' : 'bg-purple-600'} text-white`}
                title={isMicrophoneMuted ? "Activer le microphone" : "Désactiver le microphone"}
              >
                {isMicrophoneMuted ? (
                  <SpeakerXMarkIcon className="h-6 w-6" />
                ) : (
                  <SpeakerWaveIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={() => setIsCameraOff(!isCameraOff)}
                className={`p-3 rounded-full ${isCameraOff ? 'bg-gray-300' : 'bg-purple-600'} text-white`}
                title={isCameraOff ? "Activer la caméra" : "Désactiver la caméra"}
              >
                {isCameraOff ? (
                  <VideoCameraSlashIcon className="h-6 w-6" />
                ) : (
                  <VideoCameraIcon className="h-6 w-6" />
                )}
              </button>

              <button
                onClick={() => setIsHandRaised(!isHandRaised)}
                className={`p-3 rounded-full ${isHandRaised ? 'bg-yellow-500' : 'bg-purple-600'} text-white`}
                title={isHandRaised ? "Baisser la main" : "Lever la main"}
              >
                <HandRaisedIcon className="h-6 w-6" />
              </button>

              <button
                onClick={handleLeaveSession}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 px-4"
                title="Quitter la session"
              >
                Quitter
              </button>
            </div>

            {isHandRaised && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center">
                Votre main est levée - Le professeur vous donnera la parole sous peu
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {session.participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="flex items-center p-2 rounded hover:bg-gray-50"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {participant.name.charAt(0)}
                    </div>
                    {participant.isSpeaking && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">
                      {participant.name} 
                      {participant.id === 1 && " (Vous)"}
                    </p>
                    <p className="text-xs text-gray-500">{participant.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Informations de session</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Cours</p>
                <p className="font-medium">{session.course_title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horaire</p>
                <p className="font-medium">
                  {formatTime(session.start_time)} - {formatTime(session.end_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <p className="font-medium text-green-600">En cours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLiveSessionPage;