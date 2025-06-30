// src/pages/LiveSessionPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Peer from "peerjs";
import { signalRService } from "../services/signalRService";
import {
  ArrowLeftIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  VideoCameraSlashIcon,
  ShareIcon,
  UsersIcon,
  CalendarDaysIcon,
  ClockIcon,
  NoSymbolIcon,
  StopCircleIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { liveSessionService } from "../services/liveSessionService";

const LiveSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const localStream = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const peerRef = useRef(null);

  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("video");

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
        setRemoteStreams((prev) => [...prev, { id: call.peer, stream: remoteStream }]);
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

    signalRService.connection.on("ReceiveSignal", (signal) => {
      if (signal.type === "offer") {
        peerRef.current.call(signal.sender, localStream.current);
      }
    });

    signalRService.connection.on("ReceiveChatMessage", (message) => {
      setChatMessages((prev) => [...prev, message]);
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
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      });
      localStream.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      updateTrackStates();
      startSharing();
    } catch (err) {
      console.error("Erreur d'accès aux médias:", err);
      alert("Veuillez autoriser l'accès à la caméra et au microphone");
      setIsCameraOff(true);
      setIsMicrophoneMuted(true);
    }
  };

  // Partager le flux avec les participants
  const startSharing = () => {
    participants.forEach((participantId) => {
      if (participantId !== user.userId.toString()) {
        const call = peerRef.current.call(participantId, localStream.current);
        call.on("stream", (remoteStream) => {
          setRemoteStreams((prev) => [...prev, { id: participantId, stream: remoteStream }]);
        });
      }
    });
  };

  // Mise à jour des pistes média
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
        const sessionData = await liveSessionService.getLiveSession(sessionId);
        setSession(sessionData);
        setParticipants(sessionData.attendeesIds || []);
      } catch (error) {
        console.error("Erreur lors du chargement de la session:", error);
      }
    };
    fetchSession();
    startLocalStream();

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sessionId]);

  // Gestion des contrôles
  const toggleCamera = () => {
    setIsCameraOff((prev) => !prev);
    updateTrackStates();
    signalRService.sendControl(sessionId, { type: "video", state: !isCameraOff ? "off" : "on" });
  };

  const toggleMute = () => {
    setIsMicrophoneMuted((prev) => !prev);
    updateTrackStates();
    signalRService.sendControl(sessionId, { type: "audio", state: !isMicrophoneMuted ? "muted" : "unmuted" });
  };

  const startRecording = () => {
    if (!localStream.current) return;
    recordedChunksRef.current = [];
    mediaRecorderRef.current = new MediaRecorder(localStream.current, {
      mimeType: "video/webm;codecs=vp9,opus",
    });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      setRecordedVideoUrl(URL.createObjectURL(blob));
    };
    mediaRecorderRef.current.start(1000);
    setIsRecording(true);
    recordingIntervalRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const downloadRecording = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement("a");
    a.href = recordedVideoUrl;
    a.download = `session_${sessionId}.webm`;
    a.click();
  };

  const uploadRecording = async () => {
    if (!recordedChunksRef.current.length) return;
    setIsUploading(true);
    const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("recordingFile", blob, `session_${sessionId}.webm`);
    try {
      await liveSessionService.uploadRecording(sessionId, formData);
      setUploadStatus("Enregistrement sauvegardé avec succès!");
    } catch (error) {
      setUploadStatus("Échec de l'envoi");
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  const sendChatMessage = (messageText) => {
    const message = {
      text: messageText,
      sender: user,
      timestamp: new Date().toISOString(),
    };
    signalRService.sendChatMessage(sessionId, user.firstName + " " + user.lastName, messageText);
    setChatMessages((prev) => [...prev, message]);
  };

  const handleEndSession = () => {
    if (window.confirm("Terminer cette session live?")) {
      stopRecording();
      signalRService.leaveSession(sessionId, user.userId.toString());
      navigate("/dashboard/live-sessions");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(session?.shareLink || "");
    alert("Lien copié!");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderChat = () => (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender.userId === user.userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender.userId === user.userId ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.sender.firstName + " " + msg.sender.lastName} •{" "}
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const message = e.target.message.value.trim();
            if (message) {
              sendChatMessage(message);
              e.target.message.value = "";
            }
          }}
        >
          <div className="flex">
            <input
              name="message"
              type="text"
              placeholder="Envoyer un message..."
              className="flex-1 border rounded-l-lg px-4 py-2 focus:outline-none"
              disabled={!isConnected}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:opacity-50"
              disabled={!isConnected}
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (!session) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link to="/dashboard/courses" className="flex items-center text-gray-600 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Retour au cours: {session.course?.title || "Cours"}
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            {session.title} <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-3 space-x-4">
            <span>
              <CalendarDaysIcon className="h-4 w-4 mr-1 inline" />{" "}
              {new Date(session.startTime).toLocaleDateString("fr-FR")}
            </span>
            <span>
              <ClockIcon className="h-4 w-4 mr-1 inline" />{" "}
              {new Date(session.startTime).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              <UsersIcon className="h-4 w-4 mr-1 inline" /> {participants.length} participants
            </span>
          </div>
        </div>
        <div className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">ID: {sessionId}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOff ? "hidden" : "block"}`}
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                  <VideoCameraSlashIcon className="h-24 w-24 text-gray-400" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
                {isRecording && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                    {formatTime(recordingTime)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-full ${isCameraOff ? "bg-gray-300" : "bg-purple-600"} text-white`}
                title={isCameraOff ? "Activer la caméra" : "Désactiver la caméra"}
              >
                {isCameraOff ? <VideoCameraSlashIcon className="h-6 w-6" /> : <VideoCameraIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${isMicrophoneMuted ? "bg-gray-300" : "bg-purple-600"} text-white`}
                title={isMicrophoneMuted ? "Activer le microphone" : "Désactiver le microphone"}
              >
                {isMicrophoneMuted ? (
                  <span className="relative">
                    <MicrophoneIcon className="h-6 w-6" />
                    <NoSymbolIcon className="h-6 w-6 absolute top-0 left-0 text-red-500" />
                  </span>
                ) : (
                  <MicrophoneIcon className="h-6 w-6" />
                )}
              </button>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                  title="Démarrer l'enregistrement"
                >
                  <VideoCameraIcon className="h-6 w-6" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
                  title="Arrêter l'enregistrement"
                >
                  <StopCircleIcon className="h-6 w-6" />
                </button>
              )}
              <button
                className="p-3 rounded-full bg-gray-200 hover:bg-gray-300"
                title="Partager l'écran"
                onClick={startSharing}
              >
                <ShareIcon className="h-6 w-6" />
              </button>
              <button
                onClick={handleEndSession}
                className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 px-4"
                title="Terminer la session"
              >
                Terminer
              </button>
            </div>

            {recordedVideoUrl && (
              <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Enregistrement terminé</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadRecording}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Télécharger
                  </button>
                  <button
                    onClick={uploadRecording}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isUploading ? (
                      <>
                        <span className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {uploadProgress}%
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-5 w-5" />
                        Sauvegarder
                      </>
                    )}
                  </button>
                </div>
                {uploadStatus && (
                  <p
                    className={`mt-2 text-sm text-center ${
                      uploadStatus.includes("Échec") ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {uploadStatus}
                  </p>
                )}
              </div>
            )}

            {activeTab === "chat" && renderChat()}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Participants</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {participants.map((pId) => (
                <div key={pId} className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    {pId === user.userId.toString() ? "Vous" : pId}
                  </div>
                  <div>
                    <p className="font-medium">{pId === user.userId.toString() ? "Vous" : `Participant ${pId}`}</p>
                    <p className="text-xs text-gray-500">{pId === user.userId.toString() ? "Hôte" : "Étudiant"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Partager la session</h3>
            <div className="flex mb-4">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/student/live-session/${sessionId}`}
                className="flex-grow px-3 py-2 border rounded-l text-sm"
              />
              <button
                onClick={handleCopyLink}
                className="bg-purple-600 text-white px-4 py-2 rounded-r"
                title="Copier le lien"
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-around">
              <button className="flex flex-col items-center p-2 text-sm" title="Inviter des participants">
                <UserPlusIcon className="h-6 w-6 mb-1" />
                Inviter
              </button>
              <button className="flex flex-col items-center p-2 text-sm" title="Paramètres">
                <Cog6ToothIcon className="h-6 w-6 mb-1" />
                Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;