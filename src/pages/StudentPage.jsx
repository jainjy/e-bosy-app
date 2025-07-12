import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import SimplePeer from "simple-peer";
import { Video, VideoOff, Volume2, VolumeX, Users, LogOut } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { postData } from "../services/ApiFetch";

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

  const connRef = useRef(null);
  const peerRef = useRef(null);
  const videoRef = useRef(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const joinSession = async () => {
      try {
        // Rejoindre la session et s'ajouter comme participant
        const [sessionData] = await postData(`/livesessions/${sessionId}/attendees/${user.userId}`);
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
          reconnectTimer: 5000
        });

        peerRef.current = peer;

        peer.on("signal", (data) => {
          if (connRef.current?.state === "Connected") {
            connRef.current.invoke("SendSignal", user.userId.toString(), data)
              .catch(console.error);
          }
        });

        peer.on("stream", (stream) => {
          if (videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = stream;
            videoRef.current.muted = isMuted;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play().catch(e => {
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
              peerRef.current = new SimplePeer({ initiator: false, trickle: false });
            }, 1000 * retryCountRef.current);
          }
        });

        peer.on("close", () => {
          console.log("Peer connection closed");
          setIsVideoLoaded(false);
        });

        conn.on("UserJoined", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents(prev => prev + 1);
          }
        });

        conn.on("UserLeft", (userId, isTeacher) => {
          if (!isTeacher) {
            setConnectedStudents(prev => Math.max(0, prev - 1));
          }
        });

        conn.on("ReceiveSignal", (senderId, signal) => {
          if (signal.type === "sessionEnded") {
            setSessionEnded(true);
            setTimeout(() => {
              navigate("/live-sessions");
            }, 3000);
            return;
          }

          if (peerRef.current && !peerRef.current.destroyed && !peerRef.current.connected) {
            try {
              peerRef.current.signal(signal);
            } catch (err) {
              console.error("Error processing signal:", err);
            }
          }
        });

      } catch (err) {
        console.error("Connection error:", err);
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

  return (
    <div className="p-4 bg-purple-50 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {session?.title || "Session en direct"}
        </h1>
        <div className="flex gap-4">
          <span>{isConnected ? "🟢 Connecté" : "🔴 Déconnecté"}</span>
          <span>👥 {connectedStudents} participant(s)</span>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted={isMuted}
            playsInline
            className="w-full h-96 bg-black rounded-lg"
          />
          {!isVideoLoaded && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
              En attente du prof...
            </div>
          )}
          {isVideoLoaded && (
            <button
              onClick={toggleMute}
              className="absolute bottom-4 left-4 bg-zinc-200 bg-opacity-50 p-2 rounded-full"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}
        </div>
      </div>

      <button 
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded" 
        onClick={leaveSession}
      >
        Quitter la session
      </button>

      {sessionEnded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg text-center">
            <h2 className="text-xl font-bold mb-4">La session est terminée</h2>
            <p>Vous allez être redirigé vers la liste des sessions...</p>
          </div>
        </div>
      )}
    </div>
  );
}