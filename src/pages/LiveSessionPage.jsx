import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { webSocketService } from "../services/webSocketService";
import { liveSessionService } from "../services/liveSessionService";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  ShareIcon,
  UsersIcon,
  StopCircleIcon,
} from "@heroicons/react/24/outline";

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const localStream = useRef(null);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Charger les données de la session
        const sessionData = await liveSessionService.getLiveSession(sessionId);
        setSession(sessionData);

        // Démarrer le flux média
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStream.current = stream;
        videoRef.current.srcObject = stream;

        // Connecter au WebSocket
        webSocketService.connect(sessionId, "teacher");
        webSocketService.addListener("participants", handleParticipantsUpdate);
        webSocketService.addListener("chat", handleChatMessage);

        // Envoyer l'offre WebRTC
        // (implémentation WebRTC à ajouter ici)
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    initSession();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      webSocketService.disconnect();
    };
  }, [sessionId]);

  const handleParticipantsUpdate = (updatedParticipants) => {
    setParticipants(updatedParticipants);
  };

  const handleChatMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const sendChatMessage = (message) => {
    webSocketService.sendMessage("chat", {
      sessionId,
      message,
      sender: "teacher",
    });
  };

  const toggleMicrophone = () => {
    const newState = !isMicrophoneMuted;
    setIsMicrophoneMuted(newState);
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !newState;
      });
    }
  };

  const toggleCamera = () => {
    const newState = !isCameraOff;
    setIsCameraOff(newState);
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach((track) => {
        track.enabled = !newState;
      });
    }
  };

  const endSession = async () => {
    if (window.confirm("End this live session?")) {
      await liveSessionService.endSession(sessionId);
      navigate("/dashboard");
    }
  };

  if (!session) return <div>Loading session...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main video area */}
        <div className="lg:w-3/4">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full ${isCameraOff ? "hidden" : "block"}`}
            />
            {isCameraOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoCameraSlashIcon className="h-20 w-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={toggleMicrophone}
              className={`p-3 rounded-full ${
                isMicrophoneMuted ? "bg-red-500" : "bg-blue-500"
              } text-white`}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full ${
                isCameraOff ? "bg-red-500" : "bg-blue-500"
              } text-white`}
            >
              {isCameraOff ? (
                <VideoCameraSlashIcon className="h-6 w-6" />
              ) : (
                <VideoCameraIcon className="h-6 w-6" />
              )}
            </button>

            <button className="p-3 rounded-full bg-blue-500 text-white">
              <ShareIcon className="h-6 w-6" />
            </button>

            <button
              onClick={endSession}
              className="p-3 rounded-full bg-red-500 text-white px-6"
            >
              <StopCircleIcon className="h-6 w-6 inline mr-2" />
              End
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-4">
          {/* Participants */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold flex items-center">
              <UsersIcon className="h-5 w-5 mr-2" />
              Participants ({participants.length})
            </h3>
            <div className="mt-2 space-y-2">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-300 mr-2"></div>
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-lg p-4 shadow h-64 flex flex-col">
            <h3 className="font-bold">Chat</h3>
            <div className="flex-1 overflow-y-auto mb-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-2 ${
                    msg.sender === "teacher" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded ${
                      msg.sender === "teacher"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              className="border rounded p-2 w-full"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendChatMessage(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;