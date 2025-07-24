import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import {
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Users,
  LogOut,
  ArrowLeftFromLine,
  Power,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL, getData, postData } from "../services/ApiFetch";
import Chat from "../components/Chat";

export default function StudentPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [session, setSession] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  const connRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const joinSession = async () => {
      try {
        const [session] = await getData(`/livesessions/${sessionId}`);
        if (session.status == "completed") {
          navigate("/live-sessions");
          return;
        }
        const [sessionData] = await postData(
          `/livesessions/${sessionId}/attendees/${user.userId}`
        );
        if (sessionData) setSession(sessionData);
      } catch (error) {
        console.error("Error joining session:", error);
        navigate("/live-sessions");
      }
    };

    joinSession();
  }, [sessionId, user.userId, navigate]);

  useEffect(() => {
    if (!sessionId || !user?.userId) return;

    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5000/hub/conference")
      .withAutomaticReconnect()
      .build();

    connRef.current = conn;

    const setupConnection = async () => {
      try {
        await conn.start();
        await conn.invoke("JoinSession", parseInt(sessionId), user.userId);
        setIsConnected(true);

        const peer = new SimplePeer({
          initiator: false,
          trickle: false,
          reconnectTimer: 5000,
        });

        peerRef.current = peer;

        peer.on("signal", (data) => {
          if (connRef.current?.state === "Connected") {
            connRef.current
              .invoke("SendSignal", user.userId.toString(), data)
              .catch(console.error);
          }
        });

        peer.on("stream", (stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = isMuted;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch((e) => {
                console.warn("Play error:", e);
              });
            };
            setIsVideoLoaded(true);
            retryCountRef.current = 0;
          }
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          if (retryCountRef.current < 3) {
            retryCountRef.current += 1;
            setTimeout(() => {
              if (peerRef.current && !peerRef.current.destroyed) {
                peerRef.current.destroy();
              }
              peerRef.current = new SimplePeer({
                initiator: false,
                trickle: false,
              });
            }, 1000 * retryCountRef.current);
          }
        });

        peer.on("close", () => {
          console.log("Peer connection closed");
          setIsVideoLoaded(false);
        });

        conn.on("UserJoined", (userId, isTeacher, userName) => {
          if (!isTeacher) {
            setConnectedStudents((prev) => prev + 1);
          }
          setParticipants((prev) => [...prev, { userId, userName, isTeacher }]);
        });

        conn.on("UserLeft", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents((prev) => Math.max(0, prev - 1));
          }
          setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        });

        conn.on("ReceiveSignal", (senderId, signal) => {
          if (signal.type === "sessionEnded") {
            setSessionEnded(true);
            setTimeout(() => {
              navigate("/live-sessions");
            }, 3000);
            return;
          }

          if (
            peerRef.current &&
            !peerRef.current.destroyed &&
            !peerRef.current.connected
          ) {
            try {
              peerRef.current.signal(signal);
            } catch (err) {
              console.error("Error processing signal:", err);
            }
          }
        });

        conn.on("ParticipantsList", (participantsList) => {
          if (participantsList) {
            const formattedParticipants = participantsList.map((p) => ({
              userId: p.Item1.toString(),
              userName: p.Item2,
              isTeacher: p.Item3,
              profilePicture: p.Item4 || "/default-user.png",
            }));
            setParticipants(formattedParticipants);
          }
        });

        conn.on("ReceiveTimer", (time) => {
          setElapsedTime(time);
        });
      } catch (err) {
        console.error("Connection error:", err);
        setIsConnected(false);
      }
    };

    setupConnection();

    return () => {
      if (peerRef.current && !peerRef.current.destroyed) {
        peerRef.current.destroy();
      }
      if (connRef.current) {
        connRef.current.stop().catch(console.error);
      }
    };
  }, [sessionId, user?.userId]);

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const leaveSession = () => {
    navigate("/live-sessions");
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Ajouter un état pour le chat
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header amélioré */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/live-sessions")}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeftFromLine className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {session?.title || "Session en direct"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">ID: {sessionId}</span>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Étudiant
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected ? "Connecté" : "Déconnecté"}
              </span>
            </div>

            <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {connectedStudents} participant(s)
              </span>
            </div>

            <div className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vidéo principale */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="relative bg-gray-900 aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <div className="text-center p-6 rounded-xl">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white border-opacity-80 mx-auto mb-4"></div>
                    <p className="text-white font-medium text-lg">
                      En attente du flux vidéo...
                    </p>
                    <p className="text-white text-opacity-80 mt-1">
                      Le professeur n'a pas encore démarré la diffusion
                    </p>
                  </div>
                </div>
              )}

              {isVideoLoaded && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-60 p-2.5 rounded-full text-white hover:bg-opacity-80 transition-all shadow-md"
                  title={isMuted ? "Activer le son" : "Couper le son"}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Bouton principal */}
            <div className="p-4 border-t border-gray-200 flex justify-center">
              <button
                onClick={leaveSession}
                className="flex items-center justify-center px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-md"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Quitter la session
              </button>
            </div>
          </div>

          {/* Sidebar avec onglets */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("chat")}
                className={`flex-1 py-3 font-medium text-sm ${
                  activeTab === "chat"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex-1 py-3 font-medium text-sm ${
                  activeTab === "participants"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Participants ({participants.length})
              </button>
            </div>

            <div className="h-[500px] overflow-y-auto">
              {activeTab === "chat" && (
                <Chat connection={connRef.current} currentUser={user} />
              )}
              {activeTab === "participants" && (
                <div className="p-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Liste des participants
                  </h3>
                  <ul className="space-y-3">
                    {participants &&
                      participants.map((p) => (
                        <li
                          key={p.userId}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg"
                        >
                          <img
                            src={API_BASE_URL+p.profilePicture || "/default-avatar.png"}
                            alt={p.userName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-800">
                              {p.userName}{" "}
                              {p.userId === user.userId.toString() && "(Vous)"}
                            </span>
                            <span
                              className={`text-xs ${
                                p.isTeacher
                                  ? "text-blue-600"
                                  : "text-green-600"
                              } block`}
                            >
                              {p.isTeacher ? "Enseignant" : "Étudiant"}
                            </span>
                          </div>
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              p.isTeacher ? "bg-blue-500" : "bg-green-500"
                            }`}
                          ></div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification de fin de session */}
      {sessionEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-md w-full text-center shadow-xl animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Power className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Session terminée
            </h2>
            <p className="text-gray-600 mb-6">
              Vous allez être redirigé vers la liste des sessions...
            </p>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-[progress_3s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
