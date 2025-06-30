// src/pages/student/StudentLiveSessionPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { signalRService } from "../../services/signalRService";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

const StudentLiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const chatInputRef = useRef(null);
  const peerRef = useRef(null);
  const localStream = useRef(null);

  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState("video");
  const [session, setSession] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);

  // Initialisation de PeerJS
  useEffect(() => {
    peerRef.current = new Peer(user.userId.toString(), {
      host: "localhost",
      port: 9000,
      path: "/peerjs",
    });

    peerRef.current.on("open", (id) => {
      console.log("PeerJS ID:", id);
    });

    peerRef.current.on("call", (call) => {
      call.answer(localStream.current);
      call.on("stream", (remoteStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = remoteStream;
          videoRef.current.play();
        }
      });
    });

    return () => {
      peerRef.current.destroy();
    };
  }, [user.userId]);

  // Connexion à SignalR
  useEffect(() => {
    signalRService.startConnection(sessionId).then(() => {
      signalRService.joinSession(sessionId, user.userId.toString());
      setIsConnected(true);
    });

    signalRService.connection.on("ParticipantsUpdated", (updatedParticipants) => {
      setParticipants(updatedParticipants);
    });

    signalRService.connection.on("ReceiveChatMessage", (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    signalRService.connection.on("ReceiveControl", (controlData) => {
      console.log("Contrôle reçu:", controlData);
    });

    signalRService.connection.on("SessionEnded", () => {
      navigate("/dashboard/live-sessions");
    });

    return () => {
      signalRService.leaveSession(sessionId, user.userId.toString());
      signalRService.stopConnection();
    };
  }, [sessionId, user.userId, navigate]);

  // Démarrer le flux local
  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      updateTrackStates();
    } catch (err) {
      console.error("Erreur d'accès aux médias:", err);
      setIsCameraOff(true);
      setIsMicrophoneMuted(true);
    }
  };

  const updateTrackStates = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff;
      });
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicrophoneMuted;
      });
    }
  };

  // Chargement des données de session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`http://localhost:5196/api/livesessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("user_token")}`,
          },
        });
        const sessionData = await response.json();
        setSession(sessionData);
        setParticipants(sessionData.attendeesIds || []);
      } catch (error) {
        console.error("Erreur lors du chargement de la session:", error);
      }
    };
    fetchSession();
    startLocalStream();
  }, [sessionId]);

  const sendChatMessage = (messageText) => {
    if (!messageText.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: messageText,
      sender: user,
      timestamp: new Date().toISOString(),
    };
    signalRService.sendChatMessage(sessionId, user.firstName + " " + user.lastName, messageText);
    setChatMessages((prev) => [...prev, newMessage]);
    chatInputRef.current.value = "";
  };

  const toggleMute = () => {
    setIsMicrophoneMuted((prev) => !prev);
    updateTrackStates();
    signalRService.sendControl(sessionId, { type: "audio", state: !isMicrophoneMuted ? "muted" : "unmuted" });
  };

  const toggleCamera = () => {
    setIsCameraOff((prev) => !prev);
    updateTrackStates();
    signalRService.sendControl(sessionId, { type: "video", state: !isCameraOff ? "off" : "on" });
  };

  const toggleHandRaise = () => {
    setIsHandRaised((prev) => !prev);
    signalRService.sendControl(sessionId, { type: "hand", raised: !isHandRaised });
  };

  const handleLeaveSession = () => {
    if (window.confirm("Quitter cette session live ?")) {
      signalRService.leaveSession(sessionId, user.userId.toString());
      navigate("/dashboard/live-sessions");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!session) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link to="/dashboard/live-sessions" className="flex items-center text-gray-600 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour aux sessions live
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {session.title} <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-3 space-x-4">
            <span>
              <UsersIcon className="h-4 w-4 mr-1 inline" /> {participants.length} participants
            </span>
            <span>Hôte: {session.host?.firstName + " " + session.host?.lastName}</span>
          </div>
        </div>
        <div className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
          Cours: {session.course?.title}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
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

            {activeTab === "video" ? (
              <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
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
                        className={`flex ${msg.sender.userId === user.userId ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg ${
                            msg.sender.userId === user.userId ? "bg-purple-600 text-white" : "bg-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.sender.firstName + " " + msg.sender.lastName} • {formatTime(msg.timestamp)}
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

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMicrophoneMuted ? "bg-gray-300" : "bg-purple-600"} text-white`}
                title={isMicrophoneMuted ? "Activer le microphone" : "Désactiver le microphone"}
              >
                {isMicrophoneMuted ? <SpeakerXMarkIcon className="h-6 w-6" /> : <SpeakerWaveIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${isCameraOff ? "bg-gray-300" : "bg-purple-600"} text-white`}
                title={isCameraOff ? "Activer la caméra" : "Désactiver la caméra"}
              >
                {isCameraOff ? <VideoCameraSlashIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleHandRaise}
                className={`p-3 rounded-full ${isHandRaised ? "bg-yellow-500" : "bg-purple-600"} text-white`}
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

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {participants.map((pId) => (
                <div key={pId} className="flex items-center p-2 rounded hover:bg-gray-50">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {pId === user.userId.toString() ? "V" : pId}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{pId === user.userId.toString() ? "Vous" : `Participant ${pId}`}</p>
                    <p className="text-xs text-gray-500">
                      {pId === session.hostId.toString() ? "Hôte" : "Étudiant"}
                    </p>
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
                <p className="font-medium">{session.course?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Horaire</p>
                <p className="font-medium">
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
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