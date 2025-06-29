import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { webSocketService } from "../../services/webSocketService";
import {
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

const StudentLiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(true);
  const [isCameraOff, setIsCameraOff] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [teacherStream, setTeacherStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Simuler le chargement de la session
        const mockSession = {
          id: sessionId,
          title: "Advanced JavaScript Session",
          teacher: "Prof. Dupont",
        };
        setSession(mockSession);

        // Connecter au WebSocket
        webSocketService.connect(sessionId, "student");
        webSocketService.addListener("stream", handleTeacherStream);
        webSocketService.addListener("chat", handleChatMessage);
        webSocketService.addListener("participants", handleParticipantsUpdate);

        // Configuration WebRTC pour recevoir le flux
        // (implémentation à ajouter ici)
      } catch (error) {
        console.error("Error joining session:", error);
      }
    };

    initSession();

    return () => {
      webSocketService.disconnect();
    };
  }, [sessionId]);

  const handleTeacherStream = (stream) => {
    setTeacherStream(stream);
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const handleChatMessage = (message) => {
    setChatMessages((prev) => [...prev, message]);
  };

  const handleParticipantsUpdate = (updatedParticipants) => {
    setParticipants(updatedParticipants);
  };

  const sendChatMessage = (message) => {
    webSocketService.sendMessage("chat", {
      sessionId,
      message,
      sender: "student",
    });
  };

  const toggleHandRaise = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    webSocketService.sendMessage("control", {
      type: "hand",
      raised: newState,
    });
  };

  const leaveSession = () => {
    if (window.confirm("Leave this session?")) {
      navigate("/dashboard");
    }
  };

  if (!session) return <div>Connecting to session...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main video area */}
        <div className="lg:w-3/4">
          <div className="bg-black rounded-lg overflow-hidden relative">
            {teacherStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full"
              />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-800">
                <p className="text-white">Waiting for teacher stream...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={() => setIsMicrophoneMuted(!isMicrophoneMuted)}
              className={`p-3 rounded-full ${
                isMicrophoneMuted ? "bg-red-500" : "bg-blue-500"
              } text-white`}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>

            <button
              onClick={() => setIsCameraOff(!isCameraOff)}
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

            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-full ${
                isHandRaised ? "bg-yellow-500" : "bg-blue-500"
              } text-white`}
            >
              <HandRaisedIcon className="h-6 w-6" />
            </button>

            <button
              onClick={leaveSession}
              className="p-3 rounded-full bg-red-500 text-white px-6"
            >
              Leave
            </button>
          </div>

          {isHandRaised && (
            <div className="mt-2 text-center text-yellow-600">
              Your hand is raised
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:w-1/4 space-y-4">
          {/* Participants */}
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-bold">Participants</h3>
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
                    msg.sender === "student" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded ${
                      msg.sender === "student"
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

export default StudentLiveSessionPage;